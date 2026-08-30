import uuid
from decimal import Decimal
from datetime import datetime, timezone
from unittest.mock import patch, MagicMock
import pytest

from backend.app.models.payment import PaymentModel
from backend.app.models.settlement import SettlementModel, SettlementsRawModel
from backend.app.models.refund import RefundModel
from backend.app.models.bank_credit import BankCreditModel, BankCreditsRawModel
from backend.app.models.reconciliation import ReconciliationCaseModel
from backend.app.models.review import HumanReviewActionModel, AuditEventModel
from backend.app.models.ingestion import IngestionBatchModel, PaymentsRawModel


def _seed_discrepancy_fixture(db_session) -> tuple[uuid.UUID, uuid.UUID]:
    """
    Seeds two deterministic test cases into PostgreSQL:
    1. case_amount_mismatch: Payment ₹500.00, Settlement ₹488.20, Bank Credit ₹400.00 (₹88.20 discrepancy).
    2. case_missing_settlement: Payment ₹200.00 with null settlement_id.
    """
    batch_id = uuid.uuid4()
    batch = IngestionBatchModel(
        id=batch_id,
        idempotency_key=uuid.uuid4().hex,
        batch_status="processed",
        source_tables=["payments", "settlements", "bank_credits"],
        submitted_at=datetime.now(timezone.utc),
    )
    db_session.add(batch)
    db_session.flush()

    raw_p1 = PaymentsRawModel(id=uuid.uuid4(), batch_id=batch_id, source_row_index=0, raw_payload={})
    raw_p2 = PaymentsRawModel(id=uuid.uuid4(), batch_id=batch_id, source_row_index=1, raw_payload={})
    raw_s1 = SettlementsRawModel(id=uuid.uuid4(), batch_id=batch_id, source_row_index=0, raw_payload={})
    raw_bc1 = BankCreditsRawModel(id=uuid.uuid4(), batch_id=batch_id, source_row_index=0, raw_payload={})
    
    db_session.add_all([raw_p1, raw_p2, raw_s1, raw_bc1])
    db_session.flush()

    # Case 1: Amount Mismatch
    # Note: Settlement must be added and flushed first so payments and bank credits can reference settlement_id
    set_1 = SettlementModel(
        id=uuid.uuid4(),
        raw_id=raw_s1.id,
        batch_id=batch_id,
        settlement_id="set_rag_001",
        merchant_id="merch_rag_001",
        settlement_type="standard",
        gross_payment_amount=Decimal("500.00"),
        refund_amount=Decimal("0.00"),
        fee_amount=Decimal("10.00"),
        tax_amount=Decimal("1.80"),
        adjustment_amount=Decimal("0.00"),
        net_settlement_amount=Decimal("488.20"),
        currency="INR",
        settlement_status="processed",
        settlement_timestamp=datetime.now(timezone.utc),
    )
    db_session.add(set_1)
    db_session.flush()

    pay_1 = PaymentModel(
        id=uuid.uuid4(),
        raw_id=raw_p1.id,
        batch_id=batch_id,
        payment_id="pay_rag_amt_001",
        order_id="ord_rag_001",
        merchant_id="merch_rag_001",
        payment_type="card",
        payment_method="upi",
        amount=Decimal("500.00"),
        currency="INR",
        status="captured",
        payment_timestamp=datetime.now(timezone.utc),
        settlement_id="set_rag_001",
    )
    bc_1 = BankCreditModel(
        id=uuid.uuid4(),
        raw_id=raw_bc1.id,
        batch_id=batch_id,
        bank_credit_id="bc_rag_001",
        bank_account_id="ba_rag_01",
        bank_name="HDFC Bank",
        bank_reference="UTR_RAG_001",
        settlement_id="set_rag_001",
        credited_amount=Decimal("400.00"),
        currency="INR",
        bank_credit_timestamp=datetime.now(timezone.utc),
        bank_credit_status="cleared",
        narration="Payout set_rag_001",
    )
    case_1 = ReconciliationCaseModel(
        id=uuid.uuid4(),
        batch_id=batch_id,
        payment_id="pay_rag_amt_001",
        exception_type="amount_mismatch",
        decision_status="needs_review",
        confidence="high",
        expected_net_settlement=Decimal("488.20"),
        reported_net_settlement=Decimal("400.00"),
        settlement_discrepancy=Decimal("88.20"),
        case_opened_at=datetime.now(timezone.utc),
        version=1,
    )

    # Case 2: Missing Settlement (payment has null settlement_id)
    pay_2 = PaymentModel(
        id=uuid.uuid4(),
        raw_id=raw_p2.id,
        batch_id=batch_id,
        payment_id="pay_rag_noset_002",
        order_id="ord_rag_002",
        merchant_id="merch_rag_001",
        payment_type="card",
        payment_method="upi",
        amount=Decimal("200.00"),
        currency="INR",
        status="captured",
        payment_timestamp=datetime.now(timezone.utc),
        settlement_id=None,
    )
    case_2 = ReconciliationCaseModel(
        id=uuid.uuid4(),
        batch_id=batch_id,
        payment_id="pay_rag_noset_002",
        exception_type="missing_settlement",
        decision_status="needs_review",
        confidence="high",
        expected_net_settlement=Decimal("195.28"),
        reported_net_settlement=None,
        settlement_discrepancy=Decimal("195.28"),
        case_opened_at=datetime.now(timezone.utc),
        version=1,
    )

    db_session.add_all([pay_1, bc_1, case_1, pay_2, case_2])
    db_session.commit()
    return case_1.id, case_2.id


@pytest.mark.integration
@patch("backend.app.rag.assistant.FallbackLLMClient")
def test_rag_investigation_grounded_postgres_facts(mock_llm_class, client, db_session):
    """
    Scenario 1: Grounded RAG Investigation on Real PostgreSQL Discrepancy.
    Verifies that the RAG assistant extracts exact SQL facts from PostgreSQL,
    retrieves policy chunks from the corpus, and returns structured grounded output.
    """
    # ── 1. Strategy D: Pre-Test Emptiness Assertions ─────────────────────────
    assert db_session.query(ReconciliationCaseModel).count() == 0
    assert db_session.query(PaymentModel).count() == 0

    case_amt_id, _ = _seed_discrepancy_fixture(db_session)

    # ── 2. Mock LLM Response with Grounded Evidence and Real Policy Citation ──
    mock_llm_instance = MagicMock()
    mock_llm_instance.invoke.return_value = '''```json
    {
      "summary": "Bank credit is short by 88.20 INR against the net settlement amount.",
      "root_cause_analysis": "Settlement set_rag_001 net settlement amount is 488.20 INR (500.00 gross minus 10.00 fee and 1.80 tax), but bank credit credited only 400.00 INR, leaving an uncredited discrepancy of 88.20 INR.",
      "recommended_action": "Contact beneficiary bank with UTR reference UTR_RAG_001 to trace uncredited 88.20 INR balance.",
      "citations": [
        {
          "source_file": "exception_policy.md",
          "quote": "Raised when bank_credit.credited_amount != settlement.net_settlement_amount."
        }
      ],
      "is_confident": true
    }
    ```'''
    mock_llm_class.return_value = mock_llm_instance

    # ── 3. Call RAG Investigation Endpoint ───────────────────────────────────
    res = client.post(f"/api/v1/rag/investigate/{case_amt_id}")
    assert res.status_code == 200

    data = res.json()
    assert "88.20" in data["summary"]
    assert "488.20" in data["root_cause_analysis"]
    assert "UTR_RAG_001" in data["recommended_action"]
    assert len(data["citations"]) == 1
    assert data["citations"][0]["source_file"] == "exception_policy.md"
    assert data["is_confident"] is True


@pytest.mark.integration
@patch("backend.app.rag.assistant.FallbackLLMClient")
def test_rag_investigation_read_only_zero_mutations(mock_llm_class, client, db_session):
    """
    Scenario 2: Read-Only / Zero-Mutation Invariant.
    Verifies that calling the RAG investigation assistant causes ZERO mutations
    across all database tables, creates NO audit events, and leaves case version untouched.
    """
    case_amt_id, _ = _seed_discrepancy_fixture(db_session)

    # ── 1. Record Table Row Counts Before RAG Invocation ─────────────────────
    counts_before = {
        "payments": db_session.query(PaymentModel).count(),
        "settlements": db_session.query(SettlementModel).count(),
        "bank_credits": db_session.query(BankCreditModel).count(),
        "refunds": db_session.query(RefundModel).count(),
        "reconciliation_cases": db_session.query(ReconciliationCaseModel).count(),
        "audit_events": db_session.query(AuditEventModel).count(),
        "human_review_actions": db_session.query(HumanReviewActionModel).count(),
        "ingestion_batches": db_session.query(IngestionBatchModel).count(),
    }

    mock_llm_instance = MagicMock()
    mock_llm_instance.invoke.return_value = '''{
      "summary": "Read-only test inquiry.",
      "root_cause_analysis": "Investigating discrepancy.",
      "recommended_action": "Review in queue.",
      "citations": [],
      "is_confident": true
    }'''
    mock_llm_class.return_value = mock_llm_instance

    # ── 2. Invoke RAG Investigation ──────────────────────────────────────────
    res = client.post(f"/api/v1/rag/investigate/{case_amt_id}")
    assert res.status_code == 200

    # ── 3. Assert Zero Database Mutations ────────────────────────────────────
    db_session.expire_all()
    counts_after = {
        "payments": db_session.query(PaymentModel).count(),
        "settlements": db_session.query(SettlementModel).count(),
        "bank_credits": db_session.query(BankCreditModel).count(),
        "refunds": db_session.query(RefundModel).count(),
        "reconciliation_cases": db_session.query(ReconciliationCaseModel).count(),
        "audit_events": db_session.query(AuditEventModel).count(),
        "human_review_actions": db_session.query(HumanReviewActionModel).count(),
        "ingestion_batches": db_session.query(IngestionBatchModel).count(),
    }

    assert counts_before == counts_after, f"Database mutated during RAG call: before={counts_before}, after={counts_after}"

    # Invariant: Case version and status remain unmodified (AI cannot approve or alter cases)
    case = db_session.get(ReconciliationCaseModel, case_amt_id)
    assert case.version == 1
    assert case.decision_status == "needs_review"


@pytest.mark.integration
@patch("backend.app.rag.assistant.FallbackLLMClient")
def test_rag_investigation_missing_and_partial_evidence_resilience(mock_llm_class, client, db_session):
    """
    Scenario 3: Missing & Partial Evidence Resilience.
    1. Non-existent case returns HTTP 404.
    2. Missing settlement evidence (payment with null settlement_id) executes cleanly.
    """
    _, case_noset_id = _seed_discrepancy_fixture(db_session)

    mock_llm_instance = MagicMock()
    mock_llm_instance.invoke.return_value = '''{
      "summary": "Captured payment has no settlement record.",
      "root_cause_analysis": "Payment pay_rag_noset_002 has no settlement_id referenced.",
      "recommended_action": "Contact payment gateway to verify payout batch schedule.",
      "citations": [
        {
          "source_file": "exception_policy.md",
          "quote": "The payment.settlement_id is null or the referenced settlement does not exist."
        }
      ],
      "is_confident": true
    }'''
    mock_llm_class.return_value = mock_llm_instance

    # ── 1. Non-existent Case returns 404 ─────────────────────────────────────
    non_existent_uuid = uuid.uuid4()
    res_404 = client.post(f"/api/v1/rag/investigate/{non_existent_uuid}")
    assert res_404.status_code == 404
    assert f"Case {non_existent_uuid} not found" in res_404.json()["detail"]

    # ── 2. Partial Evidence Case executes cleanly ────────────────────────────
    res_noset = client.post(f"/api/v1/rag/investigate/{case_noset_id}")
    assert res_noset.status_code == 200
    data = res_noset.json()
    assert "no settlement record" in data["summary"]
    assert len(data["citations"]) == 1
    assert data["citations"][0]["source_file"] == "exception_policy.md"
    assert data["is_confident"] is True


@pytest.mark.integration
@patch("backend.app.rag.assistant.FallbackLLMClient")
def test_rag_investigation_hallucination_guardrail_downgrades_confidence(mock_llm_class, client, db_session):
    """
    Scenario 4: Hallucination Downgrade Guardrail.
    If the LLM generates a citation with a quote that is NOT present in the retrieved
    corpus chunks, the assistant automatically downgrades `is_confident` to False.
    """
    case_amt_id, _ = _seed_discrepancy_fixture(db_session)

    mock_llm_instance = MagicMock()
    mock_llm_instance.invoke.return_value = '''{
      "summary": "Fabricated analysis scenario.",
      "root_cause_analysis": "Using an unverified policy claim.",
      "recommended_action": "Auto-waive difference.",
      "citations": [
        {
          "source_file": "exception_policy.md",
          "quote": "This is a completely fabricated policy sentence that never existed in the corpus."
        }
      ],
      "is_confident": true
    }'''
    mock_llm_class.return_value = mock_llm_instance

    res = client.post(f"/api/v1/rag/investigate/{case_amt_id}")
    assert res.status_code == 200
    data = res.json()

    # Guardrail triggered: confidence downgraded from true to false
    assert data["is_confident"] is False
