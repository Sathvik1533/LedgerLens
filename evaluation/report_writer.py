import csv
import json
import os
from decimal import Decimal
from typing import Dict, Any, List, Optional
from pathlib import Path


def write_evaluation_artifacts(
    report_data: Dict[str, Any],
    output_dir: str = "artifacts/evaluation",
    detailed_cases: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, str]:
    """
    Serializes reconciliation benchmark evaluation metrics to JSON and CSV artifacts.
    
    Artifacts emitted:
      - {output_dir}/reconciliation_benchmark_report.json (Full benchmark report)
      - {output_dir}/reconciliation_metrics_summary.csv   (Summary key-value metrics)
      - {output_dir}/metrics.json                        (Throughput, accuracy, timing)
      - {output_dir}/exceptions.csv                      (Full honest list of all cases & exceptions)
    
    Returns:
      Dict mapping artifact name to file path.
    """
    os.makedirs(output_dir, exist_ok=True)
    json_path = os.path.join(output_dir, "reconciliation_benchmark_report.json")
    csv_path = os.path.join(output_dir, "reconciliation_metrics_summary.csv")
    metrics_json_path = os.path.join(output_dir, "metrics.json")
    exceptions_csv_path = os.path.join(output_dir, "exceptions.csv")

    # 1. Write Full JSON Report
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(report_data, f, indent=2, default=str)

    # 2. Write CSV Summary
    summary = report_data.get("summary", {})
    csv_rows = [
        ("dataset_size", report_data.get("dataset_size")),
        ("total_submitted", report_data.get("total_submitted")),
        ("total_accepted", report_data.get("total_accepted")),
        ("total_rejected", report_data.get("total_rejected")),
        ("match_rate_percentage", f"{float(report_data.get('match_rate_percentage', 0.0)):.2f}"),
        ("precision_auto_reconcile", f"{float(report_data.get('precision_auto_reconcile', 0.0)):.2f}"),
        ("recall_auto_reconcile", f"{float(report_data.get('recall_auto_reconcile', 0.0)):.2f}"),
        ("false_approvals", report_data.get("false_approvals", 0)),
        ("zero_false_approval_invariant", report_data.get("zero_false_approval_invariant", "FAILED")),
        ("throughput_records_per_sec", report_data.get("throughput_records_per_sec", 0.0)),
        ("elapsed_seconds", report_data.get("elapsed_seconds", 0.0)),
        ("auto_reconciled_count", summary.get("auto_reconciled_count")),
        ("needs_review_count", summary.get("needs_review_count")),
        ("unresolved_count", summary.get("unresolved_count")),
        ("total_amount_reconciled_inr", summary.get("total_amount_reconciled_inr")),
        ("total_amount_at_risk_inr", summary.get("total_amount_at_risk_inr")),
    ]

    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["metric", "value"])
        for metric, val in csv_rows:
            writer.writerow([metric, str(val) if val is not None else ""])

    # 3. Write Dedicated metrics.json
    metrics_payload = {
        "benchmark_name": report_data.get("benchmark_name", "reconciliation_evaluation_benchmark"),
        "timestamp_utc": report_data.get("timestamp_utc"),
        "dataset": {
            "total_records": report_data.get("dataset_size", summary.get("total_records")),
            "seed": report_data.get("seed", 42),
            "sources": ["payments", "settlements", "refunds", "bank_credits"],
        },
        "performance": {
            "elapsed_seconds": report_data.get("elapsed_seconds", summary.get("elapsed_seconds", 0.0)),
            "throughput_records_per_sec": report_data.get("throughput_records_per_sec", summary.get("throughput_records_per_sec", 0.0)),
        },
        "accuracy": {
            "match_rate_pct": float(report_data.get("match_rate_percentage", summary.get("match_rate_pct", 0.0))),
            "precision_auto_reconcile": float(report_data.get("precision_auto_reconcile", summary.get("precision_auto_reconcile", 0.0))),
            "recall_auto_reconcile": float(report_data.get("recall_auto_reconcile", summary.get("recall_auto_reconcile", 0.0))),
            "false_approvals": int(report_data.get("false_approvals", summary.get("false_approvals", 0))),
            "zero_false_approval_invariant": report_data.get("zero_false_approval_invariant", "PASSED"),
        },
        "classification_breakdown": {
            "auto_reconciled": summary.get("auto_reconciled_count", summary.get("auto_reconciled")),
            "needs_review": summary.get("needs_review_count", summary.get("needs_review")),
            "unresolved": summary.get("unresolved_count", summary.get("unresolved", 0)),
            "per_class_recall": report_data.get("recall_per_exception_class", {}),
            "confusion_matrix": report_data.get("confusion_matrix", {}),
        },
        "financial_summary": {
            "total_amount_reconciled_inr": summary.get("total_amount_reconciled_inr"),
            "total_amount_at_risk_inr": summary.get("total_amount_at_risk_inr"),
        }
    }
    with open(metrics_json_path, "w", encoding="utf-8") as f:
        json.dump(metrics_payload, f, indent=2, default=str)

    # 4. Write Dedicated exceptions.csv (Full honest list of all cases and exceptions)
    cases = detailed_cases or report_data.get("cases", [])
    with open(exceptions_csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "case_id",
            "payment_id",
            "predicted_status",
            "ground_truth_status",
            "predicted_exception_type",
            "ground_truth_exception_type",
            "payment_amount",
            "expected_net_settlement",
            "reported_net_settlement",
            "discrepancy_amount",
            "is_correctly_classified",
        ])
        for c in cases:
            pred_status = c.get("predicted_status", c.get("decision_status", ""))
            gt_status = c.get("ground_truth_status", c.get("expected_status", ""))
            pred_exc = c.get("predicted_exception_type", c.get("exception_type", "") or "clean")
            gt_exc = c.get("ground_truth_exception_type", c.get("ground_truth_exception", "") or "clean")

            is_correct = (pred_status == gt_status) and (pred_exc == gt_exc)

            writer.writerow([
                c.get("case_id", ""),
                c.get("payment_id", ""),
                pred_status,
                gt_status,
                pred_exc,
                gt_exc,
                c.get("payment_amount", c.get("amount", "")),
                c.get("expected_net_settlement", ""),
                c.get("reported_net_settlement", ""),
                c.get("settlement_discrepancy", c.get("discrepancy_amount", "0.00")),
                "TRUE" if is_correct else "FALSE",
            ])

    return {
        "json_artifact": json_path,
        "csv_artifact": csv_path,
        "benchmark_report_json": json_path,
        "metrics_summary_csv": csv_path,
        "metrics_json": metrics_json_path,
        "exceptions_csv": exceptions_csv_path,
    }
