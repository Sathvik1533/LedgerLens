from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlalchemy.orm import Session
from decimal import Decimal

from backend.app.db.session import get_db
from backend.app.schemas.review import (
    HumanReviewRequest,
    HumanReviewResponse,
    AuditEventResponse,
    ReviewQueueItemResponse,
    ReviewQueueResponse,
)
from backend.app.domain.exceptions import ConcurrentUpdateError
from backend.app.repositories.review_repo import ReviewRepository
from backend.app.repositories.reconciliation_repo import ReconciliationRepository

router = APIRouter()


# ── 1. Review Queue ──────────────────────────────────────────────────────────────

@router.get(
    "/queue",
    response_model=ReviewQueueResponse,
    status_code=status.HTTP_200_OK,
    summary="Get human review queue (needs_review cases)",
    description="Returns all reconciliation cases awaiting human decision, sorted by most recently opened. Includes total amount-at-risk.",
)
def get_review_queue(
    exception_type: Optional[str] = Query(None, description="Filter by exception type"),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    repo = ReviewRepository(db)
    cases = repo.get_review_queue(limit=limit, offset=offset, exception_type=exception_type)

    # Fetch payment amounts for amount-at-risk calculation
    pay_repo = ReconciliationRepository(db)
    payments, _, _, _ = pay_repo.get_all_normalized_records()
    amount_map = {p.payment_id: p.amount for p in payments}

    total_at_risk = Decimal("0.00")
    items = []
    for c in cases:
        amt = amount_map.get(c.payment_id, Decimal("0.00"))
        total_at_risk += amt
        items.append(
            ReviewQueueItemResponse(
                case_id=c.id,
                payment_id=c.payment_id,
                exception_type=c.exception_type,
                decision_status=c.decision_status,
                confidence=c.confidence,
                expected_net_settlement=c.expected_net_settlement,
                reported_net_settlement=c.reported_net_settlement,
                settlement_discrepancy=c.settlement_discrepancy,
                case_opened_at=c.case_opened_at,
                amount_at_risk=amt,
            )
        )

    return ReviewQueueResponse(
        total_cases=len(items),
        total_amount_at_risk=total_at_risk,
        cases=items,
    )


# ── 2. Submit Human Review Action ────────────────────────────────────────────────

@router.post(
    "/cases/{case_id}/review",
    response_model=HumanReviewResponse,
    status_code=status.HTTP_200_OK,
    summary="Submit a human review decision on a reconciliation case",
    description=(
        "Records an irreversible human review action (approve / reject / mark_unresolved) "
        "on a case that requires review. Writes an append-only audit event. "
        "Technical invariant: AI cannot call this endpoint — it requires an explicit actor identity."
    ),
)
def submit_review_action(
    case_id: UUID = Path(..., description="UUID of the reconciliation case"),
    body: HumanReviewRequest = ...,
    db: Session = Depends(get_db),
):
    repo = ReviewRepository(db)
    case = repo.get_case_by_id(case_id)

    if case is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Reconciliation case '{case_id}' not found.",
        )

    if case.decision_status == "auto_reconciled":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"Case '{case_id}' is already auto_reconciled. "
                "Human review is only permitted on 'needs_review' cases."
            ),
        )

    try:
        review_action, audit_event = repo.apply_review_action_atomic(
            case=case,
            expected_version=body.expected_version,
            actor=body.actor,
            action=body.action,
            human_comment=body.human_comment,
            selected_candidate_id=body.selected_candidate_id,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except ConcurrentUpdateError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))

    return HumanReviewResponse(
        review_action_id=review_action.id,
        case_id=case_id,
        actor=review_action.actor,
        action=review_action.action,
        current_version=case.version,
        previous_decision_status=review_action.previous_decision_status,
        new_decision_status=review_action.new_decision_status,
        human_comment=review_action.human_comment,
        actioned_at=review_action.actioned_at,
        audit_event_id=audit_event.id,
    )


# ── 3. Audit Trail for a Case ────────────────────────────────────────────────────

@router.get(
    "/cases/{case_id}/audit",
    response_model=list[AuditEventResponse],
    status_code=status.HTTP_200_OK,
    summary="Get full append-only audit trail for a case",
    description="Returns every audit event for the given case in chronological order. The audit trail is append-only — no events are ever deleted or modified.",
)
def get_case_audit_trail(
    case_id: UUID = Path(..., description="UUID of the reconciliation case"),
    db: Session = Depends(get_db),
):
    repo = ReviewRepository(db)
    case = repo.get_case_by_id(case_id)
    if case is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Reconciliation case '{case_id}' not found.",
        )

    events = repo.get_audit_trail_for_case(case_id)
    return [
        AuditEventResponse(
            id=e.id,
            event_type=e.event_type,
            actor=e.actor,
            case_id=e.case_id,
            batch_id=e.batch_id,
            previous_status=e.previous_status,
            new_status=e.new_status,
            occurred_at=e.occurred_at,
        )
        for e in events
    ]


@router.get(
    "/audit/all",
    response_model=list[AuditEventResponse],
    status_code=status.HTTP_200_OK,
    summary="Get system-wide append-only audit trail",
    description="Returns all audit events across all reconciliation cases in reverse chronological order.",
)
def get_all_audit_trail(
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    repo = ReviewRepository(db)
    events = repo.get_all_audit_events(limit=limit, offset=offset)
    return [
        AuditEventResponse(
            id=e.id,
            event_type=e.event_type,
            actor=e.actor,
            case_id=e.case_id,
            batch_id=e.batch_id,
            previous_status=e.previous_status,
            new_status=e.new_status,
            occurred_at=e.occurred_at,
        )
        for e in events
    ]


# ── 4. Case Detail & Multi-Source Facts ──────────────────────────────────────────

@router.get(
    "/cases/{case_id}",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    summary="Get single reconciliation case with full multi-source evidence",
)
def get_case_detail(
    case_id: UUID = Path(..., description="UUID of the reconciliation case"),
    db: Session = Depends(get_db),
):
    from backend.app.rag.tools.sql_tool import SQLEvidenceTool
    repo = ReviewRepository(db)
    case = repo.get_case_by_id(case_id)
    if case is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Reconciliation case '{case_id}' not found.",
        )
    sql_tool = SQLEvidenceTool(db)
    evidence = sql_tool.get_case_evidence(str(case_id))
    evidence["version"] = case.version
    evidence["decision_status"] = case.decision_status
    evidence["case_opened_at"] = case.case_opened_at.isoformat() if case.case_opened_at else None
    return evidence

