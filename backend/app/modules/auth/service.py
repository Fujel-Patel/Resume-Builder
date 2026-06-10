import uuid
from datetime import datetime, timedelta
from typing import Optional, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.settings import settings
from app.modules.auth import models, schemas
from app.utils.password import get_password_hash, verify_password
from app.utils.jwt import (
    create_access_token,
    hash_refresh_token,
)


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[models.User]:
    """Get user by email"""
    query = select(models.User).where(models.User.email == email)
    result = await db.execute(query)
    return result.scalars().first()


async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> Optional[models.User]:
    """Get user by ID"""
    query = select(models.User).where(models.User.id == user_id)
    result = await db.execute(query)
    return result.scalars().first()


async def authenticate_user(db: AsyncSession, email: str, password: str) -> Optional[models.User]:
    """Authenticate user with email and password"""
    user = await get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


async def increment_failed_login_attempts(db: AsyncSession, user: models.User):
    """Increment failed login attempts and lock account if needed"""
    user.failed_login_attempts += 1
    if user.failed_login_attempts >= 5:
        # Lock account for 15 minutes
        user.locked_until = datetime.utcnow() + timedelta(minutes=15)
    db.add(user)
    await db.commit()


async def reset_failed_login_attempts(db: AsyncSession, user: models.User):
    """Reset failed login attempts on successful login"""
    user.failed_login_attempts = 0
    user.locked_until = None
    db.add(user)
    await db.commit()


async def is_account_locked(user: models.User) -> bool:
    """Check if account is locked due to too many failed attempts"""
    if user.locked_until and user.locked_until > datetime.utcnow():
        return True
    return False


async def create_user(db: AsyncSession, user_create: schemas.UserCreate) -> models.User:
    """Create a new user"""
    # Hash password
    password_hash = get_password_hash(user_create.password)

    # Create user instance
    db_user = models.User(
        name=user_create.name,
        email=user_create.email,
        password_hash=password_hash,
    )

    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


async def create_access_token_for_user(db: AsyncSession, user: models.User) -> str:
    """Create access token for user"""
    access_token_expires = timedelta(minutes=settings.JWT_ACCESS_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    return access_token


async def create_refresh_token_for_user(
    db: AsyncSession, user: models.User
) -> Tuple[str, models.RefreshToken]:
    """Create refresh token for user and store hash in database"""
    refresh_token = uuid.uuid4().hex
    token_hash = hash_refresh_token(refresh_token)

    expires_at = datetime.utcnow() + timedelta(days=settings.JWT_REFRESH_EXPIRE_DAYS)

    db_refresh_token = models.RefreshToken(
        token_hash=token_hash,
        user_id=user.id,
        expires_at=expires_at,
    )

    db.add(db_refresh_token)
    await db.commit()
    await db.refresh(db_refresh_token)

    return refresh_token, db_refresh_token


async def verify_refresh_token_db(
    db: AsyncSession, token: str
) -> Optional[models.RefreshToken]:
    """Verify refresh token against database"""
    token_hash = hash_refresh_token(token)

    query = select(models.RefreshToken).where(
        models.RefreshToken.token_hash == token_hash,
        models.RefreshToken.expires_at > datetime.utcnow()
    )
    result = await db.execute(query)
    db_token = result.scalars().first()

    if db_token:
        # Verify user exists and is active
        user = await get_user_by_id(db, db_token.user_id)
        if not user or not user.is_active:
            # Delete invalid token
            await db.delete(db_token)
            await db.commit()
            return None

    return db_token


async def delete_refresh_token(db: AsyncSession, token_hash: str):
    """Delete refresh token from database"""
    query = select(models.RefreshToken).where(models.RefreshToken.token_hash == token_hash)
    result = await db.execute(query)
    db_token = result.scalars().first()

    if db_token:
        await db.delete(db_token)
        await db.commit()


async def delete_all_refresh_tokens_for_user(db: AsyncSession, user_id: uuid.UUID):
    """Delete all refresh tokens for a user (used on logout or breach)"""
    query = select(models.RefreshToken).where(models.RefreshToken.user_id == user_id)
    result = await db.execute(query)
    tokens = result.scalars().all()

    for token in tokens:
        await db.delete(token)
    await db.commit()


async def verify_email_token(
    db: AsyncSession, token: str, token_type: str
) -> Tuple[bool, Optional[models.User]]:
    """Verify email token (verification or reset)"""
    from app.utils.email import hash_email_token

    token_hash = hash_email_token(token)

    query = select(models.EmailToken).where(
        models.EmailToken.token_hash == token_hash,
        models.EmailToken.type == token_type,
        models.EmailToken.expires_at > datetime.utcnow()
    )
    result = await db.execute(query)
    email_token = result.scalars().first()

    if not email_token:
        return False, None

    # Get user
    user = await get_user_by_id(db, email_token.user_id)
    if not user:
        return False, None

    # If token_type is "verify_email", mark user as verified
    if token_type == "verify_email":
        user.is_verified = True
        db.add(user)

    # Delete used token
    await db.delete(email_token)
    await db.commit()

    return True, user


async def create_email_verification_token(
    db: AsyncSession, user: models.User
) -> str:
    """Create email verification token for user"""
    from app.utils.email import generate_email_token, hash_email_token

    token = generate_email_token()
    token_hash = hash_email_token(token)

    expires_at = datetime.utcnow() + timedelta(hours=24)  # 24 hour expiry

    db_email_token = models.EmailToken(
        token_hash=token_hash,
        user_id=user.id,
        type="verify_email",
        expires_at=expires_at,
    )

    db.add(db_email_token)
    await db.commit()

    return token


async def create_password_reset_token(
    db: AsyncSession, user: models.User
) -> str:
    """Create password reset token for user"""
    from app.utils.email import generate_email_token, hash_email_token

    token = generate_email_token()
    token_hash = hash_email_token(token)

    expires_at = datetime.utcnow() + timedelta(hours=1)  # 1 hour expiry

    db_email_token = models.EmailToken(
        token_hash=token_hash,
        user_id=user.id,
        type="reset_password",
        expires_at=expires_at,
    )

    db.add(db_email_token)
    await db.commit()

    return token