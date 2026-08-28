import uuid
from datetime import datetime
from sqlalchemy import Column, String, Numeric, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from backend.app.db.base import Base

class PaymentModel(Base):
    __tablename__ = "payments"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    raw_id = Column(UUID(as_uuid=True), ForeignKey("public.payments_raw.id"), nullable=False, unique=True)
    batch_id = Column(UUID(as_uuid=True), ForeignKey("public.ingestion_batches.id"), nullable=False)
    payment_id = Column(Text, nullable=False, unique=True)
    order_id = Column(Text, nullable=False)
    merchant_id = Column(Text, nullable=False)
    payment_type = Column(Text, nullable=False)
    payment_method = Column(Text, nullable=False)
    amount = Column(Numeric(18, 2), nullable=False)
    currency = Column(Text, nullable=False)
    status = Column(Text, nullable=False, default="captured")
    payment_timestamp = Column(DateTime(timezone=True), nullable=False)
    captured_timestamp = Column(DateTime(timezone=True), nullable=True)
    settlement_id = Column(Text, nullable=True)
    normalised_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
