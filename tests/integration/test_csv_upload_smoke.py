import io
import os
import pytest
from backend.app.models.payment import PaymentModel
from backend.app.models.settlement import SettlementModel
from backend.app.models.refund import RefundModel
from backend.app.models.bank_credit import BankCreditModel

PAYMENTS_CSV = """payment_id,amount,currency,payment_timestamp
pay_smoke_clean,1000.00,INR,2026-09-04T10:00:00Z
pay_smoke_mismatch,2000.00,INR,2026-09-04T10:05:00Z
pay_smoke_refund,1500.00,INR,2026-09-04T10:10:00Z
pay_smoke_bank,3000.00,INR,2026-09-04T10:15:00Z
pay_smoke_invalid,INVALID_AMOUNT,INR,2026-09-04T10:20:00Z
""".strip()

SETTLEMENTS_CSV = """settlement_id,merchant_id,gross_payment_amount,fee_amount,tax_amount,net_settlement_amount,settlement_timestamp
set_smoke_clean,merch_01,1000.00,20.00,3.60,976.40,2026-09-04T12:00:00Z
set_smoke_mismatch,merch_01,2000.00,50.00,9.00,1700.00,2026-09-04T12:05:00Z
set_smoke_refund,merch_01,1500.00,30.00,5.40,1464.60,2026-09-04T12:10:00Z
set_smoke_bank,merch_01,3000.00,60.00,10.80,2929.20,2026-09-04T12:15:00Z
""".strip()

REFUNDS_CSV = """refund_id,payment_id,order_id,refund_amount,refund_timestamp
ref_smoke_01,pay_smoke_refund,ord_smoke_03,500.00,2026-09-04T14:00:00Z
""".strip()

BANK_CREDITS_CSV = """bank_credit_id,bank_reference,credited_amount,bank_credit_timestamp
bnk_smoke_01,UTR_SMOKE_01,976.40,2026-09-04T16:00:00Z
bnk_smoke_02,UTR_SMOKE_02,2929.20,2026-09-04T16:10:00Z
""".strip()

@pytest.mark.integration
def test_csv_upload_valid_acceptance_and_row_rejection(client, db_session):
    """
    Smoke Test: Four-Source CSV Ingestion
    - Uploads all 4 feeds with required schema headers.
    - Validates row-level rejection on malformed amount (1 rejected, 4 accepted).
    """
    # 1. Payments Upload
    res_pay = client.post(
        "/api/v1/ingestion/payments",
        files={"file": ("payments.csv", io.BytesIO(PAYMENTS_CSV.encode("utf-8")), "text/csv")},
    )
    assert res_pay.status_code == 201
    pay_data = res_pay.json()
    assert pay_data["batch_status"] == "completed_with_errors"
    assert pay_data["row_count_submitted"] == 5
    assert pay_data["row_count_accepted"] == 4
    assert pay_data["row_count_rejected"] == 1
    assert len(pay_data["errors"]) == 1

    # Verify rows in DB
    assert db_session.query(PaymentModel).count() == 4

    # 2. Settlements Upload
    res_set = client.post(
        "/api/v1/ingestion/settlements",
        files={"file": ("settlements.csv", io.BytesIO(SETTLEMENTS_CSV.encode("utf-8")), "text/csv")},
    )
    assert res_set.status_code == 201
    assert res_set.json()["row_count_accepted"] == 4
    assert db_session.query(SettlementModel).count() == 4

    # 3. Refunds Upload
    res_ref = client.post(
        "/api/v1/ingestion/refunds",
        files={"file": ("refunds.csv", io.BytesIO(REFUNDS_CSV.encode("utf-8")), "text/csv")},
    )
    assert res_ref.status_code == 201
    assert res_ref.json()["row_count_accepted"] == 1
    assert db_session.query(RefundModel).count() == 1

    # 4. Bank Credits Upload
    res_bc = client.post(
        "/api/v1/ingestion/bank-credits",
        files={"file": ("bank_credits.csv", io.BytesIO(BANK_CREDITS_CSV.encode("utf-8")), "text/csv")},
    )
    assert res_bc.status_code == 201
    assert res_bc.json()["row_count_accepted"] == 2
    assert db_session.query(BankCreditModel).count() == 2

@pytest.mark.integration
def test_csv_upload_invalid_header_rejection(client):
    """Rejects CSV missing mandatory header columns with HTTP 400."""
    bad_header_csv = "payment_id,wrong_column,currency\npay_1,100,INR\n"
    res = client.post(
        "/api/v1/ingestion/payments",
        files={"file": ("payments.csv", io.BytesIO(bad_header_csv.encode("utf-8")), "text/csv")},
    )
    assert res.status_code == 400
    assert "Missing required columns" in res.json()["detail"]

@pytest.mark.integration
def test_csv_upload_empty_file_rejection(client):
    """Rejects 0-byte file with HTTP 400."""
    res = client.post(
        "/api/v1/ingestion/payments",
        files={"file": ("payments.csv", io.BytesIO(b""), "text/csv")},
    )
    assert res.status_code == 400
    assert "empty" in res.json()["detail"].lower()

@pytest.mark.integration
def test_csv_upload_unsupported_extension_rejection(client):
    """Rejects unsupported file formats (.xlsx, .json, .txt) with HTTP 400."""
    for ext in [".xlsx", ".json", ".txt"]:
        res = client.post(
            "/api/v1/ingestion/payments",
            files={"file": (f"payments{ext}", io.BytesIO(b"dummy content"), "application/octet-stream")},
        )
        assert res.status_code == 400
        assert "Only .csv files are supported" in res.json()["detail"]

@pytest.mark.integration
def test_csv_upload_idempotency_and_duplicate_handling(client, db_session):
    """Re-uploading the exact same CSV returns original batch without duplicating rows."""
    csv_data = """payment_id,amount,currency,payment_timestamp
pay_idem_01,500.00,INR,2026-09-04T10:00:00Z
pay_idem_02,600.00,INR,2026-09-04T10:05:00Z
""".strip()

    # First upload
    res1 = client.post(
        "/api/v1/ingestion/payments",
        files={"file": ("payments_idem.csv", io.BytesIO(csv_data.encode("utf-8")), "text/csv")},
    )
    assert res1.status_code == 201
    batch_id_1 = res1.json()["batch_id"]
    assert db_session.query(PaymentModel).count() == 2

    # Second upload with identical content
    res2 = client.post(
        "/api/v1/ingestion/payments",
        files={"file": ("payments_idem.csv", io.BytesIO(csv_data.encode("utf-8")), "text/csv")},
    )
    assert res2.status_code == 201
    batch_id_2 = res2.json()["batch_id"]
    assert batch_id_1 == batch_id_2
    assert res2.json()["is_duplicate"] is True
    # Rows must remain exactly 2 (no duplicate insertion)
    assert db_session.query(PaymentModel).count() == 2

@pytest.mark.integration
def test_no_production_database_access():
    """Safety invariant: test environment must point to isolated local test DB ending in _test."""
    from tests.conftest import DEFAULT_TEST_URL
    test_db = os.environ.get("TEST_DATABASE_URL", DEFAULT_TEST_URL)
    assert test_db != "", "TEST_DATABASE_URL missing"
    assert test_db.rstrip("/").endswith("_test"), "Must end with _test"
    assert "supabase.co" not in test_db.lower(), "Production Supabase forbidden in tests"
