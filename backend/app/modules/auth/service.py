"""Auth service — business logic for authentication flows."""

import secrets
import uuid
from datetime import datetime, timedelta, UTC
from typing import Optional, Tuple

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.settings import settings
from app.modules.auth import models, schemas
from app.utils.jwt import create_access_token, hash_refresh_token
from app.utils.password import hash_password, verify_password


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[models.User]:
    result = await db.execute(select(models.User).where(models.User.email == email))
    return result.scalars().first()


async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> Optional[models.User]:
    result = await db.execute(select(models.User).where(models.User.id == user_id))
    return result.scalars().first()


def check_password(plain: str, user: models.User) -> bool:
    """Verify password against stored hash."""
    return verify_password(plain, user.password_hash)


async def authenticate_user(db: AsyncSession, email: str, password: str) -> Optional[models.User]:
    user = await get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


async def increment_failed_login_attempts(db: AsyncSession, user: models.User) -> None:
    user.failed_login_attempts += 1
    if user.failed_login_attempts >= 5:
        user.locked_until = datetime.now(UTC) + timedelta(minutes=15)
    db.add(user)
    await db.commit()


async def reset_failed_login_attempts(db: AsyncSession, user: models.User) -> None:
    user.failed_login_attempts = 0
    user.locked_until = None
    db.add(user)
    await db.commit()


async def is_account_locked(user: models.User) -> bool:
    return bool(user.locked_until and user.locked_until > datetime.now(UTC))


async def create_user(db: AsyncSession, user_create: schemas.UserCreate) -> models.User:
    db_user = models.User(
        name=user_create.name,
        email=user_create.email,
        password_hash=hash_password(user_create.password),
    )
    db.add(db_user)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise
    await db.refresh(db_user)
    return db_user


async def create_access_token_for_user(db: AsyncSession, user: models.User) -> str:
    return create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=settings.JWT_ACCESS_EXPIRE_MINUTES),
    )


async def create_refresh_token_for_user(
    db: AsyncSession, user: models.User
) -> Tuple[str, models.RefreshToken]:
    token = secrets.token_urlsafe(32)
    token_hash = hash_refresh_token(token)
    expires_at = datetime.now(UTC) + timedelta(days=settings.JWT_REFRESH_EXPIRE_DAYS)
    db_token = models.RefreshToken(
        token_hash=token_hash,
        user_id=user.id,
        expires_at=expires_at,
    )
    db.add(db_token)
    await db.commit()
    await db.refresh(db_token)
    return token, db_token


async def verify_refresh_token_db(
    db: AsyncSession, token: str
) -> Optional[models.RefreshToken]:
    token_hash = hash_refresh_token(token)
    result = await db.execute(
        select(models.RefreshToken).where(
            models.RefreshToken.token_hash == token_hash,
            models.RefreshToken.expires_at > datetime.now(UTC),
        )
    )
    db_token = result.scalars().first()
    if db_token:
        user = await get_user_by_id(db, db_token.user_id)
        if not user or not user.is_active:
            await db.delete(db_token)
            await db.commit()
            return None
    return db_token


async def delete_refresh_token(db: AsyncSession, token_hash: str) -> None:
    result = await db.execute(
        select(models.RefreshToken).where(models.RefreshToken.token_hash == token_hash)
    )
    db_token = result.scalars().first()
    if db_token:
        await db.delete(db_token)
        await db.commit()


async def delete_all_refresh_tokens_for_user(db: AsyncSession, user_id: uuid.UUID) -> None:
    result = await db.execute(
        select(models.RefreshToken).where(models.RefreshToken.user_id == user_id)
    )
    for token in result.scalars().all():
        await db.delete(token)
    await db.commit()


async def verify_email_token(
    db: AsyncSession, token: str, token_type: str
) -> Tuple[bool, Optional[models.User]]:
    from app.utils.email import hash_email_token
    token_hash = hash_email_token(token)
    result = await db.execute(
        select(models.EmailToken).where(
            models.EmailToken.token_hash == token_hash,
            models.EmailToken.type == token_type,
            models.EmailToken.expires_at > datetime.now(UTC),
        )
    )
    email_token = result.scalars().first()
    if not email_token:
        return False, None

    user = await get_user_by_id(db, email_token.user_id)
    if not user:
        return False, None

    if token_type == "verify_email":
        user.is_verified = True
        db.add(user)

    await db.delete(email_token)
    await db.commit()
    await db.refresh(user)
    return True, user


async def create_email_verification_token(db: AsyncSession, user: models.User) -> str:
    from app.utils.email import generate_email_token, hash_email_token
    token = generate_email_token()
    token_hash = hash_email_token(token)
    db.add(models.EmailToken(
        token_hash=token_hash,
        user_id=user.id,
        type="verify_email",
        expires_at=datetime.now(UTC) + timedelta(hours=24),
    ))
    await db.commit()
    return token


async def create_password_reset_token(db: AsyncSession, user: models.User) -> str:
    from app.utils.email import generate_email_token, hash_email_token
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
