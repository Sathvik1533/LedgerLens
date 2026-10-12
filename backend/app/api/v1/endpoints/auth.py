from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.core.config import settings
from backend.app.core.security import (
    hash_password,
    verify_password,
    generate_session_token,
    hash_session_token,
)
from backend.app.models.user import UserModel, UserSessionModel
from backend.app.api.deps import (
    get_current_user,
    login_rate_limiter,
)

router = APIRouter()


class LoginRequest(BaseModel):
    email: str
    password: str


class DemoLoginRequest(BaseModel):
    role: Optional[str] = "reviewer"  # "reviewer" | "admin"


class UserProfileResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    token: Optional[str] = None


def _set_session_cookie(response: Response, request: Request, session_token: str):
    is_secure = request.headers.get("x-forwarded-proto") == "https" or request.url.scheme == "https" or settings.APP_ENV == "production"
    response.set_cookie(
        key=settings.SESSION_COOKIE_NAME,
        value=session_token,
        httponly=True,
        samesite="none" if is_secure else "lax",
        secure=is_secure,
        max_age=settings.SESSION_EXPIRE_SECONDS,
        path="/",
    )


@router.post(
    "/login",
    response_model=UserProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Sign in to LedgerLens Control Room",
)
def login(
    body: LoginRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    login_rate_limiter.check(request, "sign-in")

    user = db.query(UserModel).filter(UserModel.email == body.email.lower().strip(), UserModel.is_active == True).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please check your credentials and try again.",
        )

    # Issue session
    token = generate_session_token()
    token_hash = hash_session_token(token)
    expires_at = datetime.now(timezone.utc) + timedelta(seconds=settings.SESSION_EXPIRE_SECONDS)

    session_record = UserSessionModel(
        user_id=user.id,
        session_token_hash=token_hash,
        expires_at=expires_at,
        is_revoked=False,
    )
    db.add(session_record)
    db.commit()

    _set_session_cookie(response, request, token)

    return UserProfileResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        token=token,
    )


@router.post(
    "/demo",
    response_model=UserProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="One-click server-side demo authentication for external review",
)
def demo_login(
    body: DemoLoginRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    login_rate_limiter.check(request, "demo sign-in")

    role = "admin" if body.role == "admin" else "reviewer"
    target_email = f"{role}@ledgerlens.internal"
    display_name = "Demo Administrator" if role == "admin" else "Demo Reviewer"

    user = db.query(UserModel).filter(UserModel.email == target_email).first()
    if not user:
        # Auto-provision seeded demo user with high-iteration PBKDF2 hash
        # Default internal demo password created server-side only
        user = UserModel(
            email=target_email,
            full_name=display_name,
            role=role,
            hashed_password=hash_password(f"DemoPass_{role}_2026!"),
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = generate_session_token()
    token_hash = hash_session_token(token)
    expires_at = datetime.now(timezone.utc) + timedelta(seconds=settings.SESSION_EXPIRE_SECONDS)

    session_record = UserSessionModel(
        user_id=user.id,
        session_token_hash=token_hash,
        expires_at=expires_at,
        is_revoked=False,
    )
    db.add(session_record)
    db.commit()

    _set_session_cookie(response, request, token)

    return UserProfileResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        token=token,
    )


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    summary="End current authenticated session",
)
def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    session_token = request.cookies.get(settings.SESSION_COOKIE_NAME)
    if session_token:
        token_hash = hash_session_token(session_token)
        session_record = db.query(UserSessionModel).filter(UserSessionModel.session_token_hash == token_hash).first()
        if session_record:
            session_record.is_revoked = True
            db.commit()

    response.delete_cookie(key=settings.SESSION_COOKIE_NAME, path="/")
    return {"status": "logged_out", "message": "Your session has been securely ended."}


@router.get(
    "/me",
    response_model=UserProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Get authenticated reviewer profile",
)
def get_me(current_user: UserModel = Depends(get_current_user)):
    return UserProfileResponse(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
    )
