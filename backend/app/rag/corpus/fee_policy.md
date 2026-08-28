# Razorpay Fee & Tax Policy (v1.0)
source: fee_policy.md

## Standard Fee Rate
- Standard gateway fee: 2% of gross payment amount.
- Fee is calculated on gross_payment_amount (before any deductions).
- Formula: fee_amount = ROUND(gross_payment_amount * 0.02, 2)

## GST on Gateway Fee
- GST rate applied to fee: 18%.
- Formula: tax_amount = ROUND(fee_amount * 0.18, 2)

## Net Settlement Calculation
- net_settlement_amount = gross_payment_amount - fee_amount - tax_amount - refund_amount + adjustment_amount
- Net settlement must always be positive.
- All amounts are stored as NUMERIC(18,2) with ROUND_HALF_UP rounding.

## Fee Mismatch Definition
- A fee_mismatch exception is raised when the reported fee_amount or tax_amount in the settlement does not equal the expected values calculated from the above formulas.
- A discrepancy of even ₹0.01 constitutes a fee_mismatch and requires human review.
- Fee mismatches are never auto-reconciled — they always go to needs_review.

## Currency
- All amounts are in INR (Indian Rupee) unless explicitly stated.
- Currency field must be exactly 3 characters (ISO 4217 code).

## Decimal Precision
- Python Decimal with ROUND_HALF_UP must be used for all financial arithmetic.
- Float arithmetic is prohibited — float cannot represent 0.1 + 0.2 exactly.
