import asyncio
import uuid
from decimal import Decimal
from datetime import datetime, timezone
from typing import Dict, Any

import httpx
import pytest

from backend.app.models.reconciliation import ReconciliationCaseModel
from backend.app.models.review import HumanReviewActionModel, AuditEventModel
from backend.app.models.ingestion import IngestionBatchModel, PaymentsRawModel
from backend.app.models.payment import PaymentModel


def _seed_needs_review_case(db_session) -> uuid.UUID:
    """Seeds a single, deterministic case in needs_review state with version=1."""
    batch_id = uuid.uuid4()
    batch = IngestionBatchModel(
        id=batch_id,
        idempotency_key=uuid.uuid4().hex,
        batch_status="processed",
        source_tables=["payments"],
        submitted_at=datetime.now(timezone.utc),
    )
    raw_id = uuid.uuid4()
    raw = PaymentsRawModel(id=raw_id, batch_id=batch_id, source_row_index=0, raw_payload={})
    db_session.add(batch)
    db_session.add(raw)
    db_session.flush()

    payment_id = f"pay_concur_{uuid.uuid4().hex[:8]}"
    payment = PaymentModel(
        id=uuid.uuid4(),
        raw_id=raw_id,
        batch_id=batch_id,
        payment_id=payment_id,
        order_id="ord_concur_01",
        merchant_id="merch_concur_01",
        payment_type="card",
        payment_method="upi",
        amount=Decimal("500.00"),
        currency="INR",
        status="captured",
        payment_timestamp=datetime.now(timezone.utc),
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
        expected_net_settlement=Decimal("488.20"),
        reported_net_settlement=Decimal("400.00"),
        settlement_discrepancy=Decimal("88.20"),
        case_opened_at=datetime.now(timezone.utc),
        version=1,
    )
    db_session.add(case)
    db_session.commit()
    return case_id


async def worker_review_task(
    client: httpx.AsyncClient,
    barrier: asyncio.Barrier,
    case_id: uuid.UUID,
    worker_id: int,
    expected_version: int = 1,
) -> Dict[str, Any]:
    """
    Asynchronous reviewer task:
    1. Suspends at asyncio.Barrier until all N workers arrive.
    2. Fires HTTP POST /api/v1/review/cases/{case_id}/review simultaneously.
    3. Returns worker_id, status_code, and response body for central aggregation.
    """
    await barrier.wait()
    response = await client.post(
        f"/api/v1/review/cases/{case_id}/review",
        json={
            "actor": f"finance_ops_async_worker_{worker_id:02d}",
            "action": "approve",
            "expected_version": expected_version,
            "human_comment": f"Simultaneous review action by async worker {worker_id}",
        },
    )
    return {
        "worker_id": worker_id,
        "status_code": response.status_code,
        "data": response.json(),
    }


@pytest.mark.asyncio
@pytest.mark.integration
async def test_concurrent_review_optimistic_locking_race_condition(client_async, db_session):
    """
    Async Concurrency Race Condition Test:
    1. Pre-test emptiness assertion (Strategy D).
    2. Seed a deterministic case needing review (version=1, decision_status='needs_review').
    3. Spawn 10 async worker coroutines synchronized via asyncio.Barrier.
    4. Execute simultaneously via asyncio.gather.
    5. Assert exactly 1 HTTP 200, 9 HTTP 409, 0 HTTP 500.
    6. Verify database state: version == 2, exactly 1 review action, exactly 1 audit event.
    """

    # ── 1. Strategy D: Pre-Test Emptiness Assertions ─────────────────────────
    assert db_session.query(ReconciliationCaseModel).count() == 0
    assert db_session.query(AuditEventModel).count() == 0
    assert db_session.query(HumanReviewActionModel).count() == 0

    # ── 2. Seed Single Needs-Review Case ─────────────────────────────────────
    case_id = _seed_needs_review_case(db_session)

    # ── 3. Synchronize 10 Async Workers via Barrier ──────────────────────────
    num_workers = 10
    barrier = asyncio.Barrier(num_workers)

    tasks = [
        worker_review_task(
            client=client_async,
            barrier=barrier,
            case_id=case_id,
            worker_id=i,
            expected_version=1,
        )
        for i in range(num_workers)
    ]

    # ── 4. Fire All 10 Requests Simultaneously ───────────────────────────────
    results = await asyncio.gather(*tasks)

    # ── 5. Assert HTTP Status Invariants ─────────────────────────────────────
    status_codes = [r["status_code"] for r in results]
    assert status_codes.count(200) == 1, f"Expected 1 winner (HTTP 200), got {status_codes.count(200)}"
    assert status_codes.count(409) == 9, f"Expected 9 losers (HTTP 409), got {status_codes.count(409)}"
    assert status_codes.count(500) == 0, f"Expected 0 server errors (HTTP 500), got {status_codes.count(500)}"

    # ── 6. Assert Database Consistency and Audit Integrity ───────────────────
    db_session.expire_all()
    case = db_session.get(ReconciliationCaseModel, case_id)
    assert case.version == 2
    assert case.decision_status == "auto_reconciled"
    assert case.resolution_reason == "approve"
    assert case.case_closed_at is not None

    # Exactly one review action record created
    actions = db_session.query(HumanReviewActionModel).filter_by(case_id=case_id).all()
    assert len(actions) == 1
    assert actions[0].previous_decision_status == "needs_review"
    assert actions[0].new_decision_status == "auto_reconciled"

    # Exactly one audit event created in the same transaction
    audit_events = db_session.query(AuditEventModel).filter_by(case_id=case_id).all()
    assert len(audit_events) == 1
    assert audit_events[0].event_type == "human_approved"
    assert audit_events[0].previous_status == "needs_review"
    assert audit_events[0].new_status == "auto_reconciled"
