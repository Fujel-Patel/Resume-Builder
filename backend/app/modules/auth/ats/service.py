from backend.app.modules.auth.ats import models
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
import json
from typing import Optional, List
from backend.app.modules.auth.ats import schemas
from app.modules.ai import service as ai_service
from app.modules.resumes import service as resume_service


async def get_scan_by_id(
    db: AsyncSession, scan_id: uuid.UUID
) -> Optional[models.ATSScan]:
    """Get ATS scan by ID"""
    query = select(models.ATSScan).where(models.ATSScan.id == scan_id)
    result = await db.execute(query)
    return result.scalars().first()


async def get_scans_by_user(
    db: AsyncSession, user_id: uuid.UUID, skip: int = 0, limit: int = 100
) -> List[models.ATSScan]:
    """Get ATS scans for a user"""
    query = (
        select(models.ATSScan)
        .where(models.ATSScan.user_id == user_id)
        .offset(skip)
        .limit(limit)
        .order_by(models.ATSScan.created_at.desc())
    )
    result = await db.execute(query)
    return result.scalars().all()


async def create_scan(
    db: AsyncSession,
    user_id: uuid.UUID,
    scan_create: schemas.ATSScanCreate
) -> models.ATSScan:
    """Create a new ATS scan"""
    # Get resume text if resume_id is provided
    resume_text = None
    if scan_create.resume_id:
        resume = await resume_service.get_resume_by_id(db, uuid.UUID(scan_create.resume_id))
        if resume:
            # Get resume data and convert to text for analysis
            resume_data = await resume_service.get_resume_data(db, resume.id)
            resume_text = _resume_data_to_text(resume_data)
        else:
            raise ValueError("Resume not found")

    # If we don't have resume text from resume, we'll expect it in the request
    # For now, we'll require resume_text to be provided separately in the API
    # This would be handled in the router

    # For this service method, we expect resume_text to be provided
    # In a real implementation, we'd have a different method signature

    # Create ATS scan instance
    db_scan = models.ATSScan(
        user_id=user_id,
        resume_id=uuid.UUID(scan_create.resume_id) if scan_create.resume_id else None,
        job_description=scan_create.job_description,
        score_report=json.dumps(scan_create.score_report),
        overall_score=scan_create.overall_score,
    )

    db.add(db_scan)
    await db.commit()
    await db.refresh(db_scan)
    return db_scan


def _resume_data_to_text(resume_data: dict) -> str:
    """Convert resume data structure to text for analysis"""
    text_parts = []

    # Personal info
    personal = resume_data.get("personal", {})
    if personal.get("name"):
        text_parts.append(f"Name: {personal['name']}")
    if personal.get("email"):
        text_parts.append(f"Email: {personal['email']}")
    if personal.get("mobile"):
        text_parts.append(f"Mobile: {personal['mobile']}")
    if personal.get("address"):
        text_parts.append(f"Address: {personal['address']}")
    if personal.get("job_title"):
        text_parts.append(f"Job Title: {personal['job_title']}")

    # Links
    links = resume_data.get("personal", {}).get("links", {})
    if links:
        text_parts.append("Links:")
        for key, value in links.items():
            if value:
                text_parts.append(f"  {key.capitalize()}: {value}")

    # Summary
    summary = resume_data.get("summary")
    if summary:
        text_parts.append(f"Summary: {summary}")

    # Skills
    skills = resume_data.get("skills", [])
    if skills:
        text_parts.append(f"Skills: {', '.join(skills)}")

    # Experience
    experience = resume_data.get("experience", [])
    if experience:
        text_parts.append("Experience:")
        for exp in experience:
            if exp.get("company"):
                text_parts.append(f"  {exp['company']} - {exp.get('role', '')} ({exp.get('duration', '')})")
                if exp.get("bullets"):
                    for bullet in exp["bullets"]:
                        text_parts.append(f"    • {bullet}")

    # Projects
    projects = resume_data.get("projects", [])
    if projects:
        text_parts.append("Projects:")
        for proj in projects:
            if proj.get("name"):
                text_parts.append(f"  {proj['name']}")
                if proj.get("description"):
                    text_parts.append(f"    {proj['description']}")
                if proj.get("tech_stack"):
                    text_parts.append(f"    Tech: {', '.join(proj['tech_stack'])}")

    # Education
    education = resume_data.get("education", [])
    if education:
        text_parts.append("Education:")
        for edu in education:
            if edu.get("institution"):
                text_parts.append(f"  {edu['institution']} - {edu.get('degree', '')} ({edu.get('year', '')})")

    # Certifications
    certifications = resume_data.get("certifications", [])
    if certifications:
        text_parts.append("Certifications:")
        for cert in certifications:
            if cert.get("name"):
                text_parts.append(f"  {cert['name']}")
                if cert.get("issuer"):
                    text_parts.append(f"    Issued by: {cert['issuer']}")

    return "\n".join(text_parts)


# This function would be called from the router with resume_text parameter
async def score_resume(
    db: AsyncSession,
    user_id: uuid.UUID,
    resume_text: str,
    job_description: Optional[str] = None
) -> models.ATSScan:
    """Score resume using AI and store results"""
    # Get AI score
    score_result = await ai_service.score_resume_with_ai(
        user_id=str(user_id),
        resume_text=resume_text,
        job_description=job_description,
        db=db
    )

    # Create scan record
    scan_create = schemas.ATSScanCreate(
        job_description=job_description,
        score_report=score_result,
        overall_score=score_result.get("overall_score", 0)
    )

    return await create_scan(db, user_id, scan_create)