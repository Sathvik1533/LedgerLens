from fastapi import APIRouter
from backend.app.api.v1.endpoints import ingestion, reconciliation, review, rag

api_router = APIRouter()
api_router.include_router(ingestion.router, prefix="/ingestion", tags=["ingestion"])
api_router.include_router(reconciliation.router, prefix="/reconciliation", tags=["reconciliation"])
api_router.include_router(review.router, prefix="/review", tags=["review"])
api_router.include_router(rag.router, prefix="/rag", tags=["rag"])
