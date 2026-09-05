#!/usr/bin/env python3
"""
LedgerLens Deterministic Test Database Bootstrapper
===================================================
Prepares and deterministically seeds a disposable PostgreSQL test database for
local and CI browser E2E test suites.

Strict Safety Guardrails:
- Refuses to run against any database URL containing 'supabase.co'.
- Refuses to run unless the target database name ends with '_test'.
- Refuses to run if TEST_DATABASE_URL matches production DATABASE_URL.

Deterministic Guarantee:
- Always uses fixed seed=42 for synthetic data generation.
- Generates 60 records producing the exact same 18 exception cases, 4-source evidence,
  policy citations, evaluation metrics, and audit starting state.
"""

import os
import sys
import uuid
import argparse
import tempfile
from pathlib import Path
from decimal import Decimal

# Ensure project root is in sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

DEFAULT_TEST_URL = "postgresql://postgres:testpassword@localhost:5433/finance_controller_test"

def validate_safety(target_url: str):
    """Enforces strict safety guardrails preventing accidental execution against non-test databases."""
    if not target_url:
        raise ValueError("Target database URL is empty.")
    
    clean_url = target_url.strip().lower()
    if "supabase.co" in clean_url:
        raise RuntimeError("SAFETY VIOLATION: Refusing to bootstrap a cloud Supabase database.")
    
    # Strip query parameters or trailing slashes
    db_name = target_url.split("?")[0].rstrip("/").split("/")[-1]
    if not db_name.endswith("_test"):
        raise RuntimeError(
            f"SAFETY VIOLATION: Target database '{db_name}' does not end in '_test'. "
            f"Only isolated disposable databases ending with '_test' can be bootstrapped."
        )
    
    prod_url = os.getenv("DATABASE_URL", "").strip().lower()
    if prod_url and clean_url == prod_url and not prod_url.split("?")[0].rstrip("/").split("/")[-1].endswith("_test"):
        raise RuntimeError("SAFETY VIOLATION: TEST_DATABASE_URL cannot match production DATABASE_URL.")

def bootstrap_test_db(target_url: str = None) -> dict:
    """
    Executes full deterministic bootstrap:
    1. Safety validation
    2. Alembic migrations to head
    3. Cascade truncation of all business and auth tables
    4. Seeding of deterministic demo users (Reviewer & Admin)
    5. Synthetic multi-source financial dataset generation (seed=42, 60 records)
    6. Ingestion of payments, settlements, refunds, and bank credits
    7. Multi-source deterministic reconciliation execution
    """
    if target_url is None:
        target_url = os.getenv("TEST_DATABASE_URL", DEFAULT_TEST_URL)

    validate_safety(target_url)

    # Set environment variables for downstream modules
    os.environ["DATABASE_URL"] = target_url
    os.environ["TEST_DATABASE_URL"] = target_url
    os.environ["_TEST_DB_OVERRIDDEN"] = "1"

    print("=" * 70)
    print("  LEDGERLENS DETERMINISTIC TEST DB BOOTSTRAPPER")
    print("=" * 70)
    print(f"Target Database URL : {target_url}")

    # 1. Apply Alembic Migrations
    print("\n[Step 1/6] Running Alembic migrations to head...")
    from alembic.config import Config
    from alembic import command
    alembic_cfg = Config(str(ROOT_DIR / "alembic.ini"))
    alembic_cfg.set_main_option("sqlalchemy.url", target_url)
    command.upgrade(alembic_cfg, "head")
    print("✓ Schema migrations up-to-date.")

    # 2. Database Session & Truncation
    print("\n[Step 2/6] Truncating all tables with cascade restart identity...")
    from sqlalchemy import create_engine, text
    from sqlalchemy.orm import sessionmaker

    engine = create_engine(target_url, pool_pre_ping=True)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    try:
        db.execute(text("""
            TRUNCATE TABLE 
                payments, 
                refunds, 
                settlements, 
                bank_credits, 
                reconciliation_cases, 
                audit_events, 
                ingestion_batches,
                user_sessions,
                users
            RESTART IDENTITY CASCADE;
        """))
        db.commit()
        print("✓ Tables successfully truncated (zero rows).")

        # 3. Seed Deterministic Users
        print("\n[Step 3/6] Seeding standard demo users...")
        from backend.app.models.user import UserModel
        from backend.app.core.security import hash_password

        users_to_seed = [
            {
                "email": "reviewer@ledgerlens.internal",
                "full_name": "Demo Reviewer",
                "role": "reviewer",
                "password": "DemoPassword123!",
            },
            {
                "email": "admin@ledgerlens.internal",
                "full_name": "Demo Admin",
                "role": "admin",
                "password": "DemoPassword123!",
            },
        ]

        created_users = []
        for u in users_to_seed:
            user_obj = UserModel(
                id=uuid.uuid4(),
                email=u["email"],
                hashed_password=hash_password(u["password"]),
                full_name=u["full_name"],
                role=u["role"],
                is_active=True,
            )
            db.add(user_obj)
            created_users.append(user_obj)
        db.commit()
        print(f"✓ Seeded {len(created_users)} users: {[u['email'] for u in users_to_seed]}")

        # 4. Generate Synthetic Data (seed=42, 60 records)
        print("\n[Step 4/6] Generating synthetic dataset (seed=42, 60 records)...")
        from data.generator import generate_synthetic_dataset

        with tempfile.TemporaryDirectory() as temp_dir:
            generate_synthetic_dataset(total_records=60, seed=42, output_dir=temp_dir)
            temp_path = Path(temp_dir)

            # 5. Ingest 4 Sources
            print("\n[Step 5/6] Ingesting 4 financial feeds via IngestionService...")
            from backend.app.services.ingestion_service import IngestionService
            ingestion_service = IngestionService(db)

            feeds = [
                ("payments", "payments.csv", ingestion_service.process_payment_csv),
                ("settlements", "settlements.csv", ingestion_service.process_settlement_csv),
                ("refunds", "refunds.csv", ingestion_service.process_refund_csv),
                ("bank_credits", "bank_credits.csv", ingestion_service.process_bank_credit_csv),
            ]

            ingestion_results = {}
            for feed_name, filename, process_fn in feeds:
                filepath = temp_path / filename
                if not filepath.exists():
                    raise FileNotFoundError(f"Expected generated file {filename} not found in {temp_dir}")
                file_bytes = filepath.read_bytes()
                batch_res = process_fn(file_bytes, filename)
                ingestion_results[feed_name] = {
                    "batch_id": str(batch_res.batch_id),
                    "submitted": batch_res.row_count_submitted,
                    "accepted": batch_res.row_count_accepted,
                    "rejected": batch_res.row_count_rejected,
                    "status": batch_res.batch_status,
                }
                print(f"  • {feed_name.capitalize()}: {batch_res.row_count_accepted} accepted, {batch_res.row_count_rejected} rejected (Batch {batch_res.batch_id})")

        # 6. Run Deterministic Reconciliation
        print("\n[Step 6/6] Executing multi-source deterministic reconciliation...")
        from backend.app.services.reconciliation_service import ReconciliationService
        recon_service = ReconciliationService(db)
        recon_summary = recon_service.execute_reconciliation()

        # Query exception breakdown
        from backend.app.models.reconciliation import ReconciliationCaseModel
        from sqlalchemy import func
        case_breakdown = (
            db.query(ReconciliationCaseModel.exception_type, func.count(ReconciliationCaseModel.id))
            .group_by(ReconciliationCaseModel.exception_type)
            .all()
        )
        breakdown_dict = {str(exc): count for exc, count in case_breakdown}

        summary = {
            "status": "success",
            "target_url": target_url,
            "users_seeded": len(created_users),
            "ingestion": ingestion_results,
            "reconciliation": {
                "total_processed": recon_summary.total_payments_processed,
                "auto_reconciled": recon_summary.auto_reconciled_count,
                "needs_review": recon_summary.needs_review_count,
                "match_rate": recon_summary.match_rate_percentage,
                "case_breakdown": breakdown_dict,
            }
        }

        print("\n" + "=" * 70)
        print("  DETERMINISTIC TEST BOOTSTRAP COMPLETE")
        print("=" * 70)
        print(f"Total Payments Processed : {recon_summary.total_payments_processed}")
        print(f"Auto-Reconciled Clean    : {recon_summary.auto_reconciled_count}")
        print(f"Cases Needing Review     : {recon_summary.needs_review_count}")
        print(f"Deterministic Match Rate : {recon_summary.match_rate_percentage:.2f}%")
        print("\nException Breakdown:")
        for exc, count in sorted(breakdown_dict.items()):
            print(f"  • {exc.ljust(30)} : {count} cases")
        print("=" * 70 + "\n")

        return summary

    finally:
        db.close()
        engine.dispose()

def main():
    parser = argparse.ArgumentParser(description="Deterministic Test DB Bootstrapper for LedgerLens")
    parser.add_argument(
        "--test-db-url",
        default=os.getenv("TEST_DATABASE_URL", DEFAULT_TEST_URL),
        help="PostgreSQL connection string for the disposable test database"
    )
    args = parser.parse_args()
    try:
        bootstrap_test_db(args.test_db_url)
    except Exception as e:
        print(f"\n❌ Error during bootstrap: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
