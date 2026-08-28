from typing import Optional
from uuid import UUID
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field


class HumanReviewRequest(BaseModel):
    """Body for POST /reconciliation/cases/{case_id}/review"""
    actor: str = Field(..., description="Identifier of the human reviewer (e.g. 'ops_team_lead')")
    action: str = Field(..., description="One of: approve | reject | mark_unresolved")
    human_comment: Optional[str] = Field(None, description="Free-text rationale from the reviewer")
    selected_candidate_id: Optional[UUID] = Field(None, description="If approving, the candidate match ID chosen")

    class Config:
        json_schema_extra = {
            "example": {
                "actor": "ops_team_lead",
                "action": "approve",
                "human_comment": "Verified with bank statement. Amount discrepancy is within tolerance.",
                "selected_candidate_id": None
            }
        }


class HumanReviewResponse(BaseModel):
    """Response after a review action is recorded."""
    review_action_id: UUID
    case_id: UUID
    actor: str
    action: str
    previous_decision_status: str
    new_decision_status: str
    human_comment: Optional[str]
    actioned_at: datetime
    audit_event_id: UUID


class AuditEventResponse(BaseModel):
    id: UUID
    event_type: str
    actor: str
    case_id: Optional[UUID]
    batch_id: Optional[UUID]
    previous_status: Optional[str]
    new_status: Optional[str]
    occurred_at: datetime


class ReviewQueueItemResponse(BaseModel):
    """A single case in the human review queue."""
    case_id: UUID
    payment_id: str
    exception_type: Optional[str]
    decision_status: str
    confidence: str
    expected_net_settlement: Optional[Decimal]
    reported_net_settlement: Optional[Decimal]
    settlement_discrepancy: Optional[Decimal]
    case_opened_at: datetime
    amount_at_risk: Optional[Decimal] = None


class ReviewQueueResponse(BaseModel):
    total_cases: int
    total_amount_at_risk: Decimal
    cases: list[ReviewQueueItemResponse]
