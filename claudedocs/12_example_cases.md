# LedgerLens — Real Exception Data Cases & Multi-Source Patterns

These concrete multi-source data patterns illustrate how anomalies manifest across the 4 data streams and how LedgerLens displays them.

---

## Case 1: Contractual Fee & Tax Mismatch (`fee_mismatch`)
- **Case UUID**: `cf8a177b-face-436d-8f26-277fa7282022`
- **Payment ID**: `pay_001014`
- **Gross Captured**: `₹6,030.25`
- **Expected Net Settlement**: `₹5,887.93` (Gross - 2% Fee [₹120.61] - 18% GST [₹21.71])
- **Reported Net Settlement**: `₹5,781.20` (Gateway deducted Fee = ₹211.06 + GST = ₹37.99)
- **Settlement Discrepancy**: `-₹106.73 unauthorized overcharge`
- **Bank Credit**: `UTR00001014` credited for `₹5,781.20`
- **Root Cause**: Payment gateway applied a higher default rate tier instead of the merchant's 2.00% contractual tier.
- **Policy Citation**: `sop_fee_structures.md §4.2`

---

## Case 2: Reported Net Settlement Amount Mismatch (`amount_mismatch`)
- **Case UUID**: `6f310673-41dd-4005-91aa-c7b5284d6989`
- **Payment ID**: `pay_001028`
- **Gross Captured**: `₹2,203.75`
- **Expected Net Settlement**: `₹2,151.74`
- **Reported Net Settlement**: `₹2,101.74`
- **Settlement Discrepancy**: `-₹50.00 delta`
- **Bank Credit**: `UTR00001028` credited for `₹2,101.74`
- **Root Cause**: Gateway batch settlement omitted a ₹50.00 promotional discount credit.
- **Action**: Operator rejects line item and files acquiring adjustment request.

---

## Case 3: Missing Gateway Settlement Record (`missing_settlement`)
- **Case UUID**: `a53ab8bb-8972-480e-a1ff-fa7156596418`
- **Payment ID**: `pay_001008`
- **Gross Captured**: `₹5,413.00`
- **Reported Net Settlement**: *(None / Missing settlement_id)*
- **Bank Credit**: *(None)*
- **Exposure at Risk**: `₹5,413.00`
- **Root Cause**: Webhook capture succeeded in merchant store, but gateway settlement batch failed to generate or was delayed beyond the 3-day window.

---

## Case 4: Uncredited Settlement in Bank Statements (`missing_bank_credit`)
- **Case UUID**: `abbcb92f-f7d4-427e-8816-d9145f5ba350`
- **Payment ID**: `pay_001023`
- **Gross Captured**: `₹2,604.50`
- **Settlement Reported**: `set_001023` reports settled net of `₹2,543.03`
- **Bank Credit**: *(Zero matching UTR records found)*
- **Exposure at Risk**: `₹2,604.50`
- **Root Cause**: Gateway dispatches batch file but bank NEFT transfer fails or remains in clearing limbo.

---

## Case 5: Partial Customer Refund Unreflected in Net Payout (`partial_refund_not_reflected`)
- **Case UUID**: `a4167dc8-b50a-4b2e-b88b-8ba50a301dae`
- **Payment ID**: `pay_001052`
- **Gross Captured**: `₹3,211.50`
- **Customer Refund**: `ref_001052` issued for `₹500.00`
- **Settlement Reported**: Full payout `₹3,135.71` without deducting the ₹500.00 refund.
- **Discrepancy**: `₹500.00 refund unreflected`
- **Root Cause**: Refund was processed after gateway batch cut-off time.
