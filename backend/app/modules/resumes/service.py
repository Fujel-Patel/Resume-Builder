from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
import re
from datetime import datetime
from typing import Optional, List, Tuple
from app.modules.resumes import models, schemas
from app.modules.ai_providers import service as ai_provider_service
from app.utils.encryption import encrypt_data, decrypt_data
from app.utils.ownership import assert_ownership
from app.utils.ai import extract_resume_text  # We'll create this utility


async def get_resume_by_id(
    db: AsyncSession, resume_id: uuid.UUID
) -> Optional[models.Resume]:
    """Get resume by ID"""
    query = select(models.Resume).where(models.Resume.id == resume_id)
    result = await db.execute(query)
    return result.scalars().first()


async def get_resume_by_id_and_user(
    db: AsyncSession, resume_id: uuid.UUID, user_id: uuid.UUID
) -> Optional[models.Resume]:
    """Get resume by ID and user ID with ownership check"""
    query = select(models.Resume).where(
        models.Resume.id == resume_id,
        models.Resume.user_id == user_id,
        models.Resume.is_deleted == False
    )
    result = await db.execute(query)
    return result.scalars().first()


async def get_resumes_by_user(
    db: AsyncSession, user_id: uuid.UUID, skip: int = 0, limit: int = 100
) -> List[models.Resume]:
    """Get resumes for a user"""
    query = (
        select(models.Resume)
        .where(models.Resume.user_id == user_id, models.Resume.is_deleted == False)
        .offset(skip)
        .limit(limit)
        .order_by(models.Resume.created_at.desc())
    )
    result = await db.execute(query)
    return result.scalars().all()


async def create_resume(
    db: AsyncSession,
    user_id: uuid.UUID,
    resume_create: schemas.ResumeCreate
) -> models.Resume:
    """Create a new resume"""
    db_resume = models.Resume(
        user_id=user_id,
        title=resume_create.title,
        template_id=resume_create.template_id,
    )

    db.add(db_resume)
    await db.commit()
    await db.refresh(db_resume)

    # Create initial resume data
    initial_data = schemas.ResumeDataCreate(
        personal=schemas.PersonalInfo(),
        summary="",
        skills=[],
        experience=[],
        projects=[],
        education=[],
        certifications=[],
        custom_sections=[]
    )

    await create_resume_data(db, db_resume.id, initial_data)

    return db_resume


async def update_resume(
    db: AsyncSession,
    resume_id: uuid.UUID,
    user_id: uuid.UUID,
    resume_update: schemas.ResumeUpdate
) -> Optional[models.Resume]:
    """Update resume"""
    resume = await get_resume_by_id_and_user(db, resume_id, user_id)
    if not resume:
        return None

    update_data = resume_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(resume, field, value)

    db.add(resume)
    await db.commit()
    await db.refresh(resume)
    return resume


async def delete_resume(
    db: AsyncSession,
    resume_id: uuid.UUID,
    user_id: uuid.UUID
) -> bool:
    """Soft delete resume"""
    resume = await get_resume_by_id_and_user(db, resume_id, user_id)
    if not resume:
        return False

    resume.is_deleted = True
    resume.deleted_at = datetime.utcnow()
    db.add(resume)
    await db.commit()
    return True


async def get_resume_data(
    db: AsyncSession, resume_id: uuid.UUID
) -> Optional[models.ResumeData]:
    """Get resume data by resume ID"""
    query = select(models.ResumeData).where(models.ResumeData.resume_id == resume_id)
    result = await db.execute(query)
    return result.scalars().first()


async def create_resume_data(
    db: AsyncSession,
    resume_id: uuid.UUID,
    resume_data_create: schemas.ResumeDataCreate
) -> models.ResumeData:
    """Create resume data"""
    db_resume_data = models.ResumeData(
        resume_id=resume_id,
        personal=resume_data_create.personal.model_dump(),
        summary=resume_data_create.summary,
        skills=resume_data_create.skills,
        experience=resume_data_create.experience,
        projects=resume_data_create.projects,
        education=resume_data_create.education,
        certifications=resume_data_create.certifications,
        custom_sections=resume_data_create.custom_sections
    )

    db.add(db_resume_data)
    await db.commit()
    await db.refresh(db_resume_data)
    return db_resume_data


async def update_resume_data(
    db: AsyncSession,
    resume_id: uuid.UUID,
    resume_data_update: schemas.ResumeDataUpdate
) -> Optional[models.ResumeData]:
    """Update resume data"""
    resume_data = await get_resume_data(db, resume_id)
    if not resume_data:
        return None

    update_data = resume_data_update.model_dump(exclude_unset=True)

    # Handle personal info update specially since it's a nested object
    if "personal" in update_data and update_data["personal"] is not None:
        # Merge with existing personal data
        current_personal = resume_data.personal or {}
        update_personal = update_data["personal"].model_dump(exclude_unset=True)
        current_personal.update(update_personal)
        resume_data.personal = current_personal
        del update_data["personal"]

    # Update other fields
    for field, value in update_data.items():
        setattr(resume_data, field, value)

    db.add(resume_data)
    await db.commit()
    await db.refresh(resume_data)
    return resume_data


async def upload_and_parse_resume(
    db: AsyncSession,
    user_id: uuid.UUID,
    file_content: bytes,
    filename: str
) -> Tuple[models.Resume, models.ResumeData]:
    """
    Upload and parse resume file (PDF/DOCX) -> extract text -> populate form
    Following PRD: Existing resume upload → auto-scan → populate form
    """
    # Validate file type
    if not filename.lower().endswith(('.pdf', '.docx')):
        raise ValueError("Only PDF and DOCX files are supported")

    # Validate file size (5MB limit as per instruction.md)
    if len(file_content) > 5 * 1024 * 1024:  # 5MB
        raise ValueError("File size exceeds 5MB limit")

    # Extract text from file
    resume_text = extract_resume_text(file_content, filename)
    if not resume_text.strip():
        raise ValueError("Could not extract text from resume file")

    # Parse resume text to structured data (would use AI in production)
    # For now, we'll create a basic structure
    parsed_data = _parse_resume_text(resume_text)

    # Create resume
    resume_create = schemas.ResumeCreate(
        title=f"Uploaded Resume - {filename}",
        template_id="classic"  # Default template
    )

    resume = await create_resume(db, user_id, resume_create)

    # Create resume data with parsed information
    resume_data_create = schemas.ResumeDataCreate(**parsed_data)
    resume_data = await create_resume_data(db, resume.id, resume_data_create)

    return resume, resume_data


def _parse_resume_text(resume_text: str) -> dict:
    """
    Parse resume text into structured data
    In production, this would use AI to extract structured information
    For MVP, we'll return empty/default values
    """
    # This is a simplified parser - in production would use NLP/AI
    lines = resume_text.split('\n')

    # Basic extraction logic (would be much more sophisticated in production)
    personal_info = {}
    summary = ""
    skills = []
    experience = []
    projects = []
    education = []
    certifications = []
    custom_sections = []

    # Very basic parsing - would be replaced with AI-powered extraction
    current_section = None
    section_content = []

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Detect section headers (very basic)
        lower_line = line.lower()
        if any(keyword in lower_line for keyword in ['summary', 'profile', 'objective']):
            if section_content and current_section:
                personal_info, summary, skills, experience, projects, education, certifications, custom_sections = \
                    _add_section_content(current_section, section_content, personal_info, summary, skills, experience, projects, education, certifications, custom_sections)
            section_content = []
            current_section = "summary"
        elif any(keyword in lower_line for keyword in ['skill', 'technical', 'technology']):
            if section_content and current_section:
                personal_info, summary, skills, experience, projects, education, certifications, custom_sections = \
                    _add_section_content(current_section, section_content, personal_info, summary, skills, experience, projects, education, certifications, custom_sections)
            section_content = []
            current_section = "skills"
        elif any(keyword in lower_line for keyword in ['experience', 'employment', 'work']):
            if section_content and current_section:
                personal_info, summary, skills, experience, projects, education, certifications, custom_sections = \
                    _add_section_content(current_section, section_content, personal_info, summary, skills, experience, projects, education, certifications, custom_sections)
            section_content = []
            current_section = "experience"
        elif any(keyword in lower_line for keyword in ['project', 'portfolio']):
            if section_content and current_section:
                personal_info, summary, skills, experience, projects, education, certifications, custom_sections = \
                    _add_section_content(current_section, section_content, personal_info, summary, skills, experience, projects, education, certifications, custom_sections)
            section_content = []
            current_section = "projects"
        elif any(keyword in lower_line for keyword in ['education', 'academic', 'university', 'college']):
            if section_content and current_section:
                personal_info, summary, skills, experience, projects, education, certifications, custom_sections = \
                    _add_section_content(current_section, section_content, personal_info, summary, skills, experience, projects, education, certifications, custom_sections)
            section_content = []
            current_section = "education"
        elif any(keyword in lower_line for keyword in ['certification', 'certificate', 'license']):
            if section_content and current_section:
                personal_info, summary, skills, experience, projects, education, certifications, custom_sections = \
                    _add_section_content(current_section, section_content, personal_info, summary, skills, experience, projects, education, certifications, custom_sections)
            section_content = []
            current_section = "certifications"
        else:
            section_content.append(line)

    # Add last section
    if section_content and current_section:
        personal_info, summary, skills, experience, projects, education, certifications, custom_sections = \
            _add_section_content(current_section, section_content, personal_info, summary, skills, experience, projects, education, certifications, custom_sections)

    return {
        "personal": personal_info,
        "summary": summary,
        "skills": skills,
        "experience": experience,
        "projects": projects,
        "education": education,
        "certifications": certifications,
        "custom_sections": custom_sections
    }


def _add_section_content(section_type, content_lines, personal_info, summary, skills, experience, projects, education, certifications, custom_sections):
    """Helper to add content to appropriate section"""
    content = ' '.join(content_lines).strip()
    if not content:
        return personal_info, summary, skills, experience, projects, education, certifications, custom_sections

    if section_type == "summary":
        summary = content
    elif section_type == "skills":
        # Split by common delimiters
        skill_list = [s.strip() for s in re.split(r'[,;|\n]', content) if s.strip()]
        skills.extend(skill_list)
    elif section_type == "experience":
        # Very basic experience parsing
        experience.append({
            "company": "",
            "role": "",
            "duration": "",
            "bullets": [content]
        })
    elif section_type == "projects":
        # Very basic project parsing
        projects.append({
            "name": "",
            "description": content,
            "link": "",
            "tech_stack": []
        })
    elif section_type == "education":
        # Very basic education parsing
        education.append({
            "institution": content,
            "degree": "",
            "year": "",
            "grade": ""
        })
    elif section_type == "certifications":
        # Very basic certification parsing
        certifications.append({
            "name": content,
            "issuer": "",
            "year": "",
            "link": ""
        })
    else:
        # Personal info or custom section
        # Try to parse as key-value for personal info
        if ':' in content:
            key, value = content.split(':', 1)
            key = key.strip().lower().replace(' ', '_')
            personal_info[key] = value.strip()
        else:
            # Treat as custom section
            custom_sections.append({
                "label": "Information",
                "content": content
            })

    return personal_info, summary, skills, experience, projects, education, certifications, custom_sections


# This function would be called from the router
async def export_resume_as_pdf(
    db: AsyncSession,
    resume_id: uuid.UUID,
    user_id: uuid.UUID
) -> bytes:
    """Export resume as PDF"""
    # Get resume and data with ownership check
    resume = await get_resume_by_id_and_user(db, resume_id, user_id)
    if not resume:
        raise ValueError("Resume not found or access denied")

    resume_data = await get_resume_data(db, resume_id)
    if not resume_data:
        raise ValueError("Resume data not found")

    # In production, this would use WeasyReportLab or similar to generate PDF
    # For now, return a placeholder
    return b"PDF generation would be implemented here"