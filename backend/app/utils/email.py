"""Email token utilities — generate and hash cryptographically secure tokens."""

import hashlib
import secrets


def generate_email_token() -> str:
    """Generate 48-byte (384-bit) cryptographically secure token."""
    return secrets.token_hex(32)


def hash_email_token(token: str) -> str:
    """SHA-256 hex digest for safe DB storage."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()
