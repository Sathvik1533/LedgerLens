from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.schemas.reconciliation import ReconciliationSummaryResponse, ReconciliationCaseResponse
from backend.app.services.reconciliation_service import ReconciliationService
from backend.app.repositories.reconciliation_repo import ReconciliationRepository

router = APIRouter()

@router.post(
    "/run",
    response_model=ReconciliationSummaryResponse,
    status_code=status.HTTP_200_OK,
    summary="Execute multi-source reconciliation loop",
    description="Loads normalized payments, settlements, refunds, and bank credits, runs the 3-stage deterministic matcher, and persists reconciliation cases."
)
def run_reconciliation(
    batch_id: Optional[UUID] = Query(None, description="Optional batch ID to associate with the run"),
    db: Session = Depends(get_db),
):
    service = ReconciliationService(db)
    return service.execute_reconciliation(batch_id=batch_id)

@router.get(
    "/cases",
    response_model=List[ReconciliationCaseResponse],
    status_code=status.HTTP_200_OK,
    summary="List reconciliation cases",
    description="Returns filtered list of reconciliation cases (e.g. for review queue and exception triage)."
)
def list_reconciliation_cases(
    decision_status: Optional[str] = Query(None, description="Filter by decision_status (auto_reconciled, needs_review, unresolved)"),
    exception_type: Optional[str] = Query(None, description="Filter by exception_type"),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    repo = ReconciliationRepository(db)
    cases = repo.get_cases(decision_status=decision_status, exception_type=exception_type, limit=limit, offset=offset)
    return [
        ReconciliationCaseResponse(
            id=c.id,
            payment_id=c.payment_id,
            exception_type=c.exception_type,
            decision_status=c.decision_status,
            resolution_reason=c.resolution_reason,
            confidence=c.confidence,
            expected_net_settlement=c.expected_net_settlement,
            reported_net_settlement=c.reported_net_settlement,
            settlement_discrepancy=c.settlement_discrepancy,
            case_opened_at=c.case_opened_at,
        )
        for c in cases
    ]

@router.get(
    "/stats",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    summary="Get live reconciliation statistics and metrics",
)
def get_reconciliation_stats(db: Session = Depends(get_db)):
    from decimal import Decimal
    repo = ReconciliationRepository(db)
    payments, settlements, refunds, bank_credits = repo.get_all_normalized_records()
    cases = repo.get_cases(limit=5000)
    
    pay_map = {p.payment_id: p.amount for p in payments}
    
    auto_reconciled = 0
    needs_review = 0
    unresolved = 0
    total_reconciled = Decimal("0.00")
    total_at_risk = Decimal("0.00")
    exception_counts = {}
    
    for c in cases:
        amt = pay_map.get(c.payment_id, Decimal("0.00"))
        if c.decision_status == "auto_reconciled":
            auto_reconciled += 1
            total_reconciled += amt
        elif c.decision_status == "needs_review":
            needs_review += 1
            total_at_risk += amt
        else:
            unresolved += 1
            total_at_risk += amt
            
        if c.exception_type:
            exception_counts[c.exception_type] = exception_counts.get(c.exception_type, 0) + 1

    total_payments = len(payments)
    total_cases = len(cases)
    match_rate = round((auto_reconciled / total_cases * 100.0), 2) if total_cases > 0 else 0.0

    return {
        "total_payments_count": total_payments,
        "total_settlements_count": len(settlements),
        "total_refunds_count": len(refunds),
        "total_bank_credits_count": len(bank_credits),
        "total_cases": total_cases,
        "auto_reconciled_count": auto_reconciled,
        "needs_review_count": needs_review,
        "unresolved_count": unresolved,
        "match_rate_percentage": match_rate,
        "total_amount_reconciled": str(total_reconciled),
        "total_amount_at_risk": str(total_at_risk),
        "exception_breakdown": exception_counts,
    }
