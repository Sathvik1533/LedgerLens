import pytest
import uuid
from decimal import Decimal
from datetime import datetime, timezone
from sqlalchemy import select

from backend.app.models.reconciliation import ReconciliationCaseModel
from backend.app.models.review import HumanReviewActionModel, AuditEventModel

@pytest.mark.integration
def test_optimistic_locking_success_and_conflict(client, db_session):
    # 1. Setup case at version=1
    from backend.app.models.ingestion import IngestionBatchModel, PaymentsRawModel
    from backend.app.models.payment import PaymentModel
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
        decision_status="needs_review",
        confidence="high",
        expected_net_settlement=Decimal("100.00"),
        case_opened_at=datetime.now(timezone.utc),
        version=1
    )
    db_session.add(case)
    db_session.commit()
    
    # 2. Success path: Submit action with expected_version=1
    res1 = client.post(
        f"/api/v1/review/cases/{case_id}/review",
        json={"actor": "tester", "action": "approve", "expected_version": 1}
    )
    assert res1.status_code == 200
    
    # Verify DB state mutated and audit event wrote
    db_session.refresh(case)
    assert case.version == 2
    assert case.decision_status == "auto_reconciled"
    assert db_session.query(AuditEventModel).filter_by(case_id=case_id).count() == 1
    
    case.decision_status = "needs_review"
    db_session.commit()
    # 3. Conflict path: Concurrently submit action again with expected_version=1
    res2 = client.post(
        f"/api/v1/review/cases/{case_id}/review",
        json={"actor": "tester2", "action": "reject", "expected_version": 1}
    )
    assert res2.status_code == 409
    assert "version mismatch" in res2.json()["detail"]
    
    # Verify DB state didn't mutate and NO new audit event wrote
    db_session.refresh(case)
    assert case.version == 2
    assert case.decision_status == "needs_review"
    assert db_session.query(AuditEventModel).filter_by(case_id=case_id).count() == 1
