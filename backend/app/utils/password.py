"""Password hashing — Argon2id for new hashes, bcrypt for verification of legacy hashes.

All public functions are async-safe via ``asyncio.to_thread``.
"""

from __future__ import annotations

import asyncio
from typing import Any

from fastapi import HTTPException, status
from loguru import logger

_argon2: Any = None
HAS_ARGON2 = False

try:
    from argon2 import PasswordHasher as Argon2Hasher  # type: ignore[import-untyped]
    from argon2.exceptions import (  # type: ignore[import-untyped]
        VerifyMismatchError,
        InvalidHashError,
    )

    _argon2 = Argon2Hasher(
        time_cost=3,
        memory_cost=65536,
        parallelism=4,
        hash_len=32,
        salt_len=16,
    )
    HAS_ARGON2 = True
except ImportError:
    logger.warning("argon2-cffi not installed — falling back to bcrypt for all hashes")

import bcrypt


def _to_bytes(password: str) -> bytes:
    encoded = password.strip().encode("utf-8")
    if len(encoded) > 72:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "VALIDATION_ERROR",
                "message": f"Password exceeds maximum length (got {len(encoded)} bytes).",
                "fields": {"password": ["Too long"]},
            },
        )
    return encoded


def _is_argon2_hash(hashed: str) -> bool:
    return hashed.startswith("$argon2")


def _hash_sync(password: str) -> str:
    if HAS_ARGON2 and _argon2 is not None:
        return _argon2.hash(password)
    pw_bytes = _to_bytes(password)
    return bcrypt.hashpw(pw_bytes, bcrypt.gensalt(rounds=12)).decode("utf-8")


def _verify_sync(plain: str, hashed: str) -> bool:
    if _is_argon2_hash(hashed):
        if not HAS_ARGON2 or _argon2 is None:
            logger.error("Stored hash is Argon2 but argon2-cffi is not installed")
            return False
        try:
            _argon2.verify(hashed, plain)
            if _argon2.check_needs_rehash(hashed):
                logger.info("Argon2 hash needs rehash — will be updated on next login")
            return True
        except Exception:
            return False
    # Legacy bcrypt hash
    try:
        pw_bytes = _to_bytes(plain)
    except HTTPException:
        return False
    return bcrypt.checkpw(pw_bytes, hashed.encode("utf-8"))


async def hash_password(password: str) -> str:
    return await asyncio.to_thread(_hash_sync, password)


async def verify_password(plain: str, hashed: str) -> bool:
    return await asyncio.to_thread(_verify_sync, plain, hashed)


get_password_hash = hash_password
