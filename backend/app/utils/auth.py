"""Supabase JWT authentication dependency."""

from __future__ import annotations

import logging
import uuid
from typing import Optional

import jwt
from jwt import PyJWKClient
from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.database import get_db
from app.config.settings import settings
from app.modules.users import models as user_models
from app.modules.users import service as user_service

_jwks_url = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/.well-known/jwks.json"
_jwk_client = PyJWKClient(_jwks_url, cache_keys=True, lifespan=3600)

logger = logging.getLogger(__name__)

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

    Uses JWKS-based verification so the correct signing key (ES256/RS256)
    is selected automatically from the token's ``kid`` header.
    """
    if not authorization or not authorization.startswith("Bearer "):
        logger.warning("auth: missing or malformed Authorization header")
        raise _401

    token = authorization.removeprefix("Bearer ")

    try:
        signing_key = _jwk_client.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256", "RS256"],
            audience="authenticated",
        )
    except (jwt.InvalidTokenError, jwt.PyJWKClientError) as exc:
        logger.warning("auth: JWT verification failed: %s", type(exc).__name__)
        raise _401

    sub: Optional[str] = payload.get("sub")
    if not sub:
        raise _401

    try:
        user_id = uuid.UUID(sub)
    except ValueError:
        raise _401

    try:
        user = await user_service.get_user_by_id(db, user_id)
    except Exception as exc:
        logger.exception("auth: DB read failed for user %s: %s", user_id, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "INTERNAL_ERROR", "message": f"Database error: {type(exc).__name__}: {exc}"},
        )

    if user is None:
        email = str(payload.get("email") or "")
        name = _extract_name(payload, email)
        try:
            user = await user_service.create_user(db, user_id, name, email)
        except IntegrityError:
            # Race: another request created the profile between our read and write.
            await db.rollback()
            user = await user_service.get_user_by_id(db, user_id)
            if user is None:
                raise _401
        except Exception as exc:
            logger.exception("auth: user creation failed for %s: %s", user_id, exc)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={"code": "INTERNAL_ERROR", "message": f"User creation error: {type(exc).__name__}: {exc}"},
            )

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
