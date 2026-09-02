# LedgerLens — API Endpoint Map & Request/Response Specification

```text
api_version: v1
base_url: http://localhost:8000/api/v1
authentication: Internal Operator Identity Header / Session (Audit-Logged)
data_serialization: JSON (Decimal values serialized as penny-exact string format)
last_updated: 2026-08-31
```

---

## 1. Exception Queue & Case Management Endpoints

### 1.1 Fetch Exception Review Queue
- **Method**: `GET`
- **Path**: `/api/v1/review/queue`
- **Response (`200 OK`)**:
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

### 1.2 Fetch Single Case Multi-Source Evidence Detail
- **Method**: `GET`
- **Path**: `/api/v1/review/cases/{case_id}`
- **Response (`200 OK`)**:
```json
{
  "case_id": "cf8a177b-face-436d-8f26-277fa7282022",
  "payment_id": "pay_001014",
  "exception_type": "fee_mismatch",
  "decision_status": "needs_review",
  "expected_net_settlement": "5887.93",
  "reported_net_settlement": "5781.20",
  "settlement_discrepancy": "106.73",
  "currency": "INR",
  "version": 1,
  "case_opened_at": "2026-08-31T11:55:39.333319Z",
  "payment": {
    "payment_id": "pay_001014",
    "order_id": "order_001014",
    "merchant_id": "merch_003",
    "amount": "6030.25",
    "currency": "INR",
    "status": "captured",
    "payment_timestamp": "2026-08-31T09:15:00.000Z",
    "settlement_id": "set_001014"
  },
  "settlement": {
    "settlement_id": "set_001014",
    "gross_payment_amount": "6030.25",
    "fee_amount": "211.06",
    "tax_amount": "37.99",
    "net_settlement_amount": "5781.20",
    "settlement_status": "processed",
    "settlement_timestamp": "2026-08-31T11:30:00.000Z"
  },
  "bank_credits": [
    {
      "bank_credit_id": "bc_001014",
      "bank_account_id": "ba_hdfc_01",
      "bank_name": "HDFC Bank",
      "bank_reference": "UTR00001014",
      "credited_amount": "5781.20",
      "currency": "INR",
      "bank_credit_timestamp": "2026-08-31T11:45:00.000Z",
      "bank_credit_status": "cleared",
      "narration": "RAZORPAY SETTLEMENT BATCH 001014"
    }
  ]
}
```

---

### 1.3 Submit Human Review Decision (Atomic CAS)
- **Method**: `POST`
- **Path**: `/api/v1/review/cases/{case_id}/review`
- **Request Body**:
```json
{
  "actor": "finance_ops_reviewer",
  "action": "approve",
  "expected_version": 1,
  "human_comment": "Verified with gateway support. ₹106.73 fee adjustment approved under merchant contractual addendum.",
  "selected_candidate_id": null
}
```
- **Response (`200 OK`)**:
```json
{
  "review_action_id": "7b019318-7650-4ab9-a4f6-7b89d42e12fa",
  "case_id": "cf8a177b-face-436d-8f26-277fa7282022",
  "actor": "finance_ops_reviewer",
  "action": "approve",
  "current_version": 2,
  "previous_decision_status": "needs_review",
  "new_decision_status": "resolved",
  "human_comment": "Verified with gateway support. ₹106.73 fee adjustment approved under merchant contractual addendum.",
  "actioned_at": "2026-08-31T16:45:00.123456Z",
  "audit_event_id": "9a01f92e-3341-4822-bc51-0182f91a7833"
}
```
- **Conflict Response (`409 Conflict`)**:
```json
{
  "detail": "Case version mismatch: expected 1, current is 2. The case has been updated by another reviewer."
}
```
