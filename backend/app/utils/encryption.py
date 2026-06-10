"""Utility helpers for AES‑256‑GCM encryption and decryption.

This module provides a simple API for encrypting and decrypting sensitive data
(e.g., AI provider API keys) before persisting them to the database.  The
encryption key is sourced from the ``ENCRYPTION_KEY`` environment variable via
the :pymod:`app.config.settings` configuration model.

The implementation follows the security guidelines from the PRD:
- AES‑256‑GCM with a 12‑byte nonce
- 256‑bit key (32 bytes) validated at runtime
- Base64‑url encoding for safe storage in text fields
- Explicit ``ValueError`` on mis‑configuration
- All functions raise ``cryptography.exceptions.InvalidTag`` when decryption
  fails, allowing callers to treat the error as an authentication/integrity
  failure.
"""

import base64
import os
from typing import Final

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from app.config.settings import settings

# AES‑GCM nonce size (12 bytes) – balances security & performance.
_NONCE_SIZE: Final[int] = 12


def _get_key() -> bytes:
    """Retrieve and validate the encryption key from settings.

    The ``ENCRYPTION_KEY`` environment variable may be provided as raw 32‑byte
    UTF‑8 text or as a base64‑encoded string.  This helper normalises the value to
    exactly 32 bytes, raising ``ValueError`` if the length is incorrect.
    """
    key_raw = settings.ENCRYPTION_KEY
    # Accept base64‐encoded keys for easier handling in deployment environments.
    try:
        key_bytes = base64.urlsafe_b64decode(key_raw)
        if len(key_bytes) == 32:
            return key_bytes
    except Exception:
        # Not valid base64 – fall back to raw bytes.
        pass
    key_bytes = key_raw.encode("utf-8")
    if len(key_bytes) != 32:
        raise ValueError("ENCRYPTION_KEY must resolve to 32 bytes (AES‑256 key)")
    return key_bytes


def encrypt(plain_text: str) -> str:
    """Encrypt ``plain_text`` using AES‑256‑GCM.

    A fresh random nonce is generated for each call.  The output is a base64‑url
    encoded string containing ``nonce || ciphertext`` which can be stored safely
    in a text column.
    """
    key = _get_key()
    aesgcm = AESGCM(key)
    nonce = os.urandom(_NONCE_SIZE)
    ciphertext = aesgcm.encrypt(nonce, plain_text.encode("utf-8"), None)
    encrypted = nonce + ciphertext
    return base64.urlsafe_b64encode(encrypted).decode("utf-8")


def decrypt(cipher_text: str) -> str:
    """Decrypt a value produced by :func:`encrypt`.

    Raises ``cryptography.exceptions.InvalidTag`` if the ciphertext or authentication
    tag is invalid, signalling possible tampering.
    """
    key = _get_key()
    data = base64.urlsafe_b64decode(cipher_text.encode("utf-8"))
    nonce = data[:_NONCE_SIZE]
    ciphertext = data[_NONCE_SIZE:]
    aesgcm = AESGCM(key)
    plain_bytes = aesgcm.decrypt(nonce, ciphertext, None)
    return plain_bytes.decode("utf-8")
