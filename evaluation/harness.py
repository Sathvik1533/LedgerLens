#!/usr/bin/env python3
"""
Gate 3: Evaluation Harness
==========================
Compares the DeterministicReconciliationEngine output against the
ground_truth.csv produced by data/generator.py.

Usage:
    python evaluation/harness.py                    # defaults to data/synthetic/
    python evaluation/harness.py --data-dir path/   # custom path
    python evaluation/harness.py --json             # output raw JSON (CI mode)

Contract:
  - Reads: payments.csv, settlements.csv, refunds.csv, bank_credits.csv
  - Reads: ground_truth.csv (hidden from engine — never passed in)
  - Runs:  DeterministicReconciliationEngine.reconcile_batch(...)
  - Computes:
        match_rate, precision, recall_per_class, F1, throughput, confusion_matrix
  - Preserves TECHNICAL INVARIANTS:
        AI does NOT touch arithmetic, AI does NOT approve, zero false approvals.
"""

import csv
import json
import time
import argparse
from collections import defaultdict
from decimal import Decimal
from datetime import datetime, timezone
from typing import List, Dict, Tuple, Optional
from pathlib import Path

import sys
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.app.schemas.domain import (
    PaymentRecord, SettlementRecord, RefundRecord, BankCreditRecord,
    ReconciliationCaseResult
)
from backend.app.domain.matcher import DeterministicReconciliationEngine


# ─── CSV Loaders ────────────────────────────────────────────────────────────────

def load_payments(path: str) -> List[PaymentRecord]:
    records = []
    with open(path, newline='', encoding='utf-8-sig') as f:
        for row in csv.DictReader(f):
            row = {k.strip(): v.strip() for k, v in row.items()}
            if not row.get('captured_timestamp'):
                row['captured_timestamp'] = None
            if not row.get('settlement_id'):
                row['settlement_id'] = None
            records.append(PaymentRecord(**row))
    return records


def load_settlements(path: str) -> List[SettlementRecord]:
    records = []
    with open(path, newline='', encoding='utf-8-sig') as f:
        for row in csv.DictReader(f):
            row = {k.strip(): v.strip() for k, v in row.items()}
            if not row.get('expected_settlement_timestamp'):
                row['expected_settlement_timestamp'] = None
            records.append(SettlementRecord(**row))
    return records


def load_refunds(path: str) -> List[RefundRecord]:
    records = []
    with open(path, newline='', encoding='utf-8-sig') as f:
        for row in csv.DictReader(f):
            row = {k.strip(): v.strip() for k, v in row.items()}
            records.append(RefundRecord(**row))
    return records


def load_bank_credits(path: str) -> List[BankCreditRecord]:
    records = []
    with open(path, newline='', encoding='utf-8-sig') as f:
        for row in csv.DictReader(f):
            row = {k.strip(): v.strip() for k, v in row.items()}
            if not row.get('settlement_id'):
                row['settlement_id'] = None
            if not row.get('narration'):
                row['narration'] = None
            records.append(BankCreditRecord(**row))
    return records


def load_ground_truth(path: str) -> Dict[str, Dict]:
    """Returns dict keyed by true_payment_id -> ground truth row."""
    gt = {}
    with open(path, newline='', encoding='utf-8-sig') as f:
        for row in csv.DictReader(f):
            gt[row['true_payment_id'].strip()] = {
                'case_id': row['case_id'].strip(),
                'true_settlement_id': row['true_settlement_id'].strip(),
                'expected_status': row['expected_status'].strip(),
                'exception_type': row['exception_type'].strip(),
                'expected_resolution_reason': row['expected_resolution_reason'].strip(),
                'injection_type': row['injection_type'].strip(),
            }
    return gt


# ─── Evaluation Core ────────────────────────────────────────────────────────────

EXCEPTION_CLASSES = [
    'missing_settlement',
    'missing_bank_credit',
    'amount_mismatch',
    'fee_mismatch',
    'duplicate_payment',
    'duplicate_bank_credit',
    'partial_refund_not_reflected',
    'ambiguous_match',
]


def evaluate(
    results: List[ReconciliationCaseResult],
    ground_truth: Dict[str, Dict],
    elapsed_seconds: float,
    total_input_records: int,
) -> Dict:
    # ── Build result index by payment_id ──────────────────────────────────────
    result_by_pid: Dict[str, ReconciliationCaseResult] = {r.payment_id: r for r in results}

    # ── Match-Rate ────────────────────────────────────────────────────────────
    total = len(results)
    auto_reconciled = sum(1 for r in results if r.decision_status == 'auto_reconciled')
    needs_review = sum(1 for r in results if r.decision_status == 'needs_review')
    unresolved = sum(1 for r in results if r.decision_status not in ('auto_reconciled', 'needs_review'))
    match_rate = (auto_reconciled / total * 100) if total > 0 else 0.0

    # ── Precision on auto-reconciled (zero false-approval invariant) ──────────
    # A false positive = engine said auto_reconciled but ground truth = needs_review
    tp_auto = 0   # correctly auto-reconciled
    fp_auto = 0   # false approvals (the critical invariant)
    fn_auto = 0   # payments ground truth says clean but engine flagged

    for pid, res in result_by_pid.items():
        gt = ground_truth.get(pid)
        if gt is None:
            continue
        predicted_clean = (res.decision_status == 'auto_reconciled')
        actually_clean = (gt['expected_status'] == 'auto_reconciled')

        if predicted_clean and actually_clean:
            tp_auto += 1
        elif predicted_clean and not actually_clean:
            fp_auto += 1    # FALSE APPROVAL — the most dangerous failure
        elif not predicted_clean and actually_clean:
            fn_auto += 1

    precision_auto = (tp_auto / (tp_auto + fp_auto)) if (tp_auto + fp_auto) > 0 else 1.0
    recall_auto = (tp_auto / (tp_auto + fn_auto)) if (tp_auto + fn_auto) > 0 else 0.0

    # ── Per-Class Recall on exception types ──────────────────────────────────
    class_counts: Dict[str, Dict[str, int]] = defaultdict(lambda: {'tp': 0, 'fn': 0, 'fp': 0})
    confusion_matrix: Dict[str, Dict[str, int]] = defaultdict(lambda: defaultdict(int))

    for pid, res in result_by_pid.items():
        gt = ground_truth.get(pid)
        if gt is None:
            continue
        gt_exc = gt['exception_type'] if gt['exception_type'] else 'clean'
        pred_exc = res.exception_type if res.exception_type else 'clean'
        confusion_matrix[gt_exc][pred_exc] += 1

        if gt_exc != 'clean':
            if pred_exc == gt_exc:
                class_counts[gt_exc]['tp'] += 1
            else:
                class_counts[gt_exc]['fn'] += 1
                if pred_exc != 'clean':
                    class_counts[pred_exc]['fp'] += 1

    recall_per_class: Dict[str, float] = {}
    for exc in EXCEPTION_CLASSES:
        counts = class_counts[exc]
        tp, fn = counts['tp'], counts['fn']
        recall_per_class[exc] = round((tp / (tp + fn)) * 100, 2) if (tp + fn) > 0 else 0.0

    # ── Throughput ────────────────────────────────────────────────────────────
    throughput_rps = round(total / elapsed_seconds, 2) if elapsed_seconds > 0 else 0.0

    # ── Honest Unresolved Exceptions ─────────────────────────────────────────
    unresolved_list = []
    for pid, res in result_by_pid.items():
        gt = ground_truth.get(pid)
        if gt and gt['expected_status'] == 'needs_review' and res.decision_status != 'needs_review':
            unresolved_list.append({
                'payment_id': pid,
                'predicted_status': res.decision_status,
                'ground_truth_status': gt['expected_status'],
                'ground_truth_exception': gt['exception_type'],
                'predicted_exception': res.exception_type,
            })

    # ── Amount at Risk ────────────────────────────────────────────────────────
    amount_at_risk = sum(r.payment_amount for r in results if r.decision_status == 'needs_review')

    return {
        'summary': {
            'total_records': total,
            'auto_reconciled': auto_reconciled,
            'needs_review': needs_review,
            'unresolved': unresolved,
            'match_rate_pct': round(match_rate, 2),
            'precision_auto_reconcile': round(precision_auto * 100, 2),
            'recall_auto_reconcile': round(recall_auto * 100, 2),
            'false_approvals': fp_auto,     # MUST be 0 — technical invariant
            'throughput_records_per_sec': throughput_rps,
            'elapsed_seconds': round(elapsed_seconds, 4),
            'amount_at_risk_inr': str(amount_at_risk),
        },
        'recall_per_exception_class': recall_per_class,
        'confusion_matrix': {k: dict(v) for k, v in confusion_matrix.items()},
        'unresolved_exceptions_sample': unresolved_list[:10],
        'zero_false_approval_invariant': 'PASSED' if fp_auto == 0 else f'FAILED — {fp_auto} false approval(s)',
    }


# ─── CLI Reporting ──────────────────────────────────────────────────────────────

def print_report(report: Dict) -> None:
    s = report['summary']
    sep = "═" * 58

    print(f"\n{sep}")
    print(f"  RAZORPAY AI FINANCE CONTROLLER — GATE 3 EVALUATION")
    print(f"{sep}")
    print(f"  Total Records Processed : {s['total_records']}")
    print(f"  Auto-Reconciled         : {s['auto_reconciled']}")
    print(f"  Needs Review            : {s['needs_review']}")
    print(f"  Unresolved              : {s['unresolved']}")
    print(f"  Match Rate              : {s['match_rate_pct']}%")
    print(f"  Throughput              : {s['throughput_records_per_sec']} records/sec")
    print(f"  Elapsed                 : {s['elapsed_seconds']}s")
    print(f"  Amount at Risk (₹)     : ₹{s['amount_at_risk_inr']}")
    print(f"{sep}")
    print(f"  PRECISION (auto-reconciled) : {s['precision_auto_reconcile']}%")
    print(f"  RECALL    (auto-reconciled) : {s['recall_auto_reconcile']}%")
    print(f"  FALSE APPROVALS         : {s['false_approvals']}")
    print(f"  INVARIANT CHECK         : {report['zero_false_approval_invariant']}")
    print(f"{sep}")
    print(f"\n  RECALL PER EXCEPTION CLASS")
    print(f"  {'Exception Type':<42} {'Recall':>7}")
    print(f"  {'─'*42} {'─'*7}")
    for exc, recall in report['recall_per_exception_class'].items():
        print(f"  {exc:<42} {recall:>6.1f}%")

    print(f"\n  CONFUSION MATRIX (Ground Truth rows x Predicted cols)")
    matrix = report['confusion_matrix']
    all_labels = sorted(set(list(matrix.keys()) + [k2 for v in matrix.values() for k2 in v.keys()]))
    header_label = "GT \\ PRED"
    header = f"{header_label:<34}" + "".join(f"{l[:8]:>10}" for l in all_labels)
    print(f"  {header}")

    for gt_label in all_labels:
        row_str = f"  {gt_label:<34}"
        for pred_label in all_labels:
            cnt = matrix.get(gt_label, {}).get(pred_label, 0)
            row_str += f"{cnt:>10}"
        print(row_str)

    if report['unresolved_exceptions_sample']:
        print(f"\n  UNRESOLVED EXCEPTIONS (first {len(report['unresolved_exceptions_sample'])})")
        for item in report['unresolved_exceptions_sample']:
            print(f"    {item['payment_id']} | GT: {item['ground_truth_exception']} | PRED: {item['predicted_exception']}")
    else:
        print(f"\n  ✅ No unresolved exceptions — all anomalies correctly flagged for review.")

    print(f"\n{sep}\n")


# ─── Main ───────────────────────────────────────────────────────────────────────

def run_harness(data_dir: str = "data/synthetic", json_mode: bool = False) -> Dict:
    base = Path(data_dir)

    # Load 4 data sources (engine input)
    payments = load_payments(str(base / "payments.csv"))
    settlements = load_settlements(str(base / "settlements.csv"))
    refunds = load_refunds(str(base / "refunds.csv"))
    bank_credits = load_bank_credits(str(base / "bank_credits.csv"))

    # Load ground truth separately — never passed to engine
    ground_truth = load_ground_truth(str(base / "ground_truth.csv"))

    # Run engine with wall-clock timer
    engine = DeterministicReconciliationEngine()
    t0 = time.perf_counter()
    results = engine.reconcile_batch(
        payments=payments,
        settlements=settlements,
        bank_credits=bank_credits,
        refunds=refunds,
    )
    elapsed = time.perf_counter() - t0

    # Evaluate against ground truth
    report = evaluate(
        results=results,
        ground_truth=ground_truth,
        elapsed_seconds=elapsed,
        total_input_records=len(payments),
    )

    if json_mode:
        print(json.dumps(report, indent=2, default=str))
    else:
        print_report(report)

    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Gate 3: Reconciliation Evaluation Harness")
    parser.add_argument("--data-dir", default="data/synthetic", help="Path to synthetic data directory")
    parser.add_argument("--json", action="store_true", help="Output raw JSON (CI mode)")
    args = parser.parse_args()
    report = run_harness(data_dir=args.data_dir, json_mode=args.json)

    # Exit non-zero if the zero-false-approval invariant fails — CI gate
    import sys
    if report['summary']['false_approvals'] != 0:
        sys.exit(1)
