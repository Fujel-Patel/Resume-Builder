"""Backward-compatible re-export — prefer ``app.utils.email.hash_email_token``."""

from app.utils.email import hash_email_token as hash_token_sha256

__all__ = ["hash_token_sha256"]
