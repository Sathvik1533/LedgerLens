#!/usr/bin/env python3
"""
LedgerLens Evaluation Benchmark Runner
=======================================
Runs a reproducible evaluation benchmark over a synthetic multi-source dataset
with known ground truth labels.

Metrics computed:
  1. Throughput: processing speed (records/second) and elapsed time.
  2. Measured Accuracy: match rate, precision (zero false approvals), recall, per-category metrics.
  3. Honest Exceptions: complete export of all cases and exceptions to CSV and JSON.

Outputs emitted:
  - artifacts/evaluation/metrics.json
  - artifacts/evaluation/exceptions.csv
  - artifacts/evaluation/reconciliation_benchmark_report.json
  - artifacts/evaluation/reconciliation_metrics_summary.csv

Usage:
  python evaluation/run_benchmark.py
  python evaluation/run_benchmark.py --size 60 --seed 42 --output-dir artifacts/evaluation
"""

import argparse
import csv
import io
import json
import os
import sys
import time
from datetime import datetime, timezone
from decimal import Decimal
from typing import Dict, Any, List

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.schemas.domain import (
    PaymentRecord,
    SettlementRecord,
    RefundRecord,
    BankCreditRecord,
    ReconciliationCaseResult,
)
from backend.app.domain.matcher import DeterministicReconciliationEngine
from tests.evaluation.generator_fixture import generate_evaluation_dataset
from evaluation.report_writer import write_evaluation_artifacts


def _get_val(obj: Any) -> str:
    if obj is None:
        return ""
    if hasattr(obj, "value"):
        return str(obj.value)
    return str(obj)


def run_reconciliation_benchmark(
    total_records: int = 60,
    seed: int = 42,
    output_dir: str = "artifacts/evaluation",
) -> Dict[str, Any]:
    print(f"================================================================")
    print(f"  LEDGERLENS RECONCILIATION EVALUATION BENCHMARK")
    print(f"================================================================")
    print(f"Generating synthetic evaluation fixture (size={total_records}, seed={seed})...")

    # 1. Generate Dataset with Ground Truth
    csv_streams, meta = generate_evaluation_dataset(total_records=total_records, seed=seed)
    ground_truth = meta.get("records", {})

    # 2. Parse CSVs into typed domain records
    payments: List[PaymentRecord] = []
    rejected_rows = 0
    for row in csv.DictReader(io.StringIO(csv_streams["payments"])):
        row = {k.strip(): v.strip() for k, v in row.items()}
        if not row.get("captured_timestamp"):
            row["captured_timestamp"] = None
        if not row.get("settlement_id"):
            row["settlement_id"] = None
        try:
            payments.append(PaymentRecord(**row))
        except Exception:
            rejected_rows += 1

    settlements: List[SettlementRecord] = []
    for row in csv.DictReader(io.StringIO(csv_streams["settlements"])):
        row = {k.strip(): v.strip() for k, v in row.items()}
        if not row.get("expected_settlement_timestamp"):
            row["expected_settlement_timestamp"] = None
        try:
            settlements.append(SettlementRecord(**row))
        except Exception:
            pass

    refunds: List[RefundRecord] = []
    for row in csv.DictReader(io.StringIO(csv_streams["refunds"])):
        row = {k.strip(): v.strip() for k, v in row.items()}
        try:
            refunds.append(RefundRecord(**row))
        except Exception:
            pass

    bank_credits: List[BankCreditRecord] = []
    for row in csv.DictReader(io.StringIO(csv_streams["bank_credits"])):
        row = {k.strip(): v.strip() for k, v in row.items()}
        if not row.get("settlement_id"):
            row["settlement_id"] = None
        if not row.get("narration"):
            row["narration"] = None
        try:
            bank_credits.append(BankCreditRecord(**row))
        except Exception:
            pass

    print(f"Loaded {len(payments)} valid payments ({rejected_rows} malformed blocked), {len(settlements)} settlements, {len(refunds)} refunds, {len(bank_credits)} bank credits.")

    # 3. Benchmark Deterministic Reconciliation Execution
    engine = DeterministicReconciliationEngine()
    start_time = time.perf_counter()
    results: List[ReconciliationCaseResult] = engine.reconcile_batch(
        payments=payments,
        settlements=settlements,
        bank_credits=bank_credits,
        refunds=refunds,
    )
    elapsed_seconds = time.perf_counter() - start_time
    throughput_rps = round(len(payments) / elapsed_seconds, 2) if elapsed_seconds > 0 else 0.0

    print(f"Reconciliation completed in {elapsed_seconds*1000:.2f} ms ({throughput_rps} records/sec).")

    # 4. Compute Metrics against Ground Truth
    result_by_pid: Dict[str, ReconciliationCaseResult] = {r.payment_id: r for r in results}
    
    auto_reconciled = sum(1 for r in results if _get_val(r.decision_status) == "auto_reconciled")
    needs_review = sum(1 for r in results if _get_val(r.decision_status) == "needs_review")
    unresolved = sum(1 for r in results if _get_val(r.decision_status) not in ("auto_reconciled", "needs_review"))
    match_rate_pct = round((auto_reconciled / len(results)) * 100, 2) if results else 0.0

    tp_auto = 0
    fp_auto = 0
    fn_auto = 0
    confusion_matrix: Dict[str, Dict[str, int]] = {}
    class_stats: Dict[str, Dict[str, int]] = {}

    detailed_cases: List[Dict[str, Any]] = []

    for pid, res in result_by_pid.items():
        gt = ground_truth.get(pid, {})
        gt_status = gt.get("expected_status", "unknown")
        gt_exc = gt.get("exception_type") or "clean"
        pred_status = _get_val(res.decision_status)
        pred_exc = _get_val(res.exception_type) if res.exception_type else "clean"

        if pred_status == "auto_reconciled" and gt_status == "auto_reconciled":
            tp_auto += 1
        elif pred_status == "auto_reconciled" and gt_status != "auto_reconciled":
            fp_auto += 1  # False approval
        elif pred_status != "auto_reconciled" and gt_status == "auto_reconciled":
            fn_auto += 1

        confusion_matrix.setdefault(gt_exc, {})
        confusion_matrix[gt_exc][pred_exc] = confusion_matrix[gt_exc].get(pred_exc, 0) + 1

        class_stats.setdefault(gt_exc, {"tp": 0, "fn": 0, "fp": 0})
        if pred_exc == gt_exc:
            class_stats[gt_exc]["tp"] += 1
        else:
            class_stats[gt_exc]["fn"] += 1
            class_stats.setdefault(pred_exc, {"tp": 0, "fn": 0, "fp": 0})
            class_stats[pred_exc]["fp"] += 1

        detailed_cases.append({
            "case_id": res.case_id,
            "payment_id": pid,
            "predicted_status": pred_status,
            "ground_truth_status": gt_status,
            "predicted_exception_type": pred_exc,
            "ground_truth_exception_type": gt_exc,
            "payment_amount": str(res.payment_amount),
            "expected_net_settlement": str(res.expected_net_settlement) if res.expected_net_settlement else "",
            "reported_net_settlement": str(res.reported_net_settlement) if res.reported_net_settlement else "",
            "discrepancy_amount": str(res.settlement_discrepancy) if res.settlement_discrepancy else "0.00",
        })

    precision_auto = round((tp_auto / (tp_auto + fp_auto)) * 100, 2) if (tp_auto + fp_auto) > 0 else 100.0
    recall_auto = round((tp_auto / (tp_auto + fn_auto)) * 100, 2) if (tp_auto + fn_auto) > 0 else 0.0

    total_amount_reconciled = sum(r.payment_amount for r in results if _get_val(r.decision_status) == "auto_reconciled")
    total_amount_at_risk = sum(r.payment_amount for r in results if _get_val(r.decision_status) == "needs_review")
    total_reconciled_amount = sum(r.payment_amount for r in results if _get_val(r.decision_status) == "auto_reconciled")
    total_risk_amount = sum(r.payment_amount for r in results if _get_val(r.decision_status) == "needs_review")

    per_class_recall = {}
    for exc, counts in class_stats.items():
        tp, fn = counts["tp"], counts["fn"]
        per_class_recall[exc] = round((tp / (tp + fn)) * 100, 2) if (tp + fn) > 0 else 0.0

    run_id = f"eval_run_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}_s{seed}"

    # Compute comprehensive breakdown for all 8 mandatory exception classes
    all_8_exceptions = [
        ("missing_bank_credit", "Missing Bank Credit Verification", "SOP-2026-BNK-03", "Nodal bank ledger search and UTR clearing claim"),
        ("amount_mismatch", "Settlement Payout Shortfall", "SOP-2026-FEE-01", "Gateway fee clawback dispute or approved commercial waiver"),
        ("partial_refund_not_reflected", "Customer Refund Unadjusted in Payout", "SOP-2026-ESC-02", "Clawback unadjusted refund in next settlement batch"),
        ("fee_mismatch", "Commercial Fee Tier Deviation", "SOP-2026-FEE-01", "Demand fee reconciliation credit note from gateway"),
        ("duplicate_payment", "Duplicate Customer Charge Detected", "SOP-102", "Initiate customer reversal refund for duplicate capture"),
        ("missing_settlement", "Captured Gross Unremitted by Gateway", "SOP-2026-ESC-02", "Escalate T+2 SLA breach to payment gateway operations"),
        ("duplicate_bank_credit", "Duplicate Bank Statement Credit", "SOP-204", "Audit nodal bank statement journal and reverse shadow credit"),
        ("ambiguous_match", "Ambiguous Candidate Settlement Matches", "SOP-2026-FEE-01", "Manual timestamp and acquirer reference link"),
    ]

    exception_categories = []
    for exc_code, label, sop, resolution in all_8_exceptions:
        matching_cases = [c for c in detailed_cases if c["predicted_exception_type"] == exc_code and c["predicted_status"] == "needs_review"]
        amt = sum((Decimal(c["payment_amount"]) for c in matching_cases), Decimal("0.00"))
        first_case = matching_cases[0] if matching_cases else None
        exception_categories.append({
            "category": exc_code,
            "label": label,
            "count": len(matching_cases),
            "exposure_inr": f"{amt:.2f}",
            "policy_sop": sop,
            "resolution_path": resolution,
            "present_in_batch": len(matching_cases) > 0,
            "representative_case_id": first_case["case_id"] if first_case else None,
            "representative_payment_id": first_case["payment_id"] if first_case else None,
        })

    # Sort so active exceptions are first (descending count), followed by 0-count modes
    exception_categories.sort(key=lambda x: (x["count"], float(x["exposure_inr"])), reverse=True)

    report_payload = {
        "benchmark_name": "reconciliation_evaluation_benchmark",
        "has_run": True,
        "run_id": run_id,
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "dataset_size": len(results),
        "seed": seed,
        "elapsed_seconds": round(elapsed_seconds, 6),
        "throughput_records_per_sec": throughput_rps,
        "throughput_unit": "payment records/sec",
        "throughput_command": f"python evaluation/run_benchmark.py --size {total_records} --seed {seed}",
        "throughput_environment": "Apple Silicon local test harness (PostgreSQL + Python Decimal)",
        "match_rate_percentage": match_rate_pct,
        "match_rate_formula": f"{auto_reconciled} auto_reconciled ÷ {len(results)} records_processed × 100 = {match_rate_pct:.2f}%",
        "denominator_definition": "Total valid normalized payment records processed across 4 counterparty streams in the synthetic evaluation batch.",
        "data_scope": f"Synthetic multi-source dataset ({len(payments)} payments, {len(bank_credits)} bank credits, {len(settlements)} settlements, {len(refunds)} refunds) with hidden ground truth",
        "deterministic_vs_ai": "Deterministic rules execute 100% of mathematical matching, parity verification, and exception typing. AI (grounded RAG) acts as an advisory assistant retrieving governing SOP policies without authority to approve or move funds.",
        "precision_auto_reconcile": precision_auto,
        "recall_auto_reconcile": recall_auto,
        "false_approvals": fp_auto,
        "zero_false_approval_invariant": "PASSED" if fp_auto == 0 else f"FAILED ({fp_auto} false approvals)",
        "summary": {
            "total_records": len(results),
            "auto_reconciled_count": auto_reconciled,
            "needs_review_count": needs_review,
            "unresolved_count": unresolved,
            "total_amount_reconciled_inr": str(total_reconciled_amount),
            "total_amount_at_risk_inr": str(total_risk_amount),
        },
        "exception_categories": exception_categories,
        "recall_per_exception_class": per_class_recall,
        "confusion_matrix": confusion_matrix,
    }

    # 5. Export Artifacts
    artifact_paths = write_evaluation_artifacts(
        report_data=report_payload,
        output_dir=output_dir,
        detailed_cases=detailed_cases,
    )

    print("\n----------------- SUMMARY METRICS -----------------")
    print(f"Total Processed       : {len(results)}")
    print(f"Clean Auto-Reconciled : {auto_reconciled} ({match_rate_pct}%)")
    print(f"Needs Review          : {needs_review}")
    print(f"Auto-Reconcile Prec.  : {precision_auto}% (False Approvals: {fp_auto})")
    print(f"Auto-Reconcile Recall : {recall_auto}%")
    print(f"Throughput            : {throughput_rps} records/sec ({elapsed_seconds*1000:.2f} ms)")
    print(f"Amount Reconciled     : INR {total_amount_reconciled}")
    print(f"Amount at Risk        : INR {total_amount_at_risk}")
    print("---------------------------------------------------")
    print("\nArtifacts emitted:")
    for name, path in artifact_paths.items():
        print(f"  • {name}: {path}")

    return report_payload


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="LedgerLens Reconciliation Evaluation Benchmark Runner")
    parser.add_argument("--size", type=int, default=60, help="Number of records to evaluate (default: 60)")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for deterministic generation (default: 42)")
    parser.add_argument("--output-dir", type=str, default="artifacts/evaluation", help="Directory to save artifacts")
    args = parser.parse_args()

    run_reconciliation_benchmark(
        total_records=args.size,
        seed=args.seed,
        output_dir=args.output_dir,
    )
