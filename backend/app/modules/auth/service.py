"""Auth service — business logic for authentication flows.

Implements:
- Pending user creation (email verification required before activation)
- Single-use verification tokens with 15-min expiry
- Resend rate limiting (60s cooldown, 5/day max)
- Refresh token family tracking with replay detection
- Account lockout after failed attempts
"""

import secrets
import uuid
from datetime import datetime, timedelta, UTC
from typing import Optional, Tuple

from loguru import logger
from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.settings import settings
from app.modules.auth import models, schemas
from app.utils.jwt import create_access_token, hash_refresh_token
from app.utils.password import hash_password, verify_password


# ---------------------------------------------------------------------------
# User lookups
# ---------------------------------------------------------------------------

async def get_user_by_email(db: AsyncSession, email: str) -> Optional[models.User]:
    result = await db.execute(select(models.User).where(models.User.email == email))
    return result.scalars().first()


async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> Optional[models.User]:
    result = await db.execute(select(models.User).where(models.User.id == user_id))
    return result.scalars().first()


# ---------------------------------------------------------------------------
# Password / authentication
# ---------------------------------------------------------------------------

async def check_password(plain: str, user: models.User) -> bool:
    return await verify_password(plain, user.password_hash)


async def authenticate_user(db: AsyncSession, email: str, password: str) -> Optional[models.User]:
    user = await get_user_by_email(db, email)
    if not user:
        return None
    if not await verify_password(password, user.password_hash):
        return None
    return user


# ---------------------------------------------------------------------------
# Account lockout
# ---------------------------------------------------------------------------

async def increment_failed_login_attempts(db: AsyncSession, user: models.User) -> None:
    user.failed_login_attempts += 1
    max_attempts = getattr(settings, "MAX_LOGIN_ATTEMPTS", 5)
    lockout_minutes = getattr(settings, "LOCKOUT_MINUTES", 15)
    if user.failed_login_attempts >= max_attempts:
        user.locked_until = datetime.now(UTC) + timedelta(minutes=lockout_minutes)
    db.add(user)
    await db.commit()


async def reset_failed_login_attempts(db: AsyncSession, user: models.User) -> None:
    user.failed_login_attempts = 0
    user.locked_until = None
    db.add(user)
    await db.commit()


async def is_account_locked(user: models.User) -> bool:
    return bool(user.locked_until and user.locked_until > datetime.now(UTC))


# ---------------------------------------------------------------------------
# User creation — creates PENDING account (not active until email verified)
# ---------------------------------------------------------------------------

async def create_user(db: AsyncSession, user_create: schemas.UserCreate) -> models.User:
    pending_expire_hours = getattr(settings, "PENDING_ACCOUNT_EXPIRE_HOURS", 48)
    now = datetime.now(UTC)
    db_user = models.User(
        name=user_create.name,
        email=user_create.email,
        password_hash=await hash_password(user_create.password),
        status="pending",
        is_active=False,
        is_verified=False,
        email_verified=False,
        pending_expires_at=now + timedelta(hours=pending_expire_hours),
    )
    db.add(db_user)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise
    await db.refresh(db_user)
    return db_user


# ---------------------------------------------------------------------------
# Access token
# ---------------------------------------------------------------------------

async def create_access_token_for_user(db: AsyncSession, user: models.User) -> str:
    return create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=settings.JWT_ACCESS_EXPIRE_MINUTES),
    )


# ---------------------------------------------------------------------------
# Refresh token — with family tracking for replay detection
# ---------------------------------------------------------------------------

async def create_refresh_token_for_user(
    db: AsyncSession, user: models.User, family_id: Optional[str] = None
) -> Tuple[str, models.RefreshToken]:
    token = secrets.token_urlsafe(32)
    token_hash = hash_refresh_token(token)
    expires_at = datetime.now(UTC) + timedelta(days=settings.JWT_REFRESH_EXPIRE_DAYS)
    if not family_id:
        family_id = str(uuid.uuid4())
    db_token = models.RefreshToken(
        token_hash=token_hash,
        user_id=user.id,
        expires_at=expires_at,
        family_id=family_id,
    )
    db.add(db_token)
    await db.commit()
    await db.refresh(db_token)
    return token, db_token


async def verify_refresh_token_db(
    db: AsyncSession, token: str
) -> Optional[Tuple[models.RefreshToken, models.User]]:
    """Verify refresh token with family tracking. Returns (token, user) or None.

    Detects replay attacks: if a token has been replaced (rotated) and is reused,
    all tokens in the family are revoked.
    """
    token_hash = hash_refresh_token(token)
    stmt = (
        select(models.RefreshToken, models.User)
        .join(models.User, models.RefreshToken.user_id == models.User.id)
        .where(
            models.RefreshToken.token_hash == token_hash,
            models.RefreshToken.expires_at > datetime.now(UTC),
        )
    )
    result = await db.execute(stmt)
    row = result.first()
    if not row:
        return None
    db_token, user = row

    if not user.is_active:
        await db.delete(db_token)
        await db.commit()
        return None

    # Check for replay: if this token was already replaced, revoke entire family
    if db_token.replaced_by_hash:
        logger.warning(
            "Replay attack detected for user {} — revoking token family {}",
            user.id, db_token.family_id,
        )
        if db_token.family_id:
            await db.execute(
                delete(models.RefreshToken).where(
                    models.RefreshToken.user_id == user.id,
                    models.RefreshToken.family_id == db_token.family_id,
                )
            )
            await db.commit()
        else:
            await db.delete(db_token)
            await db.commit()
        return None

    return db_token, user


async def rotate_refresh_token(
    db: AsyncSession, old_token: models.RefreshToken, user: models.User
) -> Tuple[str, models.RefreshToken]:
    """Delete old token (mark as replaced), issue new one in same family."""
    new_token, db_token = await create_refresh_token_for_user(
        db, user, family_id=old_token.family_id
    )
    # Mark old token as replaced
    old_token.replaced_by_hash = db_token.token_hash
    db.add(old_token)
    await db.commit()
    return new_token, db_token


async def delete_refresh_token(db: AsyncSession, token_hash: str) -> None:
    result = await db.execute(
        select(models.RefreshToken).where(models.RefreshToken.token_hash == token_hash)
    )
    db_token = result.scalars().first()
    if db_token:
        await db.delete(db_token)
        await db.commit()


async def delete_all_refresh_tokens_for_user(db: AsyncSession, user_id: uuid.UUID) -> None:
    await db.execute(
        delete(models.RefreshToken).where(models.RefreshToken.user_id == user_id)
    )
    await db.commit()


# ---------------------------------------------------------------------------
# Email verification tokens — single-use, 15-min expiry
# ---------------------------------------------------------------------------

async def create_email_verification_token(db: AsyncSession, user: models.User) -> str:
    """Create a new verification token, invalidating any previous ones."""
    from app.utils.email import generate_email_token, hash_email_token

    expire_minutes = getattr(settings, "VERIFICATION_TOKEN_EXPIRE_MINUTES", 15)
    now = datetime.now(UTC)

    # Invalidate all existing verify_email tokens for this user
    await db.execute(
        delete(models.EmailToken).where(
            models.EmailToken.user_id == user.id,
            models.EmailToken.type == "verify_email",
        )
    )

    token = generate_email_token()
    token_hash = hash_email_token(token)

    db.add(models.EmailToken(
        token_hash=token_hash,
        user_id=user.id,
        type="verify_email",
        expires_at=now + timedelta(minutes=expire_minutes),
    ))

    # Update user verification tracking fields
    user.verification_token_hash = token_hash
    user.verification_sent_at = now
    user.verification_expires_at = now + timedelta(minutes=expire_minutes)
    user.verification_attempts = 0
    user.last_verification_sent_at = now
    db.add(user)

    await db.commit()
    return token


async def create_password_reset_token(db: AsyncSession, user: models.User) -> str:
    """Create a password reset token, invalidating any previous ones."""
    from app.utils.email import generate_email_token, hash_email_token

    # Invalidate all existing reset_password tokens for this user
    await db.execute(
        delete(models.EmailToken).where(
            models.EmailToken.user_id == user.id,
            models.EmailToken.type == "reset_password",
        )
    )

    token = generate_email_token()
    token_hash = hash_email_token(token)
    db.add(models.EmailToken(
        token_hash=token_hash,
        user_id=user.id,
        type="reset_password",
        expires_at=datetime.now(UTC) + timedelta(hours=1),
    ))
    await db.commit()
    return token


async def verify_email_token(
    db: AsyncSession, token: str, token_type: str
) -> Tuple[bool, Optional[models.User]]:
    """Verify and consume an email token. Single-use: deleted after verification."""
    from app.utils.email import hash_email_token

    token_hash = hash_email_token(token)

    # Check the email_tokens table
    result = await db.execute(
        select(models.EmailToken).where(
            models.EmailToken.token_hash == token_hash,
            models.EmailToken.type == token_type,
            models.EmailToken.expires_at > datetime.now(UTC),
            models.EmailToken.used_at.is_(None),
        )
    )
    email_token = result.scalars().first()
    if not email_token:
        return False, None

    user = await get_user_by_id(db, email_token.user_id)
    if not user:
        return False, None

    if token_type == "verify_email":
        now = datetime.now(UTC)
        user.is_verified = True
        user.email_verified = True
        user.verified_at = now
        user.status = "active"
        user.is_active = True
        user.verification_token_hash = None
        user.verification_expires_at = None
        user.pending_expires_at = None
        db.add(user)

    # Mark token as used, then delete
    email_token.used_at = now if token_type == "verify_email" else datetime.now(UTC)
    await db.delete(email_token)
    await db.commit()
    await db.refresh(user)
    return True, user


# ---------------------------------------------------------------------------
# Resend verification — rate limited
# ---------------------------------------------------------------------------

async def can_resend_verification(user: models.User) -> Tuple[bool, Optional[int]]:
    """Check if user can request a new verification email.

    Returns (allowed, cooldown_seconds_remaining).
    """
    now = datetime.now(UTC)
    cooldown = getattr(settings, "RESEND_COOLDOWN_SECONDS", 60)
    max_per_day = getattr(settings, "RESEND_MAX_PER_DAY", 5)

    # Cooldown check
    if user.last_verification_sent_at:
        elapsed = (now - user.last_verification_sent_at).total_seconds()
        if elapsed < cooldown:
            return False, int(cooldown - elapsed)

    # Daily limit check
    if user.verification_attempts >= max_per_day:
        return False, None

    return True, None
