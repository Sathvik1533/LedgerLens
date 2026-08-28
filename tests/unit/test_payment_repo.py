import pytest
from unittest.mock import MagicMock
from decimal import Decimal
from datetime import datetime, timezone
from backend.app.repositories.payment_repo import PaymentRepository
from backend.app.schemas.domain import PaymentRecord

def test_payment_repo_rollback_on_failure():
    """Verify that if an insert fails, rollback() is called and nothing is committed."""
    mock_db = MagicMock()
    mock_db.execute.return_value.scalar_one_or_none.return_value = None
    # Simulate an error on the flush
    mock_db.flush.side_effect = [None, RuntimeError("DB Check Violation on row 3")]

    repo = PaymentRepository(mock_db)

    raw_rows = [{"payment_id": "pay_1", "amount": "100.00"}, {"payment_id": "pay_2", "amount": "-50.00"}]
    records = [
        (0, PaymentRecord(
            payment_id="pay_1",
            order_id="ord_1",
            merchant_id="merch_1",
            amount=Decimal("100.00"),
            currency="INR",
            status="captured",
            payment_timestamp=datetime.now(timezone.utc)
        ))
    ]

    with pytest.raises(RuntimeError, match="DB Check Violation"):
        repo.ingest_payments_atomic(
            idempotency_key="batch_test_123",
            source_filename="payments.csv",
            raw_rows=raw_rows,
            validated_records=records
        )

    # Verify rollback was called and commit was NEVER called
    mock_db.rollback.assert_called_once()
    mock_db.commit.assert_not_called()

def test_payment_repo_successful_commit():
    """Verify that clean batches trigger commit() and populate dual storage."""
    mock_db = MagicMock()
    mock_db.execute.return_value.scalar_one_or_none.return_value = None

    repo = PaymentRepository(mock_db)

    raw_rows = [{"payment_id": "pay_1", "amount": "100.00"}]
    records = [
        (0, PaymentRecord(
            payment_id="pay_1",
            order_id="ord_1",
            merchant_id="merch_1",
            amount=Decimal("100.00"),
            currency="INR",
            status="captured",
            payment_timestamp=datetime.now(timezone.utc)
        ))
    ]

    batch = repo.ingest_payments_atomic(
        idempotency_key="batch_test_clean",
        source_filename="payments.csv",
        raw_rows=raw_rows,
        validated_records=records,
        rejected_count=0
    )

    # 1 batch model + 1 raw model + 1 payment model = 3 db.add calls
    assert mock_db.add.call_count == 3
    mock_db.commit.assert_called_once()
    mock_db.rollback.assert_not_called()
    assert batch.batch_status == "completed"
