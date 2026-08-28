# Settlement Timing & T+2 Policy (v1.0)
source: settlement_policy.md

## Standard Settlement Timeline (T+2)
- Razorpay settles captured payments within T+2 business days.
- T = date of payment capture.
- Settlement is credited to the merchant bank account within 2 business days of capture.

## Settlement Timestamp
- settlement_timestamp: The datetime the settlement was processed by Razorpay.
- expected_settlement_timestamp: The datetime by which settlement should have arrived.
- If settlement_timestamp > expected_settlement_timestamp, the settlement is delayed (note: not a current exception type — flagged for manual review only).

## Missing Settlement Triage
- If payment was captured more than T+3 days ago with no settlement, escalate to gateway.
- If payment was captured less than T+2 days ago, settlement may still be in transit — do not raise exception immediately.

## Settlement ID Format
- settlement_id is a unique text identifier assigned by Razorpay (e.g. set_001001).
- A single settlement_id may correspond to multiple payments in bulk settlement mode.
- In standard (per-payment) mode, each payment maps to exactly one settlement.

## Bank Credit Matching
- Bank credits are matched to settlements via the settlement_id field in bank_credits.settlement_id.
- bank_reference is the bank's unique UTR (Unique Transaction Reference) number.
- A bank_reference must be globally unique — duplication indicates a double-credit error.

## Refund Accounting
- Approved refunds are deducted from the gross settlement amount before crediting.
- refund_amount in the settlement row must equal the sum of all processed refunds for that payment.
- If refund_amount = 0 but a processed refund exists, raise partial_refund_not_reflected.
