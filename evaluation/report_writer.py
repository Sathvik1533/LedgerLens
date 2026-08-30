import csv
import json
import os
from decimal import Decimal
from typing import Dict, Any
from pathlib import Path


def write_evaluation_artifacts(
    report_data: Dict[str, Any],
    output_dir: str = "artifacts/evaluation",
) -> Dict[str, str]:
    """
    Serializes reconciliation benchmark evaluation metrics to JSON and CSV artifacts.
    
    Artifacts emitted:
      - {output_dir}/reconciliation_benchmark_report.json
      - {output_dir}/reconciliation_metrics_summary.csv
    
    Returns:
      Dict mapping artifact name to absolute/relative file path.
    """
    os.makedirs(output_dir, exist_ok=True)
    json_path = os.path.join(output_dir, "reconciliation_benchmark_report.json")
    csv_path = os.path.join(output_dir, "reconciliation_metrics_summary.csv")

    # 1. Write JSON Report
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

    return {
        "json_artifact": json_path,
        "csv_artifact": csv_path,
    }
