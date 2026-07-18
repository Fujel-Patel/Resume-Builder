"""Auth module schemas — request/response models with validation."""

import re
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.config.settings import settings
from .exceptions import WeakPasswordError, PasswordTooLongException


_PASSWORD_SPECIAL_RE = re.compile(r"[!@#$%^&*(),.?\":{}|<>_\-+=\[\]\\/;]")


def _validate_password_strength(v: str) -> str:
    min_len = getattr(settings, "PASSWORD_MIN_LENGTH", 12)
    max_bytes = getattr(settings, "PASSWORD_MAX_BYTES", 72)
    if len(v) < min_len:
        raise WeakPasswordError([f"Password must be at least {min_len} characters"])
    byte_len = len(v.encode("utf-8"))
    if byte_len > max_bytes:
        raise PasswordTooLongException(byte_len)
    missing = []
    if not re.search(r"[A-Z]", v):
        missing.append("uppercase letter")
    if not re.search(r"[a-z]", v):
        missing.append("lowercase letter")
    if not re.search(r"\d", v):
        missing.append("digit")
    if not _PASSWORD_SPECIAL_RE.search(v):
        missing.append("special character")
    if missing:
        raise WeakPasswordError([f"Password must contain at least one {m}" for m in missing])
    return v


class UserBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr

    model_config = ConfigDict(from_attributes=True, str_strip_whitespace=True)


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=72)

    model_config = ConfigDict(str_strip_whitespace=True)

    @field_validator("name")
    @classmethod
    def validate_name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Name cannot be empty")
        return v

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        return _validate_password_strength(v)


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    avatar_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True, str_strip_whitespace=True)


class UserInDBBase(UserBase):
    id: UUID
    is_verified: bool
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True, str_strip_whitespace=True)


class UserInDB(UserInDBBase):
    pass


class UserResponse(UserInDBBase):
    status: Optional[str] = None
    email_verified: Optional[bool] = None
    verified_at: Optional[datetime] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

    model_config = ConfigDict(str_strip_whitespace=True)


class RefreshTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

    model_config = ConfigDict(str_strip_whitespace=True)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    model_config = ConfigDict(str_strip_whitespace=True)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr

    model_config = ConfigDict(str_strip_whitespace=True)


class ResetPasswordRequest(BaseModel):
    token: str
    password: str = Field(..., min_length=8, max_length=72)

    model_config = ConfigDict(str_strip_whitespace=True)

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        return _validate_password_strength(v)


class VerifyEmailRequest(BaseModel):
    token: str

    model_config = ConfigDict(str_strip_whitespace=True)


class ResendVerificationRequest(BaseModel):
    email: EmailStr

    model_config = ConfigDict(str_strip_whitespace=True)
