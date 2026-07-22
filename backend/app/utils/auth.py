"""Shared get_current_user dependency — validates Supabase JWT.

Supabase Auth is the source of truth for identity and email verification.
The local `profiles` table stores app profile data only (no password, no
is_verified column). Profiles are created by the DB trigger on email
confirmation, with a safety-net auto-create path here.
"""

from __future__ import annotations

import logging
import uuid
from typing import Any, Optional

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
    detail={"code": "EMAIL_NOT_VERIFIED", "message": "Email is not verified."},
)

_jwks_client: Optional[jwt.PyJWKClient] = None


def _get_jwks_client() -> jwt.PyJWKClient:
    """Lazily initialize the JWKS client for Supabase asymmetric JWT verification."""
    global _jwks_client
    if _jwks_client is None:
        if not settings.SUPABASE_URL:
            raise RuntimeError("SUPABASE_URL is not configured")
        jwks_url = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/.well-known/jwks.json"
        _jwks_client = jwt.PyJWKClient(jwks_url, cache_keys=True)
        logger.info("JWKS client initialized: %s", jwks_url)
    return _jwks_client


def _decode_with_jwks(token: str) -> Optional[dict[str, Any]]:
    """Decode using Supabase JWKS (ES256 / RS256)."""
    try:
        signing_key = _get_jwks_client().get_signing_key_from_jwt(token)
        return jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256", "RS256"],
            audience="authenticated",
        )
    except jwt.InvalidTokenError as exc:
        logger.debug("JWKS JWT decode failed: %s", exc)
        return None
    except Exception as exc:
        logger.warning("JWKS client error: %s", exc)
        return None


def _decode_with_secret(token: str) -> Optional[dict[str, Any]]:
    """Fallback: legacy HS256 tokens signed with SUPABASE_JWT_SECRET."""
    secret = settings.SUPABASE_JWT_SECRET
    if not secret:
        return None
    try:
        return jwt.decode(
            token,
            secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except jwt.InvalidTokenError as exc:
        logger.debug("HS256 JWT decode failed: %s", exc)
        return None


def _decode_supabase_token(token: str) -> Optional[dict[str, Any]]:
    """Decode and validate a Supabase access token.

    Tries JWKS (current Supabase signing keys) first, then HS256 secret
    for projects still on the legacy JWT secret.
    """
    if not token:
        return None

    payload = _decode_with_jwks(token)
    if payload is not None:
        return payload

    return _decode_with_secret(token)


def _is_email_verified(payload: dict[str, Any]) -> bool:
    """Return True when the Supabase JWT indicates a confirmed email.

    Supabase access tokens include `email_verified` (bool) for confirmed users.
    We also accept a few legacy/alternate shapes for resilience.
    """
    claim = payload.get("email_verified")
    if claim is True:
        return True
    if claim is False or claim is None:
        # Some older tokens omit the claim; treat missing as unverified
        # unless app_metadata explicitly marks the provider as confirmed.
        pass
    if isinstance(claim, str) and claim.lower() in {"true", "1", "yes"}:
        return True
    if claim == 1:
        return True

    # app_metadata.email_verified (rare custom claims / hooks)
    app_meta = payload.get("app_metadata")
    if isinstance(app_meta, dict):
        nested = app_meta.get("email_verified")
        if nested is True or (isinstance(nested, str) and nested.lower() == "true"):
            return True

    return bool(claim)


def _check_email_verified(payload: dict[str, Any]) -> None:
    """Raise 403 if the Supabase JWT indicates the email is not confirmed."""
    if not _is_email_verified(payload):
        raise _403_EMAIL_NOT_VERIFIED


def _extract_display_name(payload: dict[str, Any], email: str) -> str:
    """Pull display name from JWT user_metadata (not raw_user_meta_data)."""
    # Access tokens expose `user_metadata`; DB rows use raw_user_meta_data.
    meta = payload.get("user_metadata") or payload.get("raw_user_meta_data") or {}
    if not isinstance(meta, dict):
        meta = {}
    name = meta.get("name") or meta.get("full_name") or meta.get("display_name")
    if isinstance(name, str) and name.strip():
        return name.strip()[:255]
    local = email.split("@")[0] if email else "User"
    return local[:255] or "User"


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
    db: AsyncSession = Depends(get_db),
) -> user_models.User:
    """Extract and validate Supabase JWT from Authorization header.

    Rejects unverified users (email_verified claim must be truthy).
    Auto-creates a profile row if the confirmation trigger has not fired yet
    but the JWT already proves the email is verified.
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
        email: str = str(payload.get("email") or "")
        name = _extract_display_name(payload, email)
        user = await user_service.create_user(db, user_id, name, email)
        logger.info("Auto-created profile for verified user %s", user_id)

    return user


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
    db: AsyncSession = Depends(get_db),
) -> Optional[user_models.User]:
    """Like get_current_user but returns None instead of raising 401."""
    if credentials is None:
        return None
    try:
        return await get_current_user(credentials=credentials, db=db)
    except HTTPException:
        return None
