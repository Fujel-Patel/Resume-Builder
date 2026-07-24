# Adaptive Print Optimization System — Implementation Plan

## Problem
13 of 37 templates overflow A4. Previous approach downgraded premium section variants (magazine→bullets, executive→bullets, etc.), destroying visual identity. Need an adaptive system that preserves every template's premium look while maximizing one-page fit.

## Architecture

```
ConfigTemplateRenderer
  ├── estimateContentHeight(resume, config) → number
  ├── isCompact = estimatedHeight > A4_HEIGHT (1123px)
  │
  ├── Layout Component (receives compact prop)
  │     ├── HeroBanner / HeroBannerCompact
  │     ├── ExecutiveHeader / ExecutiveHeaderCompact
  │     ├── EditorialLayout / EditorialLayoutCompact
  │     ├── MagazineLayout / MagazineLayoutCompact
  │     ├── SplitHeaderLayout / SplitHeaderLayoutCompact
  │     ├── OffsetSidebar / OffsetSidebarCompact
  │     ├── ModernGrid / ModernGridCompact
  │     ├── FloatingSidebar (no compact needed — already minimal)
  │     ├── Sidebar (no compact needed — already minimal)
  │     └── SingleColumn (no compact needed — just padding)
  │
  └── SectionRenderer (receives compact prop)
        ├── SectionHeader     → compact: marginBottom -3px
        ├── ExperienceItem    → compact: marginBottom -4px, bullet margin -1px
        ├── EducationItem     → compact: marginBottom -3px
        ├── SkillGroup        → compact: minimal (already tight)
        ├── SummarySection    → compact: minimal (already 0-2px)
        ├── ProjectCard       → compact: marginBottom -4px
        └── ContactInfo       → compact: no change
```

## Step-by-Step Implementation

### Step 1: Revert Section Variant Downgrades
Restore premium variants in these config files that were downgraded in the previous session:
- `consultant.ts` — restore role-first, categories, detailed, featured, highlight
- `creative-elegant.ts` — restore magazine, categories, editorial; restore spacious spacing
- `tech-professional.ts` — restore cards, detailed, highlight
- `executive-navy.ts` — restore executive, detailed, editorial
- `creative-gradient.ts` — restore timeline (×2), card, highlight
- `nova.ts` — restore timeline (×2) for experience/education

### Step 2: Add `compact` Prop to Layout Components
Modify each layout to accept `compact?: boolean` and use tighter spacing when true.

**Files to modify:**
- `layouts/HeroBanner.tsx`
- `layouts/ExecutiveHeader.tsx`
- `layouts/EditorialLayout.tsx`
- `layouts/MagazineLayout.tsx`
- `layouts/SplitHeaderLayout.tsx`
- `layouts/OffsetSidebar.tsx`
- `layouts/ModernGrid.tsx`

**Compact spacing reductions per layout:**

| Layout | Normal | Compact | Savings |
|--------|--------|---------|---------|
| HeroBanner header | 20/16 t/b | 14/10 t/b | 12px |
| HeroBanner content | 18/24 t/b | 12/16 t/b | 14px |
| ExecutiveHeader | 36px padding | 22px padding | 28px |
| ExecutiveHeader divider | 12/16 t/b | 6/10 t/b | 12px |
| EditorialLayout | 48/48 t/b | 30/30 t/b | 36px |
| EditorialLayout line-height | 1.6 | 1.45 | ~15px per 1000px |
| MagazineLayout accent bar | 16/20 t/b | 10/12 t/b | 14px |
| SplitHeaderLayout | 16+1+16 gap/div | 10+1+10 | 12px |
| OffsetSidebar topbar | 32+16 t/b | 20+10 t/b | 18px |
| OffsetSidebar sidebar | padding 20 | padding 14 | ~10px content |
| ModernGrid header | 16+2+20 | 10+2+14 | 12px |

### Step 3: Add `compact` Prop to SectionRenderer and Section Components

**Files to modify:**
- `renderer/SectionRenderer.tsx` — accept `compact?: boolean`, pass to all section components
- `sections/SectionHeader.tsx` — reduce marginBottom by 3px in compact mode
- `sections/ExperienceItem.tsx` — reduce marginBottom by 4px, bullet margin by 1px in compact mode
- `sections/EducationItem.tsx` — reduce marginBottom by 3px in compact mode
- `sections/SkillGroup.tsx` — minimal changes (already tight)
- `sections/SummarySection.tsx` — no changes needed
- `sections/ProjectCard.tsx` — reduce marginBottom by 4px in compact mode

**Compact section spacing reductions:**

| Component | Normal variant margin | Compact reduction | Per-item savings |
|-----------|----------------------|-------------------|-----------------|
| SectionHeader (editorial) | 12 | 9 | 3px |
| SectionHeader (all others) | 10 | 7 | 3px |
| ExperienceItem (executive) | 16 | 11 | 5px |
| ExperienceItem (magazine) | 16 | 11 | 5px |
| ExperienceItem (timeline) | 14 | 10 | 4px |
| ExperienceItem (bullets) | 12 | 8 | 4px |
| ExperienceItem (role-first) | 14 | 10 | 4px |
| ExperienceItem (compact) | 10 | 7 | 3px |
| ExperienceItem (cards) | 10 | 7 | 3px |
| ExperienceItem bullet marginBottom | 3 | 2 | 1px per bullet |
| EducationItem (magazine) | 12 | 8 | 4px |
| EducationItem (standard/detailed) | 8/10 | 5/7 | 3px |
| ProjectCard (varies) | ~10-14 | ~7-10 | 3-4px |

**Total section compact savings for a typical 5-section resume:**
- 5 section headers × 3px = 15px
- 3 experience items × 5px = 15px
- ~15 bullets × 1px = 15px
- 1 education item × 3px = 3px
- 3 project items × 4px = 12px
- **Total: ~60px from section compact alone**

### Step 4: Create Height Estimator

**New file:** `renderer/estimateHeight.ts`

```typescript
function estimateContentHeight(resume: ResumeData, config: TemplateConfig): number
```

**Estimation model:**

```
layoutOverhead = getLayoutOverhead(config.layout)  // base padding for the layout
contactHeight = estimateContactHeight(config.headerVariant)
sectionHeight = Σ estimateSectionHeight(section, config.sections, resume.content)
totalHeight = layoutOverhead + contactHeight + sectionHeight
```

**Layout overhead table:**

| Layout | Normal Overhead | Compact Overhead |
|--------|----------------|-----------------|
| single | margin×2 (56 for narrow) | same |
| sidebar-* | margin×2 | same |
| hero-banner | 78 | 52 |
| executive-header | 100 | 60 |
| editorial | 96 | 60 |
| magazine | margin×2 + 36 | margin×2 + 22 |
| split-header | margin×2 + 33 | margin×2 + 21 |
| modern-grid | margin×2 + 38 | margin×2 + 26 |
| offset-sidebar | margin×2 + 48 | margin×2 + 30 |
| floating-sidebar | margin×2 | same |

**Contact block height estimates:**

| headerVariant | Height |
|---------------|--------|
| banner | 90 |
| centered | 80 |
| split | 70 |
| minimal-top | 45 |
| classic | 70 |

**Section height estimates (per item × count):**

| Section | Variant | Per-item height |
|---------|---------|----------------|
| experience | executive | 65 |
| experience | magazine | 60 |
| experience | timeline | 55 |
| experience | role-first | 55 |
| experience | cards | 50 |
| experience | bullets | 48 |
| experience | compact | 40 |
| education | magazine | 42 |
| education | detailed | 38 |
| education | timeline | 38 |
| education | standard | 32 |
| education | compact | 28 |
| skills | categories | 45 |
| skills | grouped | 40 |
| skills | three-column | 35 |
| skills | tags | 30 |
| skills | matrix | 35 |
| skills | list | 25 |
| projects | featured | 55 |
| projects | detailed | 50 |
| projects | card | 45 |
| projects | magazine | 45 |
| projects | standard | 38 |
| projects | compact | 32 |
| summary | editorial | 35 |
| summary | highlight | 30 |
| summary | standard | 25 |
| summary | minimal | 20 |
| languages | (all) | 18 per item |
| certifications | (all) | 22 per item |
| awards | (all) | 25 per item |

**Section header overhead:** 12px per visible section (title + marginBottom)
**Divider overhead:** 16px per divider (when showDivider is true)

### Step 5: Integrate into ConfigTemplateRenderer

**File:** `renderer/TemplateRenderer.tsx`

Add at the top of ConfigTemplateRenderer:
```typescript
const estimatedHeight = estimateContentHeight(resume, config)
const isCompact = estimatedHeight > A4_HEIGHT
```

Pass `compact={isCompact}` to:
1. The layout component (all branches)
2. `<SectionRenderer compact={isCompact} ...>`
3. `renderContactBlock(...)` (if it needs compact adjustments)

### Step 6: Handle Contact Block in Compact Mode

The `renderContactBlock` function builds the header area. In compact mode:
- Reduce ProfileImage size from 60 to 50
- Reduce h1 font-size from default to -2px
- Reduce vertical gaps between name/title/contact info
- Reduce divider margins

### Step 7: Update Preview-All Page

Add visual indicator showing which templates are rendering in compact mode (small badge/label).

## Files Changed Summary

| File | Change |
|------|--------|
| `renderer/estimateHeight.ts` | **NEW** — height estimation logic |
| `renderer/TemplateRenderer.tsx` | Import estimator, compute isCompact, pass to layouts + SectionRenderer |
| `renderer/SectionRenderer.tsx` | Accept `compact` prop, pass to section components |
| `sections/SectionHeader.tsx` | Compact spacing |
| `sections/ExperienceItem.tsx` | Compact spacing |
| `sections/EducationItem.tsx` | Compact spacing |
| `sections/ProjectCard.tsx` | Compact spacing |
| `layouts/HeroBanner.tsx` | Compact variant (tighter padding) |
| `layouts/ExecutiveHeader.tsx` | Compact variant |
| `layouts/EditorialLayout.tsx` | Compact variant |
| `layouts/MagazineLayout.tsx` | Compact variant |
| `layouts/SplitHeaderLayout.tsx` | Compact variant |
| `layouts/OffsetSidebar.tsx` | Compact variant |
| `layouts/ModernGrid.tsx` | Compact variant |
| `configs/consultant.ts` | Revert to premium variants |
| `configs/creative-elegant.ts` | Revert to premium variants |
| `configs/tech-professional.ts` | Revert to premium variants |
| `configs/executive-navy.ts` | Revert to premium variants |
| `configs/creative-gradient.ts` | Revert to premium variants |
| `configs/nova.ts` | Revert to premium variants |
| `preview-all/page.tsx` | Add compact mode indicator |

## Verification

1. Run `npm run lint` and `npx tsc --noEmit` — must pass
2. Dev server: render all 37 templates on preview-all page
3. Measure overflow on all 37 — target: 0 templates with >20px overflow
4. Visual comparison: templates in normal vs compact mode should look nearly identical (same fonts, colors, structure — just tighter spacing)
5. Spot-check 5 premium templates (Consultant, Creative Elegant, Tech Professional, Executive Navy, Nova) to verify variants are preserved
