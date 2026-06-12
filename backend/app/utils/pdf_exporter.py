"""Utility functions for exporting HTML as PDF using WeasyPrint.

Provides:
- ``html_to_pdf``: renders an HTML string (or file) to a PDF file.
- ``export_resume_from_template``: a tiny helper that performs simple placeholder substitution
  on a template HTML string and then generates a PDF.

WeasyPrint handles CSS, images, and external resources via the ``base_url`` argument.
"""

from __future__ import annotations

import html
from pathlib import Path
from typing import List, Optional

from weasyprint import CSS, HTML


def _sanitize_for_pdf(text: str) -> str:
    """Escape HTML special characters to prevent XSS when rendering user data.

    This strips all HTML tags and attribute, converting the value to plain text.
    Use this before substituting user data into template placeholders.
    """
    return html.escape(text)


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
        When None, defaults to "about:blank" to prevent SSRF via external resource fetching.
    css_strings: Optional[List[str]]
        List of CSS strings to apply. If omitted, WeasyPrint will use any <style> tags
        present in ``html_content``.
    """
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    # Default to about:blank when no base_url is supplied to prevent WeasyPrint
    # from fetching external resources (SSRF prevention).
    safe_base = base_url if base_url is not None else "about:blank"
    html = HTML(string=html_content, base_url=safe_base)
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
    User values are HTML‑escaped before substitution to prevent XSS.
    For more complex rendering, integrate Jinja2.
    """
    rendered = template_html
    for key, value in context.items():
        safe_value = _sanitize_for_pdf(str(value))
        rendered = rendered.replace(f"{{{{{key}}}}}", safe_value)
    html_to_pdf(rendered, output_path, base_url=base_url, css_strings=css_strings)
