from enum import Enum
from typing import Optional

class FinancialExceptionType(str, Enum):
    MISSING_SETTLEMENT = "missing_settlement"
    MISSING_BANK_CREDIT = "missing_bank_credit"
    AMOUNT_MISMATCH = "amount_mismatch"
    FEE_MISMATCH = "fee_mismatch"
    DUPLICATE_PAYMENT = "duplicate_payment"
    DUPLICATE_BANK_CREDIT = "duplicate_bank_credit"
    PARTIAL_REFUND_NOT_REFLECTED = "partial_refund_not_reflected"
    AMBIGUOUS_MATCH = "ambiguous_match"

class DecisionStatus(str, Enum):
    AUTO_RECONCILED = "auto_reconciled"
    NEEDS_REVIEW = "needs_review"
    UNRESOLVED = "unresolved"
    REJECTED = "rejected"
    BLOCKED = "blocked"
    ALREADY_PROCESSED = "already_processed"

class ResolutionReason(str, Enum):
    MATCHED = "matched"
    NO_CANDIDATE_FOUND = "no_candidate_found"
    MULTIPLE_CANDIDATES = "multiple_candidates"
    REJECTED_HARD_CONFLICT = "rejected_hard_conflict"
    BLOCKED_INVALID_ROW = "blocked_invalid_row"
    DUPLICATE_BATCH = "duplicate_batch"

class ConfidenceLevel(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    UNAVAILABLE = "unavailable"
    NOT_APPLICABLE = "not_applicable"

class ConcurrentUpdateError(Exception):
    """Raised when an optimistic locking check fails during a database update."""
    pass
