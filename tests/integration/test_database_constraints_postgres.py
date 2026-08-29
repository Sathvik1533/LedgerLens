import pytest
import uuid
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy.exc import IntegrityError
from backend.app.models.ingestion import IngestionBatchModel, PaymentsRawModel
from backend.app.models.payment import PaymentModel

@pytest.mark.integration
def test_monetary_precision_roundtrip(db_session):
    # 1. Setup a valid batch and raw model to satisfy foreign keys
    batch_id = uuid.uuid4()
    batch = IngestionBatchModel(
        id=batch_id,
        idempotency_key=f"idemp_{uuid.uuid4().hex}",
        batch_status="processing",
        source_filename="test.csv",
        source_tables=["payments"],
        row_count_submitted=1,
        row_count_accepted=1,
        row_count_rejected=0,
        submitted_at=datetime.now(timezone.utc)
    )
    db_session.add(batch)
    db_session.flush()

    raw_id = uuid.uuid4()
    raw = PaymentsRawModel(id=raw_id, batch_id=batch_id, source_row_index=0, raw_payload={})
    db_session.add(raw)
    db_session.flush()

    # 2. Insert valid Decimal with exactly 2 fractional digits
    payment_id = f"pay_{uuid.uuid4().hex}"
    exact_amount = Decimal("123456789.01")
    
    payment = PaymentModel(
        id=uuid.uuid4(),
        raw_id=raw_id,
        batch_id=batch_id,
        payment_id=payment_id,
        order_id="order_1",
        merchant_id="merchant_1",
        payment_type="card",
        payment_method="upi",
        amount=exact_amount,
        currency="INR",
        status="captured",
        payment_timestamp=datetime.now(timezone.utc)
    )
    
    db_session.add(payment)
    db_session.commit()
    
    # 3. Assert exact roundtrip precision from PostgreSQL NUMERIC(18,2)
    db_session.refresh(payment)
    fetched = db_session.query(PaymentModel).filter_by(payment_id=payment_id).first()
    
    assert fetched is not None
    assert fetched.amount == exact_amount
    assert isinstance(fetched.amount, Decimal)


@pytest.mark.integration
def test_foreign_key_constraint_enforcement(db_session):
    # Act & Assert: Intentionally bypass repository logic to verify DB constraint
    with pytest.raises(IntegrityError):
        payment = PaymentModel(
            id=uuid.uuid4(),
            raw_id=uuid.uuid4(),
            batch_id=uuid.uuid4(),  # DOES NOT EXIST
            payment_id=f"pay_{uuid.uuid4().hex}",
            order_id="order_1",
            merchant_id="merchant_1",
            payment_type="card",
            payment_method="upi",
            amount=Decimal("150.00"),
            currency="INR",
            status="captured",
            payment_timestamp=datetime.now(timezone.utc)
        )
        db_session.add(payment)
        db_session.flush()  # Forces write to Postgres
