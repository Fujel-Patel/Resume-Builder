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

_403_EMAIL_NOT_VERIFIED = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail={"code": "EMAIL_NOT_VERIFIED", "message": "Email not verified"},
)

_jwks_client: Optional[jwt.PyJWKClient] = None


def _get_jwks_client() -> jwt.PyJWKClient:
    """Lazily initialize the JWKS client for Supabase token verification."""
    global _jwks_client
    if _jwks_client is None:
        jwks_url = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/.well-known/jwks.json"
        _jwks_client = jwt.PyJWKClient(jwks_url, cache_keys=True)
        logger.info("JWKS client initialized: %s", jwks_url)
    return _jwks_client


def _decode_supabase_token(token: str) -> Optional[dict]:
    """Decode and validate a Supabase JWT using JWKS. Returns payload or None."""
    try:
        signing_key = _get_jwks_client().get_signing_key_from_jwt(token)
        return jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256", "HS256"],
            audience="authenticated",
        )
    except jwt.InvalidTokenError as exc:
        logger.warning("JWT decode failed: %s", exc)
        return None
    except Exception as exc:
        logger.warning("JWKS error: %s", exc)
        return None


def _check_email_verified(payload: dict) -> None:
    """Raise 403 if the Supabase JWT indicates the email is not confirmed."""
    if not payload.get("email_verified"):
        raise _403_EMAIL_NOT_VERIFIED


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
    db: AsyncSession = Depends(get_db),
) -> user_models.User:
    """Extract and validate Supabase JWT from Authorization header.

    Rejects unverified users (email_verified claim must be True).
    """
    if credentials is None:
        raise _401

    payload = _decode_supabase_token(credentials.credentials)
    if payload is None:
        raise _401

    _check_email_verified(payload)

    sub: Optional[str] = payload.get("sub")
    if not sub:
        raise _401

    try:
        user_id = uuid.UUID(sub)
    except ValueError:
        raise _401

    user = await user_service.get_user_by_id(db, user_id)
    if user is None:
        # Auto-create profile for verified user (trigger may not have fired yet)
        email: str = payload.get("email", "")
        raw_meta = payload.get("raw_user_meta_data") or {}
        name: str = raw_meta.get("name") or raw_meta.get("full_name") or email.split("@")[0]
        user = await user_service.create_user(db, user_id, name, email)

    return user
