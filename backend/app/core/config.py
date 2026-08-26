from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Razorpay AI Finance Controller"
    API_V1_STR: str = "/api/v1"
    APP_ENV: str = "development"
    LOG_LEVEL: str = "INFO"
    DATABASE_URL: Optional[str] = "postgresql://postgres:postgres@localhost:5432/finance_controller"
    
    FEE_TOLERANCE_PERCENT: float = 0.02
    TAX_RATE_ON_FEE: float = 0.18
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
