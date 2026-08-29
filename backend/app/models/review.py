import uuid
from sqlalchemy import Column, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID, ARRAY as PG_ARRAY
from sqlalchemy.sql import func
from backend.app.db.base import Base


class HumanReviewActionModel(Base):
    __tablename__ = "human_review_actions"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("public.reconciliation_cases.id"), nullable=False)
    actor = Column(Text, nullable=False)
    action = Column(Text, nullable=False)             # approve | reject | mark_unresolved
    previous_decision_status = Column(Text, nullable=False)
    new_decision_status = Column(Text, nullable=False)
    selected_candidate_id = Column(UUID(as_uuid=True), ForeignKey("public.candidate_matches.id"), nullable=True)
    ai_output_ref = Column(UUID(as_uuid=True), ForeignKey("public.evidence_items.id"), nullable=True)
    human_comment = Column(Text, nullable=True)
    actioned_at = Column(DateTime(timezone=True), nullable=False, default=func.now(), server_default=func.now())


class AuditEventModel(Base):
    __tablename__ = "audit_events"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_type = Column(Text, nullable=False)
    actor = Column(Text, nullable=False)
    batch_id = Column(UUID(as_uuid=True), ForeignKey("public.ingestion_batches.id"), nullable=True)
    case_id = Column(UUID(as_uuid=True), ForeignKey("public.reconciliation_cases.id"), nullable=True)
    previous_status = Column(Text, nullable=True)
    new_status = Column(Text, nullable=True)
    failure_type = Column(Text, nullable=True)
    failure_reason = Column(Text, nullable=True)
    occurred_at = Column(DateTime(timezone=True), nullable=False, default=func.now(), server_default=func.now())
