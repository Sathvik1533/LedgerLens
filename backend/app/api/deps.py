import time
from datetime import datetime, timezone
from typing import Optional, Dict, List
from fastapi import Request, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.core.config import settings
from backend.app.core.security import hash_session_token
from backend.app.models.user import UserModel, UserSessionModel


# Single-process prototype in-memory rate limiter
# Tracks IP timestamps within sliding time window.
class PrototypeRateLimiter:
    def __init__(self, max_calls: int, window_seconds: int):
        self.max_calls = max_calls
        self.window_seconds = window_seconds
        self.ip_records: Dict[str, List[float]] = {}

    def check(self, request: Request, action_name: str = "request"):
        import os
        if os.getenv("TEST_DATABASE_URL"):
            return
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        timestamps = self.ip_records.get(client_ip, [])
        # Purge old timestamps
        timestamps = [t for t in timestamps if now - t < self.window_seconds]
        if len(timestamps) >= self.max_calls:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many {action_name} attempts. Please wait a minute before trying again."
            )
        timestamps.append(now)
        self.ip_records[client_ip] = timestamps


login_rate_limiter = PrototypeRateLimiter(max_calls=15, window_seconds=60)
review_rate_limiter = PrototypeRateLimiter(max_calls=45, window_seconds=60)


def get_current_user(request: Request, db: Session = Depends(get_db)) -> UserModel:
    """
    Extracts and validates the backend-enforced HttpOnly session cookie.
    Rejects missing, revoked, or expired sessions with a clean plain-text 401 error.
    """
    session_token = request.cookies.get(settings.SESSION_COOKIE_NAME)
    if not session_token:
        # Check Authorization header as backup for API testing
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header[7:].strip()

    if not session_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your session has ended. Please sign in again."
        )

    token_hash = hash_session_token(session_token)
    session_record = (
        db.query(UserSessionModel)
        .filter(
            UserSessionModel.session_token_hash == token_hash,
            UserSessionModel.is_revoked == False
        )
        .first()
    )

    if not session_record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your session has ended. Please sign in again."
        )

    # Validate expiration
    now_utc = datetime.now(timezone.utc)
    # Ensure timezone awareness
    exp = session_record.expires_at
    if exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)

    if now_utc > exp:
        session_record.is_revoked = True
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your session has ended. Please sign in again."
        )

    user = db.query(UserModel).filter(UserModel.id == session_record.user_id, UserModel.is_active == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your session has ended. Please sign in again."
        )

    return user


def get_current_reviewer(user: UserModel = Depends(get_current_user)) -> UserModel:
    """
    Enforces that the authenticated user possesses Reviewer or Administrator permissions.
    """
    if user.role not in ["reviewer", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to perform this review action."
        )
    return user


def get_current_admin(user: UserModel = Depends(get_current_user)) -> UserModel:
    """
    Enforces that the authenticated user possesses Administrator permissions.
    """
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to perform this action. Administrator access is required."
        )
    return user
