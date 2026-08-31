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
        print(f"  • Auto-Reconciled Clean : {rec_data.get('total_auto_reconciled', 'N/A')}")
        print(f"  • Cases Needing Review  : {rec_data.get('total_needs_review', 'N/A')}")
    else:
        print(f"Error: Reconciliation run failed (HTTP {res.status_code}): {res.text}")

    # 5. Review queue summary
    try:
        q_res = httpx.get(f"{args.base_url}/api/v1/review/queue", timeout=10.0)
        if q_res.status_code == 200:
            q_data = q_res.json()
            print(f"\nLive Review Queue Depth:")
            print(f"  • Pending Exception Cases : {q_data['total_cases']}")
            print(f"  • Total Capital at Risk   : INR {q_data['total_amount_at_risk']}")
    except Exception:
        pass

    print(f"\n================================================================")
    print(f"✓ DEMO SEEDING COMPLETE!")
    print(f"Open http://localhost:5173 to view the Exception Control Room.")
    print(f"================================================================\n")

if __name__ == "__main__":
    main()
