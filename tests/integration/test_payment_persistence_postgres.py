import pytest
import uuid
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy.exc import IntegrityError

from backend.app.repositories.payment_repo import PaymentRepository
from backend.app.schemas.domain import PaymentRecord
from backend.app.models.ingestion import IngestionBatchModel, PaymentsRawModel
from backend.app.models.payment import PaymentModel

@pytest.mark.integration
def test_payment_batch_persistence_success(db_session):
    repo = PaymentRepository(db_session)
    idemp_key = f"idemp_{uuid.uuid4().hex}"
    
    raw_rows = [{"raw_id": "test_1", "amount": "150.00"}]
    
    validated_records = [
        (0, PaymentRecord(
            payment_id=f"pay_{uuid.uuid4().hex[:8]}",
            order_id=f"order_{uuid.uuid4().hex[:8]}",
            merchant_id="merchant_123",
            payment_type="card",
            payment_method="upi",
            amount=Decimal("150.00"),
            currency="INR",
            status="captured",
            payment_timestamp=datetime.now(timezone.utc)
        ))
    ]
    
    # Act
    batch = repo.ingest_payments_atomic(
        idempotency_key=idemp_key,
        source_filename="test.csv",
        raw_rows=raw_rows,
        validated_records=validated_records,
        rejected_count=0
    )
    
    # Assert
    assert batch.id is not None
    assert batch.row_count_accepted == 1
    assert batch.batch_status == "completed"
    
    raw_count = db_session.query(PaymentsRawModel).filter_by(batch_id=batch.id).count()
    norm_count = db_session.query(PaymentModel).filter_by(batch_id=batch.id).count()
    
    assert raw_count == 1
    assert norm_count == 1

@pytest.mark.integration
def test_payment_batch_persistence_rollback(db_session):
    repo = PaymentRepository(db_session)
    idemp_key = f"idemp_{uuid.uuid4().hex}"
    
    raw_rows = [{"raw_id": "1"}, {"raw_id": "2"}]
    
    # Create two records with the SAME payment_id to trigger a unique constraint violation
    shared_payment_id = f"pay_{uuid.uuid4().hex[:8]}"
    
    validated_records = [
        (0, PaymentRecord(
            payment_id=shared_payment_id,
            order_id="order_1",
            merchant_id="m1",
            payment_type="card",
            payment_method="upi",
            amount=Decimal("150.00"),
            currency="INR",
            status="captured",
            payment_timestamp=datetime.now(timezone.utc)
        )),
        (1, PaymentRecord(
            payment_id=shared_payment_id,  # Duplicate! Violates unique constraint
            order_id="order_2",
            merchant_id="m1",
            payment_type="card",
            payment_method="upi",
            amount=Decimal("200.00"),
            currency="INR",
            status="captured",
            payment_timestamp=datetime.now(timezone.utc)
        ))
    ]
    
    # Act
    with pytest.raises(IntegrityError):
        repo.ingest_payments_atomic(
            idempotency_key=idemp_key,
            source_filename="test_duplicate.csv",
            raw_rows=raw_rows,
            validated_records=validated_records,
            rejected_count=0
        )
    
    # Assert - The transaction should have rolled back EVERYTHING, including the batch
    batch = repo.get_batch_by_idempotency_key(idemp_key)
    assert batch is None
    
    # Assert - Zero partial raw or normalized payments were left orphaned
    count = db_session.query(PaymentModel).filter_by(payment_id=shared_payment_id).count()
    assert count == 0
