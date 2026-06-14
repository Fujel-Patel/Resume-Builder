"""User module schemas."""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    avatar_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True, str_strip_whitespace=True)


class PasswordChangeRequest(BaseModel):
    """PATCH /users/me/password"""
    current_password: str
    new_password: str = Field(..., min_length=8)

    model_config = ConfigDict(str_strip_whitespace=True)

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        import re
        if len(v.encode("utf-8")) > 72:
            raise ValueError("Password exceeds bcrypt limit of 72 bytes")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Must contain at least one digit")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>_\-+=\[\]\\/;]", v):
            raise ValueError("Must contain at least one special character")
        return v


class DeleteAccountRequest(BaseModel):
    """DELETE /users/me — PRD requires confirmation text."""
    confirmation: str = Field(..., description="Must be exactly 'DELETE MY ACCOUNT'")

    @field_validator("confirmation")
    @classmethod
    def validate_confirmation(cls, v: str) -> str:
        if v.strip() != "DELETE MY ACCOUNT":
            raise ValueError("confirmation must be exactly 'DELETE MY ACCOUNT'")
        return v


class UserResponse(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    avatar_url: Optional[str] = None
    is_verified: bool
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
