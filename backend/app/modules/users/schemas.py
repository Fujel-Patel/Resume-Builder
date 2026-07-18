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
        from app.modules.auth.schemas import _validate_password_strength
        return _validate_password_strength(v)


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
    status: Optional[str] = None
    email_verified: Optional[bool] = None
    verified_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
