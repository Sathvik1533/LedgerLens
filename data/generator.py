import csv
import os
import random
from datetime import datetime, timedelta, timezone
from decimal import Decimal, ROUND_HALF_UP

def quantize_money(val: Decimal) -> Decimal:
    return val.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

def generate_synthetic_dataset(total_records: int = 500, seed: int = 42, output_dir: str = "data/synthetic"):
    random.seed(seed)
    os.makedirs(output_dir, exist_ok=True)

    base_time = datetime(2026, 8, 1, 10, 0, 0, tzinfo=timezone.utc)
    
    payments = []
    settlements = []
    bank_credits = []
    refunds = []
    ground_truth = []

    # Distribution: ~70% clean (350), ~30% anomalies (150)
    clean_count = int(total_records * 0.70)
    anomaly_count = total_records - clean_count
    
    exception_types = [
        'missing_settlement',
        'missing_bank_credit',
        'amount_mismatch',
        'fee_mismatch',
        'duplicate_payment',
        'duplicate_bank_credit',
        'partial_refund_not_reflected',
        'ambiguous_match'
    ]

    record_plan = ['clean'] * clean_count
    for i in range(anomaly_count):
        record_plan.append(exception_types[i % len(exception_types)])
    
    random.shuffle(record_plan)

    for idx, anomaly in enumerate(record_plan, start=1001):
        case_id = f"CASE-{idx}"
        payment_id = f"pay_{idx:06d}"
        order_id = f"order_{idx:06d}"
        settlement_id = f"set_{idx:06d}"
        bank_credit_id = f"bc_{idx:06d}"
        bank_ref = f"UTR{idx:08d}"
        refund_id = f"rfnd_{idx:06d}"
        
        # Base payment amount between ₹100.00 and ₹10,000.00
        amount = quantize_money(Decimal(str(random.randint(100, 10000))) + Decimal(str(random.choice([0, 25, 50, 75, 99]))) / Decimal('100'))
        currency = "INR"
        merchant_id = f"merch_{random.randint(1, 10):03d}"
        
        # Standard fee: 2% + 18% GST on fee
        fee_rate = Decimal('0.02')
        tax_rate = Decimal('0.18')
        fee = quantize_money(amount * fee_rate)
        tax = quantize_money(fee * tax_rate)
        net_settlement = quantize_money(amount - fee - tax)
        
        tx_time = base_time + timedelta(minutes=idx * 5)
        set_time = tx_time + timedelta(days=2, hours=4)
        bc_time = set_time + timedelta(hours=2)
        
        has_refund = False
        refund_amount = Decimal('0.00')

        # Baseline Clean Records
        p_row = {
            "payment_id": payment_id,
            "order_id": order_id,
            "merchant_id": merchant_id,
            "payment_type": "card",
            "payment_method": random.choice(["upi", "credit_card", "debit_card", "netbanking"]),
            "amount": str(amount),
            "currency": currency,
            "status": "captured",
            "payment_timestamp": tx_time.isoformat(),
            "captured_timestamp": (tx_time + timedelta(seconds=15)).isoformat(),
            "settlement_id": settlement_id
        }
        
        s_row = {
            "settlement_id": settlement_id,
            "merchant_id": merchant_id,
            "settlement_type": "standard",
            "gross_payment_amount": str(amount),
            "refund_amount": "0.00",
            "fee_amount": str(fee),
            "tax_amount": str(tax),
            "adjustment_amount": "0.00",
            "net_settlement_amount": str(net_settlement),
            "currency": currency,
            "settlement_status": "processed",
            "settlement_timestamp": set_time.isoformat(),
            "expected_settlement_timestamp": set_time.isoformat()
        }
        
        bc_row = {
            "bank_credit_id": bank_credit_id,
            "bank_account_id": "ba_0987654321",
            "bank_name": "HDFC Bank",
            "bank_reference": bank_ref,
            "settlement_id": settlement_id,
            "credited_amount": str(net_settlement),
            "currency": currency,
            "bank_credit_timestamp": bc_time.isoformat(),
            "bank_credit_status": "cleared",
            "narration": f"ACH CR RAZORPAY SETTLEMENT {settlement_id}"
        }

        # Anomaly Injection Logic
        if anomaly == 'clean':
            gt_status = "auto_reconciled"
            gt_exception = ""
            gt_reason = "matched"
            gt_review = "False"

        elif anomaly == 'missing_settlement':
            p_row["settlement_id"] = ""
            s_row = None
            bc_row = None
            gt_status = "needs_review"
            gt_exception = "missing_settlement"
            gt_reason = "no_candidate_found"
            gt_review = "True"

        elif anomaly == 'missing_bank_credit':
            bc_row = None
            gt_status = "needs_review"
            gt_exception = "missing_bank_credit"
            gt_reason = "no_candidate_found"
            gt_review = "True"

        elif anomaly == 'amount_mismatch':
            # Bank credit is ₹50 short
            mismatched_amount = quantize_money(net_settlement - Decimal('50.00'))
            bc_row["credited_amount"] = str(mismatched_amount)
            gt_status = "needs_review"
            gt_exception = "amount_mismatch"
            gt_reason = "no_candidate_found"
            gt_review = "True"

        elif anomaly == 'fee_mismatch':
            # Gateway charged 3.5% instead of 2%
            bad_fee = quantize_money(amount * Decimal('0.035'))
            bad_tax = quantize_money(bad_fee * Decimal('0.18'))
            bad_net = quantize_money(amount - bad_fee - bad_tax)
            s_row["fee_amount"] = str(bad_fee)
            s_row["tax_amount"] = str(bad_tax)
            s_row["net_settlement_amount"] = str(bad_net)
            bc_row["credited_amount"] = str(bad_net)
            gt_status = "needs_review"
            gt_exception = "fee_mismatch"
            gt_reason = "no_candidate_found"
            gt_review = "True"

        elif anomaly == 'duplicate_payment':
            # Add an extra duplicate payment with same order_id
            payments.append(p_row)
            p_row_dup = dict(p_row)
            p_row_dup["payment_id"] = f"pay_{idx:06d}_dup"
            p_row_dup["payment_timestamp"] = (tx_time + timedelta(seconds=2)).isoformat()
            payments.append(p_row_dup)
            gt_status = "needs_review"
            gt_exception = "duplicate_payment"
            gt_reason = "multiple_candidates"
            gt_review = "True"

        elif anomaly == 'duplicate_bank_credit':
            # Add an extra duplicate bank credit with same bank_reference
            bank_credits.append(bc_row)
            bc_row_dup = dict(bc_row)
            bc_row_dup["bank_credit_id"] = f"bc_{idx:06d}_dup"
            bc_row_dup["bank_credit_timestamp"] = (bc_time + timedelta(minutes=5)).isoformat()
            bank_credits.append(bc_row_dup)
            gt_status = "needs_review"
            gt_exception = "duplicate_bank_credit"
            gt_reason = "multiple_candidates"
            gt_review = "True"

        elif anomaly == 'partial_refund_not_reflected':
            has_refund = True
            refund_amount = quantize_money(amount * Decimal('0.50'))
            r_row = {
                "refund_id": refund_id,
                "payment_id": payment_id,
                "order_id": order_id,
                "refund_amount": str(refund_amount),
                "currency": currency,
                "refund_status": "processed",
                "refund_timestamp": (tx_time + timedelta(hours=6)).isoformat(),
                "refund_type": "partial"
            }
            refunds.append(r_row)
            # Settlement incorrectly omitted the refund deduction
            gt_status = "needs_review"
            gt_exception = "partial_refund_not_reflected"
            gt_reason = "no_candidate_found"
            gt_review = "True"

        elif anomaly == 'ambiguous_match':
            # Create two competing bank credits with identical amounts
            bc_row_alt = dict(bc_row)
            bc_row_alt["bank_credit_id"] = f"bc_{idx:06d}_alt"
            bc_row_alt["bank_reference"] = f"UTR{idx:08d}B"
            bank_credits.append(bc_row_alt)
            gt_status = "needs_review"
            gt_exception = "ambiguous_match"
            gt_reason = "multiple_candidates"
            gt_review = "True"

        if anomaly != 'duplicate_payment':
            payments.append(p_row)
        if s_row:
            settlements.append(s_row)
        if bc_row and anomaly not in ('duplicate_bank_credit', 'ambiguous_match'):
            bank_credits.append(bc_row)

        ground_truth.append({
            "case_id": case_id,
            "true_payment_id": payment_id,
            "true_settlement_id": settlement_id if s_row else "",
            "expected_status": gt_status,
            "exception_type": gt_exception,
            "expected_resolution_reason": gt_reason,
            "expected_net_amount": str(net_settlement),
            "expected_settlement_date": set_time.strftime("%Y-%m-%d"),
            "requires_human_review": gt_review,
            "injection_type": "clean" if anomaly == 'clean' else "injected_exception"
        })

    # Write CSV files
    def write_csv(filename, data, fieldnames):
        filepath = os.path.join(output_dir, filename)
        with open(filepath, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(data)
        print(f"Generated {len(data)} records -> {filepath}")

    write_csv("payments.csv", payments, [
        "payment_id", "order_id", "merchant_id", "payment_type", "payment_method",
        "amount", "currency", "status", "payment_timestamp", "captured_timestamp", "settlement_id"
    ])
    
    write_csv("settlements.csv", settlements, [
        "settlement_id", "merchant_id", "settlement_type", "gross_payment_amount",
        "refund_amount", "fee_amount", "tax_amount", "adjustment_amount",
        "net_settlement_amount", "currency", "settlement_status",
        "settlement_timestamp", "expected_settlement_timestamp"
    ])
    
    write_csv("bank_credits.csv", bank_credits, [
        "bank_credit_id", "bank_account_id", "bank_name", "bank_reference",
        "settlement_id", "credited_amount", "currency", "bank_credit_timestamp",
        "bank_credit_status", "narration"
    ])
    
    write_csv("refunds.csv", refunds, [
        "refund_id", "payment_id", "order_id", "refund_amount", "currency",
        "refund_status", "refund_timestamp", "refund_type"
    ])
    
    write_csv("ground_truth.csv", ground_truth, [
        "case_id", "true_payment_id", "true_settlement_id", "expected_status",
        "exception_type", "expected_resolution_reason", "expected_net_amount",
        "expected_settlement_date", "requires_human_review", "injection_type"
    ])

if __name__ == "__main__":
    generate_synthetic_dataset(500, seed=42)
