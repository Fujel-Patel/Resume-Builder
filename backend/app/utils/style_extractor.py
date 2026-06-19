"""Extract visual styling from PDF/DOCX and generate Jinja2 resume templates."""

from __future__ import annotations

import re
from collections import Counter
from pathlib import Path
from typing import Any, Dict


FONT_CSS_MAP: Dict[str, str] = {
    "helv": "'Helvetica Neue', Helvetica, Arial, sans-serif",
    "helvetica": "'Helvetica Neue', Helvetica, Arial, sans-serif",
    "arial": "'Helvetica Neue', Helvetica, Arial, sans-serif",
    "times": "Georgia, 'Times New Roman', Times, serif",
    "timesnewroman": "Georgia, 'Times New Roman', Times, serif",
    "timesnewromanps": "Georgia, 'Times New Roman', Times, serif",
    "timesnewromanpsmt": "Georgia, 'Times New Roman', Times, serif",
    "georgia": "Georgia, 'Times New Roman', Times, serif",
    "courier": "'Courier New', Courier, monospace",
    "couriernew": "'Courier New', Courier, monospace",
    "calibri": "Calibri, 'Helvetica Neue', Arial, sans-serif",
    "karla": "'Karla', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    "verdana": "Verdana, Geneva, sans-serif",
    "tahoma": "Tahoma, Geneva, sans-serif",
    "trebuchet": "'Trebuchet MS', 'Helvetica Neue', sans-serif",
    "garamond": "Garamond, 'Times New Roman', serif",
    "palatino": "Palatino, 'Palatino Linotype', serif",
    "bookman": "'Bookman Old Style', Georgia, serif",
    "symbol": "Symbol",
}

# Google Fonts that need @import in the generated HTML
GOOGLE_FONTS: Dict[str, str] = {
    "karla": "Karla:wght@400;700",
}


def _clean_font_name(name: str) -> str:
    """Strip bold/italic/oblique/MT/PS suffixes for clean font family lookup."""
    cleaned = re.sub(r"[\-\s]+", "", name.lower())
    cleaned = re.sub(
        r"(bold|italic|oblique|heavy|black|light|thin|medium|semibold|extrabold|"
        r"ultralight|mt|ps|regular|narrow|condensed|extended)$",
        "",
        cleaned,
    )
    return cleaned


def _map_font(font_name: str) -> str:
    """Map PyMuPDF font name to CSS font-family stack."""
    key = _clean_font_name(font_name)
    for k, v in FONT_CSS_MAP.items():
        if k in key:
            return v
    return "'Helvetica Neue', Helvetica, Arial, sans-serif"


def _is_bold_font(font_name: str) -> bool:
    lower = font_name.lower()
    return bool(re.search(r"(bold|heavy|black|semibold|demi)", lower))


def _css_rgb(color: int) -> str:
    if isinstance(color, int) and color > 0:
        r = (color >> 16) & 0xFF
        g = (color >> 8) & 0xFF
        b = color & 0xFF
        return f"rgb({r}, {g}, {b})"
    return "rgb(0, 0, 0)"


def extract_style_from_pdf(path: str | Path) -> Dict[str, Any]:
    """Extract visual styling from a PDF file.

    Returns a dict with page dimensions, margins, font families, sizes,
    and colors for name / title / section headers / body text.
    """
    import fitz

    doc = fitz.open(str(path))

    all_fonts: list[str] = []
    all_sizes: list[float] = []
    all_colors: list[int] = []
    page_width = page_height = 0.0
    min_x = min_y = float("inf")
    max_x = max_y = float("-inf")

    MIN_VISIBLE_SIZE = 4.0

    for page in doc:
        if page_width == 0:
            page_width = page.rect.width
            page_height = page.rect.height

        raw = page.get_text("dict")
        for block in raw.get("blocks", []):
            if block.get("type") != 0:
                continue
            bbox = block.get("bbox", [0, 0, 0, 0])
            if len(bbox) >= 4:
                min_x = min(min_x, bbox[0])
                min_y = min(min_y, bbox[1])
                max_x = max(max_x, bbox[2])
                max_y = max(max_y, bbox[3])

            for line in block.get("lines", []):
                for span in line.get("spans", []):
                    span_size = span.get("size", 11)
                    all_sizes.append(span_size)
                    if span_size < MIN_VISIBLE_SIZE:
                        continue
                    all_fonts.append(span.get("font", "helv"))
                    all_colors.append(span.get("color", 0))

    doc.close()

    # Margins
    margin_top = max(min_y - 10, 15) if min_y != float("inf") else 50
    margin_bottom = max(page_height - max_y - 10, 15) if max_y != float("-inf") else 50
    margin_left = max(min_x - 10, 15) if min_x != float("inf") else 50
    margin_right = max(page_width - max_x - 10, 15) if max_x != float("-inf") else 50

    # Analyze font usage (only visible text)
    css_fonts = [_map_font(f) for f in all_fonts]
    font_counter = Counter(css_fonts)
    size_counter = Counter(round(s, 1) for s in all_sizes)
    color_counter = Counter(all_colors)

    if not css_fonts:
        return _default_style(page_width, page_height)

    # Most common = body defaults
    body_font = font_counter.most_common(1)[0][0]
    body_size = size_counter.most_common(1)[0][0]
    body_color = color_counter.most_common(1)[0][0]

    # Larger sizes sorted desc
    sorted_sizes = sorted(size_counter.keys(), reverse=True)
    larger_sizes = [s for s in sorted_sizes if s > body_size + 1]

    name_size = body_size + 6
    title_size = body_size + 2
    section_size = body_size + 1

    if len(larger_sizes) >= 3:
        name_size = larger_sizes[0]
        title_size = larger_sizes[1]
        section_size = larger_sizes[2]
    elif len(larger_sizes) >= 2:
        name_size = larger_sizes[0]
        title_size = larger_sizes[1]
    elif len(larger_sizes) == 1:
        name_size = larger_sizes[0]

    # Detect bold fonts for bold sections
    bold_fonts = [_map_font(f) for f in all_fonts if _is_bold_font(f)]
    section_font = Counter(bold_fonts).most_common(1)[0][0] if bold_fonts else body_font

    # Section color: use body color (black) unless a distinct non-black exists
    section_color = body_color
    non_black = [c for c in all_colors if c not in (0, 0x000000)]
    if non_black:
        section_color = Counter(non_black).most_common(1)[0][0]

    return {
        "page_width": page_width or 595.0,
        "page_height": page_height or 842.0,
        "margin_top": min(margin_top, 72),
        "margin_right": min(margin_right, 72),
        "margin_bottom": min(margin_bottom, 72),
        "margin_left": min(margin_left, 72),
        "body_font": body_font,
        "body_size": body_size,
        "body_color": _css_rgb(body_color),
        "section_font": section_font,
        "section_size": section_size,
        "section_color": _css_rgb(section_color),
        "name_size": name_size,
        "title_size": title_size,
        "line_spacing": 1.3,
        "section_spacing": round(body_size * 1.4, 1),
    }


def extract_style_from_docx(path: str | Path) -> Dict[str, Any]:
    """Extract visual styling from a DOCX file."""
    from docx import Document

    doc = Document(str(path))
    style = _default_style()

    # Use first section's page dimensions
    section = doc.sections[0] if doc.sections else None
    if section:
        pw = section.page_width or 12240  # twips → default letter
        ph = section.page_height or 15840
        style["page_width"] = pw / 20  # twips → points
        style["page_height"] = ph / 20
        style["margin_top"] = (section.top_margin or 1440) / 20
        style["margin_bottom"] = (section.bottom_margin or 1440) / 20
        style["margin_left"] = (section.left_margin or 1800) / 20
        style["margin_right"] = (section.right_margin or 1800) / 20

    # Use Normal style for body defaults
    if doc.styles and "Normal" in [s.name for s in doc.styles]:
        normal = doc.styles["Normal"]
        if normal.font:
            f_name = normal.font.name
            if f_name:
                style["body_font"] = _map_font(f_name)
            if normal.font.size:
                style["body_size"] = normal.font.size.pt
            if normal.font.color and normal.font.color.rgb:
                c = normal.font.color.rgb
                style["body_color"] = f"rgb({c[0]}, {c[1]}, {c[2]})"

    # Look for Heading styles
    for sname in ["Heading 1", "Heading 2", "Title", "Subtitle"]:
        if sname in [s.name for s in doc.styles]:
            hs = doc.styles[sname]
            if hs.font and hs.font.size:
                sz = hs.font.size.pt
                if sname in ("Heading 1", "Title"):
                    style["name_size"] = sz + 2
                elif sname == "Heading 2":
                    style["section_size"] = sz

    doc.close()
    return style


def _default_style(
    page_width: float = 595.0, page_height: float = 842.0
) -> Dict[str, Any]:
    return {
        "page_width": page_width,
        "page_height": page_height,
        "margin_top": 50.0,
        "margin_right": 50.0,
        "margin_bottom": 50.0,
        "margin_left": 50.0,
        "body_font": "'Helvetica Neue', Helvetica, Arial, sans-serif",
        "body_size": 11.0,
        "body_color": "rgb(0, 0, 0)",
        "section_font": "'Helvetica Neue', Helvetica, Arial, sans-serif",
        "section_size": 12.0,
        "section_color": "rgb(0, 0, 0)",
        "name_size": 18.0,
        "title_size": 12.0,
        "line_spacing": 1.3,
        "section_spacing": 16.0,
    }


def style_to_template_jinja(style: Dict[str, Any]) -> str:
    """Generate a Jinja2 HTML template string from a style dict.

    The generated template uses the extracted fonts, colors, sizes and renders
    all standard resume sections (personal, summary, skills, experience,
    projects, education, certifications).
    """
    pw = style.get("page_width", 595)
    ph = style.get("page_height", 842)
    mt = style.get("margin_top", 50)
    mr = style.get("margin_right", 50)
    mb = style.get("margin_bottom", 50)
    ml = style.get("margin_left", 50)
    bf = style.get("body_font", "'Helvetica Neue', Arial, sans-serif")
    bs = style.get("body_size", 11)
    bc = style.get("body_color", "rgb(0, 0, 0)")
    sf = style.get("section_font", bf)
    ss = style.get("section_size", 12)
    sc = style.get("section_color", bc)
    ns = style.get("name_size", 18)
    ts = style.get("title_size", 12)
    lh = style.get("line_spacing", 1.3)
    sp = style.get("section_spacing", 16)

    # Detect Google Fonts for @import
    font_imports: list[str] = []
    for raw_name, gf_spec in GOOGLE_FONTS.items():
        if raw_name in bf.lower() or raw_name in sf.lower():
            font_imports.append(
                f"@import url('https://fonts.googleapis.com/css2?family={gf_spec}&display=swap');"
            )
    font_import_str = "\n".join(font_imports)

    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
{font_import_str}
@page {{
  size: {pw}pt {ph}pt;
  margin: {mt}pt {mr}pt {mb}pt {ml}pt;
}}
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
body {{
  font-family: {bf};
  font-size: {bs}pt;
  color: {bc};
  line-height: {lh};
}}
.name {{
  font-size: {ns}pt;
  font-weight: bold;
  text-align: center;
  margin-bottom: 2pt;
}}
.job-title {{
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 6pt;
}}
.contact-line {{
  text-align: center;
  font-size: {max(bs - 2, 8)}pt;
  color: {bc};
  margin-bottom: {max(sp * 0.5, 6)}pt;
}}
.section-title {{
  font-family: {sf};
  font-size: {ss}pt;
  font-weight: bold;
  color: {sc};
  border-bottom: 1px solid {sc};
  padding-bottom: 2pt;
  margin-top: {sp}pt;
  margin-bottom: {max(sp * 0.4, 4)}pt;
}}
.summary-text {{
  margin-bottom: 0;
}}
.entry {{
  margin-bottom: {max(sp * 0.5, 6)}pt;
}}
.entry-header {{
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}}
.entry-role {{
  font-weight: bold;
}}
.entry-company {{
  font-weight: normal;
}}
.entry-duration {{
  font-style: italic;
  color: {bc};
  white-space: nowrap;
  margin-left: 6pt;
}}
.entry-desc {{
  margin-top: 1pt;
}}
.project-name {{
  font-weight: bold;
}}
.edu-name {{
  font-weight: bold;
}}
.cert-name {{
  font-weight: bold;
}}
</style>
</head>
<body>

<div class="name">{{{{ personal.first_name }}}} {{{{ personal.last_name }}}}</div>
{{% if personal.job_title %}}
{{% set title_len = personal.job_title | length %}}
{{% if title_len > 40 %}}
<div class="job-title" style="font-size: {ts - 3}pt; color: {sc};">{{{{ personal.job_title }}}}</div>
{{% elif title_len > 30 %}}
<div class="job-title" style="font-size: {ts - 2}pt; color: {sc};">{{{{ personal.job_title }}}}</div>
{{% elif title_len > 22 %}}
<div class="job-title" style="font-size: {ts - 1}pt; color: {sc};">{{{{ personal.job_title }}}}</div>
{{% else %}}
<div class="job-title" style="font-size: {ts}pt; color: {sc};">{{{{ personal.job_title }}}}</div>
{{% endif %}}
{{% endif %}}
<div class="contact-line">
{{%- if personal.email %}}{{{{ personal.email }}}}{{% endif -%}}
{{%- if personal.mobile %}} · {{{{ personal.mobile }}}}{{% endif -%}}
{{%- if personal.address %}} · {{{{ personal.address }}}}{{% endif -%}}
{{%- if personal.github %}} · {{{{ personal.github }}}}{{% endif -%}}
{{%- if personal.linkedin %}} · {{{{ personal.linkedin }}}}{{% endif -%}}
{{%- if personal.portfolio %}} · {{{{ personal.portfolio }}}}{{% endif -%}}
</div>

{{% if summary %}}
<div class="section-title">Professional Summary</div>
<p class="summary-text">{{{{ summary }}}}</p>
{{% endif %}}

{{% if skills %}}
<div class="section-title">Skills</div>
<p>{{{{ skills | join(", ") }}}}</p>
{{% endif %}}

{{% if experience %}}
<div class="section-title">Experience</div>
{{% for exp in experience %}}
<div class="entry">
  <div class="entry-header">
    <div>
      <span class="entry-role">{{{{ exp.role }}}}</span>
      {{% if exp.company %}}<span class="entry-company"> &ndash; {{{{ exp.company }}}}</span>{{% endif %}}
    </div>
    {{% if exp.duration %}}<span class="entry-duration">{{{{ exp.duration }}}}</span>{{% endif %}}
  </div>
  {{% if exp.bullets and exp.bullets|length > 0 %}}
  <div class="entry-desc">{{{{ exp.bullets | join(" \u2022 ") }}}}</div>
  {{% endif %}}
</div>
{{% endfor %}}
{{% endif %}}

{{% if projects %}}
<div class="section-title">Projects</div>
{{% for proj in projects %}}
<div class="entry">
  <div class="project-name">{{{{ proj.name }}}}</div>
  {{% if proj.description %}}<div class="entry-desc">{{{{ proj.description }}}}</div>{{% endif %}}
</div>
{{% endfor %}}
{{% endif %}}

{{% if education %}}
<div class="section-title">Education</div>
{{% for edu in education %}}
<div class="entry">
  <div class="entry-header">
    <div>
      <span class="edu-name">{{{{ edu.institution }}}}</span>
      {{% if edu.degree %}}<span>, {{{{ edu.degree }}}}</span>{{% endif %}}
    </div>
    {{% if edu.year %}}<span class="entry-duration">{{{{ edu.year }}}}{{% if edu.grade %}} &ndash; {{{{ edu.grade }}}}{{% endif %}}</span>{{% endif %}}
  </div>
</div>
{{% endfor %}}
{{% endif %}}

{{% if certifications %}}
<div class="section-title">Certifications</div>
{{% for cert in certifications %}}
<div class="entry">
  <div class="entry-header">
    <div>
      <span class="cert-name">{{{{ cert.name }}}}</span>
      {{% if cert.issuer %}}<span> &ndash; {{{{ cert.issuer }}}}</span>{{% endif %}}
    </div>
    {{% if cert.year %}}<span class="entry-duration">{{{{ cert.year }}}}</span>{{% endif %}}
  </div>
</div>
{{% endfor %}}
{{% endif %}}

</body>
</html>"""


def extract_and_generate_template(path: str | Path, file_type: str) -> Dict[str, Any] | None:
    """Extract style from file and return the style dict.

    Returns None if extraction fails.
    """
    try:
        p = Path(path)
        if not p.is_file():
            return None
        if file_type == "pdf":
            return extract_style_from_pdf(p)
        elif file_type == "docx":
            return extract_style_from_docx(p)
        return None
    except Exception:
        return None
