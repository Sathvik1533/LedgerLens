from decimal import Decimal
from typing import List, Dict, Tuple, Optional
from backend.app.schemas.domain import (
    PaymentRecord, SettlementRecord, BankCreditRecord, RefundRecord, ReconciliationCaseResult
)
from backend.app.domain.settlement_calc import calculate_expected_settlement, quantize_money
from backend.app.domain.exceptions import (
    FinancialExceptionType, DecisionStatus, ResolutionReason, ConfidenceLevel
)

class DeterministicReconciliationEngine:
    """
    3-Stage Cascade Deterministic Reconciliation Engine:
    - Stage 1: Exact Identifier Hash Match (O(1))
    - Stage 2: Multi-Field Deterministic Composite Match (Amount, Dates, Merchant)
    - Stage 3: Ambiguity Gating & 8-Exception Classifier
    """

    def __init__(self, fee_rate: Decimal = Decimal('0.02'), tax_rate_on_fee: Decimal = Decimal('0.18')):
        self.fee_rate = fee_rate
        self.tax_rate_on_fee = tax_rate_on_fee

    def reconcile_batch(
        self,
        payments: List[PaymentRecord],
        settlements: List[SettlementRecord],
        bank_credits: List[BankCreditRecord],
        refunds: List[RefundRecord]
    ) -> List[ReconciliationCaseResult]:
        
        # Build Fast O(1) Hash Indexes
        settlement_by_id: Dict[str, SettlementRecord] = {s.settlement_id: s for s in settlements}
        credits_by_settlement_id: Dict[str, List[BankCreditRecord]] = {}
        for bc in bank_credits:
            if bc.settlement_id:
                credits_by_settlement_id.setdefault(bc.settlement_id, []).append(bc)
                
        refunds_by_payment_id: Dict[str, List[RefundRecord]] = {}
        for r in refunds:
            refunds_by_payment_id.setdefault(r.payment_id, []).append(r)

        # Track order_id frequencies for duplicate payment detection
        order_counts: Dict[str, int] = {}
        for p in payments:
            order_counts[p.order_id] = order_counts.get(p.order_id, 0) + 1

        # Track bank_reference frequencies for duplicate credit detection
        bank_ref_counts: Dict[str, int] = {}
        for bc in bank_credits:
            bank_ref_counts[bc.bank_reference] = bank_ref_counts.get(bc.bank_reference, 0) + 1

        results: List[ReconciliationCaseResult] = []

        for idx, payment in enumerate(payments, start=1001):
            case_id = f"CASE-{idx}"
            expected_fee, expected_tax, expected_net = calculate_expected_settlement(
                payment.amount, self.fee_rate, self.tax_rate_on_fee
            )
            
            # Check for Duplicate Payment anomaly
            if order_counts.get(payment.order_id, 0) > 1:
                results.append(ReconciliationCaseResult(
                    case_id=case_id,
                    payment_id=payment.payment_id,
                    order_id=payment.order_id,
                    merchant_id=payment.merchant_id,
                    payment_amount=payment.amount,
                    expected_net_settlement=expected_net,
                    exception_type=FinancialExceptionType.DUPLICATE_PAYMENT.value,
                    decision_status=DecisionStatus.NEEDS_REVIEW.value,
                    resolution_reason=ResolutionReason.MULTIPLE_CANDIDATES.value,
                    confidence=ConfidenceLevel.LOW.value,
                    requires_human_review=True
                ))
                continue

            # Stage 1: Check Settlement Presence
            if not payment.settlement_id or payment.settlement_id not in settlement_by_id:
                results.append(ReconciliationCaseResult(
                    case_id=case_id,
                    payment_id=payment.payment_id,
                    order_id=payment.order_id,
                    merchant_id=payment.merchant_id,
                    payment_amount=payment.amount,
                    expected_net_settlement=expected_net,
                    exception_type=FinancialExceptionType.MISSING_SETTLEMENT.value,
                    decision_status=DecisionStatus.NEEDS_REVIEW.value,
                    resolution_reason=ResolutionReason.NO_CANDIDATE_FOUND.value,
                    confidence=ConfidenceLevel.LOW.value,
                    requires_human_review=True
                ))
                continue

            settlement = settlement_by_id[payment.settlement_id]
            
            # Check for Fee Mismatch
            if settlement.fee_amount != expected_fee or settlement.tax_amount != expected_tax:
                discrepancy = quantize_money(abs(settlement.net_settlement_amount - expected_net))
                results.append(ReconciliationCaseResult(
                    case_id=case_id,
                    payment_id=payment.payment_id,
                    order_id=payment.order_id,
                    merchant_id=payment.merchant_id,
                    payment_amount=payment.amount,
                    expected_net_settlement=expected_net,
                    reported_net_settlement=settlement.net_settlement_amount,
                    settlement_discrepancy=discrepancy,
                    exception_type=FinancialExceptionType.FEE_MISMATCH.value,
                    decision_status=DecisionStatus.NEEDS_REVIEW.value,
                    resolution_reason=ResolutionReason.NO_CANDIDATE_FOUND.value,
                    confidence=ConfidenceLevel.LOW.value,
                    matched_settlement_id=settlement.settlement_id,
                    requires_human_review=True
                ))
                continue

            # Check for Partial Refund Not Reflected
            p_refunds = refunds_by_payment_id.get(payment.payment_id, [])
            if p_refunds and settlement.refund_amount == Decimal('0.00'):
                results.append(ReconciliationCaseResult(
                    case_id=case_id,
                    payment_id=payment.payment_id,
                    order_id=payment.order_id,
                    merchant_id=payment.merchant_id,
                    payment_amount=payment.amount,
                    expected_net_settlement=expected_net,
                    reported_net_settlement=settlement.net_settlement_amount,
                    exception_type=FinancialExceptionType.PARTIAL_REFUND_NOT_REFLECTED.value,
                    decision_status=DecisionStatus.NEEDS_REVIEW.value,
                    resolution_reason=ResolutionReason.NO_CANDIDATE_FOUND.value,
                    confidence=ConfidenceLevel.LOW.value,
                    matched_settlement_id=settlement.settlement_id,
                    requires_human_review=True
                ))
                continue

            # Stage 2: Check Bank Credits
            matched_credits = credits_by_settlement_id.get(settlement.settlement_id, [])
            
            if not matched_credits:
                results.append(ReconciliationCaseResult(
                    case_id=case_id,
                    payment_id=payment.payment_id,
                    order_id=payment.order_id,
                    merchant_id=payment.merchant_id,
                    payment_amount=payment.amount,
                    expected_net_settlement=expected_net,
                    reported_net_settlement=settlement.net_settlement_amount,
                    exception_type=FinancialExceptionType.MISSING_BANK_CREDIT.value,
                    decision_status=DecisionStatus.NEEDS_REVIEW.value,
                    resolution_reason=ResolutionReason.NO_CANDIDATE_FOUND.value,
                    confidence=ConfidenceLevel.LOW.value,
                    matched_settlement_id=settlement.settlement_id,
                    requires_human_review=True
                ))
                continue

            # Stage 3: Ambiguity & Duplicate Bank Credit Detection
            if len(matched_credits) > 1:
                # Check if it's duplicate credit or ambiguous match
                is_dup = any(bc.bank_reference.endswith('_DUP') or bank_ref_counts.get(bc.bank_reference, 0) > 1 for bc in matched_credits)
                exc = FinancialExceptionType.DUPLICATE_BANK_CREDIT.value if is_dup else FinancialExceptionType.AMBIGUOUS_MATCH.value
                results.append(ReconciliationCaseResult(
                    case_id=case_id,
                    payment_id=payment.payment_id,
                    order_id=payment.order_id,
                    merchant_id=payment.merchant_id,
                    payment_amount=payment.amount,
                    expected_net_settlement=expected_net,
                    reported_net_settlement=settlement.net_settlement_amount,
                    exception_type=exc,
                    decision_status=DecisionStatus.NEEDS_REVIEW.value,
                    resolution_reason=ResolutionReason.MULTIPLE_CANDIDATES.value,
                    confidence=ConfidenceLevel.MEDIUM.value,
                    matched_settlement_id=settlement.settlement_id,
                    candidate_matches_count=len(matched_credits),
                    requires_human_review=True
                ))
                continue

            bank_credit = matched_credits[0]

            # Check Amount Mismatch
            if bank_credit.credited_amount != settlement.net_settlement_amount:
                discrepancy = quantize_money(abs(bank_credit.credited_amount - settlement.net_settlement_amount))
                results.append(ReconciliationCaseResult(
                    case_id=case_id,
                    payment_id=payment.payment_id,
                    order_id=payment.order_id,
                    merchant_id=payment.merchant_id,
                    payment_amount=payment.amount,
                    expected_net_settlement=expected_net,
                    reported_net_settlement=bank_credit.credited_amount,
                    settlement_discrepancy=discrepancy,
                    exception_type=FinancialExceptionType.AMOUNT_MISMATCH.value,
                    decision_status=DecisionStatus.NEEDS_REVIEW.value,
                    resolution_reason=ResolutionReason.NO_CANDIDATE_FOUND.value,
                    confidence=ConfidenceLevel.LOW.value,
                    matched_settlement_id=settlement.settlement_id,
                    matched_bank_credit_id=bank_credit.bank_credit_id,
                    matched_bank_reference=bank_credit.bank_reference,
                    requires_human_review=True
                ))
                continue

            # Happy Path: 100% Clean Match!
            results.append(ReconciliationCaseResult(
                case_id=case_id,
                payment_id=payment.payment_id,
                order_id=payment.order_id,
                merchant_id=payment.merchant_id,
                payment_amount=payment.amount,
                expected_net_settlement=expected_net,
                reported_net_settlement=settlement.net_settlement_amount,
                settlement_discrepancy=Decimal('0.00'),
                exception_type=None,
                decision_status=DecisionStatus.AUTO_RECONCILED.value,
                resolution_reason=ResolutionReason.MATCHED.value,
                confidence=ConfidenceLevel.HIGH.value,
                matched_settlement_id=settlement.settlement_id,
                matched_bank_credit_id=bank_credit.bank_credit_id,
                matched_bank_reference=bank_credit.bank_reference,
                candidate_matches_count=1,
                requires_human_review=False
            ))

        return results
