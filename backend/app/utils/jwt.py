from datetime import datetime, timedelta
from typing import Optional, Union
from jose import JWTError, jwt
from passlib.context import CryptContext
import hashlib
import hmac
from app.config.settings import settings


# Password context for hashing refresh tokens (following instruction.md)
# Refresh tokens stored as bcrypt hash in DB — never raw
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_access_token(*, data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create JWT access token
    Following instruction.md: Access JWT: 15 minutes
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.JWT_ACCESS_SECRET, algorithm="HS256"
    )
    return encoded_jwt


def create_refresh_token(*, data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create JWT refresh token
    Following instruction.md: Refresh token: 7 days
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.JWT_REFRESH_SECRET, algorithm="HS256"
    )
    return encoded_jwt


def verify_token(token: str, secret_key: str) -> Optional[dict]:
    """
    Verify JWT token and return payload if valid
    Returns None if token is invalid or expired
    """
    try:
        payload = jwt.decode(token, secret_key, algorithms=["HS256"])
        return payload
    except JWTError:
        return None


def verify_access_token(token: str) -> Optional[dict]:
    """Verify access token specifically"""
    return verify_token(token, settings.JWT_ACCESS_SECRET)


def verify_refresh_token(token: str) -> Optional[dict]:
    """Verify refresh token specifically"""
    return verify_token(token, settings.JWT_REFRESH_SECRET)


def hash_refresh_token(token: str) -> str:
    """
    Hash refresh token for storage in database
    Following instruction.md: Refresh tokens stored as bcrypt hash in DB — never raw
    """
    return pwd_context.hash(token)


def verify_refresh_token_hash(plain_token: str, hashed_token: str) -> bool:
    """
    Verify a plain refresh token against its hash
    """
    return pwd_context.verify(plain_token, hashed_token)


def timing_safe_compare(a: str, b: str) -> bool:
    """
    Timing-safe string comparison to prevent timing attacks
    Following instruction.md: crypto.timingSafeEqual equivalent
    """
    if len(a) != len(b):
        return False

    result = 0
    for x, y in zip(a, b):
        result |= ord(x) ^ ord(y)
    return result == 0


def generate_state_parameter() -> str:
    """Generate state parameter for OAuth to prevent CSRF"""
    return secrets.token_urlsafe(32)


import secrets