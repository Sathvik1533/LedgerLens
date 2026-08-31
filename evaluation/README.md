# LedgerLens Reconciliation Evaluation Harness

This directory contains the reproducible evaluation suite for the LedgerLens
Multi-Source Reconciliation Engine.

---

## 1. Overview & Evaluation Goals

The evaluation harness measures three critical performance dimensions:

1. **Throughput**: Processing speed and batch latency (records per second).
2. **Measured Accuracy**: Exact classification accuracy against hidden ground
   truth, precision on auto-reconciliation, and zero false approvals.
3. **Honest Exception List**: Complete CSV/JSON export of all flagged cases,
   amounts at risk, and discrepancies without cherry-picking.

---

## 2. Dataset Specification (Synthetic Ground Truth)

The evaluation fixture generates a deterministic 60-row multi-source batch
(fixed seed `42`) across four independent financial feeds:

- **42 Clean Records (70.0%)**: All amounts, timestamps, fees, taxes, and bank
  credits match with zero discrepancy.
- **18 Injected Anomalies (30.0%)**:
  - `4 × amount_mismatch` (Bank statement amount differs from settlement);
  - `4 × missing_bank_credit` (Settlement exists, but no bank credit UTR);
  - `3 × partial_refund_not_reflected` (Customer refund unadjusted);
  - `3 × fee_mismatch` (Gateway fee deviates from standard 2% + 18% GST);
  - `2 × duplicate_payment` (Multiple captured payments for same order ID);
  - `2 × missing_settlement` (Payment captured, but settlement line omitted).
- **1 Malformed Payment Row**: Blocked at ingestion boundary to verify partial
  failure handling.

---

## 3. How to Run the Benchmark

### Standalone CLI Execution

```bash
python evaluation/run_benchmark.py
```

Optional arguments:

```bash
python evaluation/run_benchmark.py --size 60 --seed 42 --output-dir artifacts/evaluation
```

### Automated Pytest Suite

```bash
pytest tests/evaluation/ -v
```

---

## 4. Emitted Evaluation Artifacts

Running the benchmark emits four structured artifacts in `artifacts/evaluation/`:

- `metrics.json`: Primary machine-readable report containing throughput,
  timing, precision, recall, confusion matrix, and financial totals.
- `exceptions.csv`: Complete case-by-case audit log of all 60 records,
  comparing predicted vs. ground-truth classifications and discrepancy amounts.
- `reconciliation_benchmark_report.json`: Full benchmark report matching domain
  schema.
- `reconciliation_metrics_summary.csv`: Flat key-value metrics summary for
  automated CI parsing.

---

## 5. Interpreting Results

### Critical Invariants

- **False Approvals MUST Be Zero (`fp_auto == 0`)**: The engine must never
  auto-reconcile an anomalous transaction. Any false approval is a critical
  financial failure.
- **Clean Match Rate**: Exactly `70.00%` on the seed `42` evaluation dataset.
- **Precision on Auto-Reconcile**: `100.00%`.
- **Per-Category Recall**: `100.00%` across all 6 injected anomaly classes.
