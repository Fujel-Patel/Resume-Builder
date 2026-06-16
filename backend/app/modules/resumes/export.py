"""Resume PDF export — Jinja2 templates → WeasyPrint PDF."""

from pathlib import Path

from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML

from app.modules.resumes.models import Resume

TEMPLATE_DIR = Path(__file__).parent / "templates"

_env = Environment(loader=FileSystemLoader(str(TEMPLATE_DIR)))


def _build_context(resume: Resume) -> dict:
    data = resume.data
    personal = data.personal if data and data.personal else {}
    return {
        "personal": {
            "first_name": personal.get("first_name", ""),
            "last_name": personal.get("last_name", ""),
            "job_title": personal.get("job_title", ""),
            "email": personal.get("email", ""),
            "mobile": personal.get("mobile", ""),
            "address": personal.get("address", ""),
            "github": personal.get("github", ""),
            "linkedin": personal.get("linkedin", ""),
            "portfolio": personal.get("portfolio", ""),
        },
        "summary": data.summary if data else None,
        "skills": data.skills if data else None,
        "experience": data.experience if data else None,
        "projects": data.projects if data else None,
        "education": data.education if data else None,
        "certifications": data.certifications if data else None,
        "custom_sections": data.custom_sections if data else None,
    }


def render_resume_to_html(resume: Resume) -> str:
    template_id = resume.template_id
    if template_id not in ("classic", "modern", "minimal", "creative"):
        template_id = "modern"

    template = _env.get_template(f"{template_id}.html")
    context = _build_context(resume)
    return template.render(**context)


def render_resume_to_pdf(resume: Resume) -> bytes:
    html_content = render_resume_to_html(resume)
    return HTML(string=html_content, base_url="about:blank").write_pdf()
