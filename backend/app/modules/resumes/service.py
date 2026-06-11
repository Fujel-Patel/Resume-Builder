import uuid
from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.resumes import models, schemas
from app.modules.users import models as user_models
from app.utils.pdf_exporter import export_resume_from_template, html_to_pdf
from app.utils.pdf_parser import extract_metadata, extract_text


class ResumeService:
    def __init__(self, db: AsyncSession):
        self.db = db

    # ------------------------------------------------------------------
    # Basic CRUD
    # ------------------------------------------------------------------
    async def get_resume_by_id(self, resume_id: uuid.UUID) -> models.Resume:
        """Get a resume by ID, raising 404 if not found."""
        result = await self.db.execute(
            select(models.Resume).where(models.Resume.id == resume_id)
        )
        resume = result.scalars().first()
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")
        return resume

    async def get_resumes_by_user(self, user_id: uuid.UUID) -> List[models.Resume]:
        """Get all active resumes for a given user."""
        result = await self.db.execute(
            select(models.Resume)
            .where(models.Resume.user_id == user_id, models.Resume.is_active == True)
            .order_by(models.Resume.created_at.desc())
        )
        return result.scalars().all()

    async def create_resume(
        self, user_id: uuid.UUID, resume_in: schemas.ResumeCreate
    ) -> models.Resume:
        """Create a new resume for the user."""
        resume = models.Resume(
            user_id=user_id,
            title=resume_in.title,
            data=resume_in.data,
            file_url=str(resume_in.file_url) if resume_in.file_url else None,
        )
        self.db.add(resume)
        await self.db.commit()
        await self.db.refresh(resume)
        return resume

    async def update_resume(
        self, resume_id: uuid.UUID, resume_in: schemas.ResumeUpdate
    ) -> models.Resume:
        """Update an existing resume (partial update)."""
        resume = await self.get_resume_by_id(resume_id)
        update_data = resume_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if field == "file_url" and value is not None:
                value = str(value)
            setattr(resume, field, value)
        await self.db.commit()
        await self.db.refresh(resume)
        return resume

    async def deactivate_resume(self, resume_id: uuid.UUID) -> None:
        """Soft‑delete a resume by setting is_active to False."""
        resume = await self.get_resume_by_id(resume_id)
        resume.is_active = False
        await self.db.commit()

    # ------------------------------------------------------------------
    # AI‑assisted generation (placeholder – calls AI module)
    # ------------------------------------------------------------------
    async def generate_resume_with_ai(
        self,
        user_id: uuid.UUID,
        ai_prompt: str,
        template_html: str,
        css_strings: Optional[list[str]] = None,
    ) -> models.Resume:
        """
        Placeholder for AI‑driven resume generation.
        In a full implementation, this would:
          1. Call the AI module (e.g., app.modules.ai.service) to generate structured resume data.
          2. Render the data into HTML using the provided template.
          3. Convert HTML to PDF via WeasyPrint.
          4. Store the PDF URL (e.g., in object storage) and the structured data.
        For now, we raise NotImplementedError to indicate the delegation.
        """
        raise NotImplementedError("AI generation delegated to AI module")

    # ------------------------------------------------------------------
    # PDF export helpers (uses utils)
    # ------------------------------------------------------------------
    async def export_resume_to_pdf(
        self,
        resume_id: uuid.UUID,
        html_content: str,
        output_dir: str | Path,
        base_url: Optional[str] = None,
        css_strings: Optional[list[str]] = None,
    ) -> str:
        """
        Generates a PDF from HTML and returns a file system path.
        The actual uploading to Supabase/S3 would be handled elsewhere.
        """
        from pathlib import Path

        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        pdf_path = output_dir / f"resume_{resume_id}.pdf"

        html_to_pdf(
            html_content=html_content,
            output_path=pdf_path,
            base_url=base_url,
            css_strings=css_strings,
        )
        # Return a relative path or signed URL – implementation depends on storage layer
        return str(pdf_path)

    async def extract_resume_text(self, pdf_path: str | Path) -> str:
        """Convenience wrapper – delegates to pdf_parser."""
        return extract_text(pdf_path)

    async def extract_resume_metadata(self, pdf_path: str | Path) -> dict:
        """Convenience wrapper – delegates to pdf_parser."""
        return extract_metadata(pdf_path)
