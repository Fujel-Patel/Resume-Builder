"""Supabase JWT authentication dependency."""

from __future__ import annotations

import uuid
from typing import Optional

import jwt
from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.config.settings import settings
from app.modules.users import models as user_models
from app.modules.users import service as user_service

_401 = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail={"code": "UNAUTHORIZED", "message": "Could not validate credentials"},
    headers={"WWW-Authenticate": "Bearer"},
)


async def get_current_user(
    authorization: Optional[str] = Header(default=None),
    db: AsyncSession = Depends(get_db),
) -> user_models.User:
    """Validate a Supabase JWT and return the authenticated user profile.

    Works identically for email/password and Google OAuth users —
    Supabase issues the same HS256-signed JWT regardless of auth method.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise _401

    token = authorization.removeprefix("Bearer ")

    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except jwt.InvalidTokenError:
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
        email = str(payload.get("email") or "")
        name = _extract_name(payload, email)
        user = await user_service.create_user(db, user_id, name, email)

    return user


def _extract_name(payload: dict, email: str) -> str:
    """Pull display name from JWT user_metadata."""
    meta = payload.get("user_metadata") or payload.get("raw_user_meta_data") or {}
    if isinstance(meta, dict):
        name = meta.get("name") or meta.get("full_name") or meta.get("display_name")
        if isinstance(name, str) and name.strip():
            return name.strip()[:255]
    local = email.split("@")[0] if email else "User"
    return local[:255] or "User"
