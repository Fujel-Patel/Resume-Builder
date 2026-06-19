"""In-place PDF/DOCX text replacement preserving original layout.

For PDF: uses PyMuPDF (fitz) to redact old text blocks and insert optimized
text at the same coordinates, preserving fonts, positioning, and non-text
elements (images, lines, etc.).

For DOCX: uses python-docx to find and replace paragraph text in-place while
preserving all formatting (styles, fonts, spacing, headers, footers).
"""

from __future__ import annotations

import re
from collections import defaultdict
from pathlib import Path
from typing import Dict, List, Tuple

import fitz


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower().strip())


def _token_set(text: str) -> set:
    return set(_normalize(text).split())


def _jaccard(a: str, b: str) -> float:
    ta, tb = _token_set(a), _token_set(b)
    if not ta or not tb:
        return 0.0
    return len(ta & tb) / len(ta | tb)


def _build_old_sections(parsed: dict) -> Dict[str, str]:
    """Build map of section key -> old text string from parsed resume data."""
    sections: Dict[str, str] = {}

    p = parsed.get("personal") or {}
    if p.get("job_title"):
        sections["job_title"] = p["job_title"]

    if parsed.get("summary"):
        sections["summary"] = parsed["summary"]

    if parsed.get("skills"):
        sections["skills"] = ", ".join(parsed["skills"])

    for i, exp in enumerate(parsed.get("experience") or []):
        bullets = [b for b in (exp.get("bullets") or []) if b.strip()]
        if bullets:
            sections[f"experience_{i}"] = " ".join(bullets)

    for i, proj in enumerate(parsed.get("projects") or []):
        desc = (proj.get("description") or "").strip()
        if desc:
            sections[f"project_{i}"] = desc

    return sections


def _build_new_texts(optimized: dict, parsed: dict) -> Dict[str, str]:
    """Build map of section key -> new text string from optimized data."""
    result: Dict[str, str] = {}

    op = optimized.get("personal") or {}
    pp = parsed.get("personal") or {}
    if op.get("job_title") and op["job_title"] != pp.get("job_title", ""):
        result["job_title"] = op["job_title"]

    if optimized.get("summary") and optimized["summary"] != parsed.get("summary", ""):
        result["summary"] = optimized["summary"]

    old_skills = set(parsed.get("skills") or [])
    new_skills_list = optimized.get("skills") or []
    new_skills_set = set(new_skills_list)
    if new_skills_set != old_skills:
        result["skills"] = ", ".join(new_skills_list)

    old_exps = parsed.get("experience") or []
    new_exps = optimized.get("experience") or []
    for i, (old_exp, new_exp) in enumerate(zip(old_exps, new_exps)):
        old_bullets = " ".join(b for b in (old_exp.get("bullets") or []) if b.strip())
        new_bullets_list = new_exp.get("bullets") or []
        new_bullets_text = " ".join(b for b in new_bullets_list if b.strip())
        if new_bullets_text and new_bullets_text != old_bullets:
            result[f"experience_{i}"] = new_bullets_text

    old_projs = parsed.get("projects") or []
    new_projs = optimized.get("projects") or []
    for i, (old_proj, new_proj) in enumerate(zip(old_projs, new_projs)):
        old_desc = (old_proj.get("description") or "").strip()
        new_desc = (new_proj.get("description") or "").strip()
        if new_desc and new_desc != old_desc:
            result[f"project_{i}"] = new_desc

    return result


# ---------------------------------------------------------------------------
# PDF editor
# ---------------------------------------------------------------------------

def _get_text_blocks(page) -> List[dict]:
    """Extract text blocks from a PDF page, sorted top-to-bottom."""
    blocks: List[dict] = []
    raw = page.get_text("dict")
    for b in raw.get("blocks") or []:
        if b.get("type") != 0:
            continue
        lines_text: List[str] = []
        first_span = None
        for line in b.get("lines") or []:
            for span in line.get("spans") or []:
                lines_text.append(span["text"])
                if first_span is None:
                    first_span = span
        full_text = " ".join(lines_text).strip()
        if not full_text:
            continue
        blocks.append({
            "bbox": fitz.Rect(b["bbox"]),
            "text": full_text,
            "font": first_span["font"] if first_span else "helv",
            "fontsize": first_span["size"] if first_span else 11,
            "color": first_span.get("color", 0) if first_span else 0,
        })
    blocks.sort(key=lambda x: (x["bbox"].y0, x["bbox"].x0))
    return blocks


def _match_blocks_to_sections(
    blocks: List[dict],
    old_sections: Dict[str, str],
    threshold: float = 0.3,
) -> Dict[str, List[dict]]:
    """Match PDF text blocks to resume sections by text similarity."""
    matched: Dict[str, List[Tuple[float, dict]]] = {}

    for block in blocks:
        text = block["text"]
        if not text.strip():
            continue

        scores: List[Tuple[float, str]] = []
        for key, old_text in old_sections.items():
            sim = _jaccard(text, old_text)
            if sim >= threshold:
                scores.append((sim, key))

        if not scores:
            continue

        scores.sort(key=lambda x: -x[0])
        best_key = scores[0][1]

        if best_key not in matched:
            matched[best_key] = []
        matched[best_key].append((scores[0][0], block))

    # Sort each section's blocks by score desc
    result: Dict[str, List[dict]] = {}
    for key, entries in matched.items():
        entries.sort(key=lambda x: -x[0])
        result[key] = [e[1] for e in entries]

    return result


def _extract_label(block_text: str, old_text: str) -> str:
    """Extract label prefix from block text (e.g., 'Summary: ' or 'Job Title: ')."""
    bt = block_text.strip()
    ot = old_text.strip()
    if not bt or not ot:
        return ""
    bt_norm = _normalize(bt)
    ot_norm = _normalize(ot)
    if bt_norm == ot_norm:
        return ""
    if bt_norm.endswith(ot_norm):
        prefix_norm = bt_norm[: -len(ot_norm)].strip()
        if not prefix_norm:
            return ""
        prefix_word_count = len(prefix_norm.split())
        prefix_parts = bt.split()[:prefix_word_count]
        prefix = " ".join(prefix_parts).rstrip(":")
        return prefix + ": "
    return ""


def replace_text_in_pdf(
    original_path: str | Path,
    parsed: dict,
    optimized: dict,
    output_path: str | Path,
) -> None:
    """Edit PDF in-place: redact old text blocks, insert optimized text.

    Preserves all non-text elements (images, lines, backgrounds) and text
    blocks that were not matched to any changed section.
    """
    old_sections = _build_old_sections(parsed)
    new_texts = _build_new_texts(optimized, parsed)

    if not new_texts:
        import shutil
        shutil.copy2(str(original_path), str(output_path))
        return

    doc = fitz.open(str(original_path))

    for page in doc:
        blocks = _get_text_blocks(page)
        matched = _match_blocks_to_sections(blocks, old_sections)

        redactions: List[Tuple[fitz.Rect, str, str, float, int, str, str]] = []

        for section_key, matching_blocks in matched.items():
            new_text = new_texts.get(section_key)
            if new_text is None:
                continue

            for block in matching_blocks:
                redactions.append((
                    block["bbox"],
                    new_text,
                    block["font"],
                    block["fontsize"],
                    block["color"],
                    section_key,
                    block["text"],
                ))

        if not redactions:
            continue

        for entry in redactions:
            page.add_redact_annot(entry[0])
        page.apply_redactions()

        by_section: Dict[str, List[Tuple]] = defaultdict(list)
        for entry in redactions:
            by_section[entry[5]].append(entry)

        for section_key, entries in by_section.items():
            union_bbox = entries[0][0]
            for entry in entries[1:]:
                union_bbox = union_bbox | entry[0]

            _bbox, new_text, font, fontsize, color, _sk, block_text = entries[0]

            label = _extract_label(block_text, old_sections.get(section_key, ""))
            insert_text = f"{label}{new_text}" if label else new_text

            color_rgb = (
                ((color >> 16) & 0xFF) / 255.0,
                ((color >> 8) & 0xFF) / 255.0,
                (color & 0xFF) / 255.0,
            ) if isinstance(color, int) and color > 0 else (0, 0, 0)

            cur_size = fontsize
            for _attempt in range(10):
                written = page.insert_textbox(
                    rect=union_bbox,
                    buffer=insert_text,
                    fontname=_pdf_font(font),
                    fontsize=cur_size,
                    color=color_rgb,
                    align=fitz.TEXT_ALIGN_LEFT,
                )
                if written >= 0:
                    break
                cur_size = round(max(cur_size - 0.5, 6), 1)

    doc.save(str(output_path))
    doc.close()


def _pdf_font(font_name: str) -> str:
    """Map font name to one of PyMuPDF's built-in fonts."""
    lower = font_name.lower()
    if "courier" in lower:
        return "courier"
    if "times" in lower or "serif" in lower or "roman" in lower:
        return "times"
    return "helv"


# ---------------------------------------------------------------------------
# DOCX editor
# ---------------------------------------------------------------------------

def replace_text_in_docx(
    original_path: str | Path,
    parsed: dict,
    optimized: dict,
    output_path: str | Path,
) -> None:
    """Edit DOCX in-place: find and replace paragraph text.

    Uses python-docx which preserves all formatting (styles, fonts, spacing,
    headers, footers) when modifying paragraph text.
    """
    from docx import Document

    old_sections = _build_old_sections(parsed)
    new_texts = _build_new_texts(optimized, parsed)

    if not new_texts:
        import shutil
        shutil.copy2(str(original_path), str(output_path))
        return

    doc = Document(str(original_path))

    for para in doc.paragraphs:
        para_text = para.text.strip()
        if not para_text:
            continue

        best_key = None
        best_score = 0.0
        for key, old_text in old_sections.items():
            sim = _jaccard(para_text, old_text)
            if sim > best_score:
                best_score = sim
                best_key = key

        if best_key is None or best_score < 0.3:
            continue

        new_text = new_texts.get(best_key)
        if new_text is None:
            continue

        old_text = old_sections.get(best_key, "")
        if not old_text:
            continue

        if old_text in para.text:
            para.text = para.text.replace(old_text, new_text)

    doc.save(str(output_path))
