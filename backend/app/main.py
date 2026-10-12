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

from fastapi import Request, Response, status
from fastapi.responses import JSONResponse

# Explicit CSRF & Origin Validation Middleware
@app.middleware("http")
async def csrf_origin_guard(request: Request, call_next):
    if request.method in ["POST", "PUT", "DELETE", "PATCH"]:
        origin = request.headers.get("origin")
        referer = request.headers.get("referer")
        # If an external origin is provided, verify it does not come from an untrusted domain
        if origin:
            allowed_patterns = [
                "localhost",
                "127.0.0.1",
                "vercel.app",
                "trycloudflare.com",
            ]
            if not any(pattern in origin for pattern in allowed_patterns):
                return JSONResponse(
                    status_code=status.HTTP_403_FORBIDDEN,
                    content={"detail": "Cross-Site Request Forgery (CSRF) blocked: untrusted origin."}
                )

        # For API requests with session cookies, require non-simple request header (application/json or custom header)
        has_session = bool(request.cookies.get(settings.SESSION_COOKIE_NAME))
        content_type = request.headers.get("content-type", "")
        has_custom_header = bool(request.headers.get("x-requested-with") or request.headers.get("x-ledgerlens-csrf"))
        is_json_or_multipart = "application/json" in content_type or "multipart/form-data" in content_type

        # Simple cross-site forms (application/x-www-form-urlencoded or text/plain) are rejected on authenticated API endpoints
        if has_session and request.url.path.startswith(settings.API_V1_STR) and not (is_json_or_multipart or has_custom_header):
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"detail": "State-changing API requests require application/json or custom request header."}
            )

    response = await call_next(request)
    return response

# CORS configuration with credentials support
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|.*\.vercel\.app|.*\.trycloudflare\.com)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["health"], summary="Service health check")
@app.get("/healthz", tags=["health"], summary="Liveness probe")
def healthz():
    """Returns OK if the API server process is alive."""
    return {"status": "ok", "app": settings.PROJECT_NAME, "env": settings.APP_ENV}

@app.get("/readyz", tags=["health"], summary="Readiness probe")
def readyz():
    """Returns OK when the application is ready to accept traffic."""
    return {"status": "ready"}

app.include_router(api_router, prefix=settings.API_V1_STR)
