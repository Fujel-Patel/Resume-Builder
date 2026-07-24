# Design Audit — Resume Template System

**Date:** 2026-07-24
**Scope:** 37 templates (27 config-driven + 10 component-driven)
**Benchmark:** Resume.io, FlowCV, Novorésumé, Canva Resume
**Status:** READ-ONLY — no code changes until reviewed

---

## Executive Summary

The template system is structurally sound but has **systemic typography/spacing issues** that make most templates feel smaller and denser than competitors. The two rendering systems (config-driven vs component-driven) have divergent styling, and there are several rendering bugs. Fixing the systemic issues across tokens and shared components would improve all 27 config-driven templates simultaneously.

**Top 3 quick wins:**
1. Increase body text from 10px → 11px and name from 30px → 34px (token change)
2. Increase section gaps from 18px → 24px (token change)
3. Fix contact info duplication in sidebar layouts (renderer bug)

---

## P0 — Critical (Bugs / Broken Rendering)

### 1. Sidebar layouts show contact info twice
**Affected:** All sidebar-left, sidebar-right, two-column-left, two-column-right configs (16 templates)
**File:** `design-system/renderer/TemplateRenderer.tsx:83-94`

`contactBlock` (lines 51-81) is always rendered at the top, *outside* the layout branch. Then `sidebarContent` (lines 87-94) filters for `["skills", "languages", "certifications", "contact"]` — which **includes** contact. Result: contact info renders twice for sidebar templates (once in the main area header, once in the sidebar via SectionRenderer).

**Fix:** Remove `"contact"` from the `sidebarContent` filter on line 91. The contact block is already handled by `contactBlock`.

### 2. `SectionRenderer` uses section `visible` filter redundantly
**File:** `design-system/renderer/SectionRenderer.tsx:44`

`SectionRenderer` receives sections that are already filtered by `TemplateRenderer` (line 31-33), then filters again (line 44). The outer filter uses `s.visible` from the section config, the inner filter also uses `s.visible`. This is harmless but could cause confusion if someone adds a section as visible=false — it would still be excluded.

**Fix:** Low priority — remove the redundant filter in SectionRenderer or document the intent.

### 3. `Divider` component renders before first section
**File:** `design-system/renderer/SectionRenderer.tsx:98`

```tsx
{showDivider && idx > 0 && <Divider ... />}
```

The divider appears *above* the section header (before `SectionHeader`), but the visual intent is to separate *between* sections. With `idx > 0`, the first visible section never gets a divider above it, which is correct. However, the divider spacing (`marginTop: 10, marginBottom: 10`) creates double spacing when combined with the section header's `marginBottom: 10`.

**Fix:** Reduce divider `marginTop` from default to 0 for dividers between sections, or remove the marginTop on the divider in SectionRenderer.

---

## P1 — High (Systemic Quality Issues)

### 4. Body text too small — 10px vs competitor 11-12px
**Affected:** All 27 config-driven templates
**File:** `design-system/tokens/typography.ts:25-26`

| Token | Current | Competitor Range | Recommended |
|-------|---------|-----------------|-------------|
| `bodyMD` | 10.5px | 11-12px | 11px |
| `bodySM` | 10px | 10-11px | 10.5px |
| `bodyLG` | 11px | 12-13px | 12px |

Resume.io uses 10pt (≈13.3px) body text. FlowCV uses 9.5-10pt. Our 10px body text is notably smaller and harder to read, especially in print.

### 5. Name font too small — 30px vs competitor 32-40px
**File:** `design-system/renderer/TemplateRenderer.tsx:64`

Config-driven templates render the name at `fontSize: 30`. Legacy templates use 32-42px. Competitors use 32-40px. The name should be the most prominent element.

**Recommendation:** 34px for standard layouts, allow configs to override.

### 6. Section headers too small and too uniform
**File:** `design-system/tokens/typography.ts:21-23`

| Token | Current | Recommended |
|-------|---------|-------------|
| `headingLG` | 12px | 13px |
| `headingMD` | 11px | 12px |
| `headingSM` | 10px | 11px |

Section headers (EXPERIENCE, EDUCATION, etc.) should be 12-13px with 700 weight. Currently they're 11-11.5px which makes sections feel undifferentiated.

### 7. Section gap too tight — 18px vs competitor 22-30px
**File:** `design-system/tokens/spacing.ts:21-23`

| Preset | Current `sectionGap` | Recommended |
|--------|---------------------|-------------|
| compact | 14px | 16px |
| normal | 18px | 24px |
| spacious | 26px | 30px |

Competitors consistently use 24-30px between major sections. The 18px gap makes resumes feel cramped.

### 8. Experience item spacing too tight
**File:** `design-system/sections/ExperienceItem.tsx:92,104-106`

- `marginBottom: 10` between experience items → recommend 14-16px
- Bullet `marginBottom: 2` → recommend 3px
- Bullet `lineHeight: 1.6` → keep (good)

Legacy templates (professional-executive) use `marginBottom: 16` between items and `marginBottom: 3` for bullets — noticeably better spacing.

### 9. Contact info inline style lacks visual polish
**File:** `design-system/sections/ContactInfo.tsx:49-58`

The inline contact style uses bullet separators (`•`) between items. Competitors use:
- Resume.io: pipe separators with subtle styling
- FlowCV: icon + text, no separators, tighter layout
- Novorésumé: small icons with compact spacing

**Recommendation:** Add a "compact-inline" variant with icon support and tighter spacing for config templates that set `showIcons: true`.

### 10. No `interests` section handler in SectionRenderer
**File:** `design-system/renderer/SectionRenderer.tsx:41-109`

`SectionRenderer` handles summary, experience, education, skills, projects, languages, certifications, awards — but **not** `interests` or `references` or `custom`. If a user enables the interests section, it silently disappears.

**Fix:** Add handlers for `interests`, `references`, and `custom` section types.

### 11. `compact` ExperienceItem uses joined bullets (hard to scan)
**File:** `design-system/sections/ExperienceItem.tsx:26`

```tsx
{item.bullets.join(" · ")}
```

This joins all bullets into a single paragraph separated by `·`. Competitors never do this — bullets should always be separate list items for scannability. The `compact` variant is used by sidebar-dark, sidebar-modern, etc.

**Fix:** Replace with proper `<ul>` with reduced spacing, or remove the `compact` variant and use `bullets` everywhere.

---

## P2 — Medium (Visual Quality / Consistency)

### 12. Two rendering systems produce visually different results

**Config-driven (27 templates):** Uses shared SectionHeader, ExperienceItem, etc. Consistent but formulaic.

**Component-driven (10 templates):** Each has custom layout code. More distinctive but inconsistent with each other.

| Aspect | Config-driven | Component-driven |
|--------|--------------|-----------------|
| Name font | 30px | 30-42px |
| Section gap | 14-26px (preset) | 16-24px (hardcoded) |
| Bullet spacing | 2px | 2-3px |
| Experience gap | 10px | 12-16px |
| Font family | Token-resolved | Hardcoded Inter/Playfair |

**Recommendation:** Align component-driven templates to the same typography scale. Don't refactor them to use the config system — just update their hardcoded values.

### 13. ATS templates lack distinguishing features
**Affected:** ats-clean, ats-compact, ats-minimal, ats-modern-sans, ats-serif, ats-bold-headings, ats-creative-safe, ats-executive

All 8 ATS templates look nearly identical: single column, Inter font, underline headers, bullets experience. The only differences are palette color and slight font swaps.

Competitors differentiate ATS templates by:
- Font pairing (serif + sans combos)
- Header treatment (left-aligned vs centered vs boxed)
- Spacing density (compact vs generous)
- Column widths (some use asymmetric margins)

**Recommendation:** Give each ATS template a distinct header treatment + font pair + spacing preset.

### 14. Creative templates don't feel creative enough
**Affected:** creative-bold, creative-elegant, creative-gradient, creative-ocean, creative-sage

These use the same single-column layout as ATS templates with just different accent colors. Competitors like Novorésumé and Canva differentiate creative templates with:
- Colored sidebars or accent panels
- Photo integration
- Custom section dividers
- Non-standard layouts (diagonal splits, overlapping elements)

**Recommendation:** Creative templates should use `sidebar-left` or `sidebar-right` layouts with bold color backgrounds, or introduce visual elements beyond accent colors.

### 15. Sidebar templates have inconsistent sidebar widths
**File:** `design-system/renderer/TemplateRenderer.tsx:112,127`

- `sidebar-left`: width calculated from `config.grid` (22%, 28%, or 30%)
- `sidebar-right`: hardcoded 28%

This means the same template config would render differently if the sidebar is on the right vs left.

**Fix:** Always derive sidebar width from `config.grid`.

### 16. Font family mismatches between config and rendering
Several configs specify fonts that may not load properly:

| Config | Heading Font | Issue |
|--------|-------------|-------|
| ats-serif | playfairDisplay | Google Fonts requires `<link>` — check if loaded |
| finance-formal | playfairDisplay | Same |
| consultant | playfairDisplay | Same |
| executive-navy | playfairDisplay | Same |

If Playfair Display isn't loaded via `next/font`, these templates fall back to system serif.

**Action:** Verify `design-system/fonts/index.ts` loads all 8 font families via Google Fonts.

### 17. Config `showProfileImage` doesn't check for actual photo
**File:** `design-system/renderer/TemplateRenderer.tsx:54`

When `showProfileImage: true`, the renderer shows a ProfileImage component regardless of whether `content.contact.photoUrl` is set. ProfileImage gracefully shows initials when no photo, but the large initials circle may not be desired by users who didn't upload a photo.

**Recommendation:** Only render ProfileImage when `config.features.showProfileImage && content.contact.photoUrl`.

### 18. `two-tone` SectionHeader variant looks odd
**File:** `design-system/sections/SectionHeader.tsx:58-65`

The two-tone header shows the title in primary color with a horizontal line. But the line uses `c.border` (palette muted color) which is very light (#e2e8f0 etc). This creates an unbalanced look where the text is bold but the line is barely visible.

**Fix:** Use `c.primary` for the line in two-tone variant, or increase opacity.

### 19. `filled` SectionHeader color detection is fragile
**File:** `design-system/sections/SectionHeader.tsx:40`

```tsx
color: c.primary.startsWith("#fff") || c.primary === "#ffffff" ? c.text : "#fff"
```

This checks if the primary color is white to decide text color. But no palette has a white primary — all are dark. The check is dead code.

**Fix:** Simplify to `color: "#fff"` since no accent palette has a light primary.

---

## P3 — Low (Polish / Nice-to-Have)

### 20. Inconsistent em-dash vs en-dash in date ranges

| Source | Character | Example |
|--------|-----------|---------|
| Config-driven ExperienceItem | em-dash `—` | `Mar 2021 — Present` |
| Legacy templates | en-dash `–` | `Mar 2021 – Present` |
| Competitors | en-dash `–` | `Mar 2021 – Present` |

**Fix:** Standardize on en-dash `–` everywhere (industry standard for date ranges).

### 21. Section title casing inconsistency

| Template | Style |
|----------|-------|
| Config-driven | Uses section `title` from config (e.g. "Professional Summary") |
| Legacy professional-executive | Hardcoded "Summary", "Experience", "Skills" |
| Legacy neon-green | "Professional Experience", "Skills" |
| Legacy blue-steel | "Work Experience", "Skills", "Strengths" |
| Legacy obsidian-edge | "Professional Experience", "Education" |

**Recommendation:** Standardize section titles across all templates. Competitors use short forms: "Experience", "Education", "Skills", "Projects".

### 22. `SkillGroup` categories variant has inconsistent text styling
**File:** `design-system/sections/SkillGroup.tsx:70-78`

The "categories" variant renders category names in `primary` color with `textTransform: uppercase`. But the "grouped" variant (which is more commonly used) renders them in `text` color with no transform. This creates visual inconsistency when the same template uses different skill display modes.

### 23. `LanguageItem` proficiency display varies wildly

| Template | Display |
|----------|---------|
| Config-driven | `English (Native)` with italic |
| blue-steel | Dot rating (1-5 dots) |
| neon-green | `English (Native)` |
| minimal-timeline | `Native` badge |
| developer-portfolio | `Native` text |

The dot rating in blue-steel is visually distinctive and premium-looking. Consider offering it as a `SkillGroup` variant option.

### 24. `CertificationItem` layout could be more compact
**File:** `design-system/sections/CertificationItem.tsx:14`

Currently uses flex row with `justifyContent: space-between`. For sidebar layouts, certifications could use a simpler inline format (name + issuer on one line).

### 25. Missing `@page` CSS for print
None of the templates include `@page` CSS rules for proper print margins. When users print resumes, browser defaults may clip content.

**Fix:** Add `@page { size: A4; margin: 0; }` to the global styles or to each template wrapper.

### 26. `ObisdianEdge` uses `minHeight: "297mm"` while config uses `minHeight: 1123`
Different approaches to the same thing (A4 height). The mm unit is more semantically correct but less predictable across browsers.

---

## Recommended Implementation Order

### Phase 1: Quick Token Wins (improves all 27 config-driven templates)
1. Update `typography.ts` body/heading scales (P1 #4, #6)
2. Update `spacing.ts` section gaps (P1 #7)
3. Update `ExperienceItem` spacing (P1 #8)
4. Fix name size in `TemplateRenderer.tsx` (P1 #5)

### Phase 2: Bug Fixes (P0)
5. Fix sidebar contact duplication (P0 #1)
6. Add missing section handlers (P1 #10)
7. Fix compact bullets join (P1 #11)

### Phase 3: Component Alignment (P2)
8. Update 10 component-driven templates to match new token scales (P2 #12)
9. Standardize date separator to en-dash (P3 #20)
10. Standardize section titles (P3 #21)

### Phase 4: Template Differentiation (P2)
11. Give ATS templates distinct header treatments (P2 #13)
12. Make creative templates use non-single-column layouts (P2 #14)

---

## Appendix: Competitor Benchmarks

### Resume.io
- Name: ~36-40px, bold
- Title: ~16-18px
- Body: ~11px (10pt)
- Section headers: ~12-13px, uppercase, letter-spacing 0.1em
- Section gap: ~24px
- Bullet spacing: ~3px
- Contact: inline with pipe separators or icons
- Layout: single column or sidebar

### FlowCV
- Name: ~32-36px, bold
- Title: ~14-16px
- Body: ~10-11px
- Section headers: ~11-12px, uppercase
- Section gap: ~20-24px
- Bullet spacing: ~2-3px
- Contact: compact with icons
- Layout: single or sidebar

### Novorésumé
- Name: ~32-38px, bold
- Title: ~14-16px
- Body: ~10-11px
- Section headers: ~12-13px, with accent colors
- Section gap: ~24-28px
- Bullet spacing: ~3px
- Contact: icons with compact layout
- Layout: sidebar dominant, colorful

### Canva Resume
- Name: ~36-44px (larger range)
- Title: ~16-20px
- Body: ~11-12px
- Section headers: ~12-14px, varied styles
- Section gap: ~24-32px
- Bullet spacing: ~3-4px
- Contact: decorative with icons
- Layout: highly varied, creative layouts
