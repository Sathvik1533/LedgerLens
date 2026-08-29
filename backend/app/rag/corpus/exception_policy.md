# Reconciliation Exception Policy (v1.0)
source: exception_policy.md

## Exception Types & Definitions

### missing_settlement
- Raised when a captured payment has no matching settlement record.
- The payment.settlement_id is null or the referenced settlement does not exist.
- Action: Route to needs_review. Finance team must contact gateway to obtain settlement.

### missing_bank_credit
- Raised when a settlement exists but no corresponding bank credit has been received.
- The settlement_id is not referenced by any bank_credit row.
- Action: Route to needs_review. Finance team must chase bank for credit confirmation.

### amount_mismatch
- Raised when bank_credit.credited_amount != settlement.net_settlement_amount.
- Even a ₹0.01 difference triggers this exception.
- Action: Route to needs_review. Disclose the discrepancy amount in the case evidence.

### fee_mismatch
- Raised when settlement.fee_amount or settlement.tax_amount does not match the expected rate (2% + 18% GST).
- This may indicate an incorrect tier or a gateway billing error.
- Action: Route to needs_review. Never auto-approve.

### duplicate_payment
- Raised when two or more payments share the same order_id.
- Only one payment per order should be captured.
- Action: Route to needs_review. One payment must be refunded.

### duplicate_bank_credit
- Raised when two or more bank_credit rows reference the same bank_reference.
- This represents a double-credit from the bank.
- Action: Route to needs_review. Finance must contact bank to recover excess credit.

### partial_refund_not_reflected
- Raised when a refund exists for a payment but settlement.refund_amount is 0.
- The gateway has not deducted the refund from the settlement.
- Action: Route to needs_review. Finance must reconcile refund deduction with gateway.

### ambiguous_match
- Raised when two or more bank credits both reference the same settlement_id.
- Matcher cannot determine which credit is correct without human judgment.
- Action: Route to needs_review. Human must select the correct candidate.

## Decision Status Values
- auto_reconciled: Fully matched, no exception. High confidence. No human action required.
- needs_review: Exception detected. Human review mandatory before financial closure.
- unresolved: No candidate found after all matching stages. Case remains open.
- rejected: Human explicitly rejected the auto-reconciled result.
