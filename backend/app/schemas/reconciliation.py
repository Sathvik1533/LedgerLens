from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field

class ReconciliationCaseResponse(BaseModel):
    id: UUID
    payment_id: str
    exception_type: Optional[str] = None
    decision_status: str
    resolution_reason: Optional[str] = None
    confidence: str
    expected_net_settlement: Optional[Decimal] = None
    reported_net_settlement: Optional[Decimal] = None
    settlement_discrepancy: Optional[Decimal] = None
    case_opened_at: datetime

class ReconciliationSummaryResponse(BaseModel):
    total_payments_processed: int
    auto_reconciled_count: int
    needs_review_count: int
    unresolved_count: int
    match_rate_percentage: float
    total_amount_reconciled: Decimal
    total_amount_at_risk: Decimal
    cases: List[ReconciliationCaseResponse] = Field(default_factory=list)
