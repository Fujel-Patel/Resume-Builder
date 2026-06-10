from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# Personal information schema
class PersonalInfo(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    job_title: Optional[str] = None
    email: Optional[str] = None
    mobile: Optional[str] = None
    address: Optional[str] = None
    pincode: Optional[str] = None
    links: Optional[Dict[str, str]] = None  # github, linkedin, portfolio


class ResumeBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    template_id: str = Field(..., pattern="^(classic|modern|minimal|creative)$")


class ResumeCreate(ResumeBase):
    pass  # Inherits title and template_id


class ResumeUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    template_id: Optional[str] = Field(None, pattern="^(classic|modern|minimal|creative)$")


class ResumeInDBBase(ResumeBase):
    id: str
    user_id: str
    is_deleted: bool
    deleted_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ResumeInDB(ResumeInDBBase):
    pass


class ResumeResponse(ResumeInDBBase):
    pass


# Resume data schema
class ResumeDataBase(BaseModel):
    personal: PersonalInfo
    summary: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    experience: List[Dict[str, Any]] = Field(default_factory=list)
    projects: List[Dict[str, Any]] = Field(default_factory=list)
    education: List[Dict[str, Any]] = Field(default_factory=list)
    certifications: List[Dict[str, Any]] = Field(default_factory=list)
    custom_sections: List[Dict[str, Any]] = Field(default_factory=list)


class ResumeDataCreate(ResumeDataBase):
    pass


class ResumeDataUpdate(BaseModel):
    personal: Optional[PersonalInfo] = None
    summary: Optional[str] = None
    skills: Optional[List[str]] = None
    experience: Optional[List[Dict[str, Any]]] = None
    projects: Optional[List[Dict[str, Any]]] = None
    education: Optional[List[Dict[str, Any]]] = None
    certifications: Optional[List[Dict[str, Any]]] = None
    custom_sections: Optional[List[Dict[str, Any]]] = None


class ResumeDataInDBBase(ResumeDataBase):
    id: str
    resume_id: str
    updated_at: datetime

    class Config:
        from_attributes = True


class ResumeDataInDB(ResumeInDBBase):
    pass


class ResumeDataResponse(ResumeInDBBase):
    pass


# Combined resume response for API
class ResumeWithDataResponse(BaseModel):
    resume: ResumeResponse
    data: ResumeDataResponse

    class Config:
        from_attributes = True