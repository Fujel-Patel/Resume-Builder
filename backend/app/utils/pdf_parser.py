"""Utility functions for parsing PDF files using PyMuPDF (fitz).

Provides:
- ``extract_text``: returns the concatenated text of all pages.
- ``extract_metadata``: returns a dictionary of PDF metadata.
- ``extract_images``: extracts all embedded images to a directory and returns a list of file paths.

All functions are synchronous – they operate on file paths and return Python primitives.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List

import fitz  # PyMuPDF


def extract_text(pdf_path: str | Path) -> str:
    """Extract plain text from a PDF.

    Parameters
    ----------
    pdf_path: str | Path
        Path to the PDF file.

    Returns
    -------
    str
        The concatenated text of all pages, separated by newlines.
    """
    pdf_path = Path(pdf_path)
    if not pdf_path.is_file():
        raise FileNotFoundError(f"PDF file not found: {pdf_path}")
    doc = fitz.open(str(pdf_path))
    try:
        # Use "text" extraction which respects PDF layout; alternative: "text+metadata"
        page_texts = [page.get_text() for page in doc]
        return "\n".join(page_texts)
    finally:
        doc.close()


def extract_metadata(pdf_path: str | Path) -> Dict[str, Any]:
    """Return PDF metadata as a dict.

    The metadata keys correspond to the standard keys used by PyMuPDF
    (e.g., ``title``, ``author``, ``creationDate``). Missing values are omitted.
    """
    pdf_path = Path(pdf_path)
    if not pdf_path.is_file():
        raise FileNotFoundError(f"PDF file not found: {pdf_path}")
    doc = fitz.open(str(pdf_path))
    try:
        return {k: v for k, v in doc.metadata.items() if v}
    finally:
        doc.close()


def extract_images(pdf_path: str | Path, output_dir: str | Path) -> List[str]:
    """Extract all images from a PDF and write them to ``output_dir``.

    Parameters
    ----------
    pdf_path: str | Path
        Path to the source PDF.
    output_dir: str | Path
        Directory where extracted images will be saved. It will be created
        if it does not exist.

    Returns
    -------
    List[str]
        List of file paths (as strings) for the extracted images.
    """
    pdf_path = Path(pdf_path)
    output_dir = Path(output_dir)
    if not pdf_path.is_file():
        raise FileNotFoundError(f"PDF file not found: {pdf_path}")
    output_dir.mkdir(parents=True, exist_ok=True)

    doc = fitz.open(str(pdf_path))
    extracted: List[str] = []
    try:
        for page_number, page in enumerate(doc, start=1):
            image_list = page.get_images(full=True)
            for img_index, img in enumerate(image_list, start=1):
                # ``img`` is a tuple where the first element is the XREF.
                xref = img[0]
                base_image = doc.extract_image(xref)
                image_bytes = base_image["image"]
                ext = base_image.get("ext", "png")
                image_path = output_dir / f"page{page_number}_img{img_index}.{ext}"
                image_path.write_bytes(image_bytes)
                extracted.append(str(image_path))
    finally:
        doc.close()
    return extracted
