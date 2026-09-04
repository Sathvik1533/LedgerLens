from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Razorpay AI Finance Controller"
    API_V1_STR: str = "/api/v1"
    APP_ENV: str = "development"
    LOG_LEVEL: str = "INFO"
    DATABASE_URL: Optional[str] = "postgresql://postgres:postgres@localhost:5432/finance_controller"
    SECRET_KEY: str = "ledgerlens-secure-session-key-2026-recon"
    BACKEND_PROVIDER: str = "Render Cloud Infrastructure"
    DEPLOYMENT_VERSION: str = "2026.09.04-prod"
    SESSION_COOKIE_NAME: str = "ledgerlens_session"
    SESSION_EXPIRE_SECONDS: int = 86400  # 24 hours
    
    FEE_TOLERANCE_PERCENT: float = 0.02
    TAX_RATE_ON_FEE: float = 0.18
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
