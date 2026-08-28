"""
Gate 3 Tests: Evaluation Harness Invariants
============================================
These tests assert the buildathon evidence requirements directly:
  - 500 records processed
  - 8/8 exception classes detected (100% recall per class)
  - 100% precision on auto-reconciled (zero false approvals)
  - match_rate_pct > 60%   (we target ~67%)
  - Throughput > 1000 records/sec (our actual: ~50k)
  - Zero false approvals — the most critical invariant
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from evaluation.harness import run_harness

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


def test_harness_runs_on_500_records():
    """Harness loads all 4 sources and produces results for 500 payment rows."""
    report = run_harness(data_dir="data/synthetic", json_mode=False)
    assert report['summary']['total_records'] >= 500, (
        f"Expected >=500 records, got {report['summary']['total_records']}"
    )


def test_zero_false_approvals_invariant():
    """CRITICAL: The engine must never approve a payment that ground truth says is anomalous."""
    report = run_harness(data_dir="data/synthetic", json_mode=False)
    assert report['summary']['false_approvals'] == 0, (
        f"FALSE APPROVAL INVARIANT VIOLATED: {report['summary']['false_approvals']} false approvals found"
    )
    assert report['zero_false_approval_invariant'] == 'PASSED'


def test_precision_on_auto_reconcile_is_100():
    """Precision on auto-reconciled decisions must be 100% (no false positives allowed)."""
    report = run_harness(data_dir="data/synthetic", json_mode=False)
    assert report['summary']['precision_auto_reconcile'] == 100.0, (
        f"Precision was {report['summary']['precision_auto_reconcile']}% — must be 100%"
    )


def test_recall_per_exception_class_is_100():
    """All 8 exception classes must achieve 100% recall (no missed anomalies)."""
    report = run_harness(data_dir="data/synthetic", json_mode=False)
    for exc in EXCEPTION_CLASSES:
        recall = report['recall_per_exception_class'][exc]
        assert recall == 100.0, (
            f"Recall for '{exc}' was {recall}% — must be 100%"
        )


def test_match_rate_meets_target():
    """Match rate must be above 60% for buildathon minimum (our baseline: ~67%)."""
    report = run_harness(data_dir="data/synthetic", json_mode=False)
    assert report['summary']['match_rate_pct'] >= 60.0, (
        f"Match rate was {report['summary']['match_rate_pct']}% — minimum is 60%"
    )


def test_throughput_exceeds_1000_rps():
    """Throughput must exceed 1000 records/sec (confirms O(1) hash indexing, not O(N^2))."""
    report = run_harness(data_dir="data/synthetic", json_mode=False)
    assert report['summary']['throughput_records_per_sec'] >= 1000.0, (
        f"Throughput was {report['summary']['throughput_records_per_sec']} rec/sec — minimum is 1000"
    )


def test_no_unresolved_exceptions():
    """Every anomalous payment must be detected as 'needs_review', not silently auto-reconciled."""
    report = run_harness(data_dir="data/synthetic", json_mode=False)
    assert len(report['unresolved_exceptions_sample']) == 0, (
        f"Found {len(report['unresolved_exceptions_sample'])} unresolved exceptions:\n"
        + "\n".join(str(x) for x in report['unresolved_exceptions_sample'][:5])
    )


def test_json_mode_output_is_valid():
    """JSON output mode is valid for CI consumption."""
    import io, json
    from contextlib import redirect_stdout
    buf = io.StringIO()
    with redirect_stdout(buf):
        report = run_harness(data_dir="data/synthetic", json_mode=True)
    # The json.dumps output captured in buf is parseable
    parsed = json.loads(buf.getvalue())
    assert 'summary' in parsed
    assert 'recall_per_exception_class' in parsed
    assert 'confusion_matrix' in parsed
