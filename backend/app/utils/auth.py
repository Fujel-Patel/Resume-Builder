"""Shared get_current_user dependency — validates Supabase JWT."""

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
        return jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except jwt.InvalidTokenError:
        return None


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
    db: AsyncSession = Depends(get_db),
) -> user_models.User:
    """Extract and validate Supabase JWT from Authorization header."""
    if credentials is None:
        raise _401

    payload = _decode_supabase_token(credentials.credentials)
    if payload is None:
        raise _401

    sub: Optional[str] = payload.get("sub")
    if not sub:
        raise _401

    try:
        user_id = uuid.UUID(sub)
    except ValueError:
        raise _401

    user = await user_service.get_user_by_id(db, user_id)
    if user is None:
        raise _401

    return user
