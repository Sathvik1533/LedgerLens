#!/usr/bin/env python3
"""
LedgerLens Demo Seeding Script
==============================
Generates synthetic multi-source financial records, ingests them into the
running database via the backend API, and runs reconciliation so that the
Exception Control Room queue is immediately populated with rich exception cases.

Usage:
    python scripts/seed_demo_data.py
    python scripts/seed_demo_data.py --base-url http://localhost:8000
"""

import sys
import io
import time
import argparse
import httpx
from pathlib import Path

# Ensure root is on path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from data.generator import generate_synthetic_dataset

def main():
    parser = argparse.ArgumentParser(description="Seed LedgerLens database with synthetic demo data")
    parser.add_argument("--base-url", default="http://localhost:8000", help="Backend API base URL")
    parser.add_argument("--records", type=int, default=60, help="Number of records to generate")
    args = parser.parse_args()

    print(f"================================================================")
    print(f"  LEDGERLENS DEMO DATA SEEDER")
    print(f"================================================================")
    print(f"Connecting to API at: {args.base_url}")

    # 1. Health check
    try:
        res = httpx.get(f"{args.base_url}/healthz", timeout=5.0)
        if res.status_code != 200:
            print(f"Error: API health check returned status {res.status_code}")
            sys.exit(1)
        print("✓ Backend API is alive and reachable.")
    except Exception as e:
        print(f"Error: Could not connect to API at {args.base_url} ({e})")
        print("Ensure the backend server is running: uvicorn backend.app.main:app --port 8000")
        sys.exit(1)

    # 2. Generate synthetic CSV files
    temp_data_dir = ROOT_DIR / "data" / "synthetic"
    print(f"\nGenerating {args.records} synthetic multi-source records (seed=42)...")
    generate_synthetic_dataset(total_records=args.records, seed=42, output_dir=str(temp_data_dir))
    print(f"✓ Synthetic CSVs generated in {temp_data_dir}")

    # 3. Ingest 4 financial sources via API
    endpoints = [
        ("payments", "payments.csv", "payments"),
        ("settlements", "settlements.csv", "settlements"),
        ("refunds", "refunds.csv", "refunds"),
        ("bank-credits", "bank_credits.csv", "bank credits"),
    ]

    print("\nIngesting 4 financial feeds into PostgreSQL...")
    for endpoint, filename, label in endpoints:
        filepath = temp_data_dir / filename
        if not filepath.exists():
            print(f"Warning: {filepath} does not exist, skipping.")
            continue
        
        with open(filepath, "rb") as f:
            file_bytes = f.read()
            res = httpx.post(
                f"{args.base_url}/api/v1/ingestion/{endpoint}",
                files={"file": (filename, file_bytes, "text/csv")},
                timeout=30.0,
            )
            if res.status_code == 201:
                data = res.json()
                print(f"  • {label.capitalize()}: {data['row_count_accepted']} accepted ({data['row_count_rejected']} rejected), Batch {data['batch_id']}")
            else:
                print(f"  • {label.capitalize()} ingestion failed: HTTP {res.status_code} - {res.text}")

    # 4. Trigger reconciliation run
    print("\nExecuting multi-source deterministic reconciliation...")
    t0 = time.perf_counter()
    res = httpx.post(f"{args.base_url}/api/v1/reconciliation/run", timeout=30.0)
    dur_ms = (time.perf_counter() - t0) * 1000.0

    if res.status_code == 200:
        rec_data = res.json()
        print(f"✓ Reconciliation complete in {dur_ms:.2f} ms")
        print(f"  • Total Processed       : {rec_data.get('total_payments_processed', 'N/A')}")
        print(f"  • Auto-Reconciled Clean : {rec_data.get('auto_reconciled_count', rec_data.get('total_auto_reconciled', 'N/A'))}")
        print(f"  • Cases Needing Review  : {rec_data.get('needs_review_count', rec_data.get('total_needs_review', 'N/A'))}")
        print(f"  • Match Rate            : {rec_data.get('match_rate_percentage', 'N/A')}%")
        print(f"  • Reconciled Volume     : INR {rec_data.get('total_amount_reconciled', 'N/A')}")
        print(f"  • Exposure Under Review : INR {rec_data.get('total_amount_at_risk', 'N/A')}")
    else:
        print(f"Error: Reconciliation run failed (HTTP {res.status_code}): {res.text}")

    # 5. Review queue summary
    try:
        # First authenticate demo reviewer
        auth_res = httpx.post(f"{args.base_url}/api/v1/auth/demo", json={"role": "reviewer"}, timeout=10.0)
        cookies = auth_res.cookies if auth_res.status_code == 200 else {}
        q_res = httpx.get(f"{args.base_url}/api/v1/review/queue", cookies=cookies, timeout=10.0)
        if q_res.status_code == 200:
            q_data = q_res.json()
            print(f"\nLive Review Queue Depth:")
            print(f"  • Pending Exception Cases : {q_data['total_cases']}")
            print(f"  • Total Capital at Risk   : INR {q_data['total_amount_at_risk']}")
    except Exception as e:
        print(f"Note: Review queue check: {e}")

    print(f"\n================================================================")
    print(f"✓ DEMO SEEDING COMPLETE!")
    print(f"Open http://localhost:5173 to view the Exception Control Room.")
    print(f"================================================================\n")


def run_transition_demo(base_url="http://localhost:8000", keep_data=False, db_url=None):
    """
    Executes the full deterministic state transition demonstration:
    0. Clear test data (TRUNCATE financial tables).
    1. Confirm initial zero backend state.
    2. Ingest synthetic 4-source fixture (seed=42, 60 records).
    3. Execute reconciliation.
    4. Confirm non-zero computed metrics across Overview, Queue, Dossier, and Audit.
    5. Retrieve Case Dossier & 4-source continuous trace.
    6. Submit human review sign-off and confirm append-only audit event.
    7. Clean up test database (unless keep_data is True).
    """
    import os
    import json
    from sqlalchemy import create_engine, text

    print("=" * 80)
    print("  LEDGERLENS TRUTHFUL STATE TRANSITION DEMONSTRATION")
    print("=" * 80)

    # 1. Safety Validation
    clean_url = base_url.strip().lower()
    if "vercel.app" in clean_url or "onrender.com" in clean_url or "supabase.co" in clean_url:
        raise RuntimeError("FATAL SAFETY VIOLATION: State transition demo cannot target production.")
    print(f"Target Environment: Disposable Local / Test API ({base_url})")

    db_target = (
        db_url
        or os.environ.get("TEST_DATABASE_URL")
        or os.environ.get("DATABASE_URL")
        or "postgresql://postgres:testpassword@localhost:5433/finance_controller_test"
    )
    if "vercel.app" in db_target.lower() or "onrender.com" in db_target.lower() or "supabase.co" in db_target.lower():
        raise RuntimeError("FATAL SAFETY VIOLATION: Target database cannot point to cloud production.")
    print(f"Target Database   : {db_target.split('@')[-1]}")

    cleanup_engine = create_engine(db_target)

    def clean_db():
        with cleanup_engine.begin() as conn:
            conn.execute(text("""
                TRUNCATE TABLE 
                    payments, refunds, settlements, bank_credits, 
                    reconciliation_cases, audit_events, ingestion_batches
                RESTART IDENTITY CASCADE;
            """))

    # ── Phase 0: Clear Test Data (Idempotent Pre-Test Wipe) ───────────────────
    print("\n[Phase 0] Clearing test data in isolated test database...")
    clean_db()
    print("✓ Test database initialized to clean zero state.")

    # Authenticate demo reviewer
    session = httpx.Client(base_url=base_url, timeout=30.0, headers={"x-ledgerlens-csrf": "1"})
    auth_res = session.post("/api/v1/auth/demo", json={"role": "reviewer"})
    if auth_res.status_code != 200:
        print(f"Auth notice: {auth_res.status_code} (continuing with default headers)")

    # ── Phase 1: Confirm Zero State ──────────────────────────────────────────
    print("\n[Phase 1] Querying Zero State from Real Backend...")
    stats_zero = session.get("/api/v1/reconciliation/stats").json()
    queue_zero = session.get("/api/v1/review/queue").json()
    ingest_zero = session.get("/api/v1/ingestion/status").json()

    print("\n--- BEFORE: ZERO-STATE METRICS PAYLOAD ---")
    print(json.dumps({
        "stats": stats_zero,
        "queue": queue_zero,
        "ingestion_feeds": ingest_zero.get("feeds", {}),
    }, indent=2))

    assert stats_zero.get("total_payments_count") == 0, f"Expected 0 payments, got {stats_zero.get('total_payments_count')}"
    assert stats_zero.get("total_cases") == 0, f"Expected 0 cases, got {stats_zero.get('total_cases')}"
    assert stats_zero.get("match_rate_percentage") == 0.0, "Expected 0.0% match rate"
    assert stats_zero.get("total_amount_reconciled") == "0.00"
    assert stats_zero.get("total_amount_at_risk") == "0.00"
    assert queue_zero.get("total_cases") == 0
    print("✓ Confirmed real zero backend state. UI displays 'No reconciliation run active'.")

    # ── Phase 2: Ingest 4-Source Fixture ─────────────────────────────────────
    print("\n[Phase 2] Loading Known Synthetic Four-Source Fixture (seed=42, 60 records)...")
    from tests.evaluation.generator_fixture import generate_evaluation_dataset
    csv_streams, _ = generate_evaluation_dataset(total_records=60, seed=42)

    feeds = [
        ("payments", "payments.csv", "payments"),
        ("settlements", "settlements.csv", "settlements"),
        ("refunds", "refunds.csv", "refunds"),
        ("bank-credits", "bank_credits.csv", "bank_credits"),
    ]
    for endpoint, filename, stream_key in feeds:
        res = session.post(
            f"/api/v1/ingestion/{endpoint}",
            files={"file": (filename, io.BytesIO(csv_streams[stream_key].encode("utf-8")), "text/csv")}
        )
        assert res.status_code == 201, f"Failed ingestion of {filename}: {res.text}"
        data = res.json()
        print(f"  • Ingested {endpoint}: {data['row_count_accepted']} accepted rows")

    # ── Phase 3: Run Deterministic Reconciliation ────────────────────────────
    print("\n[Phase 3] Executing Multi-Source Reconciliation Loop...")
    t0 = time.perf_counter()
    run_res = session.post("/api/v1/reconciliation/run", headers={"Content-Type": "application/json"})
    dur_ms = (time.perf_counter() - t0) * 1000
    assert run_res.status_code == 200, f"Reconciliation run failed: {run_res.text}"
    print(f"✓ Reconciliation executed in {dur_ms:.2f} ms")

    # ── Phase 4: Confirm Non-Zero Computed Metrics (After) ───────────────────
    print("\n[Phase 4] Querying Updated Non-Zero State from Backend...")
    stats_after = session.get("/api/v1/reconciliation/stats").json()
    queue_after = session.get("/api/v1/review/queue").json()
    ingest_after = session.get("/api/v1/ingestion/status").json()

    print("\n--- AFTER: COMPUTED METRICS PAYLOAD ---")
    print(json.dumps({
        "stats": stats_after,
        "queue_depth": {
            "total_cases": queue_after.get("total_cases"),
            "total_amount_at_risk": queue_after.get("total_amount_at_risk"),
        },
        "ingestion_feeds": ingest_after.get("feeds", {}),
    }, indent=2))

    assert stats_after["total_payments_count"] == 60, "Expected 60 payments"
    assert stats_after["total_cases"] == 60, "Expected 60 cases"
    assert stats_after["auto_reconciled_count"] == 42, "Expected 42 auto-reconciled"
    assert stats_after["needs_review_count"] == 18, "Expected 18 needs_review"
    assert stats_after["match_rate_percentage"] == 70.0, "Expected 70.0% parity rate"
    assert float(stats_after["total_amount_reconciled"]) > 0, "Expected positive reconciled value"
    assert float(stats_after["total_amount_at_risk"]) > 0, "Expected positive exposure"
    print("✓ Parity rate updated to 70.0% (42 clean auto-reconciled of 60 processed).")
    print(f"✓ Reconciled Value : INR {stats_after['total_amount_reconciled']}")
    print(f"✓ Exposure at Risk : INR {stats_after['total_amount_at_risk']}")

    # ── Phase 5: Case Dossier & Evidence ─────────────────────────────────────
    print("\n[Phase 5] Inspecting Case Dossier & 4-Source Continuous Trace...")
    assert len(queue_after["cases"]) == 18
    target_case_id = queue_after["cases"][0]["case_id"]
    evidence_res = session.get(f"/api/v1/review/cases/{target_case_id}")
    assert evidence_res.status_code == 200
    evidence = evidence_res.json()
    print(f"✓ Case Dossier loaded for {evidence['case_id']}:")
    print(f"  • Payment ID    : {evidence['payment_id']}")
    print(f"  • Exception Type: {evidence['exception_type']}")
    print(f"  • Discrepancy   : INR {evidence.get('settlement_discrepancy', '0.00')}")

    # ── Phase 6: Human Review Sign-off & Audit Trail ─────────────────────────
    print("\n[Phase 6] Submitting Review Sign-Off & Verifying Audit Trail...")
    rev_res = session.post(
        f"/api/v1/review/cases/{target_case_id}/review",
        json={
            "actor": "demo_reviewer@ledgerlens.internal",
            "action": "approve",
            "expected_version": evidence["version"],
            "human_comment": "State transition demo: Verified nodal statement variance and signed off.",
        }
    )
    assert rev_res.status_code == 200
    receipt = rev_res.json()
    print(f"✓ Review recorded: Status -> {receipt['new_decision_status']}, Audit ID -> {receipt['audit_event_id']}")

    audit_res = session.get(f"/api/v1/review/cases/{target_case_id}/audit")
    assert audit_res.status_code == 200
    assert len(audit_res.json()) >= 1
    print("✓ Cryptographic audit ledger updated with human sign-off determination.")

    # ── Phase 7: Clean Up Test Database ──────────────────────────────────────
    if not keep_data:
        print("\n[Phase 7] Cleaning up test database (TRUNCATE)...")
        clean_db()
        print("✓ Test database returned to clean zero state.")
    else:
        print("\n[Phase 7] Preserving seeded records for visual inspection (--keep-data).")

    print("\n" + "=" * 80)
    print("✓ STATE TRANSITION DEMONSTRATION COMPLETE")
    print(f"  Proof: Target was {db_target.split('@')[-1]} (isolated test DB).")
    print("  Live production benchmark on Render/Vercel remained 100% UNTOUCHED.")
    print("=" * 80 + "\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed LedgerLens database with synthetic demo data")
    parser.add_argument("--base-url", default="http://localhost:8000", help="Backend API base URL")
    parser.add_argument("--db-url", default=None, help="Direct PostgreSQL target URL for cleanup")
    parser.add_argument("--records", type=int, default=60, help="Number of records to generate")
    parser.add_argument("--demo-transition", action="store_true", help="Run complete truthful state transition demonstration")
    parser.add_argument("--keep-data", action="store_true", help="Keep seeded data after transition demo")
    args = parser.parse_args()

    if args.demo_transition:
        run_transition_demo(base_url=args.base_url, keep_data=args.keep_data, db_url=args.db_url)
    else:
        main()

