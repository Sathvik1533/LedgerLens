import os
import pytest
from sqlalchemy.engine import make_url
from sqlalchemy.exc import ArgumentError
from sqlalchemy import create_engine, inspect, text
from alembic.config import Config
from alembic import command
from alembic.script import ScriptDirectory

def verify_safe_test_database(test_url_str: str):
    """
    Validates the safety of the test database URL strictly offline.
    Raises ValueError on any violation to fail closed before connections occur.
    """
    if not test_url_str:
        raise ValueError("TEST_DATABASE_URL is missing.")
        
    try:
        parsed_test = make_url(test_url_str)
    except ArgumentError:
        raise ValueError("TEST_DATABASE_URL parsing failed.")
        
    host = (parsed_test.host or "").lower()
    
    forbidden_host_fragments = (
        "supabase.co",
        "amazonaws.com",
        "rds.amazonaws.com",
        "neon.tech",
        "railway.app",
        "render.com",
    )
    
    if any(fragment in host for fragment in forbidden_host_fragments):
        raise ValueError("Hosted database targets are forbidden for migration tests.")

    allowed_hosts = {"localhost", "127.0.0.1", "test_db", "db_test"}
    if not host or host not in allowed_hosts:
        raise ValueError("Host must be explicitly non-empty and one of approved test hosts.")
        
    if not parsed_test.database or not parsed_test.database.endswith("_test"):
        raise ValueError("Parsed database name must end in '_test'.")


# --- Unit Tests ---
def test_safety_helper_rejects_missing_test_url():
    with pytest.raises(ValueError, match="missing"):
        verify_safe_test_database(None)

def test_safety_helper_rejects_malformed_url():
    with pytest.raises(ValueError, match="parsing failed"):
        verify_safe_test_database("not_a_url")

def test_safety_helper_rejects_hosted_supabase_hostname():
    with pytest.raises(ValueError, match="Hosted database targets are forbidden"):
        verify_safe_test_database("postgresql://u:p@db.supabase.co:5432/db_test")

def test_safety_helper_rejects_unapproved_local_host():
    with pytest.raises(ValueError, match="approved test hosts"):
        verify_safe_test_database("postgresql://u:p@invalid_db:5433/db_test")

def test_safety_helper_rejects_non_test_db_name():
    with pytest.raises(ValueError, match="end in '_test'"):
        verify_safe_test_database("postgresql://u:p@localhost:5433/prod_db")


# --- Integration Test ---
@pytest.fixture(scope="module")
def safe_alembic_config():
    default_test_url = "postgresql://postgres:testpassword@localhost:5433/finance_controller_test"
    test_url = os.environ.get("TEST_DATABASE_URL", default_test_url)
    
    verify_safe_test_database(test_url)
    
    cfg = Config("alembic.ini")
    cfg.set_main_option("sqlalchemy.url", test_url)
    return cfg, test_url


@pytest.mark.integration
@pytest.mark.migration
def test_migration_lifecycle(safe_alembic_config):
    cfg, test_url = safe_alembic_config
    engine = create_engine(test_url)
    
    expected_tables = {
        "ingestion_batches", "payments_raw", "payments", "refunds_raw", "refunds",
        "settlements_raw", "settlements", "bank_credits_raw", "bank_credits",
        "reconciliation_cases", "candidate_matches", "evidence_items",
        "human_review_actions", "audit_events"
    }
    
    try:
        # 1. Downgrade base & assert absent
        command.downgrade(cfg, "base")
        inspector = inspect(engine)
        assert expected_tables.isdisjoint(set(inspector.get_table_names(schema="public")))
        
        # 2. Upgrade head
        command.upgrade(cfg, "head")
        
        # Verify dynamic revision
        inspector = inspect(engine)
        script = ScriptDirectory.from_config(cfg)
        head_rev = script.get_current_head()
        with engine.connect() as conn:
            db_rev = conn.execute(text("SELECT version_num FROM alembic_version")).scalar()
            assert db_rev == head_rev
            
        # Verify tables
        current_tables = set(inspector.get_table_names(schema="public"))
        assert not (expected_tables - current_tables)
        
        # Verify constraints
        case_cols = {c["name"]: c for c in inspector.get_columns("reconciliation_cases", schema="public")}
        assert "version" in case_cols
        
        pay_cols = {c["name"]: c for c in inspector.get_columns("payments", schema="public")}
        assert "amount" in pay_cols
        assert str(pay_cols["amount"]["type"]) == "NUMERIC(18, 2)"
        
        fks = inspector.get_foreign_keys("payments", schema="public")
        assert any(fk["referred_table"] == "ingestion_batches" for fk in fks)
        
        uniques = inspector.get_unique_constraints("payments", schema="public")
        indexes = inspector.get_indexes("payments", schema="public")
        has_unique = (any(idx["unique"] and "payment_id" in idx["column_names"] for idx in indexes) or
                      any("payment_id" in uq["column_names"] for uq in uniques))
        assert has_unique
        
        # 3. Upgrade again (idempotency)
        command.upgrade(cfg, "head")
        
        # 4. Downgrade & assert absent again
        command.downgrade(cfg, "base")
        inspector = inspect(engine)
        assert expected_tables.isdisjoint(set(inspector.get_table_names(schema="public")))
        
        # 5. Final upgrade & re-verify
        command.upgrade(cfg, "head")
        inspector = inspect(engine)
        case_cols = {c["name"]: c for c in inspector.get_columns("reconciliation_cases", schema="public")}
        assert "version" in case_cols
        pay_cols = {c["name"]: c for c in inspector.get_columns("payments", schema="public")}
        assert str(pay_cols["amount"]["type"]) == "NUMERIC(18, 2)"
        
    finally:
        engine.dispose()
