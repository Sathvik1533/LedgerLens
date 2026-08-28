import uuid
from sqlalchemy import Column, String, Numeric, DateTime, Text, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from backend.app.db.base import Base

class SettlementsRawModel(Base):
    __tablename__ = "settlements_raw"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    batch_id = Column(UUID(as_uuid=True), ForeignKey("public.ingestion_batches.id"), nullable=False)
    source_row_index = Column(Integer, nullable=False)
    raw_payload = Column(JSONB, nullable=False)
    ingested_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())


class SettlementModel(Base):
    __tablename__ = "settlements"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    raw_id = Column(UUID(as_uuid=True), ForeignKey("public.settlements_raw.id"), nullable=False, unique=True)
    batch_id = Column(UUID(as_uuid=True), ForeignKey("public.ingestion_batches.id"), nullable=False)
    settlement_id = Column(Text, nullable=False, unique=True)
    merchant_id = Column(Text, nullable=False)
    settlement_type = Column(Text, nullable=False)
    gross_payment_amount = Column(Numeric(18, 2), nullable=False)
    refund_amount = Column(Numeric(18, 2), nullable=False, default=0.00)
    fee_amount = Column(Numeric(18, 2), nullable=False)
    tax_amount = Column(Numeric(18, 2), nullable=False)
    adjustment_amount = Column(Numeric(18, 2), nullable=False, default=0.00)
    net_settlement_amount = Column(Numeric(18, 2), nullable=False)
    currency = Column(Text, nullable=False)
    settlement_status = Column(Text, nullable=False)
    settlement_timestamp = Column(DateTime(timezone=True), nullable=False)
    expected_settlement_timestamp = Column(DateTime(timezone=True), nullable=True)
    normalised_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
