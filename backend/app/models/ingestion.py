import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, ARRAY
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from backend.app.db.base import Base

class IngestionBatchModel(Base):
    __tablename__ = "ingestion_batches"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    idempotency_key = Column(Text, nullable=False, unique=True)
    batch_status = Column(Text, nullable=False, default="received")
    source_filename = Column(Text, nullable=True)
    source_tables = Column(ARRAY(Text), nullable=False)
    row_count_submitted = Column(Integer, nullable=True)
    row_count_accepted = Column(Integer, nullable=True)
    row_count_rejected = Column(Integer, nullable=True)
    failure_type = Column(Text, nullable=True)
    failure_reason = Column(Text, nullable=True)
    submitted_at = Column(DateTime(timezone=True), nullable=False, default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    paused_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())


class PaymentsRawModel(Base):
    __tablename__ = "payments_raw"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    batch_id = Column(UUID(as_uuid=True), nullable=False)
    source_row_index = Column(Integer, nullable=False)
    raw_payload = Column(JSONB, nullable=False)
    ingested_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
