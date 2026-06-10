"""Utility functions for password hashing and verification using bcrypt.

Provides a simple API for generating password hashes and verifying them.
"""

from passlib.context import CryptContext

# Password hashing context following instruction.md best practices
# bcrypt cost factor ≥ 12
pwd_context = CryptContext(schemes=["bcrypt"], bcrypt__rounds=12, deprecated="auto")


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt with cost factor ≥ 10
    Following instruction.md security best practices
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against its hash
    """
    return pwd_context.verify(plain_password, hashed_password)

# Backward compatibility: older code imports ``get_password_hash``
get_password_hash = hash_password