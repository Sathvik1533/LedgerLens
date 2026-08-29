import csv
from datetime import datetime, timezone
from decimal import Decimal
from backend.app.schemas.domain import PaymentRecord, SettlementRecord, BankCreditRecord, RefundRecord
from backend.app.domain.matcher import DeterministicReconciliationEngine
from backend.app.domain.exceptions import DecisionStatus

def parse_iso(dt_str: str) -> datetime:
    if not dt_str:
        return None
    return datetime.fromisoformat(dt_str)

def load_synthetic_records():
    with open('data/synthetic/payments.csv') as f:
        payments = [
            PaymentRecord(
                payment_id=r['payment_id'],
                order_id=r['order_id'],
                merchant_id=r['merchant_id'],
                payment_type=r['payment_type'],
                payment_method=r['payment_method'],
                amount=Decimal(r['amount']),
                currency=r['currency'],
                status=r['status'],
                payment_timestamp=parse_iso(r['payment_timestamp']),
                captured_timestamp=parse_iso(r['captured_timestamp']),
                settlement_id=r['settlement_id'] if r['settlement_id'] else None
            )
            for r in csv.DictReader(f)
        ]

    with open('data/synthetic/settlements.csv') as f:
        settlements = [
            SettlementRecord(
                settlement_id=r['settlement_id'],
                merchant_id=r['merchant_id'],
                settlement_type=r['settlement_type'],
                gross_payment_amount=Decimal(r['gross_payment_amount']),
                refund_amount=Decimal(r['refund_amount']),
                fee_amount=Decimal(r['fee_amount']),
                tax_amount=Decimal(r['tax_amount']),
                adjustment_amount=Decimal(r['adjustment_amount']),
                net_settlement_amount=Decimal(r['net_settlement_amount']),
                currency=r['currency'],
                settlement_status=r['settlement_status'],
                settlement_timestamp=parse_iso(r['settlement_timestamp']),
                expected_settlement_timestamp=parse_iso(r['expected_settlement_timestamp'])
            )
            for r in csv.DictReader(f)
        ]

    with open('data/synthetic/bank_credits.csv') as f:
        bank_credits = [
            BankCreditRecord(
                bank_credit_id=r['bank_credit_id'],
                bank_account_id=r['bank_account_id'],
                bank_name=r['bank_name'],
                bank_reference=r['bank_reference'],
                settlement_id=r['settlement_id'] if r['settlement_id'] else None,
                credited_amount=Decimal(r['credited_amount']),
                currency=r['currency'],
                bank_credit_timestamp=parse_iso(r['bank_credit_timestamp']),
                bank_credit_status=r['bank_credit_status'],
                narration=r['narration']
            )
            for r in csv.DictReader(f)
        ]

    with open('data/synthetic/refunds.csv') as f:
        refunds = [
            RefundRecord(
                refund_id=r['refund_id'],
                payment_id=r['payment_id'],
                order_id=r['order_id'],
                refund_amount=Decimal(r['refund_amount']),
                currency=r['currency'],
                refund_status=r['refund_status'],
                refund_timestamp=parse_iso(r['refund_timestamp']),
                refund_type=r['refund_type']
            )
            for r in csv.DictReader(f)
        ]

    return payments, settlements, bank_credits, refunds

def test_reconcile_full_synthetic_batch():
    payments, settlements, bank_credits, refunds = load_synthetic_records()
    engine = DeterministicReconciliationEngine()
    
    results = engine.reconcile_batch(payments, settlements, bank_credits, refunds)
    
    assert len(results) == len(payments)
    
    auto_reconciled = [r for r in results if r.decision_status == DecisionStatus.AUTO_RECONCILED.value]
    needs_review = [r for r in results if r.decision_status == DecisionStatus.NEEDS_REVIEW.value]
    
    # Verify auto-reconciled cases have high confidence
    for r in auto_reconciled:
        assert r.confidence == 'high'
        assert r.exception_type is None
        assert r.requires_human_review is False
        assert r.settlement_discrepancy == Decimal('0.00')
        
    # Verify needs_review cases have valid exception types
    for r in needs_review:
        assert r.exception_type in [
            'missing_settlement', 'missing_bank_credit', 'amount_mismatch',
            'fee_mismatch', 'duplicate_payment', 'duplicate_bank_credit',
            'partial_refund_not_reflected', 'ambiguous_match'
        ]
        assert r.requires_human_review is True
        
    print(f"\nReconciliation Results Summary:")
    print(f"Total Transactions: {len(results)}")
    print(f"Auto-Reconciled: {len(auto_reconciled)} ({len(auto_reconciled)/len(results)*100:.1f}%)")
    print(f"Needs Review: {len(needs_review)} ({len(needs_review)/len(results)*100:.1f}%)")
