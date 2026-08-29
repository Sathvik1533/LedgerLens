import uuid
from sqlalchemy import Column, String, Numeric, DateTime, Text, ForeignKey, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.sql import func
from backend.app.db.base import Base

class ReconciliationCaseModel(Base):
    __tablename__ = "reconciliation_cases"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    batch_id = Column(UUID(as_uuid=True), ForeignKey("public.ingestion_batches.id"), nullable=False)
    payment_id = Column(Text, ForeignKey("public.payments.payment_id"), nullable=False)
    exception_type = Column(Text, nullable=True)
    decision_status = Column(Text, nullable=False)
    resolution_reason = Column(Text, nullable=True)
    confidence = Column(Text, nullable=False, default="high")
    technical_status = Column(Text, nullable=False, default="success")
    failure_type = Column(Text, nullable=True)
    failure_reason = Column(Text, nullable=True)
    expected_net_settlement = Column(Numeric(18, 2), nullable=True)
    reported_net_settlement = Column(Numeric(18, 2), nullable=True)
    settlement_discrepancy = Column(Numeric(18, 2), nullable=True)
    currency = Column(Text, nullable=True)
    selected_candidate_id = Column(UUID(as_uuid=True), nullable=True)
    case_opened_at = Column(DateTime(timezone=True), nullable=False, default=func.now(), server_default=func.now())
    case_closed_at = Column(DateTime(timezone=True), nullable=True)
    last_updated_at = Column(DateTime(timezone=True), nullable=False, default=func.now(), server_default=func.now())
    version = Column(Integer, nullable=False, default=1, server_default="1")



class CandidateMatchModel(Base):
    __tablename__ = "candidate_matches"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("public.reconciliation_cases.id"), nullable=False)
    match_stage = Column(Text, nullable=False)
    candidate_type = Column(Text, nullable=False)
    candidate_entity_id = Column(Text, nullable=False)
    match_score = Column(Numeric(5, 4), nullable=True)
    matching_fields = Column(JSONB, nullable=True)
    conflicting_fields = Column(JSONB, nullable=True)
    is_selected = Column(Boolean, nullable=False, default=False)
    ai_rationale = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=func.now(), server_default=func.now())


class EvidenceItemModel(Base):
    __tablename__ = "evidence_items"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("public.reconciliation_cases.id"), nullable=False)
    evidence_type = Column(Text, nullable=False)
    source_table = Column(Text, nullable=True)
    source_entity_id = Column(Text, nullable=True)
    content = Column(JSONB, nullable=False)
    model_version = Column(Text, nullable=True)
    is_ai_generated = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=func.now(), server_default=func.now())
