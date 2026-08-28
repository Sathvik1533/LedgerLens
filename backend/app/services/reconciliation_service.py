import uuid
from decimal import Decimal
from typing import List, Optional
from sqlalchemy.orm import Session

from backend.app.domain.matcher import DeterministicReconciliationEngine
from backend.app.repositories.reconciliation_repo import ReconciliationRepository
from backend.app.schemas.reconciliation import ReconciliationSummaryResponse, ReconciliationCaseResponse

class ReconciliationService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ReconciliationRepository(db)
        self.engine = DeterministicReconciliationEngine()

    def execute_reconciliation(self, batch_id: Optional[uuid.UUID] = None) -> ReconciliationSummaryResponse:
        active_batch_id = batch_id or uuid.uuid4()

        payments, settlements, refunds, bank_credits = self.repo.get_all_normalized_records()

        results = self.engine.reconcile_batch(
            payments=payments,
            settlements=settlements,
            bank_credits=bank_credits,
            refunds=refunds
        )

        persisted_cases = self.repo.save_reconciliation_results_atomic(
            batch_id=active_batch_id,
            results=results
        )

        auto_reconciled = 0
        needs_review = 0
        unresolved = 0
        amount_reconciled = Decimal("0.00")
        amount_at_risk = Decimal("0.00")

        # Map payment amounts
        pay_amount_map = {p.payment_id: p.amount for p in payments}

        case_responses: List[ReconciliationCaseResponse] = []
        for c in persisted_cases:
            amt = pay_amount_map.get(c.payment_id, Decimal("0.00"))
            if c.decision_status == "auto_reconciled":
                auto_reconciled += 1
                amount_reconciled += amt
            elif c.decision_status == "needs_review":
                needs_review += 1
                amount_at_risk += amt
            else:
                unresolved += 1
                amount_at_risk += amt

            case_responses.append(
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
            )

        total_processed = len(results)
        match_rate = (auto_reconciled / total_processed * 100.0) if total_processed > 0 else 0.0

        return ReconciliationSummaryResponse(
            total_payments_processed=total_processed,
            auto_reconciled_count=auto_reconciled,
            needs_review_count=needs_review,
            unresolved_count=unresolved,
            match_rate_percentage=round(match_rate, 2),
            total_amount_reconciled=amount_reconciled,
            total_amount_at_risk=amount_at_risk,
            cases=case_responses,
        )
