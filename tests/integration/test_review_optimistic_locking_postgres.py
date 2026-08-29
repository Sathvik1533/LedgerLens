import pytest
from sqlalchemy import text
import uuid
from decimal import Decimal
from datetime import datetime, timezone

from backend.app.models.reconciliation import ReconciliationCaseModel
from backend.app.models.review import HumanReviewActionModel, AuditEventModel
from backend.app.models.ingestion import IngestionBatchModel, PaymentsRawModel
from backend.app.models.payment import PaymentModel

def _setup_case_in_db(db_session, version: int, decision_status: str = "needs_review"):
    batch_id = uuid.uuid4()
    batch = IngestionBatchModel(
        id=batch_id, idempotency_key=uuid.uuid4().hex, batch_status="processed", source_tables=["payments"],
        submitted_at=datetime.now(timezone.utc)
    )
    raw_id = uuid.uuid4()
    raw = PaymentsRawModel(id=raw_id, batch_id=batch_id, source_row_index=0, raw_payload={})
    db_session.add(batch)
    db_session.add(raw)
    db_session.flush()

    payment_id = f"pay_{uuid.uuid4().hex}"
    payment = PaymentModel(
        id=uuid.uuid4(), raw_id=raw_id, batch_id=batch_id, payment_id=payment_id,
        order_id="o1", merchant_id="m1", payment_type="card", payment_method="upi", amount=Decimal("100.00"), currency="INR",
        status="captured", payment_timestamp=datetime.now(timezone.utc)
    )
    db_session.add(payment)
    db_session.flush()

    case_id = uuid.uuid4()
    case = ReconciliationCaseModel(
        id=case_id,
        batch_id=batch_id,
        payment_id=payment_id,
        exception_type="amount_mismatch",
        decision_status=decision_status,
        confidence="high",
        expected_net_settlement=Decimal("100.00"),
        case_opened_at=datetime.now(timezone.utc),
        version=version
    )
    db_session.add(case)
    db_session.commit()
    return case_id

@pytest.mark.integration
def test_optimistic_locking_success(client, db_session):
    # Setup natural state: case is needs_review, version 1
    case_id = _setup_case_in_db(db_session, version=1, decision_status="needs_review")

    # Request with correct expected version
    res = client.post(
        f"/api/v1/review/cases/{case_id}/review",
        json={"actor": "tester", "action": "approve", "expected_version": 1}
    )
    assert res.status_code == 200

    body = res.json()
    assert body["current_version"] == 2
    assert body["new_decision_status"] == "auto_reconciled"

    # Status transition succeeds, version increments exactly once
    case = db_session.get(ReconciliationCaseModel, case_id)
    assert case.version == 2
    assert case.decision_status == "auto_reconciled"

    # One review/audit record is created
    assert db_session.query(HumanReviewActionModel).filter_by(case_id=case_id).count() == 1
    assert db_session.query(AuditEventModel).filter_by(case_id=case_id).count() == 1


@pytest.mark.integration
def test_optimistic_locking_stale_version_rejection(client, db_session):
    # Setup natural state: case is needs_review, version 2
    case_id = _setup_case_in_db(db_session, version=2, decision_status="needs_review")

    # Submit a review request with stale expected_version = 1
    res = client.post(
        f"/api/v1/review/cases/{case_id}/review",
        json={"actor": "tester2", "action": "reject", "expected_version": 1}
    )

    # Assert HTTP 409
    assert res.status_code == 409
    assert "mismatch" in res.json()["detail"].lower() or "status changed" in res.json()["detail"].lower()

    # Case remains needs_review, case version remains 2
    db_session.expire_all() # ensure we fetch fresh from DB
    case = db_session.get(ReconciliationCaseModel, case_id)
    assert case.version == 2
    assert case.decision_status == "needs_review"

    # No review action is created, no audit event is created
    assert db_session.query(HumanReviewActionModel).filter_by(case_id=case_id).count() == 0
    assert db_session.query(AuditEventModel).filter_by(case_id=case_id).count() == 0

    # Session is usable after conflict
    assert db_session.execute(text("SELECT 1")).scalar() == 1
