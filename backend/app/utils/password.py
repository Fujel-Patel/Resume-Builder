"""Password hashing via direct bcrypt — passlib removed (incompatible with bcrypt >= 4.0.0)."""
import bcrypt
from fastapi import HTTPException, status


def _to_bytes(password: str) -> bytes:
    """Encode + enforce 72-byte bcrypt hard limit."""
    encoded = password.strip().encode("utf-8")
    if len(encoded) > 72:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "VALIDATION_ERROR",
                "message": f"Password exceeds bcrypt limit of 72 bytes (got {len(encoded)} bytes).",
                "fields": {"password": ["Too long — max 72 bytes"]},
            },
        )
    return encoded


def hash_password(password: str) -> str:
    pw_bytes = _to_bytes(password)
    return bcrypt.hashpw(pw_bytes, bcrypt.gensalt(rounds=12)).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        pw_bytes = _to_bytes(plain)
    except HTTPException:
        return False
    return bcrypt.checkpw(pw_bytes, hashed.encode("utf-8"))


# backward compat alias
get_password_hash = hash_password
