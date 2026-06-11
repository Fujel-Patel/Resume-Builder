"""Utility functions for exporting HTML as PDF using WeasyPrint.

Provides:
- ``html_to_pdf``: renders an HTML string (or file) to a PDF file.
- ``export_resume_from_template``: a tiny helper that performs simple placeholder substitution
  on a template HTML string and then generates a PDF.

WeasyPrint handles CSS, images, and external resources via the ``base_url`` argument.
"""

from __future__ import annotations

from pathlib import Path
from typing import List, Optional

from weasyprint import CSS, HTML


def html_to_pdf(
    html_content: str,
    output_path: str | Path,
    base_url: Optional[str] = None,
    css_strings: Optional[List[str]] = None,
) -> None:
    """Render an HTML string to a PDF file.

    Parameters
    ----------
    html_content: str
        Full HTML markup to be rendered.
    output_path: str | Path
        Destination for the generated PDF.
    base_url: Optional[str]
        Base URL used by WeasyPrint to resolve relative URLs (e.g., images, CSS files).
    css_strings: Optional[List[str]]
        List of CSS strings to apply. If omitted, WeasyPrint will use any <style> tags
        present in ``html_content``.
    """
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    html = HTML(string=html_content, base_url=base_url)
    stylesheets = [CSS(string=css) for css in css_strings] if css_strings else None
    html.write_pdf(str(output_path), stylesheets=stylesheets)


def export_resume_from_template(
    template_html: str,
    context: dict,
    output_path: str | Path,
    base_url: Optional[str] = None,
    css_strings: Optional[List[str]] = None,
) -> None:
    """Render a simple placeholder‑based template into a PDF.

    This function does a very light templating step: it replaces ``{{key}}``
    placeholders in ``template_html`` with the corresponding values from ``context``.
    For more complex rendering, integrate Jinja2.
    """
    rendered = template_html
    for key, value in context.items():
        rendered = rendered.replace(f"{{{{{key}}}}}", str(value))
    html_to_pdf(rendered, output_path, base_url=base_url, css_strings=css_strings)
