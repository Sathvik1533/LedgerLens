import uuid
from sqlalchemy import Column, String, Numeric, DateTime, Text, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from backend.app.db.base import Base

class RefundsRawModel(Base):
    __tablename__ = "refunds_raw"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    batch_id = Column(UUID(as_uuid=True), ForeignKey("public.ingestion_batches.id"), nullable=False)
    source_row_index = Column(Integer, nullable=False)
    raw_payload = Column(JSONB, nullable=False)
    ingested_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())


class RefundModel(Base):
    __tablename__ = "refunds"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    raw_id = Column(UUID(as_uuid=True), ForeignKey("public.refunds_raw.id"), nullable=False, unique=True)
    batch_id = Column(UUID(as_uuid=True), ForeignKey("public.ingestion_batches.id"), nullable=False)
    refund_id = Column(Text, nullable=False, unique=True)
    payment_id = Column(Text, ForeignKey("public.payments.payment_id"), nullable=False)
    order_id = Column(Text, nullable=False)
    refund_amount = Column(Numeric(18, 2), nullable=False)
    currency = Column(Text, nullable=False)
    refund_status = Column(Text, nullable=False)
    refund_timestamp = Column(DateTime(timezone=True), nullable=False)
    refund_type = Column(Text, nullable=False)
    normalised_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
