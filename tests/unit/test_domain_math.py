import csv
from decimal import Decimal
from backend.app.domain.settlement_calc import calculate_expected_settlement, quantize_money

def test_penny_exact_settlement_calculation():
    gross = Decimal('1000.00')
    fee, tax, net = calculate_expected_settlement(gross)
    
    # 2% fee on 1000 = 20.00
    assert fee == Decimal('20.00')
    # 18% GST on 20 = 3.60
    assert tax == Decimal('3.60')
    # Net = 1000 - 20 - 3.60 = 976.40
    assert net == Decimal('976.40')
    # Invariant: gross == net + fee + tax
    assert gross == net + fee + tax

def test_odd_amount_rounding():
    gross = Decimal('149.99')
    fee, tax, net = calculate_expected_settlement(gross)
    
    # 149.99 * 0.02 = 2.9998 -> 3.00
    assert fee == Decimal('3.00')
    # 3.00 * 0.18 = 0.54
    assert tax == Decimal('0.54')
    # Net = 149.99 - 3.00 - 0.54 = 146.45
    assert net == Decimal('146.45')
    assert gross == net + fee + tax

def test_synthetic_data_integrity():
    with open('data/synthetic/ground_truth.csv', 'r', encoding='utf-8') as f:
        reader = list(csv.DictReader(f))
    
    assert len(reader) == 500
    
    clean_cases = [r for r in reader if r['expected_status'] == 'auto_reconciled']
    assert len(clean_cases) == 350
    
    exception_cases = [r for r in reader if r['expected_status'] == 'needs_review']
    assert len(exception_cases) == 150
    
    exceptions_found = set(r['exception_type'] for r in exception_cases if r['exception_type'])
    expected_exceptions = {
        'missing_settlement', 'missing_bank_credit', 'amount_mismatch',
        'fee_mismatch', 'duplicate_payment', 'duplicate_bank_credit',
        'partial_refund_not_reflected', 'ambiguous_match'
    }
    assert exceptions_found == expected_exceptions
