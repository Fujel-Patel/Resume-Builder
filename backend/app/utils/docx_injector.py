"""Inject optimized resume content into a DOCX using the Base-Nova template builder.

For both PDF and DOCX uploads, builds a uniformly styled DOCX from the
reference template, eliminating the need for fragile XML-level text replacement.
"""

from __future__ import annotations

from pathlib import Path

from app.utils.template_builder import make_resume_docx


def inject_into_docx(
    original_path: str | Path,
    parsed: dict,
    optimized: dict,
    output_path: str | Path,
) -> None:
    """Build a styled DOCX from optimized resume data.

    Args:
        original_path: Path to original uploaded file (PDF or DOCX).
                       Used only for reference; content comes from optimized dict.
        parsed: AI-parsed resume content as dict.
        optimized: AI-optimized resume content as dict.
        output_path: Path where the output DOCX will be saved.
    """
    make_resume_docx(output_path, parsed, optimized)
