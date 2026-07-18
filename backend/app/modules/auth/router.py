"""Auth router — pending user flow, email verification, resend, login enforcement."""

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.config.settings import settings
from app.limiter import limiter
from app.modules.auth import schemas, service
from app.modules.auth.exceptions import (
    AccountLockedException,
    AccountPendingException,
    DuplicateEmailException,
    EmailNotVerifiedException,
    EmailValidationException,
    InvalidCredentialsException,
    InvalidTokenException,
    ResendCooldownException,
    TooManyResendAttemptsException,
)
from app.types.common import success

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


def _frontend_verify_url(token: str) -> str:
    """Build the frontend verification URL for email links."""
    base = getattr(settings, "FRONTEND_URL", settings.CLIENT_URL)
    return f"{base}/verify-email?token={token}"


# ---------------------------------------------------------------------------
# POST /signup — creates PENDING account, sends verification email
# ---------------------------------------------------------------------------

@router.post("/signup", status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def signup(request: Request, user_create: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    # Email validation: syntax + domain + MX + disposable
    from app.services.email_validation import validate_email_full, EmailValidationError
    try:
        validated_email = validate_email_full(user_create.email)
    except EmailValidationError as exc:
        raise EmailValidationException(exc.message)

    # Check if a user with this email already exists (active or pending)
    existing = await service.get_user_by_email(db, validated_email)
    if existing:
        if existing.status == "pending":
            # Check if pending account expired
            from datetime import datetime, timezone
            if existing.pending_expires_at and existing.pending_expires_at < datetime.now(timezone.utc):
                # Delete expired pending account and let them re-register
                await db.delete(existing)
                await db.commit()
            else:
                raise DuplicateEmailException()
        else:
            raise DuplicateEmailException()

    # Create PENDING user (not active, cannot login)
    try:
        user = await service.create_user(db, user_create)
    except IntegrityError:
        raise DuplicateEmailException()

    # Generate verification token and send email
    token = await service.create_email_verification_token(db, user)

    from app.services.email_sender import send_email
    from app.services.email_templates import verification_email_html
    verify_url = _frontend_verify_url(token)
    expire_minutes = getattr(settings, "VERIFICATION_TOKEN_EXPIRE_MINUTES", 15)
    html_body = verification_email_html(verify_url, expires_in_minutes=expire_minutes)
    await send_email(
        to_email=user.email,
        subject=f"Verify your email — {_BRAND_NAME}",
        html_body=html_body,
    )

    return success({
        "message": "Please check your email to verify your account.",
        "email": user.email,
    })


_BRAND_NAME = "Generative-CV"


# ---------------------------------------------------------------------------
# POST /login — blocks pending and unverified accounts
# ---------------------------------------------------------------------------

@router.post("/login")
@limiter.limit("10/minute")
async def login(
    request: Request,
    body: schemas.LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    user = await service.get_user_by_email(db, body.email)

    # Check lockout BEFORE password to prevent timing bypass
    if user and await service.is_account_locked(user):
        raise AccountLockedException()

    # Always run the same code path to prevent timing attacks revealing email existence
    if not user or not await service.check_password(body.password, user):
        if user:
            await service.increment_failed_login_attempts(db, user)
        raise InvalidCredentialsException()

    # Block login for pending accounts
    if user.status == "pending":
        raise AccountPendingException()

    # Block login for unverified accounts (backward compat)
    if not user.is_active:
        raise InvalidCredentialsException()

    if not user.email_verified and not user.is_verified:
        raise EmailNotVerifiedException()

    await service.reset_failed_login_attempts(db, user)

    access_token = await service.create_access_token_for_user(db, user)
    refresh_token, _ = await service.create_refresh_token_for_user(db, user)
    _set_refresh_cookie(response, refresh_token)

    return success({"access_token": access_token, "token_type": "bearer"})


# ---------------------------------------------------------------------------
# POST /refresh — with family tracking for replay detection
# ---------------------------------------------------------------------------

@router.post("/refresh")
@limiter.limit("20/minute")
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

    result = await service.verify_refresh_token_db(db, token)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "TOKEN_INVALID", "message": "Expired or revoked refresh token"},
        )

    db_token, user = result

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "UNAUTHORIZED", "message": "User not found or inactive"},
        )

    # Rotate: mark old as replaced, issue new in same family
    new_refresh_token, _ = await service.rotate_refresh_token(db, db_token, user)
    access_token = await service.create_access_token_for_user(db, user)
    _set_refresh_cookie(response, new_refresh_token)

    return success({
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "name": user.name,
            "email": user.email,
            "is_verified": user.email_verified or user.is_verified,
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "updated_at": user.updated_at.isoformat() if user.updated_at else None,
        },
    })


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
        result = await service.verify_refresh_token_db(db, token)
        if result:
            db_token, _ = result
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
@limiter.limit("5/minute")
async def forgot_password(
    request: Request,
    body: schemas.ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    user = await service.get_user_by_email(db, body.email)
    if user and user.is_active:
        token = await service.create_password_reset_token(db, user)
        from app.services.email_sender import send_email
        from app.services.email_templates import password_reset_email_html
        base = getattr(settings, "FRONTEND_URL", settings.CLIENT_URL)
        reset_url = f"{base}/reset-password?token={token}"
        html_body = password_reset_email_html(reset_url)
        await send_email(
            to_email=user.email,
            subject=f"Reset your password — {_BRAND_NAME}",
            html_body=html_body,
        )

    return success({"message": "If an account exists for this email, a reset link has been sent"})


# ---------------------------------------------------------------------------
# POST /reset-password
# ---------------------------------------------------------------------------

@router.post("/reset-password")
@limiter.limit("5/minute")
async def reset_password(
    request: Request,
    body: schemas.ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    is_valid, user = await service.verify_email_token(db, body.token, "reset_password")
    if not is_valid or not user:
        raise InvalidTokenException()

    from app.utils.password import hash_password
    user.password_hash = await hash_password(body.password)
    await service.delete_all_refresh_tokens_for_user(db, user.id)
    db.add(user)
    await db.commit()
    await db.refresh(user)

    return success({"message": "Password reset successfully"})


# ---------------------------------------------------------------------------
# POST /verify-email — preferred (avoids email-client prefetch)
# ---------------------------------------------------------------------------

@router.post("/verify-email")
@limiter.limit("10/minute")
async def verify_email_post(
    request: Request,
    body: schemas.VerifyEmailRequest,
    db: AsyncSession = Depends(get_db),
):
    is_valid, user = await service.verify_email_token(db, body.token, "verify_email")
    if not is_valid or not user:
        raise InvalidTokenException("Invalid or expired email verification link")

    return success({
        "message": "Email verified successfully. You can now log in.",
        "email_verified": True,
    })


# ---------------------------------------------------------------------------
# GET /verify-email — legacy, kept for backward compatibility
# ---------------------------------------------------------------------------

@router.get("/verify-email")
@limiter.limit("10/minute")
async def verify_email_get(
    request: Request,
    token: str,
    db: AsyncSession = Depends(get_db),
):
    is_valid, user = await service.verify_email_token(db, token, "verify_email")
    if not is_valid or not user:
        raise InvalidTokenException("Invalid or expired email verification link")

    return success({
        "message": "Email verified successfully. You can now log in.",
        "email_verified": True,
    })


# ---------------------------------------------------------------------------
# POST /resend-verification — rate limited, invalidates previous token
# ---------------------------------------------------------------------------

@router.post("/resend-verification")
@limiter.limit("5/minute")
async def resend_verification(
    request: Request,
    body: schemas.ResendVerificationRequest,
    db: AsyncSession = Depends(get_db),
):
    user = await service.get_user_by_email(db, body.email)

    # Always return success to prevent email enumeration
    if not user or user.status == "active" and user.email_verified:
        return success({"message": "If an account exists, a verification email has been sent"})

    # Check rate limits
    allowed, cooldown = await service.can_resend_verification(user)
    if not allowed:
        if cooldown is not None:
            raise ResendCooldownException(cooldown)
        raise TooManyResendAttemptsException()

    # Generate new token (invalidates previous)
    token = await service.create_email_verification_token(db, user)

    # Increment attempt counter
    user.verification_attempts = (user.verification_attempts or 0) + 1
    db.add(user)
    await db.commit()

    from app.services.email_sender import send_email
    from app.services.email_templates import verification_email_html
    verify_url = _frontend_verify_url(token)
    expire_minutes = getattr(settings, "VERIFICATION_TOKEN_EXPIRE_MINUTES", 15)
    html_body = verification_email_html(verify_url, expires_in_minutes=expire_minutes)
    await send_email(
        to_email=user.email,
        subject=f"Verify your email — {_BRAND_NAME}",
        html_body=html_body,
    )

    return success({"message": "If an account exists, a verification email has been sent"})
