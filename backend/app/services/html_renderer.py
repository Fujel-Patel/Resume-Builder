"""Resume → self-contained HTML renderer (backend data shape).

Generates a complete HTML document (with inline CSS) that visually matches
the React template components on the frontend.  The output is fed to
Playwright for PDF generation.

The input dict must follow the backend ``ResumeResponse`` schema, i.e.::

    {
      "template_id": "nova-timeline",
      "data": {
        "personal": {"first_name": "Jane", "last_name": "Doe", ...},
        "summary": "...",
        "skills": [...],
        "skill_groups": {"Frontend": ["React", "TS"], ...},
        "experience": [{"company": "...", "role": "...", "duration": "...", "bullets": [...]}],
        "education": [...],
        "certifications": [...],
        "projects": [...],
        "custom_sections": [...],
      }
    }
"""

from __future__ import annotations

import html as html_module
from typing import Any

# ---------------------------------------------------------------------------
# Shared CSS / helpers
# ---------------------------------------------------------------------------

FONT_IMPORT = (
    '<style>@import url("https://fonts.googleapis.com/css2?family=Inter:'
    "wght@400;500;600;700&amp;display=swap\");</style>"
)

# Nova (default) palette
NOVA_PRIMARY = "#1a3a5c"
NOVA_ACCENT = "#00FFF0"

# Professional Executive palette
PE_PRIMARY = "#355E88"
PE_DIVIDER = "#4A6785"
PE_DARK = "#222222"
PE_BODY = "#333333"
PE_MUTED = "#666666"
PE_TITLE = "#355E88"
PE_ROLE_LABEL = "#4E6B86"
PE_DATE = "#444444"


def e(text: str | None) -> str:
    return html_module.escape(text or "")


# ---------------------------------------------------------------------------
# Top-level dispatcher
# ---------------------------------------------------------------------------

TEMPLATE_RENDERERS: dict[str, Any] = {}


def register(template_id: str):
    def wrapper(fn):
        TEMPLATE_RENDERERS[template_id] = fn
        return fn
    return wrapper


def render_resume_to_html(resume_data: dict, template_id: str) -> str:
    """Return a complete HTML document for the given resume + template.

    Parameters
    ----------
    resume_data:
        Dictionary matching the backend ``ResumeResponse`` shape.
    template_id:
        One of ``"nova-timeline"``, ``"professional-executive"``, etc.
    """
    renderer = TEMPLATE_RENDERERS.get(template_id)
    if renderer is None:
        renderer = TEMPLATE_RENDERERS.get("nova-timeline")
    if renderer is None:
        msg = f"No renderer for template '{template_id}' and no fallback available"
        raise ValueError(msg)

    html_body = renderer(resume_data)
    return _document_wrapper(html_body, template_id)


def _document_wrapper(body_html: str, template_id: str) -> str:
    return f"""\
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=794"/>
{FONT_IMPORT}
<style>
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  html {{ background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
  body {{ background: white; }}
  @page {{ size: A4; margin: 0; }}
  .page-break {{ break-after: page; }}
  .avoid-break {{ break-inside: avoid; page-break-inside: avoid; }}
</style>
</head>
<body>
{body_html}
</body>
</html>"""


# ---------------------------------------------------------------------------
# Helpers – extract backend data shape
# ---------------------------------------------------------------------------

def _personal(d: dict) -> dict:
    return d.get("personal") or {}


def _full_name(p: dict) -> str:
    return f"{p.get('first_name','')} {p.get('last_name','')}".strip()


def _experience(d: dict) -> list:
    return d.get("experience") or []


def _education(d: dict) -> list:
    return d.get("education") or []


def _skills(d: dict) -> list:
    """Return list of skill-group dicts {name, skills} from backend skill_groups."""
    s = d.get("skill_groups") or {}
    out = []
    for name, items in s.items():
        out.append({"name": name, "skills": items})
    # Also handle flat skills list
    flat = d.get("skills") or []
    if flat and not out:
        out.append({"name": "", "skills": flat})
    return out


def _certifications(d: dict) -> list:
    return d.get("certifications") or []


def _projects(d: dict) -> list:
    return d.get("projects") or []


def _custom(d: dict) -> list:
    return d.get("custom_sections") or []


# ---------------------------------------------------------------------------
# Nova Timeline renderer
# ---------------------------------------------------------------------------

@register("nova-timeline")
def _nova_timeline(data: dict) -> str:
    d = data.get("data") or {}
    p = _personal(d)
    summary = d.get("summary") or ""
    experience = _experience(d)
    education = _education(d)
    skills = _skills(d)
    certifications = _certifications(d)
    projects = _projects(d)

    sidebar_html = _nova_sidebar(p, skills)
    main_html = _nova_main(summary, experience, education, certifications, projects)

    return f"""\
<div class="resume-page" style="width:210mm;padding:0.75in;font-family:Inter,sans-serif;color:#333333;line-height:1.4;background:white;">
  <div style="display:flex;gap:24px;">
    <aside style="width:30%;flex-shrink:0;">
      {sidebar_html}
    </aside>
    <main style="flex:1;position:relative;">
      <div style="position:absolute;left:0;top:0;bottom:0;width:1px;background:#e5e7eb;"></div>
      <div style="padding-left:20px;">
        {main_html}
      </div>
    </main>
  </div>
</div>"""


def _nova_sidebar(p: dict, skills: list) -> str:
    sections = []

    # name + title
    name_html = f"<h1 style='font-size:22px;font-weight:700;line-height:1.2;margin:0 0 2px 0;color:#111827;'>{e(_full_name(p))}</h1>"
    title_html = ""
    if p.get("job_title"):
        title_html = f"<p style='font-size:13px;color:#6b7280;margin-bottom:12px;'>{e(p['job_title'])}</p>"

    contact_lines = ""
    for val in [p.get("email"), p.get("mobile"), p.get("address"), p.get("portfolio"), p.get("linkedin"), p.get("github")]:
        if val:
            contact_lines += f"<p style='font-size:10px;color:#4b5563;margin:0;line-height:1.5;'>{e(val)}</p>"

    contact_block = f"""\
<div style="margin-bottom:12px;">
  {name_html}
  {title_html}
  {f'<div style="display:flex;flex-direction:column;gap:2px;">{contact_lines}</div>' if contact_lines else ''}
</div>"""
    sections.append(contact_block)

    # Skills (from skill_groups)
    if skills:
        html = '<div style="margin-bottom:12px;">'
        html += '<div style="border-bottom:1px solid #d1d5db;padding-bottom:4px;margin-bottom:8px;"><h2 style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#374151;">Skills</h2></div>'
        for g in skills:
            if g.get("name"):
                html += f"<p style='font-size:10px;font-weight:600;color:#374151;margin:0 0 2px 0;text-transform:uppercase;letter-spacing:0.5px;'>{e(g['name'])}</p>"
            chips = "".join(
                f"<span style='display:inline-block;font-size:9px;background:#f3f4f6;color:#374151;padding:2px 6px;border-radius:2px;margin:1px;'>{e(s)}</span>"
                for s in g.get("skills", [])
            )
            html += f"<div style='margin-bottom:6px;'>{chips}</div>"
        html += "</div>"
        sections.append(html)

    return "\n".join(sections)


def _nova_main(summary, experience, education, certifications, projects) -> str:
    sections_html = ""

    def section(title, content, first=False):
        nonlocal sections_html
        dot = '<div style="position:absolute;left:-24px;top:4px;width:10px;height:10px;border-radius:50%;background:#d1d5db;border:2px solid white;"></div>'
        heading = f'<div style="border-bottom:1px solid #d1d5db;padding-bottom:4px;margin-bottom:8px;"><h2 style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#374151;">{title}</h2></div>'
        sections_html += f'<section style="position:relative;margin-bottom:12px;" class="avoid-break">{dot}{heading}{content}</section>'

    # Summary
    if summary:
        section("Professional Summary", f"<p style='font-size:11px;line-height:1.6;color:#374151;'>{e(summary)}</p>", first=True)

    # Experience
    if experience:
        items = ""
        for exp in experience:
            duration = exp.get("duration") or ""
            date_html = f"<p style='font-size:10px;color:#9ca3af;white-space:nowrap;flex-shrink:0;'>{e(duration)}</p>" if duration else ""
            bullets = ""
            if exp.get("bullets"):
                bullets = "<ul style='margin:4px 0 0 0;padding-left:12px;font-size:11px;line-height:1.5;color:#374151;'>" + "".join(
                    f"<li style='margin-bottom:1px;'>{e(b)}</li>" for b in exp["bullets"]
                ) + "</ul>"
            items += f"""\
<div class="avoid-break" style="margin-bottom:8px;">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
    <div>
      <p style="font-size:12px;font-weight:600;color:#111827;margin:0;">{e(exp.get('role'))}</p>
      <p style="font-size:11px;color:#4b5563;margin:0;">{e(exp.get('company'))}</p>
    </div>
    {date_html}
  </div>
  {bullets}
</div>"""
        section("Experience", items)

    # Education
    if education:
        items = ""
        for edu in education:
            date_html = ""
            if edu.get("year"):
                date_html = f"<p style='font-size:10px;color:#9ca3af;white-space:nowrap;flex-shrink:0;'>{e(edu['year'])}</p>"
            grade_html = f"<p style='font-size:10px;color:#9ca3af;margin:0;'>Grade: {e(edu.get('grade'))}</p>" if edu.get("grade") else ""
            items += f"""\
<div class="avoid-break" style="margin-bottom:6px;">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
    <div>
      <p style="font-size:12px;font-weight:600;color:#111827;margin:0;">{e(edu.get('degree'))}</p>
      <p style="font-size:11px;color:#4b5563;margin:0;">{e(edu.get('institution'))}</p>
      {grade_html}
    </div>
    {date_html}
  </div>
</div>"""
        section("Education", items)

    # Certifications
    if certifications:
        items = ""
        for cert in certifications:
            year = cert.get("year") or ""
            items += f"""\
<div class="avoid-break" style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;font-size:11px;margin-bottom:4px;">
  <div>
    <p style="font-weight:500;color:#1f2937;margin:0;">{e(cert.get('name'))}</p>
    {f'<p style="color:#6b7280;margin:0;">{e(cert.get("issuer"))}</p>' if cert.get('issuer') else ''}
  </div>
  {f'<p style="font-size:10px;color:#9ca3af;white-space:nowrap;flex-shrink:0;margin:0;">{e(year)}</p>' if year else ''}
</div>"""
        section("Certifications", items)

    # Projects
    if projects:
        items = ""
        for proj in projects:
            desc = proj.get("description") or ""
            tech = proj.get("tech_stack") or []
            desc_html = f"<p style='font-size:11px;line-height:1.5;color:#374151;margin-top:2px;'>{e(desc)}</p>" if desc else ""
            tech_html = ""
            if tech:
                tech_html = "<div style='margin-top:2px;display:flex;flex-wrap:wrap;gap:3px;'>" + "".join(
                    f"<span style='font-size:9px;background:#f3f4f6;color:#374151;padding:1px 5px;border-radius:2px;'>{e(t)}</span>"
                    for t in tech
                ) + "</div>"
            items += f"""\
<div class="avoid-break" style="margin-bottom:6px;">
  <p style="font-size:12px;font-weight:600;color:#111827;margin:0;">{e(proj.get('name'))}</p>
  {desc_html}
  {tech_html}
</div>"""
        section("Projects", items)

    # Custom sections
    # (not included in Nova sidebar-based template to match frontend)

    return sections_html


# ---------------------------------------------------------------------------
# Obsidian Edge renderer
# ---------------------------------------------------------------------------

OE_BLACK = "#000000"
OE_WHITE = "#ffffff"
OE_MUTED_WHITE = "#E5E7EB"
OE_BODY_BG = "#F4F5F7"
OE_HEADING = "#111827"
OE_BODY = "#374151"

OE_ICONS: dict[str, str] = {
    "summary": "\U0001F4C4",
    "experience": "\U0001F4BC",
    "education": "\U0001F393",
    "skills": "\U0001F9E0",
    "languages": "\U0001F30D",
    "certifications": "\U0001F3C6",
    "projects": "\U0001F680",
}


@register("obsidian-edge")
def _obsidian_edge(data: dict) -> str:
    d = data.get("data") or {}
    p = _personal(d)
    summary = d.get("summary") or ""
    experience = _experience(d)
    education = _education(d)
    skills = _skills(d)
    certifications = _certifications(d)
    projects = _projects(d)

    # --- Header ---
    name = _full_name(p)
    title = p.get("job_title") or ""

    contact_parts = ""
    for val, icon in [
        (p.get("email"), None),
        (p.get("mobile"), None),
        (p.get("address"), None),
        (p.get("portfolio"), None),
        (p.get("github"), None),
        (p.get("linkedin"), None),
    ]:
        if val:
            display = val.replace("https://github.com/", "").replace("https://linkedin.com/in/", "")
            contact_parts += f'<span style="font-size:13px;color:{OE_WHITE};">{e(display)}</span>'

    contact_row = (
        f'<div style="display:flex;flex-wrap:wrap;gap:24px;margin-top:16px;font-size:13px;color:{OE_WHITE};">{contact_parts}</div>'
        if contact_parts
        else ""
    )

    header = f"""\
<section style="background:{OE_BLACK};color:{OE_WHITE};padding:32px;">
  <h1 style="font-size:32px;font-weight:700;margin:0;line-height:1.2;">{e(name)}</h1>
  {f'<p style="font-size:18px;font-weight:400;color:{OE_MUTED_WHITE};margin:4px 0 0 0;">{e(title)}</p>' if title else ''}
  {contact_row}
</section>"""

    # --- Body sections ---
    body_parts = ""

    # Summary
    if summary:
        body_parts += _oe_section(
            "Summary", OE_ICONS["summary"],
            f'<p style="font-size:14px;line-height:1.7;color:{OE_BODY};margin:0;">{e(summary)}</p>'
        )

    # Experience
    if experience:
        items = ""
        for i, exp in enumerate(experience):
            dur = exp.get("duration") or ""
            loc = exp.get("location") or ""
            date_loc = ""
            if loc or dur:
                parts_list = []
                if loc:
                    parts_list.append(f"<span>{e(loc)}</span>")
                if dur:
                    parts_list.append(f"<span>{e(dur)}</span>")
                date_loc = f'<div style="text-align:right;font-size:13px;color:{OE_BODY};line-height:1.4;">{"<br>".join(parts_list)}</div>'

            bullets = ""
            if exp.get("bullets"):
                bullets = (
                    f'<ul style="margin:6px 0 0 0;padding-left:18px;font-size:13px;line-height:1.6;color:{OE_BODY};">'
                    + "".join(f"<li style='margin-bottom:1px;'>{e(b)}</li>" for b in exp["bullets"])
                    + "</ul>"
                )

            mb = "margin-bottom:12px;" if i < len(experience) - 1 else ""
            items += f"""\
<div class="avoid-break" style="{mb}">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;">
    <div style="flex:1;">
      <p style="font-size:15px;font-weight:700;color:{OE_HEADING};margin:0;">{e(exp.get('role') or '')}</p>
      <p style="font-size:14px;font-weight:600;color:{OE_BODY};margin:2px 0 0 0;">{e(exp.get('company') or '')}</p>
    </div>
    {date_loc}
  </div>
  {bullets}
</div>"""
        body_parts += _oe_section("Professional Experience", OE_ICONS["experience"], items)

    # Education
    if education:
        items = ""
        for i, edu in enumerate(education):
            year = edu.get("year") or ""
            loc = edu.get("location") or ""
            right = ""
            parts_list = []
            if loc:
                parts_list.append(f"<span>{e(loc)}</span>")
            if year:
                parts_list.append(f"<span>{e(year)}</span>")
            if parts_list:
                right = f'<div style="text-align:right;font-size:13px;color:{OE_BODY};line-height:1.4;">{"<br>".join(parts_list)}</div>'

            mb = "margin-bottom:12px;" if i < len(education) - 1 else ""
            items += f"""\
<div class="avoid-break" style="display:flex;justify-content:space-between;align-items:flex-start;{mb}">
  <div>
    <p style="font-size:15px;font-weight:700;color:{OE_HEADING};margin:0;">{e(edu.get('degree') or '')}</p>
    <p style="font-size:14px;font-weight:400;color:{OE_BODY};margin:2px 0 0 0;">{e(edu.get('institution') or '')}</p>
  </div>
  {right}
</div>"""
        body_parts += _oe_section("Education", OE_ICONS["education"], items)

    # Skills
    if skills:
        grid = ""
        for group in skills:
            name_html = ""
            if group.get("name"):
                nm = group["name"].replace("_", " ").title()
                name_html = f'<p style="font-size:14px;font-weight:600;color:{OE_HEADING};margin:0 0 4px 0;">{e(nm)}</p>'
            items_html = "".join(
                f"<li style='margin-bottom:1px;'>{e(s)}</li>" for s in group.get("skills", [])
            )
            grid += f"""\
<div>
  {name_html}
  <ul style="margin:0;padding-left:18px;font-size:13px;color:{OE_BODY};line-height:1.6;">{items_html}</ul>
</div>"""
        body_parts += _oe_section(
            "Skills", OE_ICONS["skills"],
            f'<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">{grid}</div>'
        )

    # Certifications
    if certifications:
        items = ""
        for cert in certifications:
            year = cert.get("year") or ""
            name_str = e(cert.get("name") or "")
            if cert.get("issuer"):
                name_str += f" &mdash; {e(cert.get('issuer'))}"
            if year:
                name_str += f" ({e(year)})"
            items += f"<li style='margin-bottom:1px;'>{name_str}</li>"
        body_parts += _oe_section(
            "Certificates", OE_ICONS["certifications"],
            f'<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;"><ul style="margin:0;padding-left:18px;font-size:13px;color:{OE_BODY};line-height:1.6;">{items}</ul></div>'
        )

    # Projects
    if projects:
        items = ""
        for i, proj in enumerate(projects):
            desc = proj.get("description") or ""
            tech = proj.get("tech_stack") or []
            desc_html = f'<p style="font-size:13px;color:{OE_BODY};margin:2px 0 0 0;">{e(desc)}</p>' if desc else ""
            tech_html = ""
            if tech:
                tech_html = (
                    '<div style="margin-top:4px;display:flex;flex-wrap:wrap;gap:4px;">'
                    + "".join(
                        f'<span style="font-size:12px;background:#e5e7eb;color:{OE_BODY};padding:2px 8px;border-radius:4px;">{e(t)}</span>'
                        for t in tech
                    )
                    + "</div>"
                )
            mb = "margin-bottom:12px;" if i < len(projects) - 1 else ""
            items += f"""\
<div class="avoid-break" style="{mb}">
  <p style="font-size:15px;font-weight:700;color:{OE_HEADING};margin:0 0 2px 0;">{e(proj.get('name') or '')}</p>
  {desc_html}
  {tech_html}
</div>"""
        body_parts += _oe_section("Projects", OE_ICONS["projects"], items)

    return f"""\
<div style="font-family:Inter,sans-serif;width:210mm;background:white;color:{OE_BODY};">
  {header}
  <div style="background:{OE_BODY_BG};padding:24px;display:flex;flex-direction:column;gap:20px;">
    {body_parts}
  </div>
</div>"""


def _oe_section(title: str, icon: str, content: str) -> str:
    return f"""\
<section class="avoid-break">
  <h2 style="font-size:18px;font-weight:700;color:{OE_HEADING};margin:0 0 12px 0;display:flex;align-items:center;gap:8px;">
    <span style="font-size:18px;">{icon}</span>
    {title}
  </h2>
  {content}
</section>"""


# ---------------------------------------------------------------------------
# Blue Steel renderer
# ---------------------------------------------------------------------------

BS_PRIMARY = "#2F3552"
BS_HEADER_BG = "#DCE4EA"
BS_BODY_BG = "#F3F4F6"
BS_CARD_BG = "#ffffff"
BS_TEXT = "#3A3A3A"
BS_MUTED = "#6B7280"


@register("blue-steel")
def _blue_steel(data: dict) -> str:
    d = data.get("data") or {}
    p = _personal(d)
    summary = d.get("summary") or ""
    experience = _experience(d)
    education = _education(d)
    skills = _skills(d)
    certifications = _certifications(d)
    projects = _projects(d)

    name = _full_name(p)
    title = p.get("job_title") or ""

    # --- Header banner ---
    initials = ""
    fn = (p.get("first_name") or "")[:1]
    ln = (p.get("last_name") or "")[:1]
    if fn or ln:
        initials = (fn + ln).upper()[:2]

    contact_rows = ""
    for row in [
        [("address", p.get("address"))],
        [("email", p.get("email"))],
        [("phone", p.get("mobile"))],
        [("linkedin", p.get("linkedin"))],
    ]:
        cells = ""
        for _label, val in row:
            if val:
                display = val.replace("https://linkedin.com/in/", "")
                cells += f"<span style='display:flex;align-items:center;gap:6px;font-size:12px;color:{BS_TEXT};'>{e(display)}</span>"
        if cells:
            contact_rows += cells

    title_html = ""
    if title:
        title_html = f"""<span style="font-family:'Playfair Display','Times New Roman',serif;font-size:20px;font-style:italic;font-weight:400;color:{BS_MUTED};line-height:1.2;">{e(title)}</span>"""

    header = f"""\
<div style="background:{BS_HEADER_BG};padding:28px 32px;display:flex;align-items:flex-start;gap:24px;">
  <div style="flex:1;min-width:0;">
    <div style="display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;">
      <h1 style="font-family:'Playfair Display','Times New Roman',serif;font-size:32px;font-weight:700;color:{BS_PRIMARY};margin:0;line-height:1.2;letter-spacing:-0.02em;">{e(name)}</h1>
      {title_html}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 24px;margin-top:14px;font-size:12px;color:{BS_TEXT};">
      {contact_rows}
    </div>
  </div>
  <div style="width:80px;height:80px;border-radius:50%;background:{BS_PRIMARY};display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;font-size:28px;font-weight:600;font-family:Inter,sans-serif;line-height:1;">
    {e(initials)}
  </div>
</div>"""

    # --- Body ---
    body = ""

    # Summary
    if summary:
        body += f"""\
<div style="background:{BS_CARD_BG};padding:20px;margin-bottom:16px;">
  <p style="font-size:13px;line-height:1.7;color:{BS_TEXT};margin:0;">{e(summary)}</p>
</div>"""

    # Experience
    if experience:
        items = ""
        for i, exp in enumerate(experience):
            dur = exp.get("duration") or ""
            loc = exp.get("location") or ""
            right = ""
            parts_list = []
            if loc:
                parts_list.append(f"<span>{e(loc)}</span>")
            if dur:
                parts_list.append(f"<span>{e(dur)}</span>")
            if parts_list:
                right = f'<div style="text-align:right;font-size:12px;color:{BS_MUTED};line-height:1.4;">{"<br>".join(parts_list)}</div>'
            bullets = ""
            if exp.get("bullets"):
                bullets = (
                    f'<ul style="margin:6px 0 0 0;padding-left:14px;font-size:12px;line-height:1.6;color:{BS_TEXT};">'
                    + "".join(f"<li style='margin-bottom:2px;'>{e(b)}</li>" for b in exp["bullets"])
                    + "</ul>"
                )
            mb = "margin-bottom:16px;" if i < len(experience) - 1 else ""
            items += f"""\
<div class="avoid-break" style="{mb}">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;">
    <div style="flex:1;">
      <p style="font-size:14px;font-weight:700;color:{BS_PRIMARY};margin:0;">{e(exp.get('role') or '')}</p>
      <p style="font-size:13px;font-weight:500;color:{BS_TEXT};margin:2px 0 0 0;">{e(exp.get('company') or '')}</p>
    </div>
    {right}
  </div>
  {bullets}
</div>"""
        body += f"""\
<div style="background:{BS_CARD_BG};padding:20px;margin-bottom:16px;">
  {_bs_section_heading("Work Experience")}
  {items}
</div>"""

    # Education
    if education:
        items = ""
        for i, edu in enumerate(education):
            year = edu.get("year") or ""
            loc = edu.get("location") or ""
            right_parts = []
            if loc:
                right_parts.append(f"<span>{e(loc)}</span>")
            if year:
                right_parts.append(f"<span>{e(year)}</span>")
            right = f'<div style="text-align:right;font-size:12px;color:{BS_MUTED};line-height:1.4;">{"<br>".join(right_parts)}</div>' if right_parts else ""
            mb = "margin-bottom:12px;" if i < len(education) - 1 else ""
            items += f"""\
<div class="avoid-break" style="display:flex;justify-content:space-between;align-items:flex-start;{mb}">
  <div>
    <p style="font-size:14px;font-weight:600;color:{BS_PRIMARY};margin:0;">{e(edu.get('degree') or '')}</p>
    <p style="font-size:13px;color:{BS_TEXT};margin:2px 0 0 0;">{e(edu.get('institution') or '')}</p>
  </div>
  {right}
</div>"""
        body += f"""\
<div style="background:{BS_CARD_BG};padding:20px;margin-bottom:16px;">
  {_bs_section_heading("Education")}
  {items}
</div>"""

    # --- Two-column bottom section ---
    bottom_cols = ""

    # Skills (left)
    if skills:
        grid = ""
        for group in skills:
            name_html = ""
            if group.get("name"):
                nm = group["name"].replace("_", " ").title()
                name_html = f'<p style="font-size:12px;font-weight:600;color:{BS_PRIMARY};margin:0 0 4px 0;text-transform:uppercase;letter-spacing:0.04em;">{e(nm)}</p>'
            items_html = "".join(
                f"<li style='margin-bottom:1px;'>{e(s)}</li>" for s in group.get("skills", [])
            )
            grid += f"""\
<div style="margin-bottom:12px;">
  {name_html}
  <ul style="margin:0;padding-left:14px;font-size:12px;color:{BS_TEXT};line-height:1.7;">{items_html}</ul>
</div>"""
        bottom_cols += f"""\
<div style="flex:1;background:{BS_CARD_BG};padding:20px;">
  {_bs_section_heading("Skills")}
  {grid}
</div>"""

    # Languages + Certifications + Projects (right)
    right_content = ""

    if certifications:
        items = ""
        for cert in certifications:
            year = cert.get("year") or ""
            name_str = e(cert.get("name") or "")
            if cert.get("issuer"):
                name_str += f" &mdash; {e(cert.get('issuer'))}"
            if year:
                name_str += f" ({e(year)})"
            items += f"<li style='margin-bottom:1px;'>{name_str}</li>"
        right_content += f"""\
<div style="background:{BS_CARD_BG};padding:20px;">
  {_bs_section_heading("Certificates")}
  <ul style="margin:0;padding-left:14px;font-size:12px;color:{BS_TEXT};line-height:1.6;">{items}</ul>
</div>"""

    if projects:
        items = ""
        for i, proj in enumerate(projects):
            desc = proj.get("description") or ""
            tech = proj.get("tech_stack") or []
            desc_html = f'<p style="font-size:12px;color:{BS_TEXT};margin:2px 0 0 0;">{e(desc)}</p>' if desc else ""
            tech_html = ""
            if tech:
                tech_html = (
                    '<div style="margin-top:4px;display:flex;flex-wrap:wrap;gap:4px;">'
                    + "".join(
                        f'<span style="font-size:11px;background:#e5e7eb;color:{BS_TEXT};padding:1px 6px;border-radius:3px;">{e(t)}</span>'
                        for t in tech
                    )
                    + "</div>"
                )
            mb = "margin-bottom:12px;" if i < len(projects) - 1 else ""
            items += f"""\
<div class="avoid-break" style="{mb}">
  <p style="font-size:13px;font-weight:600;color:{BS_PRIMARY};margin:0 0 2px 0;">{e(proj.get('name') or '')}</p>
  {desc_html}
  {tech_html}
</div>"""
        right_content += f"""\
<div style="background:{BS_CARD_BG};padding:20px;">
  {_bs_section_heading("Projects")}
  {items}
</div>"""

    if right_content:
        bottom_cols += f"""\
<div style="flex:1;display:flex;flex-direction:column;gap:16px;">
  {right_content}
</div>"""

    if bottom_cols:
        body += f'<div style="display:flex;gap:16px;">{bottom_cols}</div>'

    return f"""\
<div style="font-family:Inter,sans-serif;width:210mm;background:{BS_BODY_BG};color:{BS_TEXT};">
  {header}
  <div style="padding:20px 32px 32px;">
    {body}
  </div>
</div>"""


def _bs_section_heading(title: str) -> str:
    return f"""\
<div style="margin-bottom:12px;">
  <h2 style="font-size:14px;font-weight:700;color:{BS_PRIMARY};margin:0;text-transform:uppercase;letter-spacing:0.06em;">{title}</h2>
  <div style="height:1px;background:{BS_PRIMARY};opacity:0.3;margin-top:6px;"></div>
</div>"""


# ---------------------------------------------------------------------------
# Neon Green renderer
# ---------------------------------------------------------------------------

NG_ACCENT = "#3DDC97"
NG_TEXT = "#111827"
NG_SECONDARY = "#4B5563"
NG_MUTED = "#6B7280"
NG_BG = "#ffffff"
NG_BORDER = "#E5E7EB"


@register("neon-green")
def _neon_green(data: dict) -> str:
    d = data.get("data") or {}
    p = _personal(d)
    summary = d.get("summary") or ""
    experience = _experience(d)
    education = _education(d)
    skills = _skills(d)
    certifications = _certifications(d)
    projects = _projects(d)

    name = _full_name(p)
    title = p.get("job_title") or ""

    # --- Header ---
    initials = ""
    fn = (p.get("first_name") or "")[:1]
    ln = (p.get("last_name") or "")[:1]
    if fn or ln:
        initials = (fn + ln).upper()[:2]

    # Contact items (left col: location, phone; right col: email, github/portfolio)
    email = p.get("email") or ""
    phone = p.get("mobile") or ""
    address = p.get("address") or ""
    github = p.get("github") or ""
    portfolio = p.get("portfolio") or ""
    website_github = portfolio or github

    left_col = ""
    right_col = ""

    def contact_cell(icon_svg: str, val: str) -> str:
        dval = val.replace("https://github.com/", "").replace("https://linkedin.com/in/", "")
        return f"""\
<span style="display:flex;align-items:center;gap:6px;font-size:12px;color:{NG_SECONDARY};line-height:1.5;">
  {icon_svg}
  <span>{e(dval)}</span>
</span>"""

    if address:
        left_col += contact_cell(
            '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3DDC97" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 7-8 13-8 13s-8-6-8-13a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
            address,
        )
    if phone:
        left_col += contact_cell(
            '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3DDC97" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z"/></svg>',
            phone,
        )
    if email:
        right_col += contact_cell(
            '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3DDC97" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
            email,
        )
    if website_github:
        right_col += contact_cell(
            '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3DDC97" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
            website_github,
        )

    header = f"""\
<div style="padding:36px 40px 28px;display:flex;align-items:flex-start;gap:24px;">
  <div style="flex:1;min-width:0;">
    <h1 style="font-size:32px;font-weight:700;color:{NG_TEXT};margin:0;line-height:1.2;letter-spacing:-0.02em;">{e(name)}</h1>
    {f'<p style="font-size:18px;font-weight:400;color:{NG_SECONDARY};margin:4px 0 0 0;line-height:1.3;">{e(title)}</p>' if title else ''}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 32px;margin-top:16px;">
      <div style="display:flex;flex-direction:column;gap:6px;">
        {left_col}
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;">
        {right_col}
      </div>
    </div>
  </div>
  {f'<div style="width:88px;height:88px;border-radius:6px;background:{NG_ACCENT};display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;font-size:28px;font-weight:600;font-family:Inter,sans-serif;line-height:1;">{e(initials)}</div>' if initials else ''}
</div>"""

    # --- Body ---
    body = ""
    body += '<div style="padding:0 40px 36px;">'

    # Summary
    if summary:
        body += f"""\
<div style="margin-bottom:28px;">
  <p style="font-size:12px;line-height:1.7;color:{NG_SECONDARY};margin:0;">{e(summary)}</p>
</div>"""

    # Experience
    if experience:
        body += _ng_section_heading("Professional Experience")
        for i, exp in enumerate(experience):
            dur = exp.get("duration") or ""
            loc = exp.get("location") or ""
            right = ""
            parts_list = []
            if loc:
                parts_list.append(f"<span>{e(loc)}</span>")
            if dur:
                parts_list.append(f"<span>{e(dur)}</span>")
            if parts_list:
                right = f'<div style="text-align:right;font-size:11px;color:{NG_MUTED};line-height:1.5;white-space:nowrap;margin-left:12px;">{"<br>".join(parts_list)}</div>'
            bullets = ""
            if exp.get("bullets"):
                bullets = (
                    f'<ul style="margin:4px 0 0 0;padding-left:14px;font-size:11px;line-height:1.6;color:{NG_SECONDARY};">'
                    + "".join(f"<li style='margin-bottom:1px;'>{e(b)}</li>" for b in exp["bullets"])
                    + "</ul>"
                )
            mb = "margin-bottom:18px;" if i < len(experience) - 1 else ""
            body += f"""\
<div class="avoid-break" style="{mb}">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;">
    <div style="flex:1;">
      <p style="font-size:13px;font-weight:700;color:{NG_TEXT};margin:0;">{e(exp.get('role') or '')}</p>
      <p style="font-size:12px;font-style:italic;color:{NG_SECONDARY};margin:1px 0 0 0;">{e(exp.get('company') or '')}</p>
    </div>
    {right}
  </div>
  {bullets}
</div>"""

    # Education
    if education:
        body += _ng_section_heading("Education")
        for i, edu in enumerate(education):
            year = edu.get("year") or ""
            loc = edu.get("location") or ""
            right_parts = []
            if loc:
                right_parts.append(f"<span>{e(loc)}</span>")
            if year:
                right_parts.append(f"<span>{e(year)}</span>")
            right = f'<div style="text-align:right;font-size:11px;color:{NG_MUTED};white-space:nowrap;margin-left:12px;">{"<br>".join(right_parts)}</div>' if right_parts else ""
            mb = "margin-bottom:12px;" if i < len(education) - 1 else ""
            body += f"""\
<div class="avoid-break" style="display:flex;justify-content:space-between;align-items:flex-start;{mb}">
  <div>
    <p style="font-size:13px;font-weight:700;color:{NG_TEXT};margin:0;">{e(edu.get('degree') or '')}</p>
    <p style="font-size:12px;font-style:italic;color:{NG_SECONDARY};margin:1px 0 0 0;">{e(edu.get('institution') or '')}</p>
  </div>
  {right}
</div>"""

    # Skills (flat keyword row)
    if skills:
        all_skill_names: list[str] = []
        for g in skills:
            all_skill_names.extend(g.get("skills", []))
        if all_skill_names:
            body += _ng_section_heading("Skills")
            joined = " \u2022 ".join(e(s) for s in all_skill_names)
            body += f'<p style="font-size:11px;color:{NG_SECONDARY};margin:0;line-height:1.7;">{joined}</p>'

    # Two-column bottom: Languages + Certifications/Projects
    has_langs = d.get("languages") or []
    has_certs = certifications
    has_projs = projects
    if has_langs or has_certs or has_projs:
        bottom = ""
        if has_langs:
            lang_items = ""
            for lang in has_langs:
                nm = e(lang.get("name") or "")
                prof = (lang.get("proficiency") or "").capitalize()
                lang_items += f'<p style="font-size:11px;color:{NG_SECONDARY};margin:0;line-height:1.6;">{nm} <span style="color:{NG_MUTED};">({e(prof)})</span></p>'
            bottom += f"""\
<div style="flex:1;min-width:0;">
  {_ng_section_heading("Languages")}
  <div style="display:flex;flex-direction:column;gap:4px;">
    {lang_items}
  </div>
</div>"""
        if has_certs or has_projs:
            right_bottom = ""
            if has_certs:
                cert_items = ""
                for cert in has_certs:
                    year = cert.get("year") or ""
                    name_str = e(cert.get("name") or "")
                    if cert.get("issuer"):
                        name_str += f" &mdash; {e(cert.get('issuer'))}"
                    if year:
                        name_str += f" ({e(year)})"
                    cert_items += f"<li style='margin-bottom:1px;'>{name_str}</li>"
                if cert_items:
                    right_bottom += f"""\
<div style="margin-bottom:20px;">
  {_ng_section_heading("Certifications")}
  <ul style="margin:0;padding-left:14px;font-size:11px;color:{NG_SECONDARY};line-height:1.6;">{cert_items}</ul>
</div>"""
            if has_projs:
                proj_items = ""
                for proj in has_projs:
                    proj_name = e(proj.get("name") or "")
                    desc = proj.get("description") or ""
                    entry = f"<li><span style='font-weight:600;color:{NG_TEXT};'>{proj_name}</span>"
                    if desc:
                        entry += f": {e(desc)}"
                    entry += "</li>"
                    proj_items += entry
                if proj_items:
                    right_bottom += f"""\
<div>
  {_ng_section_heading("Projects")}
  <ul style="margin:0;padding-left:14px;font-size:11px;color:{NG_SECONDARY};line-height:1.6;">{proj_items}</ul>
</div>"""
            if right_bottom:
                bottom += f'<div style="flex:1;min-width:0;">{right_bottom}</div>'

        if bottom:
            body += f'<div style="display:flex;gap:40px;margin-top:28px;">{bottom}</div>'

    body += "</div>"

    return f"""\
<div style="font-family:Inter,sans-serif;width:210mm;background:{NG_BG};color:{NG_TEXT};">
  {header}
  {body}
</div>"""


def _ng_section_heading(title: str) -> str:
    return f"""\
<div style="margin-bottom:8px;">
  <h2 style="font-size:13px;font-weight:700;color:{NG_TEXT};margin:0;text-transform:uppercase;letter-spacing:0.08em;">{title}</h2>
  <div style="height:2px;background:{NG_ACCENT};margin-top:5px;width:32px;"></div>
</div>"""


# ---------------------------------------------------------------------------
# Professional Executive renderer
# ---------------------------------------------------------------------------

@register("professional-executive")
def _professional_executive(data: dict) -> str:
    d = data.get("data") or {}
    p = _personal(d)
    summary = d.get("summary") or ""
    experience = _experience(d)
    education = _education(d)
    skills = _skills(d)
    certifications = _certifications(d)
    projects = _projects(d)

    def divider():
        return '<hr style="border:none;height:2px;background:#4A6785;margin:8px 0 12px 0;" />'

    def section_heading(title, first=False):
        return f"{'' if first else divider()}<h2 style='font-size:16px;font-weight:700;color:#355E88;margin:0 0 8px 0;'>{title}</h2>"

    # Header
    parts = []
    parts.append(f"<h1 style='font-size:42px;font-weight:700;color:#355E88;margin:0;line-height:1.1;'>{e(_full_name(p))}</h1>")
    if p.get("job_title"):
        parts.append(f"<p style='font-size:20px;font-weight:400;color:#4E6B86;margin:8px 0 0 0;'>{e(p['job_title'])}</p>")

    contact_items = ""
    for val in [p.get("email"), p.get("mobile"), p.get("address"), p.get("linkedin"), p.get("github")]:
        if val:
            contact_items += f"<span style='font-size:13px;color:#222222;'>{e(val)}</span>"
    if contact_items:
        parts.append(f"<div style='display:flex;flex-wrap:wrap;gap:12px;margin-top:14px;font-size:13px;color:#222222;'>{contact_items}</div>")
    header_html = "\n".join(parts)

    # Body
    body = ""

    # Summary
    if summary:
        body += section_heading("Summary", first=True)
        body += f"<p style='font-size:14px;line-height:1.7;color:#333333;margin:0;'>{e(summary)}</p>"

    # Experience
    if experience:
        body += section_heading("Experience")
        for i, exp in enumerate(experience):
            duration = exp.get("duration") or ""
            date_html = f"<p style='font-size:14px;font-weight:600;color:#444444;margin:0;white-space:nowrap;'>{e(duration)}</p>" if duration else ""
            bullets = ""
            if exp.get("bullets"):
                bullets = "<ul style='margin:6px 0 0 0;padding-left:18px;font-size:14px;line-height:1.6;color:#333333;'>" + "".join(
                    f"<li style='margin-bottom:2px;'>{e(b)}</li>" for b in exp["bullets"]
                ) + "</ul>"
            mb = "margin-bottom:16px;" if i < len(experience) - 1 else ""
            body += f"""\
<div class="avoid-break" style="{mb}">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;">
    <div>
      <p style="font-size:16px;font-weight:700;color:#222222;margin:0;">{e(exp.get('role'))}</p>
      <p style="font-size:15px;font-weight:500;color:#333333;margin:2px 0 0 0;">{e(exp.get('company'))}</p>
    </div>
    {date_html}
  </div>
  {bullets}
</div>"""

    # Education
    if education:
        body += section_heading("Education")
        for i, edu in enumerate(education):
            year = edu.get("year") or ""
            date_html = f"<p style='font-size:14px;font-weight:600;color:#444444;margin:0;white-space:nowrap;'>{e(year)}</p>" if year else ""
            mb = "margin-bottom:16px;" if i < len(education) - 1 else ""
            body += f"""\
<div class="avoid-break" style="display:flex;justify-content:space-between;align-items:flex-start;{mb}">
  <div>
    <p style="font-size:16px;font-weight:700;color:#222222;margin:0;">{e(edu.get('degree'))}</p>
    <p style="font-size:15px;font-weight:500;color:#333333;margin:2px 0 0 0;">{e(edu.get('institution'))}</p>
  </div>
  {date_html}
</div>"""

    # Skills
    if skills:
        body += section_heading("Skills")
        grid_items = ""
        for group in skills:
            items = "".join(
                f"<li style='margin-bottom:1px;'>{e(s)}</li>" for s in group.get("skills", [])
            )
            name_html = f"<p style='font-size:14px;font-weight:600;color:#222222;margin:0 0 4px 0;'>{e(group.get('name','').replace('_',' ').title())}</p>" if group.get("name") else ""
            grid_items += f"""\
<div class="avoid-break">
  {name_html}
  <ul style="margin:0;padding-left:18px;font-size:14px;color:#333333;line-height:1.6;">
    {items}
  </ul>
</div>"""
        body += f"<div style='display:grid;grid-template-columns:repeat(2,1fr);gap:24px;'>{grid_items}</div>"

    # Certifications
    if certifications:
        body += section_heading("Certificates")
        items = ""
        for cert in certifications:
            year = cert.get("year") or ""
            items += f"<li style='margin-bottom:2px;'>{e(cert.get('name'))}{' — '+e(cert.get('issuer')) if cert.get('issuer') else ''}{' ('+e(year)+')' if year else ''}</li>"
        body += f"<ul style='margin:0;padding-left:18px;font-size:14px;color:#333333;line-height:1.6;'>{items}</ul>"

    # Projects
    if projects:
        body += section_heading("Projects")
        for i, proj in enumerate(projects):
            desc = proj.get("description") or ""
            tech = proj.get("tech_stack") or []
            desc_html = f"<p style='font-size:14px;color:#4b5563;margin:2px 0 0 0;'>{e(desc)}</p>" if desc else ""
            tech_html = ""
            if tech:
                tech_html = "<div style='margin-top:4px;display:flex;flex-wrap:wrap;gap:4px;'>" + "".join(
                    f"<span style='font-size:12px;background:#f3f4f6;color:#374151;padding:2px 8px;border-radius:4px;'>{e(t)}</span>"
                    for t in tech
                ) + "</div>"
            mb = "margin-bottom:16px;" if i < len(projects) - 1 else ""
            body += f"""\
<div class="avoid-break" style="{mb}">
  <p style="font-size:15px;font-weight:600;color:#222222;margin:0 0 2px 0;">{e(proj.get('name'))}</p>
  {desc_html}
  {tech_html}
</div>"""

    return f"""\
<div style="font-family:Inter,sans-serif;width:210mm;padding:40px;color:#333333;background:white;">
  {header_html}
  {body}
</div>"""
