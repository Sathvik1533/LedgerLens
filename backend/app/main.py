from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.core.config import settings
from backend.app.api.v1.api import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/healthz", tags=["health"], summary="Liveness probe")
def healthz():
    """Returns OK if the API server process is alive."""
    return {"status": "ok", "app": settings.PROJECT_NAME, "env": settings.APP_ENV}

@app.get("/readyz", tags=["health"], summary="Readiness probe")
def readyz():
    """Returns OK when the application is ready to accept traffic."""
    return {"status": "ready"}

app.include_router(api_router, prefix=settings.API_V1_STR)
