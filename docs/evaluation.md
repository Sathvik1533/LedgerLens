# LedgerLens Evaluation Benchmark & Methodology

This document outlines the evaluation harness, synthetic dataset generation, and verification methodology used to validate **LedgerLens**.

---

## 1. Evaluation Dataset Methodology

The evaluation harness (`tests/evaluation/generator_fixture.py`) generates a deterministic synthetic dataset with known ground truth using random seed `42`:

- **Total Valid Records**: 60 multi-source transactions.
- **Total Submitted Rows**: 61 rows across 4 CSV files (including 1 intentionally malformed amount row `99.999` to verify ingestion boundary validation).
- **Clean Match Ratio**: 70.0% (42 clean transactions matching across Payments, Settlements, and Bank Credits).
- **Anomaly Distribution (30.0% / 18 records)**:
  - 4 `amount_mismatch`
  - 4 `missing_bank_credit`
  - 3 `partial_refund_not_reflected`
  - 3 `fee_mismatch`
  - 2 `duplicate_payment`
  - 2 `missing_settlement`

---

## 2. Benchmark Metric Results

The evaluation test (`tests/evaluation/test_evaluation_benchmark_report.py`) executes an end-to-end ingest, reconciliation run, and metric calculation against PostgreSQL 15, asserting results against known ground truth:

| Metric | Target / Invariant | Actual Result | Verification Status |
|---|---|---|---|
| **Clean Auto-Reconciliation Match Rate** | Expected 70.0% | **70.00%** (42 / 60) | Passed |
| **Precision on Auto-Reconciled Cases** | $100.0\%$ | **100.00%** | Passed (0 false auto-approvals) |
| **Recall on Auto-Reconciled Cases** | $100.0\%$ | **100.00%** | Passed |
| **False Approvals** | Exactly 0 | **0** | Passed |
| **Exception Isolation** | 18 anomalies flagged | **18 flagged** | Passed (0 unflagged anomalies) |
| **Boundary Rejection** | 1 invalid row rejected | **1 rejected** | Passed (Row count accepted: 60/61) |

---

## 3. Emitted Benchmark Artifacts

The benchmark test serializes metrics into machine-readable JSON and CSV reports:

- **JSON Benchmark Report**: [`artifacts/evaluation/reconciliation_benchmark_report.json`](../artifacts/evaluation/reconciliation_benchmark_report.json)
- **CSV Summary Metrics**: [`artifacts/evaluation/reconciliation_metrics_summary.csv`](../artifacts/evaluation/reconciliation_metrics_summary.csv)

### Reproducing the Evaluation Suite
```bash
make test-ci
```
