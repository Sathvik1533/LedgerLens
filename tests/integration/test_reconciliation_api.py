import pytest
from unittest.mock import MagicMock
from decimal import Decimal
from datetime import datetime, timezone
from uuid import uuid4
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.db.session import get_db
from backend.app.schemas.domain import PaymentRecord, SettlementRecord, BankCreditRecord, RefundRecord
from backend.app.models.reconciliation import ReconciliationCaseModel

client = TestClient(app)

def test_ingest_settlements_and_refunds_and_credits_routes():
    """Verify all 3 auxiliary ingestion endpoints return 201 Created."""
    mock_db = MagicMock()
    mock_db.execute.return_value.scalar_one_or_none.return_value = None
    app.dependency_overrides[get_db] = lambda: mock_db

    # 1. Settlements CSV
    set_csv = (
        "settlement_id,merchant_id,settlement_type,gross_payment_amount,refund_amount,fee_amount,tax_amount,adjustment_amount,net_settlement_amount,currency,settlement_status,settlement_timestamp\n"
        "set_001,merch_01,standard,1000.00,0.00,20.00,3.60,0.00,976.40,INR,processed,2026-08-25T12:00:00Z\n"
    )
    res_set = client.post(
        "/api/v1/ingestion/settlements",
        files={"file": ("settlements.csv", set_csv.encode("utf-8"), "text/csv")},
    )
    assert res_set.status_code == 201
    assert res_set.json()["row_count_accepted"] == 1

    # 2. Refunds CSV
    ref_csv = (
        "refund_id,payment_id,order_id,refund_amount,currency,refund_status,refund_timestamp,refund_type\n"
        "ref_001,pay_001,ord_001,50.00,INR,processed,2026-08-25T11:00:00Z,partial\n"
    )
    res_ref = client.post(
        "/api/v1/ingestion/refunds",
        files={"file": ("refunds.csv", ref_csv.encode("utf-8"), "text/csv")},
    )
    assert res_ref.status_code == 201
    assert res_ref.json()["row_count_accepted"] == 1

    # 3. Bank Credits CSV
    bc_csv = (
        "bank_credit_id,bank_account_id,bank_name,bank_reference,settlement_id,credited_amount,currency,bank_credit_timestamp,bank_credit_status\n"
        "bc_001,ba_01,HDFC Bank,HDFC_REF_001,set_001,976.40,INR,2026-08-25T15:00:00Z,cleared\n"
    )
    res_bc = client.post(
        "/api/v1/ingestion/bank-credits",
        files={"file": ("bank_credits.csv", bc_csv.encode("utf-8"), "text/csv")},
    )
    assert res_bc.status_code == 201
    assert res_bc.json()["row_count_accepted"] == 1

    app.dependency_overrides.clear()

def test_reconciliation_run_and_cases_endpoint():
    """Verify executing reconciliation run returns summary metrics and matches correctly."""
    mock_db = MagicMock()

    # Create mock normalized domain objects returned from repo.get_all_normalized_records()
    payment = MagicMock()
    payment.payment_id = "pay_001"
    payment.order_id = "ord_001"
    payment.merchant_id = "merch_01"
    payment.payment_type = "card"
    payment.payment_method = "upi"
    payment.amount = Decimal("1000.00")
    payment.currency = "INR"
    payment.status = "captured"
    payment.payment_timestamp = datetime(2026, 8, 25, 10, 0, tzinfo=timezone.utc)
    payment.captured_timestamp = None
    payment.settlement_id = "set_001"

    settlement = MagicMock()
    settlement.settlement_id = "set_001"
    settlement.merchant_id = "merch_01"
    settlement.settlement_type = "standard"
    settlement.gross_payment_amount = Decimal("1000.00")
    settlement.refund_amount = Decimal("0.00")
    settlement.fee_amount = Decimal("20.00")
    settlement.tax_amount = Decimal("3.60")
    settlement.adjustment_amount = Decimal("0.00")
    settlement.net_settlement_amount = Decimal("976.40")
    settlement.currency = "INR"
    settlement.settlement_status = "processed"
    settlement.settlement_timestamp = datetime(2026, 8, 25, 12, 0, tzinfo=timezone.utc)
    settlement.expected_settlement_timestamp = None

    bank_credit = MagicMock()
    bank_credit.bank_credit_id = "bc_001"
    bank_credit.bank_account_id = "ba_01"
    bank_credit.bank_name = "HDFC Bank"
    bank_credit.bank_reference = "HDFC_REF_001"
    bank_credit.settlement_id = "set_001"
    bank_credit.credited_amount = Decimal("976.40")
    bank_credit.currency = "INR"
    bank_credit.bank_credit_timestamp = datetime(2026, 8, 25, 15, 0, tzinfo=timezone.utc)
    bank_credit.bank_credit_status = "cleared"
    bank_credit.narration = None

    mock_db.execute.return_value.scalars.return_value.all.side_effect = [
        [payment],      # payments
        [settlement],   # settlements
        [],             # refunds
        [bank_credit],  # bank_credits
    ]

    app.dependency_overrides[get_db] = lambda: mock_db

    # Execute Reconciliation Run
    res_run = client.post("/api/v1/reconciliation/run")
    assert res_run.status_code == 200
    summary = res_run.json()

    assert summary["total_payments_processed"] == 1
    assert summary["auto_reconciled_count"] == 1
    assert summary["match_rate_percentage"] == 100.0
    assert summary["needs_review_count"] == 0
    assert len(summary["cases"]) == 1
    assert summary["cases"][0]["decision_status"] == "auto_reconciled"

    # Query Cases Endpoint
    case_model = ReconciliationCaseModel(
        id=uuid4(),
        batch_id=uuid4(),
        payment_id="pay_001",
        exception_type=None,
        decision_status="auto_reconciled",
        resolution_reason="matched",
        confidence="high",
        expected_net_settlement=Decimal("976.40"),
        reported_net_settlement=Decimal("976.40"),
        settlement_discrepancy=Decimal("0.00"),
        case_opened_at=datetime.now(timezone.utc),
    )
    mock_db.execute.return_value.scalars.return_value.all.side_effect = None
    mock_db.execute.return_value.scalars.return_value.all.return_value = [case_model]

    res_cases = client.get("/api/v1/reconciliation/cases?decision_status=auto_reconciled")
    assert res_cases.status_code == 200
    cases_list = res_cases.json()
    assert len(cases_list) == 1
    assert cases_list[0]["payment_id"] == "pay_001"
    assert cases_list[0]["decision_status"] == "auto_reconciled"

    app.dependency_overrides.clear()
