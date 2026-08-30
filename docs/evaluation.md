# LedgerLens Evaluation Benchmark & Methodology

This document outlines the evaluation harness, synthetic dataset generation,
and verification methodology used to validate **LedgerLens**.

---

## 1. Evaluation Dataset Methodology

The evaluation harness (`tests/evaluation/generator_fixture.py`) generates a
deterministic synthetic dataset with known ground truth using random seed `42`:

- **Total Valid Records**: 60 multi-source transactions.
- **Total Submitted Rows**: 61 rows across 4 CSV files (including 1
  intentionally malformed amount row `99.999` to verify boundary validation).
- **Clean Match Ratio**: 70.0% (42 clean transactions matching across Payments,
  Settlements, and Bank Credits).
- **Anomaly Distribution (30.0% / 18 records)**:
  - 4 `amount_mismatch`
  - 4 `missing_bank_credit`
  - 3 `partial_refund_not_reflected`
  - 3 `fee_mismatch`
  - 2 `duplicate_payment`
  - 2 `missing_settlement`

---

## 2. Benchmark Metric Results

The evaluation test (`tests/evaluation/test_evaluation_benchmark_report.py`)
executes an end-to-end ingest, reconciliation run, and metric calculation
against PostgreSQL 15, asserting results against known ground truth:

- **Clean Auto-Reconciliation Match Rate**: `70.00%` (42 / 60).
- **Precision on Auto-Reconciled Cases**: `100.00%` (0 false auto-approvals).
- **Recall on Auto-Reconciled Cases**: `100.00%`.
- **False Approvals**: Exactly `0` (Technical invariant: zero false approvals).
- **Exception Isolation**: `18 flagged` out of 18 anomalies.
- **Boundary Rejection**: `1 rejected` out of 61 submitted rows.
- **Throughput**: ~`70,000` records/sec in-memory matching; ~`26s` for full
  PostgreSQL 15 transactional integration suite.

---

## 3. Emitted Benchmark Artifacts

The benchmark serializes evaluation metrics into structured artifacts in
`artifacts/evaluation/`:

- **Metrics JSON**: `artifacts/evaluation/metrics.json`
- **Exceptions CSV**: `artifacts/evaluation/exceptions.csv`
- **JSON Benchmark Report**:
  `artifacts/evaluation/reconciliation_benchmark_report.json`
- **CSV Summary Metrics**:
  `artifacts/evaluation/reconciliation_metrics_summary.csv`

---

## 4. Reproducing the Evaluation Suite

### Standalone Benchmark Execution

```bash
python evaluation/run_benchmark.py
```

### Full Integration & E2E Test Suite

```bash
make test-ci
```
