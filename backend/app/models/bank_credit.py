import uuid
from sqlalchemy import Column, String, Numeric, DateTime, Text, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from backend.app.db.base import Base

class BankCreditsRawModel(Base):
    __tablename__ = "bank_credits_raw"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    batch_id = Column(UUID(as_uuid=True), ForeignKey("public.ingestion_batches.id"), nullable=False)
    source_row_index = Column(Integer, nullable=False)
    raw_payload = Column(JSONB, nullable=False)
    ingested_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())


class BankCreditModel(Base):
    __tablename__ = "bank_credits"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    raw_id = Column(UUID(as_uuid=True), ForeignKey("public.bank_credits_raw.id"), nullable=False, unique=True)
    batch_id = Column(UUID(as_uuid=True), ForeignKey("public.ingestion_batches.id"), nullable=False)
    bank_credit_id = Column(Text, nullable=False, unique=True)
    bank_account_id = Column(Text, nullable=False)
    bank_name = Column(Text, nullable=False)
    bank_reference = Column(Text, nullable=False, unique=True)
    settlement_id = Column(Text, ForeignKey("public.settlements.settlement_id"), nullable=True)
    credited_amount = Column(Numeric(18, 2), nullable=False)
    currency = Column(Text, nullable=False)
    bank_credit_timestamp = Column(DateTime(timezone=True), nullable=False)
    bank_credit_status = Column(Text, nullable=False)
    narration = Column(Text, nullable=True)
    normalised_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
