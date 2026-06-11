from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr


class UserCreate(UserBase):
    pass  # Inherits name and email


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    avatar_url: Optional[str] = None


class UserInDBBase(UserBase):
    id: str
    is_verified: bool
    is_active: bool
    avatar_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserInDB(UserInDBBase):
    pass


class UserResponse(UserInDBBase):
    pass
