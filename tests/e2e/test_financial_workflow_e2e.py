import io
import pytest
from decimal import Decimal

from backend.app.models.payment import PaymentModel
from backend.app.models.settlement import SettlementModel, SettlementsRawModel
from backend.app.models.refund import RefundModel, RefundsRawModel
from backend.app.models.bank_credit import BankCreditModel, BankCreditsRawModel
from backend.app.models.reconciliation import ReconciliationCaseModel
from backend.app.models.review import HumanReviewActionModel, AuditEventModel
from backend.app.models.ingestion import IngestionBatchModel, PaymentsRawModel
from backend.app.rag.tools.sql_tool import SQLEvidenceTool


@pytest.mark.e2e
@pytest.mark.integration
def test_four_source_financial_workflow_e2e(client, db_session):
    """
    End-to-End Financial Operations Workflow:
    1. Pre-test database emptiness assertion (Strategy D).
    2. Four-source CSV ingestion through FastAPI endpoints (with partial validation rejection).
    3. Multi-source deterministic reconciliation execution.
    4. Review queue and exception case triage retrieval.
    5. Read-only SQL evidence tool fact aggregation.
    6. Human review decision with optimistic locking (version 1 -> 2).
    7. Persisted audit event creation within the same transaction.
    8. Stale review rejection (HTTP 409) with no additional audit events.
    """

    # ── 1. Strategy D: Pre-Test Emptiness Assertions ─────────────────────────
    assert db_session.query(PaymentModel).count() == 0
    assert db_session.query(SettlementModel).count() == 0
    assert db_session.query(RefundModel).count() == 0
    assert db_session.query(BankCreditModel).count() == 0
    assert db_session.query(ReconciliationCaseModel).count() == 0
    assert db_session.query(AuditEventModel).count() == 0
    assert db_session.query(HumanReviewActionModel).count() == 0
    assert db_session.query(IngestionBatchModel).count() == 0

    # ── 2. Ingestion Phase: Four Financial Sources via HTTP ──────────────────

    # Source 1: Payments CSV (4 valid records + 1 invalid decimal row)
    payments_csv = (
        "payment_id,order_id,merchant_id,payment_type,payment_method,amount,currency,status,payment_timestamp,settlement_id\n"
        "pay_e2e_001,ord_001,merch_001,card,upi,100.00,INR,captured,2026-08-29T10:00:00Z,set_e2e_001\n"
        "pay_e2e_002,ord_002,merch_001,card,upi,500.00,INR,captured,2026-08-29T10:05:00Z,set_e2e_002\n"
        "pay_e2e_003,ord_003,merch_001,card,upi,200.00,INR,captured,2026-08-29T10:10:00Z,set_e2e_003\n"
        "pay_e2e_004,ord_004,merch_001,card,upi,300.00,INR,captured,2026-08-29T10:15:00Z,set_e2e_004\n"
        "pay_e2e_inv,ord_inv,merch_001,card,upi,INVALID_DECIMAL,INR,captured,2026-08-29T10:20:00Z,set_e2e_inv\n"
    )
    res_pay = client.post(
        "/api/v1/ingestion/payments",
        files={"file": ("payments.csv", io.BytesIO(payments_csv.encode("utf-8")), "text/csv")},
    )
    assert res_pay.status_code == 201
    pay_data = res_pay.json()
    assert pay_data["row_count_submitted"] == 5
    assert pay_data["row_count_accepted"] == 4
    assert pay_data["row_count_rejected"] == 1
    assert pay_data["batch_status"] == "completed_with_errors"
    assert len(pay_data["errors"]) == 1
    assert pay_data["errors"][0]["source_row_index"] == 4

    # Assert raw vs normalized payments in DB
    db_session.expire_all()
    assert db_session.query(PaymentsRawModel).count() == 5
    assert db_session.query(PaymentModel).count() == 4
    for p in db_session.query(PaymentModel).all():
        assert p.currency == "INR"

    # Source 2: Settlements CSV (4 valid records matching payments)
    settlements_csv = (
        "settlement_id,merchant_id,settlement_type,gross_payment_amount,refund_amount,fee_amount,tax_amount,adjustment_amount,net_settlement_amount,currency,settlement_status,settlement_timestamp\n"
        "set_e2e_001,merch_001,standard,100.00,0.00,2.00,0.36,0.00,97.64,INR,processed,2026-08-29T12:00:00Z\n"
        "set_e2e_002,merch_001,standard,500.00,0.00,10.00,1.80,0.00,488.20,INR,processed,2026-08-29T12:00:00Z\n"
        "set_e2e_003,merch_001,standard,200.00,0.00,4.00,0.72,0.00,195.28,INR,processed,2026-08-29T12:00:00Z\n"
        "set_e2e_004,merch_001,standard,300.00,0.00,6.00,1.08,0.00,292.92,INR,processed,2026-08-29T12:00:00Z\n"
    )
    res_set = client.post(
        "/api/v1/ingestion/settlements",
        files={"file": ("settlements.csv", io.BytesIO(settlements_csv.encode("utf-8")), "text/csv")},
    )
    assert res_set.status_code == 201
    set_data = res_set.json()
    assert set_data["row_count_submitted"] == 4
    assert set_data["row_count_accepted"] == 4
    assert set_data["row_count_rejected"] == 0
    assert set_data["batch_status"] == "completed"

    db_session.expire_all()
    assert db_session.query(SettlementsRawModel).count() == 4
    assert db_session.query(SettlementModel).count() == 4

    # Source 3: Refunds CSV (1 valid partial refund on pay_e2e_004)
    refunds_csv = (
        "refund_id,payment_id,order_id,refund_amount,currency,refund_status,refund_timestamp,refund_type\n"
        "ref_e2e_001,pay_e2e_004,ord_004,50.00,INR,processed,2026-08-29T11:00:00Z,partial\n"
    )
    res_ref = client.post(
        "/api/v1/ingestion/refunds",
        files={"file": ("refunds.csv", io.BytesIO(refunds_csv.encode("utf-8")), "text/csv")},
    )
    assert res_ref.status_code == 201
    ref_data = res_ref.json()
    assert ref_data["row_count_submitted"] == 1
    assert ref_data["row_count_accepted"] == 1
    assert ref_data["row_count_rejected"] == 0

    db_session.expire_all()
    assert db_session.query(RefundsRawModel).count() == 1
    assert db_session.query(RefundModel).count() == 1

    # Source 4: Bank Credits CSV (2 valid records: exact credit for set_001, short credit for set_002)
    bank_credits_csv = (
        "bank_credit_id,bank_account_id,bank_name,bank_reference,settlement_id,credited_amount,currency,bank_credit_timestamp,bank_credit_status,narration\n"
        "bc_e2e_001,ba_01,HDFC Bank,ref_e2e_001,set_e2e_001,97.64,INR,2026-08-29T14:00:00Z,cleared,Payout set_e2e_001\n"
        "bc_e2e_002,ba_01,HDFC Bank,ref_e2e_002,set_e2e_002,400.00,INR,2026-08-29T14:00:00Z,cleared,Payout set_e2e_002\n"
    )
    res_bc = client.post(
        "/api/v1/ingestion/bank-credits",
        files={"file": ("bank_credits.csv", io.BytesIO(bank_credits_csv.encode("utf-8")), "text/csv")},
    )
    assert res_bc.status_code == 201
    bc_data = res_bc.json()
    assert bc_data["row_count_submitted"] == 2
    assert bc_data["row_count_accepted"] == 2
    assert bc_data["row_count_rejected"] == 0

    db_session.expire_all()
    assert db_session.query(BankCreditsRawModel).count() == 2
    assert db_session.query(BankCreditModel).count() == 2
    assert db_session.query(IngestionBatchModel).count() == 4

    # ── 3. Multi-Source Reconciliation Trigger via HTTP ──────────────────────
    res_recon = client.post(f"/api/v1/reconciliation/run?batch_id={pay_data['batch_id']}")
    assert res_recon.status_code == 200
    recon_summary = res_recon.json()

    assert recon_summary["total_payments_processed"] == 4
    assert recon_summary["auto_reconciled_count"] == 1
    assert recon_summary["needs_review_count"] == 3
    assert recon_summary["unresolved_count"] == 0
    assert recon_summary["match_rate_percentage"] == 25.0
    assert Decimal(str(recon_summary["total_amount_reconciled"])) == Decimal("100.00")
    assert Decimal(str(recon_summary["total_amount_at_risk"])) == Decimal("1000.00")

    # Verify persisted cases in PostgreSQL
    db_session.expire_all()
    cases = db_session.query(ReconciliationCaseModel).all()
    assert len(cases) == 4
    cases_by_payment = {c.payment_id: c for c in cases}

    # Case 1: Auto-reconciled
    c1 = cases_by_payment["pay_e2e_001"]
    assert c1.decision_status == "auto_reconciled"
    assert c1.exception_type is None
    assert c1.resolution_reason == "matched"
    assert c1.confidence == "high"
    assert c1.version == 1
    assert c1.currency == "INR"

    # Case 2: Amount mismatch
    c2 = cases_by_payment["pay_e2e_002"]
    assert c2.decision_status == "needs_review"
    assert c2.exception_type == "amount_mismatch"
    assert c2.settlement_discrepancy == Decimal("88.20")
    assert c2.version == 1
    assert c2.currency == "INR"

    # Case 3: Missing bank credit
    c3 = cases_by_payment["pay_e2e_003"]
    assert c3.decision_status == "needs_review"
    assert c3.exception_type == "missing_bank_credit"
    assert c3.version == 1
    assert c3.currency == "INR"

    # Case 4: Partial refund not reflected
    c4 = cases_by_payment["pay_e2e_004"]
    assert c4.decision_status == "needs_review"
    assert c4.exception_type == "partial_refund_not_reflected"
    assert c4.version == 1
    assert c4.currency == "INR"

    # ── 4. Case Triage & Review Queue Endpoints via HTTP ─────────────────────
    res_queue = client.get("/api/v1/review/queue")
    assert res_queue.status_code == 200
    queue_data = res_queue.json()
    assert queue_data["total_cases"] == 3
    assert Decimal(str(queue_data["total_amount_at_risk"])) == Decimal("1000.00")

    res_cases = client.get("/api/v1/reconciliation/cases?decision_status=needs_review")
    assert res_cases.status_code == 200
    review_cases_list = res_cases.json()
    assert len(review_cases_list) == 3

    # ── 5. Non-HTTP Read-Only Evidence Tool Integration ──────────────────────
    sql_tool = SQLEvidenceTool(db_session)
    evidence = sql_tool.get_case_evidence(str(c2.id))
    assert evidence["case_id"] == str(c2.id)
    assert evidence["payment_id"] == "pay_e2e_002"
    assert evidence["currency"] == "INR"
    assert Decimal(evidence["payment"]["amount"]) == Decimal("500.00")
    assert Decimal(evidence["settlement"]["net_settlement_amount"]) == Decimal("488.20")
    assert len(evidence["bank_credits"]) == 1
    assert Decimal(evidence["bank_credits"][0]["credited_amount"]) == Decimal("400.00")
    assert Decimal(evidence["settlement_discrepancy"]) == Decimal("88.20")

    # ── 6. Human Review Decision with Optimistic Locking via HTTP ────────────
    # A successful review action creates a persisted audit event in the same database
    # transaction as the case update and review-action record.
    review_payload = {
        "actor": "finance_lead_sathvik",
        "action": "approve",
        "expected_version": 1,
        "human_comment": "Verified bank statement. Short credit of 88.20 INR acknowledged.",
    }
    res_rev = client.post(f"/api/v1/review/cases/{c2.id}/review", json=review_payload)
    assert res_rev.status_code == 200
    rev_resp = res_rev.json()
    assert rev_resp["current_version"] == 2
    assert rev_resp["previous_decision_status"] == "needs_review"
    assert rev_resp["new_decision_status"] == "auto_reconciled"
    assert rev_resp["actor"] == "finance_lead_sathvik"
    assert rev_resp["audit_event_id"] is not None

    # Assert PostgreSQL transaction persistence for case, review action, and audit event
    db_session.expire_all()
    updated_c2 = db_session.get(ReconciliationCaseModel, c2.id)
    assert updated_c2.version == 2
    assert updated_c2.decision_status == "auto_reconciled"

    review_action = (
        db_session.query(HumanReviewActionModel)
        .filter(HumanReviewActionModel.case_id == c2.id)
        .one()
    )
    assert review_action.actor == "finance_lead_sathvik"
    assert review_action.action == "approve"
    assert review_action.new_decision_status == "auto_reconciled"

    audit_event = (
        db_session.query(AuditEventModel)
        .filter(AuditEventModel.case_id == c2.id)
        .one()
    )
    assert audit_event.event_type == "human_approved"
    assert audit_event.actor == "finance_lead_sathvik"
    assert audit_event.previous_status == "needs_review"
    assert audit_event.new_status == "auto_reconciled"

    # ── 7. Audit Trail Retrieval via HTTP ────────────────────────────────────
    res_audit = client.get(f"/api/v1/review/cases/{c2.id}/audit")
    assert res_audit.status_code == 200
    audit_trail = res_audit.json()
    assert len(audit_trail) == 1
    assert audit_trail[0]["id"] == str(audit_event.id)
    assert audit_trail[0]["event_type"] == "human_approved"
    assert audit_trail[0]["actor"] == "finance_lead_sathvik"
    assert audit_trail[0]["new_status"] == "auto_reconciled"

    # ── 8. Stale Review Action Rejection via HTTP ────────────────────────────
    # Attempting to submit another review with stale expected_version=1 must return HTTP 409
    stale_review_payload = {
        "actor": "secondary_reviewer",
        "action": "reject",
        "expected_version": 1,
        "human_comment": "Concurrent stale attempt.",
    }
    res_stale = client.post(f"/api/v1/review/cases/{c2.id}/review", json=stale_review_payload)
    assert res_stale.status_code == 409

    # Verify no state mutation occurred in database
    db_session.expire_all()
    assert db_session.get(ReconciliationCaseModel, c2.id).version == 2
    assert db_session.query(HumanReviewActionModel).filter_by(case_id=c2.id).count() == 1
    assert db_session.query(AuditEventModel).filter_by(case_id=c2.id).count() == 1
