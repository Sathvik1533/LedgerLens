import pytest
from unittest.mock import MagicMock
from fastapi.testclient import TestClient
from uuid import uuid4
from datetime import datetime, timezone

from backend.app.main import app
from backend.app.db.session import get_db
from backend.app.models.ingestion import IngestionBatchModel

client = TestClient(app)

def test_healthz_and_readyz():
    """Verify standard liveness and readiness probe endpoints."""
    res_health = client.get("/healthz")
    assert res_health.status_code == 200
    assert res_health.json()["status"] == "ok"

    res_ready = client.get("/readyz")
    assert res_ready.status_code == 200
    assert res_ready.json()["status"] == "ready"

def test_ingest_payments_csv_success():
    """Verify clean 2-row CSV upload returns 201 Created and completed batch status."""
    mock_db = MagicMock()
    mock_db.execute.return_value.scalar_one_or_none.return_value = None

    def override_get_db():
        try:
            yield mock_db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    csv_data = (
        "payment_id,order_id,merchant_id,payment_type,payment_method,amount,currency,status,payment_timestamp,captured_timestamp,settlement_id\n"
        "pay_001,ord_001,merch_01,card,upi,100.00,INR,captured,2026-08-25T10:00:00Z,2026-08-25T10:01:00Z,set_001\n"
        "pay_002,ord_002,merch_01,card,upi,250.50,INR,captured,2026-08-25T10:05:00Z,,set_001\n"
    )

    response = client.post(
        "/api/v1/ingestion/payments",
        files={"file": ("payments.csv", csv_data.encode("utf-8"), "text/csv")},
        headers={"X-Idempotency-Key": "test_idempotency_001"}
    )

    app.dependency_overrides.clear()

    assert response.status_code == 201
    data = response.json()
    assert data["idempotency_key"] == "test_idempotency_001"
    assert data["row_count_submitted"] == 2
    assert data["row_count_accepted"] == 2
    assert data["row_count_rejected"] == 0
    assert data["batch_status"] == "completed"
    assert data["is_duplicate"] is False
    assert len(data["errors"]) == 0

def test_ingest_payments_missing_columns():
    """Verify uploading a CSV missing required 'amount' column returns 400 Bad Request."""
    mock_db = MagicMock()
    mock_db.execute.return_value.scalar_one_or_none.return_value = None
    app.dependency_overrides[get_db] = lambda: mock_db

    invalid_csv = (
        "payment_id,order_id,merchant_id,currency,status,payment_timestamp\n"
        "pay_001,ord_001,merch_01,INR,captured,2026-08-25T10:00:00Z\n"
    )

    response = client.post(
        "/api/v1/ingestion/payments",
        files={"file": ("payments.csv", invalid_csv.encode("utf-8"), "text/csv")},
    )

    app.dependency_overrides.clear()

    assert response.status_code == 400
    assert "Missing required columns" in response.json()["detail"]

def test_ingest_payments_with_invalid_row():
    """Verify invalid amount blocks only the invalid row while clean rows continue."""
    mock_db = MagicMock()
    mock_db.execute.return_value.scalar_one_or_none.return_value = None
    app.dependency_overrides[get_db] = lambda: mock_db

    mixed_csv = (
        "payment_id,order_id,merchant_id,payment_type,payment_method,amount,currency,status,payment_timestamp\n"
        "pay_001,ord_001,merch_01,card,upi,100.00,INR,captured,2026-08-25T10:00:00Z\n"
        "pay_002,ord_002,merch_01,card,upi,INVALID_NUM,INR,captured,2026-08-25T10:05:00Z\n"
    )

    response = client.post(
        "/api/v1/ingestion/payments",
        files={"file": ("payments.csv", mixed_csv.encode("utf-8"), "text/csv")},
        headers={"X-Idempotency-Key": "test_mixed_batch"}
    )

    app.dependency_overrides.clear()

    assert response.status_code == 201
    data = response.json()
    assert data["row_count_submitted"] == 2
    assert data["row_count_accepted"] == 1
    assert data["row_count_rejected"] == 1
    assert data["batch_status"] == "completed_with_errors"
    assert len(data["errors"]) == 1
    assert data["errors"][0]["source_row_index"] == 1

def test_ingest_payments_duplicate_idempotency():
    """Verify re-uploading an existing batch returns the original record marked is_duplicate=True."""
    mock_db = MagicMock()
    existing_id = uuid4()
    existing_batch = IngestionBatchModel(
        id=existing_id,
        idempotency_key="batch_dup_key",
        batch_status="completed",
        source_filename="payments.csv",
        source_tables=["payments"],
        row_count_submitted=5,
        row_count_accepted=5,
        row_count_rejected=0,
        submitted_at=datetime.now(timezone.utc),
        completed_at=datetime.now(timezone.utc),
    )
    mock_db.execute.return_value.scalar_one_or_none.return_value = existing_batch

    app.dependency_overrides[get_db] = lambda: mock_db

    csv_data = "payment_id,amount,currency,payment_timestamp\npay_001,10.00,INR,2026-08-25T10:00:00Z\n"

    response = client.post(
        "/api/v1/ingestion/payments",
        files={"file": ("payments.csv", csv_data.encode("utf-8"), "text/csv")},
        headers={"X-Idempotency-Key": "batch_dup_key"}
    )

    app.dependency_overrides.clear()

    assert response.status_code == 201
    data = response.json()
    assert data["batch_id"] == str(existing_id)
    assert data["is_duplicate"] is True
    assert data["row_count_accepted"] == 5
