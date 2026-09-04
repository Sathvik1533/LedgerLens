from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.db.session import get_db
from backend.app.core.config import settings

router = APIRouter()

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """
    Comprehensive health check returning service status, API version,
    deployment version, database connectivity, and runtime provider from configuration.
    """
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_status = "disconnected"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "service": settings.PROJECT_NAME,
        "api_version": "v1",
        "deployment_version": settings.DEPLOYMENT_VERSION,
        "source_commit": settings.SOURCE_COMMIT,
        "backend_provider": settings.BACKEND_PROVIDER,
        "database_status": db_status,
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
    }

@router.get("/readiness")
def readiness_check(db: Session = Depends(get_db)):
    """
    Readiness check indicating the API can connect to the database and RAG engine is ready.
    """
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_status = "disconnected"

    try:
        from backend.app.api.v1.endpoints.rag import _retriever
        rag_ready = _retriever.is_ready()
    except Exception:
        rag_ready = False

    is_ready = (db_status == "connected" and rag_ready)
    return {
        "status": "ready" if is_ready else "not_ready",
        "database": db_status,
        "rag_engine": "ready" if rag_ready else "unready",
    }
