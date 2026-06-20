"""Build a Base-Nova styled DOCX resume template programmatically.

Usage:
    doc = build_base_nova_template()
    doc.save("output.docx")
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List, Optional

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn, nsdecls
from docx.oxml import parse_xml
from docx.shared import Inches, Pt, RGBColor


BRAND = RGBColor(0x00, 0xFF, 0xF0)
DARK = RGBColor(0x00, 0x00, 0x00)
GRAY = RGBColor(0x66, 0x66, 0x66)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)

FONT_FAMILY = "Karla"
SECTION_SIZE = Pt(11)
BODY_SIZE = Pt(10)
SMALL_SIZE = Pt(8)
NAME_SIZE = Pt(18)
TITLE_SIZE = Pt(12)


def _set_run_font(run, name: str = FONT_FAMILY, size=Pt(10), bold: bool = False,
                  color: RGBColor = DARK, italic: bool = False) -> None:
    run.font.name = name
    run.font.size = size
    run.font.bold = bold
    run.font.color.rgb = color
    run.font.italic = italic
    rpr = run._element.get_or_add_rPr()
    rFonts = rpr.find(qn('w:rFonts'))
    if rFonts is None:
        rFonts = parse_xml(f'<w:rFonts {nsdecls("w")} w:ascii="{name}" w:hAnsi="{name}" w:eastAsia="{name}" w:cs="{name}"/>')
        rpr.insert(0, rFonts)
    else:
        rFonts.set(qn('w:ascii'), name)
        rFonts.set(qn('w:hAnsi'), name)


def _add_bottom_border(paragraph, color: str = "00FFF0", sz: int = 4) -> None:
    pPr = paragraph._element.get_or_add_pPr()
    pBdr = parse_xml(
        f'<w:pBdr {nsdecls("w")}>'
        f'  <w:bottom w:val="single" w:sz="{sz}" w:space="1" w:color="{color}"/>'
        f'</w:pBdr>'
    )
    pPr.append(pBdr)


def _add_paragraph(doc: Document, text: str, size=Pt(10), bold: bool = False,
                   color: RGBColor = DARK, italic: bool = False,
                   alignment=WD_ALIGN_PARAGRAPH.LEFT,
                   space_before: Pt = Pt(0), space_after: Pt = Pt(2),
                   font_name: str = FONT_FAMILY) -> None:
    para = doc.add_paragraph()
    para.alignment = alignment
    para.paragraph_format.space_before = space_before
    para.paragraph_format.space_after = space_after
    para.paragraph_format.line_spacing = 1.15
    run = para.add_run(text)
    _set_run_font(run, name=font_name, size=size, bold=bold, color=color, italic=italic)
    return para


def _add_section_header(doc: Document, title: str) -> None:
    para = doc.add_paragraph()
    para.alignment = WD_ALIGN_PARAGRAPH.LEFT
    para.paragraph_format.space_before = Pt(8)
    para.paragraph_format.space_after = Pt(4)
    para.paragraph_format.line_spacing = 1.15
    run = para.add_run(title.upper())
    _set_run_font(run, size=SECTION_SIZE, bold=True, color=DARK)
    _add_bottom_border(para)


def _add_bullet(doc: Document, text: str, indent: float = 0.25) -> None:
    para = doc.add_paragraph()
    para.alignment = WD_ALIGN_PARAGRAPH.LEFT
    para.paragraph_format.space_before = Pt(0)
    para.paragraph_format.space_after = Pt(1)
    para.paragraph_format.line_spacing = 1.15
    para.paragraph_format.left_indent = Inches(indent)
    para.paragraph_format.first_line_indent = Inches(-0.15)
    run = para.add_run("• " + text)
    _set_run_font(run, size=BODY_SIZE, bold=False, color=DARK)


def _add_inline_paragraph(doc: Document, parts: List[Dict[str, Any]]) -> None:
    para = doc.add_paragraph()
    para.alignment = WD_ALIGN_PARAGRAPH.LEFT
    para.paragraph_format.space_before = Pt(0)
    para.paragraph_format.space_after = Pt(2)
    para.paragraph_format.line_spacing = 1.15
    for p in parts:
        run = para.add_run(p.get("text", ""))
        _set_run_font(
            run,
            name=p.get("font", FONT_FAMILY),
            size=p.get("size", BODY_SIZE),
            bold=p.get("bold", False),
            color=p.get("color", DARK),
            italic=p.get("italic", False),
        )


def build_base_nova_template() -> Document:
    """Build and return a python-docx Document with Base-Nova styling.

    Returns empty Document with section styles defined. Callers fill in content.
    """
    doc = Document()

    section = doc.sections[0]
    section.page_width = Inches(8.27)
    section.page_height = Inches(11.69)
    section.top_margin = Pt(50)
    section.bottom_margin = Pt(50)
    section.left_margin = Pt(50)
    section.right_margin = Pt(50)

    return doc


def _build_contact_parts(personal: Dict[str, str]) -> List[str]:
    parts = []
    if personal.get("email"):
        parts.append(personal["email"])
    if personal.get("mobile"):
        parts.append(personal["mobile"])
    if personal.get("address"):
        parts.append(personal["address"])
    if personal.get("github"):
        parts.append(personal["github"])
    if personal.get("linkedin"):
        parts.append(personal["linkedin"])
    if personal.get("portfolio"):
        parts.append(personal["portfolio"])
    return parts


def _render_skills_text(skills: Optional[List[str]],
                        skill_groups: Optional[Dict[str, List[str]]]) -> str:
    if skill_groups:
        lines = []
        for label, items in skill_groups.items():
            label_str = label.replace("_", " ").title()
            lines.append(f"{label_str}: {', '.join(items)}")
        return "\n".join(lines)
    if skills:
        return ", ".join(skills)
    return ""


def make_resume_docx(
    output_path: str | Path,
    parsed: dict,
    optimized: dict,
) -> Path:
    """Build a complete styled DOCX from optimized resume data.

    Uses build_base_nova_template() then fills in all sections.
    """
    data = optimized
    personal = data.get("personal") or {}
    first = personal.get("first_name", "").strip()
    last = personal.get("last_name", "").strip()
    name = f"{first} {last}".strip()
    title = personal.get("job_title", "").strip()
    contact_parts = _build_contact_parts(personal)

    doc = build_base_nova_template()

    if name:
        _add_paragraph(doc, name, size=NAME_SIZE, bold=True,
                       alignment=WD_ALIGN_PARAGRAPH.CENTER, space_after=Pt(0))

    if title:
        _add_paragraph(doc, title, size=TITLE_SIZE, bold=False, color=BRAND,
                       alignment=WD_ALIGN_PARAGRAPH.CENTER, space_before=Pt(2), space_after=Pt(4))

    if contact_parts:
        _add_paragraph(doc, "  ·  ".join(contact_parts), size=SMALL_SIZE, color=GRAY,
                       alignment=WD_ALIGN_PARAGRAPH.CENTER, space_before=Pt(2), space_after=Pt(6))

    # Summary
    summary = data.get("summary", "").strip()
    if summary:
        _add_section_header(doc, "Summary")
        _add_paragraph(doc, summary, size=BODY_SIZE, space_after=Pt(4))

    # Skills
    skills_text = _render_skills_text(data.get("skills"), data.get("skill_groups"))
    if skills_text:
        _add_section_header(doc, "Skills")
        for line in skills_text.split("\n"):
            _add_paragraph(doc, line, size=BODY_SIZE, space_after=Pt(1))

    # Experience
    experiences = data.get("experience") or []
    if experiences:
        _add_section_header(doc, "Experience")
        for exp in experiences:
            company = (exp.get("company") or "").strip()
            role = (exp.get("role") or "").strip()
            duration = (exp.get("duration") or "").strip()
            bullets = exp.get("bullets") or []

            left_text = f"{role}@{company}" if role and company else (role or company)
            if duration:
                _add_inline_paragraph(doc, [
                    {"text": left_text, "bold": True, "size": BODY_SIZE},
                    {"text": f"   {duration}", "italic": True, "color": GRAY, "size": SMALL_SIZE},
                ])
            else:
                _add_paragraph(doc, left_text, size=BODY_SIZE, bold=True, space_after=Pt(1))

            for b in bullets:
                if b.strip():
                    _add_bullet(doc, b.strip())

    # Projects
    projects = data.get("projects") or []
    if projects:
        _add_section_header(doc, "Projects")
        for proj in projects:
            pname = (proj.get("name") or "").strip()
            desc = (proj.get("description") or "").strip()
            if pname:
                _add_paragraph(doc, pname, size=BODY_SIZE, bold=True, space_after=Pt(1))
            if desc:
                _add_bullet(doc, desc)

    # Education
    education_list = data.get("education") or []
    if education_list:
        _add_section_header(doc, "Education")
        for edu in education_list:
            inst = (edu.get("institution") or "").strip()
            degree = (edu.get("degree") or "").strip()
            year = (edu.get("year") or "").strip()
            grade = (edu.get("grade") or "").strip()

            left = inst
            if degree:
                left += f", {degree}"
            right = year
            if grade:
                right += f" — {grade}" if right else grade

            if right:
                _add_inline_paragraph(doc, [
                    {"text": left, "bold": True, "size": BODY_SIZE},
                    {"text": f"   {right}", "italic": True, "color": GRAY, "size": SMALL_SIZE},
                ])
            else:
                _add_paragraph(doc, left, size=BODY_SIZE, bold=True, space_after=Pt(1))

    # Certifications
    certs = data.get("certifications") or []
    if certs:
        _add_section_header(doc, "Certifications")
        for cert in certs:
            cname = (cert.get("name") or "").strip()
            issuer = (cert.get("issuer") or "").strip()
            year = (cert.get("year") or "").strip()

            left = cname
            if issuer:
                left += f" — {issuer}"
            right = year

            if right:
                _add_inline_paragraph(doc, [
                    {"text": left, "bold": True, "size": BODY_SIZE},
                    {"text": f"   {right}", "italic": True, "color": GRAY, "size": SMALL_SIZE},
                ])
            else:
                _add_paragraph(doc, left, size=BODY_SIZE, bold=True, space_after=Pt(1))

    doc.save(str(output_path))
    return Path(output_path)
