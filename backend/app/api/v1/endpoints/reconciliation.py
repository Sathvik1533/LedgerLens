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
