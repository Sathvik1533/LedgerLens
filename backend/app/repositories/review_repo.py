import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select

from backend.app.models.reconciliation import ReconciliationCaseModel
from backend.app.models.review import HumanReviewActionModel, AuditEventModel


class ReviewRepository:
    def __init__(self, db: Session):
        self.db = db

    # ── Case Lookup ──────────────────────────────────────────────────────────────

    def get_case_by_id(self, case_id: uuid.UUID) -> Optional[ReconciliationCaseModel]:
        stmt = select(ReconciliationCaseModel).where(ReconciliationCaseModel.id == case_id)
        return self.db.execute(stmt).scalar_one_or_none()

    def get_review_queue(
        self,
        limit: int = 100,
        offset: int = 0,
        exception_type: Optional[str] = None,
    ) -> List[ReconciliationCaseModel]:
        """Return all cases with decision_status = 'needs_review', ordered by case_opened_at desc."""
        stmt = (
            select(ReconciliationCaseModel)
            .where(ReconciliationCaseModel.decision_status == "needs_review")
            .order_by(ReconciliationCaseModel.case_opened_at.desc())
        )
        if exception_type:
            stmt = stmt.where(ReconciliationCaseModel.exception_type == exception_type)
        stmt = stmt.limit(limit).offset(offset)
        return self.db.execute(stmt).scalars().all()

    # ── Review Action ────────────────────────────────────────────────────────────

    def apply_review_action_atomic(
        self,
        case: ReconciliationCaseModel,
        expected_version: int,
        actor: str,
        action: str,                    # approve | reject | mark_unresolved
        human_comment: Optional[str],
        selected_candidate_id: Optional[uuid.UUID],
    ) -> tuple[HumanReviewActionModel, AuditEventModel]:
        """
        ACID boundary: updates case status, writes review action, writes audit event — all in one transaction.
        Technical invariants enforced:
          - AI does NOT call this method — only humans do.
          - Audit event is append-only; we never UPDATE or DELETE audit_events rows.
          - Previous status is recorded before mutation.
        """
        ACTION_TO_STATUS = {
            "approve": "auto_reconciled",
            "reject": "rejected",
            "mark_unresolved": "unresolved",
        }
        if action not in ACTION_TO_STATUS:
            raise ValueError(f"Invalid review action '{action}'. Must be: approve, reject, mark_unresolved")

        EVENT_TYPE_MAP = {
            "approve": "human_approved",
            "reject": "human_rejected",
            "mark_unresolved": "human_marked_unresolved",
        }

        now = datetime.now(timezone.utc)
        previous_status = case.decision_status
        new_status = ACTION_TO_STATUS[action]

        try:
            from sqlalchemy import update
            from backend.app.domain.exceptions import ConcurrentUpdateError
            
            # 1. Mutate the case via atomic optimistic locking UPDATE
            values_to_update = {
                "decision_status": new_status,
                "resolution_reason": action,
                "last_updated_at": now,
                "version": expected_version + 1,
            }
            if action == "approve":
                values_to_update["case_closed_at"] = now
            if selected_candidate_id:
                values_to_update["selected_candidate_id"] = selected_candidate_id
                
            stmt = (
                update(ReconciliationCaseModel)
                .where(
                    ReconciliationCaseModel.id == case.id,
                    ReconciliationCaseModel.version == expected_version,
                    ReconciliationCaseModel.decision_status == "needs_review"
                )
                .values(**values_to_update)
            )
            result = self.db.execute(stmt)
            if result.rowcount == 0:
                self.db.rollback()
                raise ConcurrentUpdateError("Case version mismatch or status changed.")
                
            # Reflect changes in memory model for subsequent code if needed
            case.version = expected_version + 1
            case.decision_status = new_status

            # 2. Write append-only review action row
            review_action = HumanReviewActionModel(
                id=uuid.uuid4(),
                case_id=case.id,
                actor=actor,
                action=action,
                previous_decision_status=previous_status,
                new_decision_status=new_status,
                selected_candidate_id=selected_candidate_id,
                human_comment=human_comment,
                actioned_at=now,
            )
            self.db.add(review_action)

            # 3. Write append-only audit event
            audit_event = AuditEventModel(
                id=uuid.uuid4(),
                event_type=EVENT_TYPE_MAP[action],
                actor=actor,
                case_id=case.id,
                batch_id=case.batch_id,
                previous_status=previous_status,
                new_status=new_status,
                occurred_at=now,
            )
            self.db.add(audit_event)

            self.db.commit()
            self.db.refresh(review_action)
            self.db.refresh(audit_event)
            return review_action, audit_event

        except Exception as e:
            self.db.rollback()
            raise e

    # ── Audit Trail ──────────────────────────────────────────────────────────────

    def get_audit_trail_for_case(self, case_id: uuid.UUID) -> List[AuditEventModel]:
        """Returns the full append-only audit trail for a single case, oldest-first."""
        stmt = (
            select(AuditEventModel)
            .where(AuditEventModel.case_id == case_id)
            .order_by(AuditEventModel.occurred_at.asc())
        )
        return self.db.execute(stmt).scalars().all()

    def get_all_audit_events(self, limit: int = 100, offset: int = 0) -> List[AuditEventModel]:
        """Returns system-wide append-only audit events, newest-first."""
        stmt = (
            select(AuditEventModel)
            .order_by(AuditEventModel.occurred_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return self.db.execute(stmt).scalars().all()

    def emit_audit_event(
        self,
        event_type: str,
        actor: str,
        case_id: Optional[uuid.UUID] = None,
        batch_id: Optional[uuid.UUID] = None,
        previous_status: Optional[str] = None,
        new_status: Optional[str] = None,
        failure_type: Optional[str] = None,
        failure_reason: Optional[str] = None,
    ) -> AuditEventModel:
        """Emit a standalone audit event (e.g. case_opened, case_auto_reconciled) with no DB mutation."""
        now = datetime.now(timezone.utc)
        event = AuditEventModel(
            id=uuid.uuid4(),
            event_type=event_type,
            actor=actor,
            case_id=case_id,
            batch_id=batch_id,
            previous_status=previous_status,
            new_status=new_status,
            failure_type=failure_type,
            failure_reason=failure_reason,
            occurred_at=now,
        )
        try:
            self.db.add(event)
            self.db.commit()
            self.db.refresh(event)
            return event
        except Exception as e:
            self.db.rollback()
            raise e
