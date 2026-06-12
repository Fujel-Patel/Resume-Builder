"""Utility functions for JWT creation, verification, and related helpers.

The module uses the ``pyjwt`` library for token handling and ``passlib`` for hashing
refresh tokens before they are persisted.  All secrets and default expiration values
are obtained from :pymod:`app.config.settings`.
"""

import secrets
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

import jwt  # pyjwt
from jwt import PyJWTError
from passlib.context import CryptContext

from app.config.settings import settings


def _expiration(
    delta: Optional[timedelta],
    default_minutes: Optional[int] = None,
    default_days: Optional[int] = None,
) -> datetime:
    """Calculate the expiration ``datetime`` for a token.

    If ``delta`` is supplied it overrides the default; otherwise the function uses
    either ``default_minutes`` (access token) or ``default_days`` (refresh token).
    """
    if delta:
        return datetime.utcnow() + delta
    if default_minutes is not None:
        return datetime.utcnow() + timedelta(minutes=default_minutes)
    if default_days is not None:
        return datetime.utcnow() + timedelta(days=default_days)
    raise ValueError("Either a delta or a default expiration must be provided")


def create_access_token(
    data: Dict[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    """Create a signed JWT access token.

    The payload contains the supplied ``data`` plus an ``exp`` claim.  If
    ``expires_delta`` is omitted the ``JWT_ACCESS_EXPIRE_MINUTES`` setting is used.
    """
    to_encode = data.copy()
    expire = _expiration(
        expires_delta, default_minutes=settings.JWT_ACCESS_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_ACCESS_SECRET, algorithm="HS256")


def create_refresh_token(
    data: Dict[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    """Create a signed JWT refresh token.

    The payload contains the supplied ``data`` plus an ``exp`` claim.  If
    ``expires_delta`` is omitted the ``JWT_REFRESH_EXPIRE_DAYS`` setting is used.
    """
    to_encode = data.copy()
    expire = _expiration(expires_delta, default_days=settings.JWT_REFRESH_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_REFRESH_SECRET, algorithm="HS256")


def decode_token(token: str) -> Dict[str, Any]:
    """Decode *and* verify a JWT, returning its payload.

    The function attempts verification with the access secret first and, if that
    fails, retries with the refresh secret.  ``PyJWTError`` is raised for any
    validation problem.
    """
    for secret in (settings.JWT_ACCESS_SECRET, settings.JWT_REFRESH_SECRET):
        try:
            payload = jwt.decode(
                token, secret, algorithms=["HS256"], options={"verify_aud": False}
            )
            return payload
        except PyJWTError:
            continue
    raise PyJWTError("Invalid token or signature")


def verify_token(token: str, secret_key: str) -> Optional[Dict[str, Any]]:
    """Verify ``token`` using ``secret_key`` and return the payload if valid.

    Returns ``None`` when verification fails.
    """
    try:
        return jwt.decode(
            token, secret_key, algorithms=["HS256"], options={"verify_aud": False}
        )
    except PyJWTError:
        return None


def verify_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Convenience wrapper to verify an access token."""
    return verify_token(token, settings.JWT_ACCESS_SECRET)


def verify_refresh_token(token: str) -> Optional[Dict[str, Any]]:
    """Convenience wrapper to verify a refresh token."""
    return verify_token(token, settings.JWT_REFRESH_SECRET)


# ---------------------------------------------------------------------------
# Refresh‑token hashing utilities – the database stores only a bcrypt hash.
# ---------------------------------------------------------------------------

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_refresh_token(token: str) -> str:
    """Hash a refresh token for safe storage in the database."""
    return _pwd_context.hash(token)


def verify_refresh_token_hash(plain_token: str, hashed_token: str) -> bool:
    """Verify a plain refresh token against its stored bcrypt hash."""
    return _pwd_context.verify(plain_token, hashed_token)


# ---------------------------------------------------------------------------
# Unused utilities – kept for future use (marked with TODO)
# ---------------------------------------------------------------------------


def timing_safe_compare(a: str, b: str) -> bool:
    """Timing‑safe string comparison to mitigate side‑channel attacks.

    NOTE: Currently unused. passlib's verify() handles timing‑safe comparison
    internally. Prefer ``hmac.compare_digest`` for new HMAC‑based use cases.
    This is kept here for future OAuth state‑parameter verification.
    """
    if len(a) != len(b):
        return False
    result = 0
    for x, y in zip(a, b):
        result |= ord(x) ^ ord(y)
    return result == 0


def generate_state_parameter() -> str:
    """Generate a random URL‑safe state parameter for OAuth flows.

    TODO: Wire into the OAuth authorization endpoint flow once implemented.
    """
    return secrets.token_urlsafe(32)
