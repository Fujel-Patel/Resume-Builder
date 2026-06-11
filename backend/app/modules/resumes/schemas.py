from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, Field, HttpUrl


class ResumeBase(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    data: Any = Field(
        ..., description="Structured resume data matching ResumeData interface"
    )
    file_url: Optional[HttpUrl] = None


class ResumeCreate(ResumeBase):
    pass  # user_id is set by the service/router from the authenticated user


class ResumeUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    data: Optional[Any] = None
    file_url: Optional[HttpUrl] = None


class ResumeInDBBase(ResumeBase):
    id: UUID
    user_id: UUID
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True  # Pydantic v2


class ResumeInDB(ResumeInDBBase):
    pass


class ResumePublic(ResumeInDBBase):
    """Schema returned to the client – same as InDB for now."""

    pass
