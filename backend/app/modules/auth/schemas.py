from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr

    model_config = ConfigDict(from_attributes=True, str_strip_whitespace=True)


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    avatar_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True, str_strip_whitespace=True)


class UserInDBBase(UserBase):
    id: str
    is_verified: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime

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
    password: str = Field(..., min_length=8)

    model_config = ConfigDict(str_strip_whitespace=True)


class VerifyEmailRequest(BaseModel):
    token: str

    model_config = ConfigDict(str_strip_whitespace=True)