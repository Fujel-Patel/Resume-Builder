import re
from datetime import datetime

from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
from .exceptions import WeakPasswordError, PasswordTooLongException

from uuid import UUID


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
        """Enforce password complexity and bcrypt 72‑byte limit.
        Raises:
        - :class:`PasswordTooLongException` if UTF‑8 byte length > 72.
        - :class:`WeakPasswordError` for any other complexity violation.
        """
        # Character‑length minimum (still enforced for usability)
        if len(v) < 8:
            raise WeakPasswordError(["Password must be at least 8 characters"])
        # Byte‑length check for bcrypt
        byte_len = len(v.encode("utf-8"))
        if byte_len > 72:
            raise PasswordTooLongException(byte_len)
        # Complexity checks – collect all missing requirements
        missing = []
        if not re.search(r"[A-Z]", v):
            missing.append("uppercase letter")
        if not re.search(r"[a-z]", v):
            missing.append("lowercase letter")
        if not re.search(r"\d", v):
            missing.append("digit")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>_\-+=\[\]\\/;]", v):
            missing.append("special character")
        if missing:
            raise ValueError("Password must contain uppercase letter")
        return v


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
    pass


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
        """Enforce password complexity and bcrypt 72‑byte limit on reset.
        Raises:
        - :class:`PasswordTooLongException` if UTF‑8 byte length > 72.
        - :class:`WeakPasswordError` for any other complexity violation.
        """
        if len(v) < 8:
            raise WeakPasswordError(["Password must be at least 8 characters"])
        byte_len = len(v.encode("utf-8"))
        if byte_len > 72:
            raise PasswordTooLongException(byte_len)
        missing = []
        if not re.search(r"[A-Z]", v):
            missing.append("uppercase letter")
        if not re.search(r"[a-z]", v):
            missing.append("lowercase letter")
        if not re.search(r"\d", v):
            missing.append("digit")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>_\-+=\[\]\\/;]", v):
            missing.append("special character")
        if missing:
            raise WeakPasswordError([f"Password must contain at least one {m}" for m in missing])
        return v


class VerifyEmailRequest(BaseModel):
    token: str

    model_config = ConfigDict(str_strip_whitespace=True)
