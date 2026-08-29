import uuid
from typing import List, Tuple, Dict, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import select

from backend.app.models.ingestion import IngestionBatchModel
from backend.app.models.payment import PaymentModel
from backend.app.models.settlement import SettlementsRawModel, SettlementModel
from backend.app.models.refund import RefundsRawModel, RefundModel
from backend.app.models.bank_credit import BankCreditsRawModel, BankCreditModel
from backend.app.models.reconciliation import ReconciliationCaseModel, CandidateMatchModel, EvidenceItemModel
from backend.app.schemas.domain import (
    PaymentRecord,
    SettlementRecord,
    RefundRecord,
    BankCreditRecord,
    ReconciliationCaseResult,
)

class ReconciliationRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_batch_by_idempotency_key(self, idempotency_key: str) -> Optional[IngestionBatchModel]:
        stmt = select(IngestionBatchModel).where(IngestionBatchModel.idempotency_key == idempotency_key)
        return self.db.execute(stmt).scalar_one_or_none()

    def ingest_settlements_atomic(
        self,
        idempotency_key: str,
        source_filename: str,
        raw_rows: List[Dict[str, Any]],
        validated_records: List[Tuple[int, SettlementRecord]],
        rejected_count: int = 0,
    ) -> IngestionBatchModel:
        existing = self.get_batch_by_idempotency_key(idempotency_key)
        if existing:
            return existing

        batch_id = uuid.uuid4()
        now = datetime.now(timezone.utc)
        batch = IngestionBatchModel(
            id=batch_id,
            idempotency_key=idempotency_key,
            batch_status="processing",
            source_filename=source_filename,
            source_tables=["settlements"],
            row_count_submitted=len(raw_rows),
            row_count_accepted=len(validated_records),
            row_count_rejected=rejected_count,
            submitted_at=now,
        )

        try:
            self.db.add(batch)
            self.db.flush()

            raw_id_map: Dict[int, uuid.UUID] = {}
            for idx, raw_dict in enumerate(raw_rows):
                raw_id = uuid.uuid4()
                raw_model = SettlementsRawModel(
                    id=raw_id,
                    batch_id=batch_id,
                    source_row_index=idx,
                    raw_payload=raw_dict,
                )
                self.db.add(raw_model)
                raw_id_map[idx] = raw_id

            self.db.flush()

            for idx, record in validated_records:
                settlement_model = SettlementModel(
                    id=uuid.uuid4(),
                    raw_id=raw_id_map[idx],
                    batch_id=batch_id,
                    settlement_id=record.settlement_id,
                    merchant_id=record.merchant_id,
                    settlement_type=record.settlement_type,
                    gross_payment_amount=record.gross_payment_amount,
                    refund_amount=record.refund_amount,
                    fee_amount=record.fee_amount,
                    tax_amount=record.tax_amount,
                    adjustment_amount=record.adjustment_amount,
                    net_settlement_amount=record.net_settlement_amount,
                    currency=record.currency,
                    settlement_status=record.settlement_status,
                    settlement_timestamp=record.settlement_timestamp,
                    expected_settlement_timestamp=record.expected_settlement_timestamp,
                )
                self.db.add(settlement_model)

            batch.batch_status = "completed" if rejected_count == 0 else "completed_with_errors"
            batch.completed_at = datetime.now(timezone.utc)
            self.db.commit()
            self.db.refresh(batch)
            return batch
        except Exception as e:
            self.db.rollback()
            raise e

    def ingest_refunds_atomic(
        self,
        idempotency_key: str,
        source_filename: str,
        raw_rows: List[Dict[str, Any]],
        validated_records: List[Tuple[int, RefundRecord]],
        rejected_count: int = 0,
    ) -> IngestionBatchModel:
        existing = self.get_batch_by_idempotency_key(idempotency_key)
        if existing:
            return existing

        batch_id = uuid.uuid4()
        now = datetime.now(timezone.utc)
        batch = IngestionBatchModel(
            id=batch_id,
            idempotency_key=idempotency_key,
            batch_status="processing",
            source_filename=source_filename,
            source_tables=["refunds"],
            row_count_submitted=len(raw_rows),
            row_count_accepted=len(validated_records),
            row_count_rejected=rejected_count,
            submitted_at=now,
        )

        try:
            self.db.add(batch)
            self.db.flush()

            raw_id_map: Dict[int, uuid.UUID] = {}
            for idx, raw_dict in enumerate(raw_rows):
                raw_id = uuid.uuid4()
                raw_model = RefundsRawModel(
                    id=raw_id,
                    batch_id=batch_id,
                    source_row_index=idx,
                    raw_payload=raw_dict,
                )
                self.db.add(raw_model)
                raw_id_map[idx] = raw_id

            self.db.flush()

            for idx, record in validated_records:
                refund_model = RefundModel(
                    id=uuid.uuid4(),
                    raw_id=raw_id_map[idx],
                    batch_id=batch_id,
                    refund_id=record.refund_id,
                    payment_id=record.payment_id,
                    order_id=record.order_id,
                    refund_amount=record.refund_amount,
                    currency=record.currency,
                    refund_status=record.refund_status,
                    refund_timestamp=record.refund_timestamp,
                    refund_type=record.refund_type,
                )
                self.db.add(refund_model)

            batch.batch_status = "completed" if rejected_count == 0 else "completed_with_errors"
            batch.completed_at = datetime.now(timezone.utc)
            self.db.commit()
            self.db.refresh(batch)
            return batch
        except Exception as e:
            self.db.rollback()
            raise e

    def ingest_bank_credits_atomic(
        self,
        idempotency_key: str,
        source_filename: str,
        raw_rows: List[Dict[str, Any]],
        validated_records: List[Tuple[int, BankCreditRecord]],
        rejected_count: int = 0,
    ) -> IngestionBatchModel:
        existing = self.get_batch_by_idempotency_key(idempotency_key)
        if existing:
            return existing

        batch_id = uuid.uuid4()
        now = datetime.now(timezone.utc)
        batch = IngestionBatchModel(
            id=batch_id,
            idempotency_key=idempotency_key,
            batch_status="processing",
            source_filename=source_filename,
            source_tables=["bank_credits"],
            row_count_submitted=len(raw_rows),
            row_count_accepted=len(validated_records),
            row_count_rejected=rejected_count,
            submitted_at=now,
        )

        try:
            self.db.add(batch)
            self.db.flush()

            raw_id_map: Dict[int, uuid.UUID] = {}
            for idx, raw_dict in enumerate(raw_rows):
                raw_id = uuid.uuid4()
                raw_model = BankCreditsRawModel(
                    id=raw_id,
                    batch_id=batch_id,
                    source_row_index=idx,
                    raw_payload=raw_dict,
                )
                self.db.add(raw_model)
                raw_id_map[idx] = raw_id

            self.db.flush()

            for idx, record in validated_records:
                credit_model = BankCreditModel(
                    id=uuid.uuid4(),
                    raw_id=raw_id_map[idx],
                    batch_id=batch_id,
                    bank_credit_id=record.bank_credit_id,
                    bank_account_id=record.bank_account_id,
                    bank_name=record.bank_name,
                    bank_reference=record.bank_reference,
                    settlement_id=record.settlement_id,
                    credited_amount=record.credited_amount,
                    currency=record.currency,
                    bank_credit_timestamp=record.bank_credit_timestamp,
                    bank_credit_status=record.bank_credit_status,
                    narration=record.narration,
                )
                self.db.add(credit_model)

            batch.batch_status = "completed" if rejected_count == 0 else "completed_with_errors"
            batch.completed_at = datetime.now(timezone.utc)
            self.db.commit()
            self.db.refresh(batch)
            return batch
        except Exception as e:
            self.db.rollback()
            raise e

    def get_all_normalized_records(self) -> Tuple[List[PaymentRecord], List[SettlementRecord], List[RefundRecord], List[BankCreditRecord]]:
        payments = [
            PaymentRecord(
                payment_id=p.payment_id,
                order_id=p.order_id,
                merchant_id=p.merchant_id,
                payment_type=p.payment_type,
                payment_method=p.payment_method,
                amount=p.amount,
                currency=p.currency,
                status=p.status,
                payment_timestamp=p.payment_timestamp,
                captured_timestamp=p.captured_timestamp,
                settlement_id=p.settlement_id,
            )
            for p in self.db.execute(select(PaymentModel)).scalars().all()
        ]
        settlements = [
            SettlementRecord(
                settlement_id=s.settlement_id,
                merchant_id=s.merchant_id,
                settlement_type=s.settlement_type,
                gross_payment_amount=s.gross_payment_amount,
                refund_amount=s.refund_amount,
                fee_amount=s.fee_amount,
                tax_amount=s.tax_amount,
                adjustment_amount=s.adjustment_amount,
                net_settlement_amount=s.net_settlement_amount,
                currency=s.currency,
                settlement_status=s.settlement_status,
                settlement_timestamp=s.settlement_timestamp,
                expected_settlement_timestamp=s.expected_settlement_timestamp,
            )
            for s in self.db.execute(select(SettlementModel)).scalars().all()
        ]
        refunds = [
            RefundRecord(
                refund_id=r.refund_id,
                payment_id=r.payment_id,
                order_id=r.order_id,
                refund_amount=r.refund_amount,
                currency=r.currency,
                refund_status=r.refund_status,
                refund_timestamp=r.refund_timestamp,
                refund_type=r.refund_type,
            )
            for r in self.db.execute(select(RefundModel)).scalars().all()
        ]
        bank_credits = [
            BankCreditRecord(
                bank_credit_id=b.bank_credit_id,
                bank_account_id=b.bank_account_id,
                bank_name=b.bank_name,
                bank_reference=b.bank_reference,
                settlement_id=b.settlement_id,
                credited_amount=b.credited_amount,
                currency=b.currency,
                bank_credit_timestamp=b.bank_credit_timestamp,
                bank_credit_status=b.bank_credit_status,
                narration=b.narration,
            )
            for b in self.db.execute(select(BankCreditModel)).scalars().all()
        ]
        return payments, settlements, refunds, bank_credits

    def save_reconciliation_results_atomic(
        self,
        batch_id: uuid.UUID,
        results: List[ReconciliationCaseResult],
    ) -> List[ReconciliationCaseModel]:
        case_models: List[ReconciliationCaseModel] = []
        now = datetime.now(timezone.utc)
        try:
            for res in results:
                case_id = uuid.uuid4()
                case_model = ReconciliationCaseModel(
                    id=case_id,
                    batch_id=batch_id,
                    payment_id=res.payment_id,
                    exception_type=res.exception_type,
                    decision_status=res.decision_status,
                    resolution_reason=res.resolution_reason,
                    confidence=res.confidence,
                    expected_net_settlement=res.expected_net_settlement,
                    reported_net_settlement=res.reported_net_settlement,
                    settlement_discrepancy=res.settlement_discrepancy,
                    currency="INR",
                    technical_status="success",
                    case_opened_at=now,
                    last_updated_at=now,
                )
                self.db.add(case_model)
                case_models.append(case_model)

                if res.matched_settlement_id:
                    cand = CandidateMatchModel(
                        id=uuid.uuid4(),
                        case_id=case_id,
                        match_stage="exact_identifier",
                        candidate_type="settlement",
                        candidate_entity_id=res.matched_settlement_id,
                        match_score=1.0000,
                        is_selected=True,
                        created_at=now,
                    )
                    self.db.add(cand)

                if res.matched_bank_credit_id:
                    cand = CandidateMatchModel(
                        id=uuid.uuid4(),
                        case_id=case_id,
                        match_stage="exact_identifier",
                        candidate_type="bank_credit",
                        candidate_entity_id=res.matched_bank_credit_id,
                        match_score=1.0000,
                        is_selected=True,
                        created_at=now,
                    )
                    self.db.add(cand)

            self.db.commit()
            return case_models
        except Exception as e:
            self.db.rollback()
            raise e

    def get_cases(
        self,
        decision_status: Optional[str] = None,
        exception_type: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> List[ReconciliationCaseModel]:
        stmt = select(ReconciliationCaseModel)
        if decision_status:
            stmt = stmt.where(ReconciliationCaseModel.decision_status == decision_status)
        if exception_type:
            stmt = stmt.where(ReconciliationCaseModel.exception_type == exception_type)
        stmt = stmt.limit(limit).offset(offset)
        return self.db.execute(stmt).scalars().all()
