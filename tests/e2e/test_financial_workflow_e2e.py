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
    assert db_session.query(PaymentsRawModel).filter_by(batch_id=pay_data["batch_id"]).count() == 5
    assert db_session.query(PaymentModel).filter_by(batch_id=pay_data["batch_id"]).count() == 4
    for p in db_session.query(PaymentModel).filter_by(batch_id=pay_data["batch_id"]).all():
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
    assert db_session.query(SettlementsRawModel).filter_by(batch_id=set_data["batch_id"]).count() == 4
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
    assert db_session.query(RefundsRawModel).filter_by(batch_id=ref_data["batch_id"]).count() == 1
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
    assert db_session.query(BankCreditsRawModel).filter_by(batch_id=bc_data["batch_id"]).count() == 2
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
    from tests.conftest import create_test_user_session
    token, _ = create_test_user_session(db_session, role="reviewer", email="finance_lead_sathvik")
    client.cookies.set("ledgerlens_session", token)

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


@pytest.mark.e2e
@pytest.mark.integration
def test_truthful_state_transition_full_cycle(client, db_session):
    """
    Verifies the complete truthful state transition cycle:
    1. Confirm real zero state (0 records, 0 metrics, has_run=False, empty queue, empty feeds).
    2. Load known synthetic 4-source fixture (seed=42, 60 records).
    3. Run deterministic reconciliation.
    4. Confirm non-zero computed metrics (70% parity, reconciled value, exposure, 6 exception types).
    5. Confirm review queue (18 cases), representative case evidence, and operator sign-off.
    6. Confirm append-only audit event persistence.
    7. Clean up test database and verify return to zero state.
    """
    from tests.conftest import create_test_user_session
    from tests.evaluation.generator_fixture import generate_evaluation_dataset

    token, user = create_test_user_session(db_session, role="reviewer", email="transition_lead@ledgerlens.internal")
    client.cookies.set("ledgerlens_session", token)

    # ── Phase 1: Confirm Real Zero Backend State ─────────────────────────────
    # Overview / Stats
    res_stats_zero = client.get("/api/v1/reconciliation/stats")
    assert res_stats_zero.status_code == 200
    stats_zero = res_stats_zero.json()
    assert stats_zero["total_payments_count"] == 0
    assert stats_zero["total_settlements_count"] == 0
    assert stats_zero["total_refunds_count"] == 0
    assert stats_zero["total_bank_credits_count"] == 0
    assert stats_zero["total_cases"] == 0
    assert stats_zero["auto_reconciled_count"] == 0
    assert stats_zero["needs_review_count"] == 0
    assert stats_zero["unresolved_count"] == 0
    assert stats_zero["match_rate_percentage"] == 0.0
    assert stats_zero["total_amount_reconciled"] == "0.00"
    assert stats_zero["total_amount_at_risk"] == "0.00"
    assert stats_zero["exception_breakdown"] == {}
    assert stats_zero["has_run"] is False

    # Review Queue
    res_queue_zero = client.get("/api/v1/review/queue")
    assert res_queue_zero.status_code == 200
    queue_zero = res_queue_zero.json()
    assert queue_zero["total_cases"] == 0
    assert len(queue_zero["cases"]) == 0
    assert queue_zero["total_amount_at_risk"] == "0.00"

    # Ingestion Feeds Status
    res_ingest_zero = client.get("/api/v1/ingestion/status")
    assert res_ingest_zero.status_code == 200
    ingest_zero = res_ingest_zero.json()
    assert ingest_zero["feeds"]["payments"]["count"] == 0
    assert ingest_zero["feeds"]["settlements"]["count"] == 0
    assert ingest_zero["feeds"]["refunds"]["count"] == 0
    assert ingest_zero["feeds"]["bank_credits"]["count"] == 0
    assert len(ingest_zero["batches"]) == 0

    # ── Phase 2: Load Known Synthetic Four-Source Fixture ────────────────────
    csv_streams, meta = generate_evaluation_dataset(total_records=60, seed=42)

    # Ingest Payments (60 valid, 1 malformed rejected)
    res_p = client.post(
        "/api/v1/ingestion/payments",
        files={"file": ("payments.csv", io.BytesIO(csv_streams["payments"].encode("utf-8")), "text/csv")},
    )
    assert res_p.status_code == 201
    assert res_p.json()["row_count_accepted"] == 60

    # Ingest Settlements (58 valid)
    res_s = client.post(
        "/api/v1/ingestion/settlements",
        files={"file": ("settlements.csv", io.BytesIO(csv_streams["settlements"].encode("utf-8")), "text/csv")},
    )
    assert res_s.status_code == 201
    assert res_s.json()["row_count_accepted"] == 58

    # Ingest Refunds (3 valid)
    res_r = client.post(
        "/api/v1/ingestion/refunds",
        files={"file": ("refunds.csv", io.BytesIO(csv_streams["refunds"].encode("utf-8")), "text/csv")},
    )
    assert res_r.status_code == 201
    assert res_r.json()["row_count_accepted"] == 3

    # Ingest Bank Credits (54 valid)
    res_b = client.post(
        "/api/v1/ingestion/bank-credits",
        files={"file": ("bank_credits.csv", io.BytesIO(csv_streams["bank_credits"].encode("utf-8")), "text/csv")},
    )
    assert res_b.status_code == 201
    assert res_b.json()["row_count_accepted"] == 54

    # Confirm feeds updated in ingestion status
    res_ingest_updated = client.get("/api/v1/ingestion/status")
    assert res_ingest_updated.status_code == 200
    ingest_updated = res_ingest_updated.json()
    assert ingest_updated["feeds"]["payments"]["count"] == 60
    assert ingest_updated["feeds"]["settlements"]["count"] == 58
    assert ingest_updated["feeds"]["refunds"]["count"] == 3
    assert ingest_updated["feeds"]["bank_credits"]["count"] == 54
    assert len(ingest_updated["batches"]) == 4

    # ── Phase 3: Run Multi-Source Deterministic Reconciliation ────────────────
    res_run = client.post("/api/v1/reconciliation/run", headers={"Content-Type": "application/json"})
    assert res_run.status_code == 200
    run_data = res_run.json()
    assert run_data["total_payments_processed"] == 60
    assert run_data["auto_reconciled_count"] == 42
    assert run_data["needs_review_count"] == 18
    assert run_data["match_rate_percentage"] == 70.0

    # ── Phase 4: Confirm Non-Zero Computed Metrics (After) ───────────────────
    res_stats_after = client.get("/api/v1/reconciliation/stats")
    assert res_stats_after.status_code == 200
    stats_after = res_stats_after.json()
    assert stats_after["total_payments_count"] == 60
    assert stats_after["total_cases"] == 60
    assert stats_after["auto_reconciled_count"] == 42
    assert stats_after["needs_review_count"] == 18
    assert stats_after["unresolved_count"] == 0
    assert stats_after["match_rate_percentage"] == 70.0
    assert Decimal(stats_after["total_amount_reconciled"]) > Decimal("0.00")
    assert Decimal(stats_after["total_amount_at_risk"]) > Decimal("0.00")
    assert stats_after["has_run"] is True

    # Confirm 6 active exception categories from fixture
    exc_breakdown = stats_after["exception_breakdown"]
    assert exc_breakdown.get("amount_mismatch") == 4
    assert exc_breakdown.get("missing_bank_credit") == 4
    assert exc_breakdown.get("partial_refund_not_reflected") == 3
    assert exc_breakdown.get("fee_mismatch") == 3
    assert exc_breakdown.get("duplicate_payment") == 2
    assert exc_breakdown.get("missing_settlement") == 2

    # ── Phase 5: Confirm Review Queue Cases & Evidence Dossier ───────────────
    res_queue_after = client.get("/api/v1/review/queue")
    assert res_queue_after.status_code == 200
    queue_after = res_queue_after.json()
    assert queue_after["total_cases"] == 18
    assert len(queue_after["cases"]) == 18
    assert Decimal(queue_after["total_amount_at_risk"]) > Decimal("0.00")

    first_case = queue_after["cases"][0]
    target_case_id = first_case["case_id"]

    # Retrieve Case Evidence
    res_evidence = client.get(f"/api/v1/review/cases/{target_case_id}")
    assert res_evidence.status_code == 200
    evidence = res_evidence.json()
    assert evidence["case_id"] == target_case_id
    assert evidence["payment_id"] is not None
    assert evidence["payment"] is not None
    assert evidence["version"] == 1

    # ── Phase 6: Human Review Sign-Off & Append-Only Audit Trail ─────────────
    review_res = client.post(
        f"/api/v1/review/cases/{target_case_id}/review",
        json={
            "actor": "transition_lead@ledgerlens.internal",
            "action": "approve",
            "expected_version": 1,
            "human_comment": "Verified multi-source trace. Cleared variance for state transition test.",
        }
    )
    assert review_res.status_code == 200
    review_receipt = review_res.json()
    assert review_receipt["current_version"] == 2
    assert review_receipt["new_decision_status"] == "auto_reconciled"
    assert review_receipt["audit_event_id"] is not None

    # Verify Audit Trail for Case
    res_case_audit = client.get(f"/api/v1/review/cases/{target_case_id}/audit")
    assert res_case_audit.status_code == 200
    case_audit = res_case_audit.json()
    assert len(case_audit) == 1
    assert case_audit[0]["event_type"] == "human_approved"
    assert case_audit[0]["actor"] == "transition_lead@ledgerlens.internal"

    # Verify Global Audit Log
    res_all_audit = client.get("/api/v1/review/audit/all")
    assert res_all_audit.status_code == 200
    assert len(res_all_audit.json()) >= 1

    # ── Phase 7: Clean Up Test Database & Verify Return to Zero State ────────
    db_session.rollback()
    from tests.conftest import truncate_all_tables
    truncate_all_tables()

    # Re-create session since truncate removes user_sessions & users
    token_clean, _ = create_test_user_session(db_session, role="reviewer", email="transition_lead@ledgerlens.internal")
    client.cookies.set("ledgerlens_session", token_clean)

    res_stats_cleaned = client.get("/api/v1/reconciliation/stats")
    assert res_stats_cleaned.status_code == 200
    assert res_stats_cleaned.json()["total_payments_count"] == 0
    assert res_stats_cleaned.json()["total_cases"] == 0
    assert res_stats_cleaned.json()["has_run"] is False
