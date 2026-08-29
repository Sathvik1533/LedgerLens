import uuid
from typing import List, Tuple, Dict, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import select
from backend.app.models.ingestion import IngestionBatchModel, PaymentsRawModel
from backend.app.models.payment import PaymentModel
from backend.app.schemas.domain import PaymentRecord

class PaymentRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_batch_by_idempotency_key(self, idempotency_key: str) -> Optional[IngestionBatchModel]:
        stmt = select(IngestionBatchModel).where(IngestionBatchModel.idempotency_key == idempotency_key)
        return self.db.execute(stmt).scalar_one_or_none()

    def ingest_payments_atomic(
        self,
        idempotency_key: str,
        source_filename: str,
        raw_rows: List[Dict[str, Any]],
        validated_records: List[Tuple[int, PaymentRecord]],
        rejected_count: int = 0
    ) -> IngestionBatchModel:
        """
        Executes atomic dual-storage ingestion:
        1. IngestionBatch record
        2. Immutable payments_raw records
        3. Normalised payments records linked via raw_id
        
        Guaranteed atomic via ACID transaction.
        """
        # If batch with idempotency key already exists, return it (idempotency)
        existing_batch = self.get_batch_by_idempotency_key(idempotency_key)
        if existing_batch:
            return existing_batch

        batch_id = uuid.uuid4()
        now = datetime.now(timezone.utc)

        batch = IngestionBatchModel(
            id=batch_id,
            idempotency_key=idempotency_key,
            batch_status="processing",
            source_filename=source_filename,
            source_tables=["payments"],
            row_count_submitted=len(raw_rows),
            row_count_accepted=len(validated_records),
            row_count_rejected=rejected_count,
            submitted_at=now,
        )

        try:
            self.db.add(batch)
            self.db.flush()  # Flush so batch_id exists for foreign keys

            # Step 2: Insert into payments_raw and map row_index -> raw_id
            raw_id_map: Dict[int, uuid.UUID] = {}
            for idx, raw_dict in enumerate(raw_rows):
                raw_id = uuid.uuid4()
                raw_model = PaymentsRawModel(
                    id=raw_id,
                    batch_id=batch_id,
                    source_row_index=idx,
                    raw_payload=raw_dict,
                )
                self.db.add(raw_model)
                raw_id_map[idx] = raw_id

            self.db.flush()  # Flush raw rows so raw_id FKs exist

            # Step 3: Insert into payments (normalised)
            for idx, record in validated_records:
                payment_model = PaymentModel(
                    id=uuid.uuid4(),
                    raw_id=raw_id_map[idx],
                    batch_id=batch_id,
                    payment_id=record.payment_id,
                    order_id=record.order_id,
                    merchant_id=record.merchant_id,
                    payment_type=record.payment_type,
                    payment_method=record.payment_method,
                    amount=record.amount,
                    currency=record.currency,
                    status=record.status,
                    payment_timestamp=record.payment_timestamp,
                    captured_timestamp=record.captured_timestamp,
                    settlement_id=record.settlement_id,
                )
                self.db.add(payment_model)

            batch.batch_status = "completed" if rejected_count == 0 else "completed_with_errors"
            batch.completed_at = datetime.now(timezone.utc)
            
            self.db.commit()
            self.db.refresh(batch)
            return batch

        except Exception as e:
            self.db.rollback()
            raise e
