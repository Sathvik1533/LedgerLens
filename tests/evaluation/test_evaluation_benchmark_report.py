import io
import json
import csv
import os
from decimal import Decimal
from datetime import datetime, timezone
import pytest

from backend.app.models.payment import PaymentModel
from backend.app.models.settlement import SettlementModel
from backend.app.models.refund import RefundModel
from backend.app.models.bank_credit import BankCreditModel
from backend.app.models.reconciliation import ReconciliationCaseModel
from backend.app.models.review import HumanReviewActionModel, AuditEventModel
from backend.app.models.ingestion import IngestionBatchModel
from tests.evaluation.generator_fixture import generate_evaluation_dataset
from evaluation.report_writer import write_evaluation_artifacts


@pytest.mark.evaluation
@pytest.mark.integration
def test_evaluation_benchmark_report_e2e(client, db_session):
    """
    Evaluation Benchmark & Reporting Test:
    1. Pre-test emptiness assertion on all relevant tables (Strategy D).
    2. Generate deterministic 60-record dataset with known ground truth.
    3. Ingest all 4 sources via FastAPI endpoints.
    4. Run multi-source reconciliation tagged to the payments batch.
    5. Assert computed metrics against ground truth (70.0% match rate, zero false approvals).
    6. Serialize benchmark artifacts to JSON and CSV.
    7. Assert artifact files exist, are parseable, and match database state.
    """

    # ── 1. Strategy D: Pre-Test Emptiness Assertions ─────────────────────────
    assert db_session.query(PaymentModel).count() == 0
    assert db_session.query(SettlementModel).count() == 0
    assert db_session.query(RefundModel).count() == 0
    assert db_session.query(BankCreditModel).count() == 0
    assert db_session.query(ReconciliationCaseModel).count() == 0
    assert db_session.query(AuditEventModel).count() == 0
    assert db_session.query(HumanReviewActionModel).count() == 0
    assert db_session.query(IngestionBatchModel).count() == 0

    # ── 2. Generate Dataset ──────────────────────────────────────────────────
    csv_streams, meta = generate_evaluation_dataset(total_records=60, seed=42)

    # ── 3. Four-Source Ingestion Phase ───────────────────────────────────────
    res_pay = client.post(
        "/api/v1/ingestion/payments",
        files={"file": ("payments.csv", io.BytesIO(csv_streams["payments"].encode("utf-8")), "text/csv")},
    )
    assert res_pay.status_code == 201
    pay_batch_id = res_pay.json()["batch_id"]

    res_set = client.post(
        "/api/v1/ingestion/settlements",
        files={"file": ("settlements.csv", io.BytesIO(csv_streams["settlements"].encode("utf-8")), "text/csv")},
    )
    assert res_set.status_code == 201

    res_ref = client.post(
        "/api/v1/ingestion/refunds",
        files={"file": ("refunds.csv", io.BytesIO(csv_streams["refunds"].encode("utf-8")), "text/csv")},
    )
    assert res_ref.status_code == 201

    res_bc = client.post(
        "/api/v1/ingestion/bank-credits",
        files={"file": ("bank_credits.csv", io.BytesIO(csv_streams["bank_credits"].encode("utf-8")), "text/csv")},
    )
    assert res_bc.status_code == 201

    # ── 4. Reconciliation Execution ──────────────────────────────────────────
    res_recon = client.post(f"/api/v1/reconciliation/run?batch_id={pay_batch_id}")
    assert res_recon.status_code == 200
    recon_summary = res_recon.json()

    assert recon_summary["total_payments_processed"] == 60
    assert recon_summary["auto_reconciled_count"] == meta["expected_auto_reconciled"]
    assert recon_summary["needs_review_count"] == meta["expected_needs_review"]
    assert recon_summary["unresolved_count"] == meta["expected_unresolved"]
    assert recon_summary["match_rate_percentage"] == meta["expected_match_rate"]
    assert Decimal(str(recon_summary["total_amount_reconciled"])) == Decimal(meta["expected_total_amount_reconciled_inr"])
    assert Decimal(str(recon_summary["total_amount_at_risk"])) == Decimal(meta["expected_total_amount_at_risk_inr"])

    # ── 5. Detailed Database Case Verification ───────────────────────────────
    db_session.expire_all()
    cases = db_session.query(ReconciliationCaseModel).all()
    assert len(cases) == 60

    cases_by_pid = {c.payment_id: c for c in cases}
    tp_auto = 0
    fp_auto = 0
    fn_auto = 0
    actual_exception_counts = {
        "amount_mismatch": 0,
        "missing_bank_credit": 0,
        "partial_refund_not_reflected": 0,
        "fee_mismatch": 0,
        "duplicate_payment": 0,
        "missing_settlement": 0,
    }

    for pid, c in cases_by_pid.items():
        gt = meta["records"][pid]
        if c.decision_status == "auto_reconciled" and gt["expected_status"] == "auto_reconciled":
            tp_auto += 1
        elif c.decision_status == "auto_reconciled" and gt["expected_status"] != "auto_reconciled":
            fp_auto += 1  # False approval (forbidden invariant)
        elif c.decision_status != "auto_reconciled" and gt["expected_status"] == "auto_reconciled":
            fn_auto += 1

        if c.exception_type in actual_exception_counts:
            actual_exception_counts[c.exception_type] += 1

    # Invariants
    assert fp_auto == 0, f"False approval invariant failed: {fp_auto} false approvals found"
    assert tp_auto == 42
    assert fn_auto == 0
    precision_auto = (tp_auto / (tp_auto + fp_auto)) * 100.0 if (tp_auto + fp_auto) > 0 else 0.0
    recall_auto = (tp_auto / (tp_auto + fn_auto)) * 100.0 if (tp_auto + fn_auto) > 0 else 0.0
    assert precision_auto == 100.0
    assert recall_auto == 100.0

    # Exception type distribution matches ground truth exactly
    for exc_type, expected_count in meta["expected_exception_counts"].items():
        assert actual_exception_counts[exc_type] == expected_count, (
            f"Mismatch for {exc_type}: expected {expected_count}, got {actual_exception_counts[exc_type]}"
        )

    # ── 6. Serialize Benchmark Artifacts ─────────────────────────────────────
    report_data = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "dataset_size": 60,
        "total_submitted": meta["total_submitted"],
        "total_accepted": meta["total_accepted"],
        "total_rejected": meta["total_rejected"],
        "match_rate_percentage": meta["expected_match_rate"],
        "precision_auto_reconcile": precision_auto,
        "recall_auto_reconcile": recall_auto,
        "false_approvals": fp_auto,
        "zero_false_approval_invariant": "PASSED" if fp_auto == 0 else "FAILED",
        "summary": {
            "auto_reconciled_count": recon_summary["auto_reconciled_count"],
            "needs_review_count": recon_summary["needs_review_count"],
            "unresolved_count": recon_summary["unresolved_count"],
            "total_amount_reconciled_inr": meta["expected_total_amount_reconciled_inr"],
            "total_amount_at_risk_inr": meta["expected_total_amount_at_risk_inr"],
        },
        "exception_type_distribution": actual_exception_counts,
    }

    artifact_paths = write_evaluation_artifacts(report_data, output_dir="artifacts/evaluation")

    # ── 7. Verify Artifact Files on Disk ─────────────────────────────────────
    assert os.path.exists(artifact_paths["json_artifact"])
    assert os.path.exists(artifact_paths["csv_artifact"])

    # Verify JSON content
    with open(artifact_paths["json_artifact"], "r", encoding="utf-8") as f:
        loaded_json = json.load(f)
    assert loaded_json["dataset_size"] == 60
    assert loaded_json["match_rate_percentage"] == 70.0
    assert loaded_json["false_approvals"] == 0
    assert loaded_json["summary"]["auto_reconciled_count"] == 42
    assert loaded_json["summary"]["needs_review_count"] == 18

    # Verify CSV content
    with open(artifact_paths["csv_artifact"], "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        csv_data = dict(list(reader))
    assert csv_data["dataset_size"] == "60"
    assert csv_data["match_rate_percentage"] == "70.00"
    assert csv_data["false_approvals"] == "0"
    assert csv_data["auto_reconciled_count"] == "42"
    assert csv_data["needs_review_count"] == "18"
