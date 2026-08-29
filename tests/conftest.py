import os
import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient

# 1. Setup isolated test URL
DEFAULT_TEST_URL = "postgresql://postgres:testpassword@localhost:5433/finance_controller_test"
test_db_url = os.getenv("TEST_DATABASE_URL", DEFAULT_TEST_URL)
prod_db_url = os.getenv("DATABASE_URL", "")

# 2. Strict Safety Checks
if not test_db_url:
    raise RuntimeError("TEST_DATABASE_URL environment variable is missing.")

if test_db_url == prod_db_url and prod_db_url != "":
    raise RuntimeError("TEST_DATABASE_URL cannot be identical to DATABASE_URL.")

if "supabase.co" in test_db_url.lower():
    raise RuntimeError("Refusing to run tests against a Supabase cloud database.")

if not test_db_url.rstrip('/').endswith("_test"):
    raise RuntimeError(f"Test database name must end in '_test'. Got URL: {test_db_url}")

# Force the application to use the test database
os.environ["DATABASE_URL"] = test_db_url

from backend.app.main import app
from backend.app.db.session import get_db

engine = create_engine(test_db_url)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def apply_migrations():
    """Apply Alembic migrations to the test database once per session."""
    alembic_cfg = Config("alembic.ini")
    alembic_cfg.set_main_option("sqlalchemy.url", test_db_url)
    command.upgrade(alembic_cfg, "head")
    yield
    # No downgrade needed; docker-compose down -v destroys the volume safely.

@pytest.fixture(scope="function")
def db_session():
    """
    Yields a real database session and TRUNCATES all tables after the test.
    This cleanup strategy (TRUNCATE ... RESTART IDENTITY CASCADE) avoids the 
    fragility of nested transactions (SAVEPOINT) when FastAPI endpoints explicitly 
    commit their own sessions.
    """
    session = TestingSessionLocal()
    yield session
    session.close()
    
    with engine.begin() as conn:
        conn.execute(text("""
            TRUNCATE TABLE 
                payments, 
                refunds, 
                settlements, 
                bank_credits, 
                reconciliation_cases, 
                audit_events, 
                ingestion_batches
            RESTART IDENTITY CASCADE;
        """))

@pytest.fixture(scope="function")
def client(db_session):
    """Provides a TestClient with the `get_db` dependency securely overridden."""
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
