import os
import subprocess
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


def _resolve_source_commit() -> str:
    env_commit = os.getenv("SOURCE_COMMIT") or os.getenv("RENDER_GIT_COMMIT") or os.getenv("VERCEL_GIT_COMMIT_SHA")
    if env_commit:
        return env_commit[:40]
    try:
        return subprocess.check_output(["git", "rev-parse", "HEAD"], text=True, stderr=subprocess.DEVNULL).strip()
    except Exception:
        return "8b27535f74a0ddd5a09f895b8bd5fa7b5599384d"


class Settings(BaseSettings):
    PROJECT_NAME: str = "LedgerLens"
    API_V1_STR: str = "/api/v1"
    APP_ENV: str = "development"
    LOG_LEVEL: str = "INFO"
    DATABASE_URL: Optional[str] = "postgresql://postgres:postgres@localhost:5432/finance_controller"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-local-session-key-only")
    BACKEND_PROVIDER: str = "Render Cloud Infrastructure"
    DEPLOYMENT_VERSION: str = os.getenv("DEPLOYMENT_VERSION") or _resolve_source_commit()
    SOURCE_COMMIT: str = _resolve_source_commit()
    SESSION_COOKIE_NAME: str = "ledgerlens_session"
    SESSION_EXPIRE_SECONDS: int = 86400  # 24 hours
    
    FEE_TOLERANCE_PERCENT: float = 0.02
    TAX_RATE_ON_FEE: float = 0.18
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
