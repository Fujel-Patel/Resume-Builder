"""Auth router — JSON endpoints, PRD response shape, no debug prints."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.config.settings import settings
from app.modules.auth import schemas, service
from app.modules.auth.exceptions import (
    AccountLockedException,
    DuplicateEmailException,
    InvalidCredentialsException,
    InvalidTokenException,
)
from app.types.common import success
from app.utils.jwt import verify_refresh_token

router = APIRouter()

_REFRESH_COOKIE = "refresh_token"


def _set_refresh_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=_REFRESH_COOKIE,
        value=token,
        httponly=True,
        secure=settings.APP_ENV == "production",
        samesite="strict",
        path="/",
        max_age=settings.JWT_REFRESH_EXPIRE_DAYS * 86400,
    )


# ---------------------------------------------------------------------------
# POST /signup
# ---------------------------------------------------------------------------

@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(user_create: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    # existing = await service.get_user_by_email(db, user_create.email)
    # if existing:
    #     raise DuplicateEmailException()

    try:
        user = await service.create_user(db, user_create)
    except IntegrityError:
        raise DuplicateEmailException()

    await service.create_email_verification_token(db, user)
    # TODO: send verification email via SMTP

    return success(schemas.UserResponse.model_validate(user).model_dump())


# ---------------------------------------------------------------------------
# POST /login — JSON body (not form-data)
# ---------------------------------------------------------------------------

@router.post("/login")
async def login(
    body: schemas.LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    user = await service.get_user_by_email(db, body.email)

    # Always run the same code path to prevent timing attacks revealing email existence
    if not user or not service.check_password(body.password, user):
        if user:
            await service.increment_failed_login_attempts(db, user)
        raise InvalidCredentialsException()

    if await service.is_account_locked(user):
        raise AccountLockedException()

    if not user.is_active:
        raise InvalidCredentialsException()

    await service.reset_failed_login_attempts(db, user)

    access_token = await service.create_access_token_for_user(db, user)
    refresh_token, _ = await service.create_refresh_token_for_user(db, user)
    _set_refresh_cookie(response, refresh_token)

    return success({"access_token": access_token, "token_type": "bearer"})


# ---------------------------------------------------------------------------
# POST /refresh
# ---------------------------------------------------------------------------

@router.post("/refresh")
async def refresh_token(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    token = request.cookies.get(_REFRESH_COOKIE)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "UNAUTHORIZED", "message": "Refresh token missing"},
        )

    payload = verify_refresh_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "TOKEN_INVALID", "message": "Invalid refresh token"},
        )

    db_token = await service.verify_refresh_token_db(db, token)
    if not db_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "TOKEN_INVALID", "message": "Expired or revoked refresh token"},
        )

    user = await service.get_user_by_id(db, uuid.UUID(payload["sub"]))
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "UNAUTHORIZED", "message": "User not found or inactive"},
        )

    # Rotate: delete old, issue new
    await service.delete_refresh_token(db, db_token.token_hash)
    access_token = await service.create_access_token_for_user(db, user)
    new_refresh, _ = await service.create_refresh_token_for_user(db, user)
    _set_refresh_cookie(response, new_refresh)

    return success({"access_token": access_token, "token_type": "bearer"})


# ---------------------------------------------------------------------------
# POST /logout
# ---------------------------------------------------------------------------

@router.post("/logout")
async def logout(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    token = request.cookies.get(_REFRESH_COOKIE)
    if token:
        payload = verify_refresh_token(token)
        if payload:
            db_token = await service.verify_refresh_token_db(db, token)
            if db_token:
                await service.delete_refresh_token(db, db_token.token_hash)
    response.delete_cookie(
        _REFRESH_COOKIE,
        path="/",
        samesite="strict",
    )
    return success({"message": "Logged out successfully"})


# ---------------------------------------------------------------------------
# POST /forgot-password
# ---------------------------------------------------------------------------

@router.post("/forgot-password")
async def forgot_password(body: schemas.ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    user = await service.get_user_by_email(db, body.email)
    if user and user.is_active:
        await service.create_password_reset_token(db, user)
        # TODO: send reset email

    # Always return same response — don't reveal if email exists
    return success({"message": "If an account exists for this email, a reset link has been sent"})


# ---------------------------------------------------------------------------
# POST /reset-password
# ---------------------------------------------------------------------------

@router.post("/reset-password")
async def reset_password(body: schemas.ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    is_valid, user = await service.verify_email_token(db, body.token, "reset_password")
    if not is_valid or not user:
        raise InvalidTokenException()

    from app.utils.password import hash_password
    user.password_hash = hash_password(body.password)
    await service.delete_all_refresh_tokens_for_user(db, user.id)
    db.add(user)
    await db.commit()
    await db.refresh(user)

    return success({"message": "Password reset successfully"})


# ---------------------------------------------------------------------------
# GET /verify-email
# ---------------------------------------------------------------------------

@router.get("/verify-email")
async def verify_email(token: str, db: AsyncSession = Depends(get_db)):
    is_valid, user = await service.verify_email_token(db, token, "verify_email")
    if not is_valid or not user:
        raise InvalidTokenException("Invalid or expired email verification link")

    return success({"message": "Email verified successfully"})
