"""Thin wrapper around :func:`template_builder.make_resume_docx`.

All previous fragile logic (Jaccard matching, proportional run splitting,
XML ``<w:t>`` manipulation) has been removed.  This module now delegates
entirely to :mod:`template_builder` for programmatic DOCX generation.

The public ``inject_into_docx`` signature is preserved so callers
(routers / services) do not need to change.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

from app.utils.template_builder import make_resume_docx


def inject_into_docx(resume_data: dict[str, Any], output_path: str | Path) -> None:
    """Build a Base-Nova styled DOCX from *resume_data*.

    Parameters
    ----------
    resume_data:
        Dictionary mirroring the frontend ``ResumeData`` shape.
    output_path:
        Destination ``.docx`` file path.
    """
    make_resume_docx(resume_data, output_path)
