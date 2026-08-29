import csv
import io
import hashlib
from typing import Tuple, List, Dict, Any, Optional
from pydantic import ValidationError
from sqlalchemy.orm import Session

from backend.app.schemas.domain import PaymentRecord, SettlementRecord, RefundRecord, BankCreditRecord
from backend.app.schemas.ingestion import IngestionBatchResponse, RowValidationError
from backend.app.repositories.payment_repo import PaymentRepository
from backend.app.repositories.reconciliation_repo import ReconciliationRepository

REQUIRED_PAYMENT_COLUMNS = {"payment_id", "amount", "currency", "payment_timestamp"}
REQUIRED_SETTLEMENT_COLUMNS = {"settlement_id", "merchant_id", "gross_payment_amount", "fee_amount", "tax_amount", "net_settlement_amount", "settlement_timestamp"}
REQUIRED_REFUND_COLUMNS = {"refund_id", "payment_id", "order_id", "refund_amount", "refund_timestamp"}
REQUIRED_BANK_CREDIT_COLUMNS = {"bank_credit_id", "bank_reference", "credited_amount", "bank_credit_timestamp"}

class IngestionService:
    def __init__(self, db: Session):
        self.db = db
        self.payment_repo = PaymentRepository(db)
        self.reconciliation_repo = ReconciliationRepository(db)

    @staticmethod
    def calculate_file_hash(content: bytes) -> str:
        """Computes SHA-256 hash of file content for bulletproof idempotency."""
        return hashlib.sha256(content).hexdigest()

    def process_payment_csv(
        self, file_content: bytes, filename: str, custom_idempotency_key: Optional[str] = None
    ) -> IngestionBatchResponse:
        idempotency_key = custom_idempotency_key or self.calculate_file_hash(file_content)
        existing = self.payment_repo.get_batch_by_idempotency_key(idempotency_key)
        if existing:
            return self._build_duplicate_response(existing)

        text_content = file_content.decode("utf-8-sig")
        reader = csv.DictReader(io.StringIO(text_content))
        if not reader.fieldnames:
            raise ValueError("Empty CSV file or missing header row.")

        missing_cols = REQUIRED_PAYMENT_COLUMNS - set(f.strip() for f in reader.fieldnames if f)
        if missing_cols:
            raise ValueError(f"Missing required columns: {sorted(list(missing_cols))}")

        raw_rows, validated_records, errors = [], [], []
        for idx, row in enumerate(reader):
            cleaned = {k.strip(): (v.strip() if v is not None else "") for k, v in row.items() if k}
            raw_rows.append(cleaned)
            if not cleaned.get("captured_timestamp"):
                cleaned["captured_timestamp"] = None
            if not cleaned.get("settlement_id"):
                cleaned["settlement_id"] = None
            try:
                rec = PaymentRecord(**cleaned)
                validated_records.append((idx, rec))
            except Exception as e:
                errors.append(RowValidationError(source_row_index=idx, error_message=str(e), raw_value=str(cleaned.get("amount", ""))))

        batch = self.payment_repo.ingest_payments_atomic(
            idempotency_key=idempotency_key,
            source_filename=filename,
            raw_rows=raw_rows,
            validated_records=validated_records,
            rejected_count=len(errors),
        )
        return self._build_response(batch, errors)

    def process_settlement_csv(
        self, file_content: bytes, filename: str, custom_idempotency_key: Optional[str] = None
    ) -> IngestionBatchResponse:
        idempotency_key = custom_idempotency_key or self.calculate_file_hash(file_content)
        existing = self.reconciliation_repo.get_batch_by_idempotency_key(idempotency_key)
        if existing:
            return self._build_duplicate_response(existing)

        text_content = file_content.decode("utf-8-sig")
        reader = csv.DictReader(io.StringIO(text_content))
        if not reader.fieldnames:
            raise ValueError("Empty CSV file or missing header row.")

        missing_cols = REQUIRED_SETTLEMENT_COLUMNS - set(f.strip() for f in reader.fieldnames if f)
        if missing_cols:
            raise ValueError(f"Missing required columns: {sorted(list(missing_cols))}")

        raw_rows, validated_records, errors = [], [], []
        for idx, row in enumerate(reader):
            cleaned = {k.strip(): (v.strip() if v is not None else "") for k, v in row.items() if k}
            raw_rows.append(cleaned)
            try:
                rec = SettlementRecord(**cleaned)
                validated_records.append((idx, rec))
            except Exception as e:
                errors.append(RowValidationError(source_row_index=idx, error_message=str(e), raw_value=str(cleaned.get("net_settlement_amount", ""))))

        batch = self.reconciliation_repo.ingest_settlements_atomic(
            idempotency_key=idempotency_key,
            source_filename=filename,
            raw_rows=raw_rows,
            validated_records=validated_records,
            rejected_count=len(errors),
        )
        return self._build_response(batch, errors)

    def process_refund_csv(
        self, file_content: bytes, filename: str, custom_idempotency_key: Optional[str] = None
    ) -> IngestionBatchResponse:
        idempotency_key = custom_idempotency_key or self.calculate_file_hash(file_content)
        existing = self.reconciliation_repo.get_batch_by_idempotency_key(idempotency_key)
        if existing:
            return self._build_duplicate_response(existing)

        text_content = file_content.decode("utf-8-sig")
        reader = csv.DictReader(io.StringIO(text_content))
        if not reader.fieldnames:
            raise ValueError("Empty CSV file or missing header row.")

        missing_cols = REQUIRED_REFUND_COLUMNS - set(f.strip() for f in reader.fieldnames if f)
        if missing_cols:
            raise ValueError(f"Missing required columns: {sorted(list(missing_cols))}")

        raw_rows, validated_records, errors = [], [], []
        for idx, row in enumerate(reader):
            cleaned = {k.strip(): (v.strip() if v is not None else "") for k, v in row.items() if k}
            raw_rows.append(cleaned)
            try:
                rec = RefundRecord(**cleaned)
                validated_records.append((idx, rec))
            except Exception as e:
                errors.append(RowValidationError(source_row_index=idx, error_message=str(e), raw_value=str(cleaned.get("refund_amount", ""))))

        batch = self.reconciliation_repo.ingest_refunds_atomic(
            idempotency_key=idempotency_key,
            source_filename=filename,
            raw_rows=raw_rows,
            validated_records=validated_records,
            rejected_count=len(errors),
        )
        return self._build_response(batch, errors)

    def process_bank_credit_csv(
        self, file_content: bytes, filename: str, custom_idempotency_key: Optional[str] = None
    ) -> IngestionBatchResponse:
        idempotency_key = custom_idempotency_key or self.calculate_file_hash(file_content)
        existing = self.reconciliation_repo.get_batch_by_idempotency_key(idempotency_key)
        if existing:
            return self._build_duplicate_response(existing)

        text_content = file_content.decode("utf-8-sig")
        reader = csv.DictReader(io.StringIO(text_content))
        if not reader.fieldnames:
            raise ValueError("Empty CSV file or missing header row.")

        missing_cols = REQUIRED_BANK_CREDIT_COLUMNS - set(f.strip() for f in reader.fieldnames if f)
        if missing_cols:
            raise ValueError(f"Missing required columns: {sorted(list(missing_cols))}")

        raw_rows, validated_records, errors = [], [], []
        for idx, row in enumerate(reader):
            cleaned = {k.strip(): (v.strip() if v is not None else "") for k, v in row.items() if k}
            raw_rows.append(cleaned)
            try:
                rec = BankCreditRecord(**cleaned)
                validated_records.append((idx, rec))
            except Exception as e:
                errors.append(RowValidationError(source_row_index=idx, error_message=str(e), raw_value=str(cleaned.get("credited_amount", ""))))

        batch = self.reconciliation_repo.ingest_bank_credits_atomic(
            idempotency_key=idempotency_key,
            source_filename=filename,
            raw_rows=raw_rows,
            validated_records=validated_records,
            rejected_count=len(errors),
        )
        return self._build_response(batch, errors)

    def _build_response(self, batch: Any, errors: List[RowValidationError]) -> IngestionBatchResponse:
        return IngestionBatchResponse(
            batch_id=batch.id,
            idempotency_key=batch.idempotency_key,
            batch_status=batch.batch_status,
            source_filename=batch.source_filename,
            row_count_submitted=batch.row_count_submitted or 0,
            row_count_accepted=batch.row_count_accepted or 0,
            row_count_rejected=batch.row_count_rejected or 0,
            errors=errors,
            submitted_at=batch.submitted_at,
            completed_at=batch.completed_at,
            is_duplicate=False,
        )

    def _build_duplicate_response(self, existing: Any) -> IngestionBatchResponse:
        return IngestionBatchResponse(
            batch_id=existing.id,
            idempotency_key=existing.idempotency_key,
            batch_status=existing.batch_status,
            source_filename=existing.source_filename,
            row_count_submitted=existing.row_count_submitted or 0,
            row_count_accepted=existing.row_count_accepted or 0,
            row_count_rejected=existing.row_count_rejected or 0,
            errors=[],
            submitted_at=existing.submitted_at,
            completed_at=existing.completed_at,
            is_duplicate=True,
        )
