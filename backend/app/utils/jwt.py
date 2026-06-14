"""JWT utilities — pyjwt only. Refresh token hashed with SHA-256 (bcrypt is wrong tool for random tokens)."""

import hashlib
import hmac
import secrets
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

import jwt
from jwt import PyJWTError

from app.config.settings import settings


# ---------------------------------------------------------------------------
# Token creation
# ---------------------------------------------------------------------------

def _exp(delta: Optional[timedelta], minutes: int = None, days: int = None) -> datetime:
    if delta:
        return datetime.utcnow() + delta
    if minutes:
        return datetime.utcnow() + timedelta(minutes=minutes)
    if days:
        return datetime.utcnow() + timedelta(days=days)
    raise ValueError("Must supply delta, minutes, or days")


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    payload = {**data, "exp": _exp(expires_delta, minutes=settings.JWT_ACCESS_EXPIRE_MINUTES)}
    return jwt.encode(payload, settings.JWT_ACCESS_SECRET, algorithm="HS256")


def create_refresh_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    payload = {**data, "exp": _exp(expires_delta, days=settings.JWT_REFRESH_EXPIRE_DAYS)}
    return jwt.encode(payload, settings.JWT_REFRESH_SECRET, algorithm="HS256")


# ---------------------------------------------------------------------------
# Token verification
# ---------------------------------------------------------------------------

def verify_token(token: str, secret: str) -> Optional[Dict[str, Any]]:
    try:
        return jwt.decode(token, secret, algorithms=["HS256"], options={"verify_aud": False})
    except PyJWTError:
        return None


def verify_access_token(token: str) -> Optional[Dict[str, Any]]:
    return verify_token(token, settings.JWT_ACCESS_SECRET)


def verify_refresh_token(token: str) -> Optional[Dict[str, Any]]:
    return verify_token(token, settings.JWT_REFRESH_SECRET)


# ---------------------------------------------------------------------------
# Refresh token storage — SHA-256 hash (tokens are already random 32-byte values;
# bcrypt overhead is unnecessary and passlib broke on bcrypt >= 4.0.0)
# ---------------------------------------------------------------------------

def hash_refresh_token(token: str) -> str:
    """SHA-256 hex digest of a refresh token for DB storage."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def verify_refresh_token_hash(plain_token: str, stored_hash: str) -> bool:
    """Timing-safe comparison of a plain token against its stored hash."""
    return hmac.compare_digest(hash_refresh_token(plain_token), stored_hash)


def generate_state_parameter() -> str:
    return secrets.token_urlsafe(32)
