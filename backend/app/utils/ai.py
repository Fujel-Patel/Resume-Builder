"""
AI Utility Functions
Following instruction.md for AI integration and file handling
"""
import fitz  # PyMuPDF
import pdfplumber
import docx2txt
import io
from typing import Union
from app.config.settings import settings


def extract_resume_text(file_content: bytes, filename: str) -> str:
    """
    Extract text from resume file (PDF/DOCX)
    Following PRD: PyMuPDF / pdfplumber for resume upload → text extract
    """
    file_extension = filename.lower().split('.')[-1] if '.' in filename else ''

    try:
        if file_extension == 'pdf':
            return extract_text_from_pdf(file_content)
        elif file_extension == 'docx':
            return extract_text_from_docx(file_content)
        else:
            raise ValueError(f"Unsupported file format: {file_extension}")
    except Exception as e:
        raise ValueError(f"Failed to extract text from {filename}: {str(e)}")


def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF using PyMuPDF (fitz)"""
    text = ""

    # Try PyMuPDF first
    try:
        pdf_document = fitz.open(stream=file_content, filetype="pdf")
        for page_num in range(pdf_document.page_count):
            page = pdf_document[page_num]
            text += page.get_text()
        pdf_document.close()
    except Exception as e:
        # Fallback to pdfplumber
        try:
            with pdfplumber.open(io.BytesIO(file_content)) as pdf:
                for page in pdf.pages:
                    text += page.extract_text() or ""
        except Exception as e2:
            raise ValueError(f"Both PyMuPDF and pdfplumber failed: {str(e)}, {str(e2)}")

    return text.strip()


def extract_text_from_docx(file_content: bytes) -> str:
    """Extract text from DOCX file"""
    try:
        text = docx2txt.process(io.BytesIO(file_content))
        return text.strip()
    except Exception as e:
        raise ValueError(f"Failed to extract text from DOCX: {str(e)}")


# PDF parsing utilities for more advanced processing
def parse_pdf_structure(file_content: bytes) -> dict:
    """
    Parse PDF structure for more sophisticated text extraction
    Could be used for layout-aware parsing in future
    """
    try:
        pdf_document = fitz.open(stream=file_content, filetype="pdf")
        structure = {
            "page_count": pdf_document.page_count,
            "text_by_page": [],
            "metadata": pdf_document.metadata
        }

        for page_num in range(pdf_document.page_count):
            page = pdf_document[page_num]
            page_text = page.get_text()
            page_blocks = page.get_text("blocks")  # More detailed structure

            structure["text_by_page"].append({
                "page_number": page_num + 1,
                "text": page_text,
                "blocks": page_blocks
            })

        pdf_document.close()
        return structure
    except Exception as e:
        raise ValueError(f"Failed to parse PDF structure: {str(e)}")


# Text cleaning utilities
def clean_extracted_text(text: str) -> str:
    """
    Clean extracted text for better processing
    """
    import re

    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)

    # Remove special characters that might interfere with processing
    # Keep basic punctuation and alphanumeric
    text = re.sub(r'[^\w\s\.\,\;\:\!\?\-\(\)]', ' ', text)

    # Remove extra spaces again
    text = re.sub(r'\s+', ' ', text)

    return text.strip()


# Future: AI-powered resume parsing would go here
def parse_resume_with_ai(resume_text: str) -> dict:
    """
    Parse resume text using AI to extract structured data
    This would integrate with the AI service to extract personal info, skills, etc.
    For now, this is a placeholder
    """
    # In production, this would call the AI service with appropriate prompts
    # to extract structured data from resume text
    return {
        "personal": {},
        "summary": "",
        "skills": [],
        "experience": [],
        "projects": [],
        "education": [],
        "certifications": [],
        "custom_sections": []
    }