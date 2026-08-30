import csv
import io
import random
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import Dict, Any, Tuple, List

from backend.app.domain.settlement_calc import calculate_expected_settlement, quantize_money


def generate_evaluation_dataset(
    total_records: int = 60,
    seed: int = 42,
    base_time: datetime = datetime(2026, 8, 1, 10, 0, 0, tzinfo=timezone.utc),
) -> Tuple[Dict[str, str], Dict[str, Any]]:
    """
    Generates a deterministic 60-row financial evaluation dataset with known ground truth.
    
    Distribution:
      - 42 clean records (70%)
      - 18 anomalies:
          - 4 amount_mismatch
          - 4 missing_bank_credit
          - 3 partial_refund_not_reflected
          - 3 fee_mismatch
          - 2 duplicate_payment
          - 2 missing_settlement
      - 1 invalid payment row (to verify partial rejection)
    
    Returns:
      - csv_streams: Dict[str, str] mapping 'payments', 'settlements', 'refunds', 'bank_credits'
      - ground_truth_meta: Dict[str, Any] with ground-truth expected metrics and classifications.
    """
    random.seed(seed)
    
    anomaly_plan: List[str] = (
        ["amount_mismatch"] * 4
        + ["missing_bank_credit"] * 4
        + ["partial_refund_not_reflected"] * 3
        + ["fee_mismatch"] * 3
        + ["duplicate_payment"] * 2
        + ["missing_settlement"] * 2
    )
    
    # 42 clean + 18 anomalies = 60 total valid records
    record_plan: List[str] = ["clean"] * 42 + anomaly_plan
    
    # Sort or fix order deterministically
    random.shuffle(record_plan)
    
    payments: List[Dict[str, str]] = []
    settlements: List[Dict[str, str]] = []
    refunds: List[Dict[str, str]] = []
    bank_credits: List[Dict[str, str]] = []
    
    ground_truth_records: Dict[str, Dict[str, Any]] = {}
    total_reconciled_amount = Decimal("0.00")
    total_risk_amount = Decimal("0.00")
    
    exception_counts: Dict[str, int] = {
        "amount_mismatch": 0,
        "missing_bank_credit": 0,
        "partial_refund_not_reflected": 0,
        "fee_mismatch": 0,
        "duplicate_payment": 0,
        "missing_settlement": 0,
    }

    # Generate records
    for idx, category in enumerate(record_plan, start=1001):
        payment_id = f"pay_eval_{idx:04d}"
        order_id = f"ord_eval_{idx:04d}"
        settlement_id = f"set_eval_{idx:04d}"
        bank_credit_id = f"bc_eval_{idx:04d}"
        refund_id = f"ref_eval_{idx:04d}"
        bank_ref = f"UTR_EVAL_{idx:08d}"
        merchant_id = f"merch_eval_{(idx % 5) + 1:03d}"
        
        # Base payment amount
        base_int = 100 + ((idx * 37) % 4900)
        amount = quantize_money(Decimal(str(base_int)) + Decimal(".50"))
        
        fee, tax, net_settlement = calculate_expected_settlement(amount)
        
        tx_time = base_time + timedelta(minutes=idx * 10)
        set_time = tx_time + timedelta(days=1, hours=2)
        bc_time = set_time + timedelta(hours=2)
        
        p_row = {
            "payment_id": payment_id,
            "order_id": order_id,
            "merchant_id": merchant_id,
            "payment_type": "card",
            "payment_method": "upi",
            "amount": str(amount),
            "currency": "INR",
            "status": "captured",
            "payment_timestamp": tx_time.isoformat(),
            "captured_timestamp": (tx_time + timedelta(seconds=10)).isoformat(),
            "settlement_id": settlement_id,
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
            "currency": "INR",
            "settlement_status": "processed",
            "settlement_timestamp": set_time.isoformat(),
            "expected_settlement_timestamp": set_time.isoformat(),
        }
        
        bc_row = {
            "bank_credit_id": bank_credit_id,
            "bank_account_id": "ba_eval_01",
            "bank_name": "HDFC Bank",
            "bank_reference": bank_ref,
            "settlement_id": settlement_id,
            "credited_amount": str(net_settlement),
            "currency": "INR",
            "bank_credit_timestamp": bc_time.isoformat(),
            "bank_credit_status": "cleared",
            "narration": f"Payout {settlement_id}",
        }
        
        # Apply anomalies
        if category == "clean":
            payments.append(p_row)
            settlements.append(s_row)
            bank_credits.append(bc_row)
            total_reconciled_amount += amount
            ground_truth_records[payment_id] = {
                "expected_status": "auto_reconciled",
                "exception_type": None,
                "amount": amount,
            }

        elif category == "amount_mismatch":
            # Bank credit is short by 88.20 INR
            bc_row["credited_amount"] = str(quantize_money(net_settlement - Decimal("88.20")))
            payments.append(p_row)
            settlements.append(s_row)
            bank_credits.append(bc_row)
            total_risk_amount += amount
            exception_counts["amount_mismatch"] += 1
            ground_truth_records[payment_id] = {
                "expected_status": "needs_review",
                "exception_type": "amount_mismatch",
                "amount": amount,
            }

        elif category == "missing_bank_credit":
            # Omit bank credit row entirely
            payments.append(p_row)
            settlements.append(s_row)
            total_risk_amount += amount
            exception_counts["missing_bank_credit"] += 1
            ground_truth_records[payment_id] = {
                "expected_status": "needs_review",
                "exception_type": "missing_bank_credit",
                "amount": amount,
            }

        elif category == "partial_refund_not_reflected":
            # Refund exists on payment, but settlement has refund_amount = 0.00
            ref_row = {
                "refund_id": refund_id,
                "payment_id": payment_id,
                "order_id": order_id,
                "refund_amount": "50.00",
                "currency": "INR",
                "refund_status": "processed",
                "refund_timestamp": (tx_time + timedelta(hours=1)).isoformat(),
                "refund_type": "partial",
            }
            refunds.append(ref_row)
            payments.append(p_row)
            settlements.append(s_row)
            bank_credits.append(bc_row)
            total_risk_amount += amount
            exception_counts["partial_refund_not_reflected"] += 1
            ground_truth_records[payment_id] = {
                "expected_status": "needs_review",
                "exception_type": "partial_refund_not_reflected",
                "amount": amount,
            }

        elif category == "fee_mismatch":
            # Settlement has wrong fee (5% instead of 2%)
            wrong_fee = quantize_money(amount * Decimal("0.05"))
            wrong_tax = quantize_money(wrong_fee * Decimal("0.18"))
            wrong_net = quantize_money(amount - wrong_fee - wrong_tax)
            s_row["fee_amount"] = str(wrong_fee)
            s_row["tax_amount"] = str(wrong_tax)
            s_row["net_settlement_amount"] = str(wrong_net)
            bc_row["credited_amount"] = str(wrong_net)
            payments.append(p_row)
            settlements.append(s_row)
            bank_credits.append(bc_row)
            total_risk_amount += amount
            exception_counts["fee_mismatch"] += 1
            ground_truth_records[payment_id] = {
                "expected_status": "needs_review",
                "exception_type": "fee_mismatch",
                "amount": amount,
            }

        elif category == "duplicate_payment":
            # Both duplicate payments share the exact same order_id
            dup_order_id = "ord_eval_shared_dup_01"
            p_row["order_id"] = dup_order_id
            payments.append(p_row)
            settlements.append(s_row)
            bank_credits.append(bc_row)
            total_risk_amount += amount
            exception_counts["duplicate_payment"] += 1
            ground_truth_records[payment_id] = {
                "expected_status": "needs_review",
                "exception_type": "duplicate_payment",
                "amount": amount,
            }

        elif category == "missing_settlement":
            # Omit settlement record from settlements list
            payments.append(p_row)
            total_risk_amount += amount
            exception_counts["missing_settlement"] += 1
            ground_truth_records[payment_id] = {
                "expected_status": "needs_review",
                "exception_type": "missing_settlement",
                "amount": amount,
            }

    # Add 1 invalid payment row to verify partial rejection at ingestion
    p_invalid = {
        "payment_id": "pay_eval_inv",
        "order_id": "ord_eval_inv",
        "merchant_id": "merch_eval_001",
        "payment_type": "card",
        "payment_method": "upi",
        "amount": "MALFORMED_VALUE",
        "currency": "INR",
        "status": "captured",
        "payment_timestamp": base_time.isoformat(),
        "captured_timestamp": (base_time + timedelta(seconds=10)).isoformat(),
        "settlement_id": "set_eval_inv",
    }
    payments.append(p_invalid)

    # Convert records to CSV strings
    def dicts_to_csv(dicts: List[Dict[str, str]], fieldnames: List[str]) -> str:
        buf = io.StringIO()
        writer = csv.DictWriter(buf, fieldnames=fieldnames)
        writer.writeheader()
        for d in dicts:
            writer.writerow(d)
        return buf.getvalue()

    payment_fields = [
        "payment_id", "order_id", "merchant_id", "payment_type", "payment_method",
        "amount", "currency", "status", "payment_timestamp", "captured_timestamp", "settlement_id"
    ]
    settlement_fields = [
        "settlement_id", "merchant_id", "settlement_type", "gross_payment_amount",
        "refund_amount", "fee_amount", "tax_amount", "adjustment_amount",
        "net_settlement_amount", "currency", "settlement_status",
        "settlement_timestamp", "expected_settlement_timestamp"
    ]
    refund_fields = [
        "refund_id", "payment_id", "order_id", "refund_amount", "currency",
        "refund_status", "refund_timestamp", "refund_type"
    ]
    bank_credit_fields = [
        "bank_credit_id", "bank_account_id", "bank_name", "bank_reference",
        "settlement_id", "credited_amount", "currency", "bank_credit_timestamp",
        "bank_credit_status", "narration"
    ]

    csv_streams = {
        "payments": dicts_to_csv(payments, payment_fields),
        "settlements": dicts_to_csv(settlements, settlement_fields),
        "refunds": dicts_to_csv(refunds, refund_fields),
        "bank_credits": dicts_to_csv(bank_credits, bank_credit_fields),
    }

    ground_truth_meta = {
        "total_submitted": 61,
        "total_accepted": 60,
        "total_rejected": 1,
        "expected_auto_reconciled": 42,
        "expected_needs_review": 18,
        "expected_unresolved": 0,
        "expected_match_rate": 70.0,
        "expected_total_amount_reconciled_inr": str(total_reconciled_amount),
        "expected_total_amount_at_risk_inr": str(total_risk_amount),
        "expected_exception_counts": exception_counts,
        "records": ground_truth_records,
    }

    return csv_streams, ground_truth_meta
