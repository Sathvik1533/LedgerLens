import io
import uuid
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

@pytest.mark.integration
def test_ingestion_counts_one_row_accepted():
    """
    P0.1 Regression Test:
    Verify that uploading a valid 1-row payments CSV returns:
      - row_count_accepted == 1
      - row_count_rejected == 0
    And that the JSON payload properties match row_count_accepted and row_count_rejected
    as required by frontend/src/pages/IngestionFeedsPage.tsx.
    """
    # 1. Authenticate as Demo Reviewer
    login_resp = client.post("/api/v1/auth/demo", json={"role": "reviewer"})
    assert login_resp.status_code == 200
    session_cookie = login_resp.cookies.get("ledgerlens_session")
    assert session_cookie is not None

    cookies = {"ledgerlens_session": session_cookie}

    # 2. Construct a single valid payment CSV row
    unique_pid = f"pay_reg_{uuid.uuid4().hex[:8]}"
    unique_order = f"ord_reg_{uuid.uuid4().hex[:8]}"
    csv_content = (
        "payment_id,order_id,merchant_id,payment_type,payment_method,amount,currency,status,payment_timestamp\n"
        f"{unique_pid},{unique_order},merch_reg_01,card,upi,1500.00,INR,captured,2026-09-04T12:00:00Z\n"
    )

    # 3. Upload CSV
    res = client.post(
        "/api/v1/ingestion/payments",
        files={"file": ("single_payment.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")},
        cookies=cookies,
        headers={"X-LedgerLens-CSRF": "1"},
    )
    assert res.status_code == 201
    data = res.json()

    # Exact contract assertions
    assert "row_count_accepted" in data, "Response must include row_count_accepted"
    assert "row_count_rejected" in data, "Response must include row_count_rejected"
    assert data["row_count_accepted"] == 1, f"Expected exactly 1 accepted row, got {data['row_count_accepted']}"
    assert data["row_count_rejected"] == 0, f"Expected 0 rejected rows, got {data['row_count_rejected']}"
    assert data["batch_status"] == "completed"

@pytest.mark.integration
def test_ingestion_counts_one_row_rejected():
    """
    P0.1 Regression Test (Error case):
    Verify that uploading an invalid 1-row payments CSV returns:
      - row_count_accepted == 0
      - row_count_rejected == 1
    """
    login_resp = client.post("/api/v1/auth/demo", json={"role": "reviewer"})
    assert login_resp.status_code == 200
    session_cookie = login_resp.cookies.get("ledgerlens_session")

    cookies = {"ledgerlens_session": session_cookie}

    # Invalid amount: non-numeric string triggers decimal parsing failure and row rejection
    csv_content = (
        "payment_id,order_id,merchant_id,payment_type,payment_method,amount,currency,status,payment_timestamp\n"
        "pay_bad_01,ord_bad_01,merch_01,card,upi,INVALID_DECIMAL,INR,captured,2026-09-04T12:00:00Z\n"
    )

    res = client.post(
        "/api/v1/ingestion/payments",
        files={"file": ("bad_payment.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")},
        cookies=cookies,
        headers={"X-LedgerLens-CSRF": "1"},
    )
    assert res.status_code == 201
    data = res.json()

    assert data["row_count_accepted"] == 0
    assert data["row_count_rejected"] == 1
    assert data["batch_status"] in ["completed_with_errors", "failed"]
