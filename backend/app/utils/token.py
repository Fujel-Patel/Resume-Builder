import hashlib
from typing import Any


def hash_token_sha256(token: str) -> str:
    """Return a deterministic SHA-256 hex digest of the given token.
    Used for storing refresh tokens and email verification tokens securely.
    """
    return hashlib.sha256(token.encode("utf-8")).hexdigest()
