from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.db.session import get_db

router = APIRouter()

@router.get("/health")
def health_check():
    """
    Basic health check indicating the API is up.
    """
    return {"status": "ok"}

@router.get("/readiness")
def readiness_check(db: Session = Depends(get_db)):
    """
    Readiness check indicating the API can connect to the database.
    """
    try:
        # Simple query to check database connectivity
        db.execute(text("SELECT 1"))
        return {"status": "ready", "database": "connected"}
    except Exception as e:
        raise HTTPException(status_code=503, detail="Database connection failed")
