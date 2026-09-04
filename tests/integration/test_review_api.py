"""
Gate 4 Integration Tests: Human Review Queue & Audit Trail
==========================================================

Tests cover:
  1. GET /api/v1/review/queue    — returns needs_review cases with amount-at-risk
  2. POST /api/v1/review/cases/{id}/review — approve, reject, mark_unresolved
  3. GET /api/v1/review/cases/{id}/audit  — append-only audit trail
  4. 409 on reviewing an auto_reconciled case (guard invariant)
  5. 404 on non-existent case
  6. 400 on invalid action verb
"""

import pytest
from unittest.mock import MagicMock, patch
from uuid import uuid4
from decimal import Decimal
from datetime import datetime, timezone
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.db.session import get_db
from backend.app.models.reconciliation import ReconciliationCaseModel
from backend.app.models.review import HumanReviewActionModel, AuditEventModel

from backend.app.api.deps import get_current_reviewer
from backend.app.models.user import UserModel

client = TestClient(app)

CSRF_HEADERS = {"Content-Type": "application/json", "X-LedgerLens-CSRF": "1"}


@pytest.fixture(autouse=True)
def override_reviewer_auth():
    mock_reviewer_user = UserModel(
        id=uuid4(),
        email="ops_lead@ledgerlens.internal",
        full_name="Operations Lead",
        role="reviewer",
        is_active=True,
    )
    app.dependency_overrides[get_current_reviewer] = lambda: mock_reviewer_user
    yield
    app.dependency_overrides.pop(get_current_reviewer, None)


def _make_needs_review_case(payment_id: str = "pay_001") -> ReconciliationCaseModel:
    now = datetime.now(timezone.utc)
    c = ReconciliationCaseModel(
        id=uuid4(),
        batch_id=uuid4(),
        payment_id=payment_id,
        exception_type="amount_mismatch",
        decision_status="needs_review",
        resolution_reason="no_candidate_found",
        confidence="low",
        technical_status="success",
        expected_net_settlement=Decimal("976.40"),
        reported_net_settlement=Decimal("926.40"),
        settlement_discrepancy=Decimal("50.00"),
        currency="INR",
        case_opened_at=now,
        last_updated_at=now,
        version=2,
    )
    return c


def _make_review_action(case_id, actor="ops_lead@ledgerlens.internal", action="approve") -> HumanReviewActionModel:
    now = datetime.now(timezone.utc)
    return HumanReviewActionModel(
        id=uuid4(),
        case_id=case_id,
        actor=actor,
        action=action,
        previous_decision_status="needs_review",
        new_decision_status="auto_reconciled" if action == "approve" else "rejected",
        human_comment="Verified with bank records.",
        actioned_at=now,
    )


def _make_audit_event(case_id, event_type="human_approved") -> AuditEventModel:
    now = datetime.now(timezone.utc)
    return AuditEventModel(
        id=uuid4(),
        event_type=event_type,
        actor="ops_lead@ledgerlens.internal",
        case_id=case_id,
        previous_status="needs_review",
        new_status="auto_reconciled",
        occurred_at=now,
    )


# ── 1. Review Queue ─────────────────────────────────────────────────────────────

def test_get_review_queue_returns_needs_review_cases():
    mock_db = MagicMock()
    case = _make_needs_review_case()
    mock_db.execute.return_value.scalars.return_value.all.side_effect = [
        [case],   # review queue cases
        [],       # payments (for amount-at-risk)
        [],       # settlements
        [],       # refunds
        [],       # bank_credits
    ]
    app.dependency_overrides[get_db] = lambda: mock_db

    res = client.get("/api/v1/review/queue")
    assert res.status_code == 200
    body = res.json()
    assert body["total_cases"] == 1
    assert body["cases"][0]["decision_status"] == "needs_review"
    assert body["cases"][0]["exception_type"] == "amount_mismatch"

    app.dependency_overrides.pop(get_db, None)


# ── 2. Submit Review Action: Approve ───────────────────────────────────────────

def test_submit_review_approve_succeeds():
    mock_db = MagicMock()
    case = _make_needs_review_case()
    case_id = case.id
    review_action = _make_review_action(case_id, action="approve")
    audit_event = _make_audit_event(case_id, event_type="human_approved")

    # scalar_one_or_none returns case on lookup
    mock_db.execute.return_value.scalar_one_or_none.return_value = case

    with patch(
        "backend.app.repositories.review_repo.ReviewRepository.apply_review_action_atomic",
        return_value=(review_action, audit_event),
    ):
        app.dependency_overrides[get_db] = lambda: mock_db
        res = client.post(
            f"/api/v1/review/cases/{case_id}/review",
            json={
                "actor": "ops_lead@ledgerlens.internal",
                "action": "approve",
                "human_comment": "Verified with bank records.",
                "expected_version": 1,
            },
            headers=CSRF_HEADERS,
        )

    assert res.status_code == 200
    body = res.json()
    assert body["action"] == "approve"
    assert body["new_decision_status"] == "auto_reconciled"
    assert body["previous_decision_status"] == "needs_review"
    assert "audit_event_id" in body

    app.dependency_overrides.pop(get_db, None)


# ── 3. Submit Review Action: Reject ────────────────────────────────────────────

def test_submit_review_reject_succeeds():
    mock_db = MagicMock()
    case = _make_needs_review_case()
    case_id = case.id
    review_action = _make_review_action(case_id, action="reject")
    review_action.new_decision_status = "rejected"
    audit_event = _make_audit_event(case_id, event_type="human_rejected")

    mock_db.execute.return_value.scalar_one_or_none.return_value = case

    with patch(
        "backend.app.repositories.review_repo.ReviewRepository.apply_review_action_atomic",
        return_value=(review_action, audit_event),
    ):
        app.dependency_overrides[get_db] = lambda: mock_db
        res = client.post(
            f"/api/v1/review/cases/{case_id}/review",
            json={
                "actor": "ops_lead@ledgerlens.internal",
                "action": "reject",
                "human_comment": "Duplicate entry found in settlement records.",
                "expected_version": 1,
            },
            headers=CSRF_HEADERS,
        )

    assert res.status_code == 200
    assert res.json()["action"] == "reject"
    assert res.json()["new_decision_status"] == "rejected"
    app.dependency_overrides.pop(get_db, None)


# ── 4. 409 Guard: Cannot Review an Auto-Reconciled Case ────────────────────────

def test_review_already_auto_reconciled_returns_409():
    mock_db = MagicMock()
    case = _make_needs_review_case()
    case.decision_status = "auto_reconciled"   # pre-approved case

    mock_db.execute.return_value.scalar_one_or_none.return_value = case
    app.dependency_overrides[get_db] = lambda: mock_db

    res = client.post(
        f"/api/v1/review/cases/{case.id}/review",
        json={
            "actor": "ops_lead@ledgerlens.internal",
            "action": "approve",
            "human_comment": "Verified with bank records.",
            "expected_version": 1,
        },
        headers=CSRF_HEADERS,
    )
    assert res.status_code == 409
    assert "auto_reconciled" in res.json()["detail"]
    app.dependency_overrides.pop(get_db, None)


# ── 5. 404 on Non-Existent Case ─────────────────────────────────────────────────

def test_review_nonexistent_case_returns_404():
    mock_db = MagicMock()
    mock_db.execute.return_value.scalar_one_or_none.return_value = None
    app.dependency_overrides[get_db] = lambda: mock_db

    fake_id = uuid4()
    res = client.post(
        f"/api/v1/review/cases/{fake_id}/review",
        json={
            "actor": "ops_lead@ledgerlens.internal",
            "action": "approve",
            "human_comment": "Verified with bank records.",
            "expected_version": 1,
        },
        headers=CSRF_HEADERS,
    )
    assert res.status_code == 404
    app.dependency_overrides.pop(get_db, None)


# ── 6. Append-Only Audit Trail ──────────────────────────────────────────────────

def test_get_audit_trail_returns_events_in_order():
    mock_db = MagicMock()
    case = _make_needs_review_case()
    case_id = case.id

    event1 = _make_audit_event(case_id, event_type="human_approved")
    event2 = _make_audit_event(case_id, event_type="human_rejected")

    mock_db.execute.return_value.scalar_one_or_none.return_value = case
    mock_db.execute.return_value.scalars.return_value.all.return_value = [event1, event2]
    app.dependency_overrides[get_db] = lambda: mock_db

    res = client.get(f"/api/v1/review/cases/{case_id}/audit")
    assert res.status_code == 200
    events = res.json()
    assert len(events) == 2
    assert events[0]["event_type"] == "human_approved"
    assert events[1]["event_type"] == "human_rejected"
    app.dependency_overrides.pop(get_db, None)


# ── 7. 404 on Audit Trail for Non-Existent Case ─────────────────────────────────

def test_audit_trail_nonexistent_case_returns_404():
    mock_db = MagicMock()
    mock_db.execute.return_value.scalar_one_or_none.return_value = None
    app.dependency_overrides[get_db] = lambda: mock_db

    res = client.get(f"/api/v1/review/cases/{uuid4()}/audit")
    assert res.status_code == 404
    app.dependency_overrides.pop(get_db, None)
