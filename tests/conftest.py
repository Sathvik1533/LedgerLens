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

if not os.environ.get("_TEST_DB_OVERRIDDEN") and test_db_url == prod_db_url and prod_db_url != "":
    raise RuntimeError("TEST_DATABASE_URL cannot be identical to DATABASE_URL.")

if "supabase.co" in test_db_url.lower():
    raise RuntimeError("Refusing to run tests against a Supabase cloud database.")

if not test_db_url.rstrip('/').endswith("_test"):
    raise RuntimeError(f"Test database name must end in '_test'. Got URL: {test_db_url}")

# Force the application to use the test database
os.environ["DATABASE_URL"] = test_db_url
os.environ["_TEST_DB_OVERRIDDEN"] = "1"

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

def truncate_all_tables():
    with engine.begin() as conn:
        conn.execute(text("""
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

@pytest.fixture(scope="function", autouse=True)
def clean_database():
    """Guarantees a clean, unpolluted database state before and after every test."""
    truncate_all_tables()
    yield
    truncate_all_tables()

@pytest.fixture(scope="function")
def db_session():
    """
    Yields a real database session with strict table truncation before and after.
    """
    truncate_all_tables()
    session = TestingSessionLocal()
    yield session
    session.close()
    truncate_all_tables()

@pytest.fixture(scope="function")
def client(db_session):
    """Provides a TestClient with the `get_db` dependency securely overridden."""
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def create_test_user_session(db_session, role="reviewer", email=None):
    """Creates a user and valid session token directly in the database."""
    import uuid
    from datetime import datetime, timedelta, timezone
    from backend.app.models.user import UserModel, UserSessionModel
    from backend.app.core.security import hash_password, generate_session_token, hash_session_token

    if not email:
        email = f"{role}@ledgerlens.internal"
    
    user = db_session.query(UserModel).filter(UserModel.email == email).first()
    if not user:
        user = UserModel(
            id=uuid.uuid4(),
            email=email,
            hashed_password=hash_password("DemoPassword123!"),
            full_name=f"Demo {role.title()}",
            role=role,
            is_active=True,
        )
        db_session.add(user)
        db_session.flush()

    token = generate_session_token()
    token_hash = hash_session_token(token)
    session_record = UserSessionModel(
        id=uuid.uuid4(),
        user_id=user.id,
        session_token_hash=token_hash,
        expires_at=datetime.now(timezone.utc) + timedelta(days=1),
        is_revoked=False,
    )
    db_session.add(session_record)
    db_session.commit()
    return token, user


@pytest.fixture
def auth_reviewer_session(db_session):
    token, user = create_test_user_session(db_session, role="reviewer")
    return {
        "token": token,
        "user": user,
        "cookies": {"ledgerlens_session": token},
        "headers": {"Content-Type": "application/json", "X-LedgerLens-CSRF": "1"},
    }


@pytest.fixture
def auth_admin_session(db_session):
    token, user = create_test_user_session(db_session, role="admin")
    return {
        "token": token,
        "user": user,
        "cookies": {"ledgerlens_session": token},
        "headers": {"Content-Type": "application/json", "X-LedgerLens-CSRF": "1"},
    }


import pytest_asyncio

@pytest_asyncio.fixture(scope="function")
async def client_async():
    """Provides an httpx.AsyncClient hooked to the FastAPI app via ASGITransport with real session pooling."""
    import httpx
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


