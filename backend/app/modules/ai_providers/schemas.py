from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class AIProviderBase(BaseModel):
    provider_name: str = Field(..., pattern="^(anthropic|gemini|nvidia-nim|custom)$")
    base_url: Optional[str] = None


class AIProviderCreate(AIProviderBase):
    api_key: str = Field(..., min_length=1)


class AIProviderUpdate(BaseModel):
    base_url: Optional[str] = None
    is_default: Optional[bool] = None


class AIProviderInDBBase(AIProviderBase):
    id: str
    user_id: str
    is_verified: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AIProviderInDB(AIProviderInDBBase):
    pass


class AIProviderResponse(AIProviderInDBBase):
    pass


class AIProviderVerify(BaseModel):
    valid: bool