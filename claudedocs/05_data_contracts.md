# LedgerLens — Data Contracts & Schema Documentation

```text
document_version: 1.0.0
status: ACTIVE_DATA_CONTRACT
scope: MVP Exception-First 4-Source Reconciliation
currency: INR (₹)
precision: Decimal-Safe (PostgreSQL NUMERIC / Python Decimal / Tabular Monospace)
last_updated: 2026-08-31
```

---

## 1. Backend Schema Definitions

### 1.1 Review Queue Response (`ReviewQueueResponse`)

Returned by `GET /api/v1/review/queue` to populate the Exception Control Room table.

#### Pydantic Schema (Python 3.11+)
```python
from decimal import Decimal
from datetime import datetime
from uuid import UUID
from typing import Optional, List
from pydantic import BaseModel, Field

class ReviewQueueItem(BaseModel):
    case_id: UUID = Field(..., description="Unique UUID identifier of the reconciliation case")
    payment_id: str = Field(..., description="Unique merchant payment identifier (e.g. pay_001014)")
    exception_type: Optional[str] = Field(
        None, 
        description="One of the 8 deterministic exception codes (e.g. 'amount_mismatch', 'fee_mismatch')"
    )
    decision_status: str = Field(
        ..., 
        description="Current case status: 'needs_review' | 'auto_reconciled' | 'rejected' | 'unresolved'"
    )
    confidence: str = Field(
        ..., 
        description="Grounding level: 'high' | 'medium' | 'low'"
    )
    expected_net_settlement: Optional[Decimal] = Field(
        None, 
        description="Deterministic net payout calculated from gross, fee (2%), tax (18%), and refunds"
    )
    reported_net_settlement: Optional[Decimal] = Field(
        None, 
        description="Net settlement amount reported in the gateway batch line item"
    )
    settlement_discrepancy: Optional[Decimal] = Field(
        None, 
        description="Absolute difference between expected and reported net settlement (|Expected - Reported|)"
    )
    case_opened_at: datetime = Field(
        ..., 
        description="Timezone-aware timestamp when the reconciliation anomaly was flagged"
    )
    amount_at_risk: Optional[Decimal] = Field(
        None, 
        description="Total monetary exposure associated with the unlinked or mismatched transaction"
    )

class ReviewQueueResponse(BaseModel):
    total_cases: int = Field(..., description="Total count of open exception cases currently in the backlog")
    total_amount_at_risk: Decimal = Field(..., description="Sum of amount_at_risk across all unresolved cases")
    cases: List[ReviewQueueItem] = Field(..., description="List of exception queue items")
```

#### JSON Payload Example
```json
{
  "total_cases": 31,
  "total_amount_at_risk": "121989.46",
  "cases": [
    {
      "case_id": "cf8a177b-face-436d-8f26-277fa7282022",
      "payment_id": "pay_001014",
      "exception_type": "fee_mismatch",
      "decision_status": "needs_review",
      "confidence": "low",
      "expected_net_settlement": "5887.93",
      "reported_net_settlement": "5781.20",
      "settlement_discrepancy": "106.73",
      "case_opened_at": "2026-08-31T11:55:39.333319Z",
      "amount_at_risk": "6030.25"
    }
  ]
}
```

---

### 1.2 Case Evidence Response (`CaseEvidenceResponse`)

Returned by `GET /api/v1/review/cases/{case_id}` to supply the 3-Column Case Investigation Workspace.

#### Pydantic Schema (Python 3.11+)
```python
class PaymentFacts(BaseModel):
    payment_id: str
    order_id: str
    merchant_id: str
    amount: Decimal
    currency: str = "INR"
    status: str = "captured"
    payment_timestamp: Optional[datetime] = None
    settlement_id: Optional[str] = None

class SettlementFacts(BaseModel):
    settlement_id: str
    gross_payment_amount: Decimal
    fee_amount: Decimal
    tax_amount: Decimal
    net_settlement_amount: Decimal
    settlement_status: str = "processed"
    settlement_timestamp: Optional[datetime] = None

class BankCreditFacts(BaseModel):
    bank_credit_id: str
    bank_account_id: str
    bank_name: str
    bank_reference: str
    credited_amount: Decimal
    currency: str = "INR"
    bank_credit_timestamp: Optional[datetime] = None
    bank_credit_status: str = "cleared"
    narration: Optional[str] = None

class CaseEvidenceResponse(BaseModel):
    case_id: UUID
    payment_id: str
    exception_type: str
    decision_status: str
    expected_net_settlement: Optional[Decimal]
    reported_net_settlement: Optional[Decimal]
    settlement_discrepancy: Optional[Decimal]
    currency: str = "INR"
    version: int = Field(..., description="Monotonically increasing lock version for atomic CAS concurrency")
    case_opened_at: Optional[datetime] = None
    payment: Optional[PaymentFacts] = None
    settlement: Optional[SettlementFacts] = None
    bank_credits: List[BankCreditFacts] = Field(default_factory=list)
```

---

### 1.3 Human Review Request & Response (`HumanReviewResponse`)

Used in `POST /api/v1/review/cases/{case_id}/review` to record human review decisions with atomic Compare-And-Swap (CAS) optimistic locking.

#### Pydantic Schema (Python 3.11+)
```python
class HumanReviewRequest(BaseModel):
    actor: str = Field(..., description="Identity of the operator performing review (e.g. 'finance_ops_reviewer')")
    action: str = Field(..., description="Review action: 'approve' | 'reject' | 'mark_unresolved'")
    expected_version: int = Field(..., description="The lock version expected by the client to prevent stale updates")
    human_comment: Optional[str] = Field(None, description="Mandatory audit justification text from the operator")
    selected_candidate_id: Optional[UUID] = Field(None, description="Optional chosen target ID for ambiguous matches")

class HumanReviewResponse(BaseModel):
    review_action_id: UUID
    case_id: UUID
    actor: str
    action: str
    current_version: int = Field(..., description="Updated lock version (expected_version + 1)")
    previous_decision_status: str
    new_decision_status: str
    human_comment: Optional[str]
    actioned_at: datetime
    audit_event_id: UUID
```

---

### 1.4 Audit Event (`AuditEventItem`)

Returned by `GET /api/v1/review/cases/{case_id}/audit` and `GET /api/v1/review/audit/all`.

#### Pydantic Schema (Python 3.11+)
```python
class AuditEventResponse(BaseModel):
    id: UUID
    event_type: str = Field(..., description="e.g. 'case_created', 'human_review_applied', 'ingestion_batch_processed'")
    actor: str = Field(..., description="'system' or operator identifier (e.g. 'finance_ops_reviewer')")
    case_id: Optional[UUID] = None
    batch_id: Optional[UUID] = None
    previous_status: Optional[str] = None
    new_status: Optional[str] = None
    occurred_at: datetime = Field(..., description="ISO 8601 UTC timestamp")
```

---

## 2. Field-Level Documentation

| Field Name | Meaning & Financial Representation | Exact Derivation / Mathematical Formula | Example Values | Consuming UI Components |
| :--- | :--- | :--- | :--- | :--- |
| `amount` (`gross_amount`) | Gross transaction amount captured from merchant checkout. | Stored in raw payment capture feed (`payments.amount`). | `₹6,030.25`<br>`₹2,203.75` | Queue Table (`At Risk`), Payment Card, Command Center (`Total Captured`). |
| `fee_amount` | Contractual 2% transaction fee charged by payment gateway. | $\text{Fee} = \text{round}(\text{Gross} \times 0.02, 2)$ | `₹120.61`<br>`₹44.08` | Gateway Settlement Feed Card, Settings Formula Inspector. |
| `tax_amount` | Statutory 18% Goods & Services Tax (GST) charged on the processing fee. | $\text{GST} = \text{round}(\text{Fee} \times 0.18, 2)$ | `₹21.71`<br>`₹7.93` | Gateway Settlement Feed Card, Settings Formula Inspector. |
| `expected_net_settlement` | Deterministic expected payout to the merchant account. | $\text{Expected Net} = \text{Gross} - (\text{Fee} + \text{GST}) - \text{Refunds}$ | `₹5,887.93`<br>`₹2,151.74` | Anomaly Summary Strip, Payment Feed Card, Case Metadata. |
| `reported_net_settlement` | Net payout amount reported in gateway settlement file. | Stored in gateway settlement batch feed (`settlements.net_settlement_amount`). | `₹5,781.20`<br>`₹2,101.74` | Anomaly Summary Strip, Settlement Feed Card. |
| `settlement_discrepancy` | Monetary variance between calculation and settlement. | $\Delta = \lvert \text{Reported Net} - \text{Expected Net} \rvert$ | `₹106.73`<br>`₹50.00` | Queue Row Title, Discrepancy Metric (`text-rose-400`), Sorting Filter. |
| `amount_at_risk` | Total unverified money at risk of loss or misallocation. | $\begin{cases} \text{Gross Amount} & \text{if missing settlement/bank credit} \\ \Delta \text{ Discrepancy} & \text{if amount/fee mismatch} \end{cases}$ | `₹6,030.25`<br>`₹7,673.75` | Header Context Strip (`₹1,21,989.46 exposure`), Queue Table Column. |
| `version` (`lock_version`) | Optimistic concurrency version tag. Prevents concurrent overwrite. | Monotonically increments on each human review ($v_{\text{new}} = v_{\text{current}} + 1$). | `v1`<br>`v2` | Case Header Badge, Decision Panel footer (`Atomic CAS`), HTTP 409 Banner. |
| `bank_reference` (`UTR`) | Unique Transaction Reference number from core banking settlement. | Extracted from NEFT/RTGS statement feed (`bank_credits.bank_reference`). | `UTR00001014`<br>`UTR99887711` | Bank Credit Feed Card, Search Filter Input. |

---

## 3. Exception Type Taxonomy (The 8 Deterministic Financial Exceptions)

### 1. `missing_settlement`
- **Technical Code**: `missing_settlement` | **Severity**: `High`
- **Plain Description**: *"Payment captured by merchant, but no gateway settlement batch line item was received."*
- **Scenario**: `pay_001008` captured for ₹5,413.00, settlement batch never arrived.

### 2. `missing_bank_credit`
- **Technical Code**: `missing_bank_credit` | **Severity**: `High`
- **Plain Description**: *"Settlement reported by gateway, but no matching bank statement UTR credit appears in statement feed."*
- **Scenario**: `set_001049` reports settled net of ₹1,035.22, but zero matching UTRs exist in bank statement.

### 3. `amount_mismatch`
- **Technical Code**: `amount_mismatch` | **Severity**: `Critical`
- **Plain Description**: *"Calculated expected net payout deviates from gateway reported net settlement amount."*
- **Scenario**: Expected net is ₹2,151.74, reported net is ₹2,101.74 (₹50.00 discrepancy).

### 4. `fee_mismatch`
- **Technical Code**: `fee_mismatch` | **Severity**: `High`
- **Plain Description**: *"Calculated 2% gateway fee and 18% GST deviate from settlement line item."*
- **Scenario**: Contractual fee+tax = ₹142.32, gateway billed ₹249.05 (₹106.73 unauthorized overcharge).

### 5. `duplicate_payment`
- **Technical Code**: `duplicate_payment` | **Severity**: `Critical`
- **Plain Description**: *"Multiple captured payment entries detected for the same order reference."*
- **Scenario**: Two payments captured for order_001042 for ₹1,093.75 each, only 1 settled.

### 6. `duplicate_bank_credit`
- **Technical Code**: `duplicate_bank_credit` | **Severity**: `High`
- **Plain Description**: *"Multiple bank statement credits reference the same settlement batch ID."*
- **Scenario**: Two bank credits received for batch `set_001007` for ₹7,673.75 each.

### 7. `partial_refund_not_reflected`
- **Technical Code**: `partial_refund_not_reflected` | **Severity**: `High`
- **Plain Description**: *"Customer refund was captured, but net settlement payout was not adjusted."*
- **Scenario**: ₹300.00 partial refund issued, gateway settlement paid full gross without deduction.

### 8. `ambiguous_match`
- **Technical Code**: `ambiguous_match` | **Severity**: `High`
- **Plain Description**: *"Multiple candidate settlement or bank records matched transaction criteria equally."*
- **Scenario**: Two identical settlement batches share exact gross amounts and timestamp windows.
