"""Shared get_current_user dependency — validates Supabase JWT."""

import logging
import uuid
from typing import Optional

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.config.settings import settings
from app.modules.users import models as user_models
from app.modules.users import service as user_service

logger = logging.getLogger(__name__)

_bearer = HTTPBearer(auto_error=False)

_401 = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail={"code": "UNAUTHORIZED", "message": "Could not validate credentials"},
    headers={"WWW-Authenticate": "Bearer"},
)

_403_unverified = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail={"code": "EMAIL_NOT_VERIFIED", "message": "Please verify your email address"},
)


def _decode_supabase_token(token: str) -> Optional[dict]:
    """Decode and validate a Supabase JWT. Returns payload or None."""
    try:
        import base64, json
        # Decode header to see what's being sent
        try:
            header_b64 = token.split(".")[0]
            # Fix padding
            padded = header_b64 + "=" * (-len(header_b64) % 4)
            header = json.loads(base64.urlsafe_b64decode(padded))
            logger.warning("JWT header: %s | token_len=%d | first_20_chars=%s", header, len(token), token[:20])
        except Exception as e:
            logger.warning("JWT header parse failed: %s | token_first_40=%s", e, token[:40])

        return jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except jwt.InvalidTokenError as exc:
        logger.warning("JWT decode failed: %s", exc)
        return None


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
    db: AsyncSession = Depends(get_db),
) -> user_models.User:
    """Extract and validate Supabase JWT from Authorization header."""
    if credentials is None:
        logger.warning("Auth: no credentials provided")
        raise _401

    payload = _decode_supabase_token(credentials.credentials)
    if payload is None:
        logger.warning("Auth: JWT decode returned None (secret mismatch or bad token)")
        raise _401

    sub: Optional[str] = payload.get("sub")
    if not sub:
        logger.warning("Auth: JWT missing 'sub' claim")
        raise _401

    try:
        user_id = uuid.UUID(sub)
    except ValueError:
        logger.warning("Auth: invalid UUID in 'sub': %s", sub)
        raise _401

    user = await user_service.get_user_by_id(db, user_id)
    if user is None:
        logger.warning("Auth: no profile found for user_id=%s — did the migration run?", user_id)
        raise _401

    logger.info("Auth: user authenticated user_id=%s", user_id)
    return user
