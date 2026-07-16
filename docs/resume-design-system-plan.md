# Generative-CV Resume Design System — Architecture Plan

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    DESIGN SYSTEM                         │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │ Tokens   │  │ Sections │  │ Layouts  │  │ Fonts  │ │
│  │          │  │          │  │          │  │        │ │
│  │typeface  │  │Header    │  │Single    │  │Inter   │ │
│  │spacing   │  │Experience│  │Column    │  │IBM Plex│ │
│  │color     │  │Skills    │  │TwoColumn │  │Lato    │ │
│  │layout    │  │Education │  │Sidebar   │  │DM Sans │ │
│  │          │  │Projects  │  │Timeline  │  │Geist   │ │
│  │          │  │Contact   │  │          │  │SS3     │ │
│  │          │  │Divider   │  │          │  │        │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───┬────┘ │
│       │              │              │             │      │
│  ┌────▼──────────────▼──────────────▼─────────────▼──┐  │
│  │              TEMPLATE SYSTEM                       │  │
│  │                                                    │  │
│  │  ┌─────────────────┐  ┌────────────────────────┐  │  │
│  │  │ Config-Driven   │  │ Component-Driven       │  │  │
│  │  │ (20 templates)  │  │ (10 templates)         │  │  │
│  │  │                 │  │                        │  │  │
│  │  │ TemplateConfig  │  │ Standalone React       │  │  │
│  │  │   + Renderer    │  │ components using       │  │  │
│  │  │   + Sections    │  │ shared sections        │  │  │
│  │  └────────┬────────┘  └───────────┬────────────┘  │  │
│  │           │                       │               │  │
│  │  ┌────────▼───────────────────────▼────────────┐  │  │
│  │  │          Template Registry                   │  │  │
│  │  │  Map<string, TemplateConfig | Component>     │  │  │
│  │  └──────────────────────┬──────────────────────┘  │  │
│  └─────────────────────────┼─────────────────────────┘  │
│                            │                            │
│  ┌─────────────────────────▼─────────────────────────┐  │
│  │              RENDERING PIPELINE                    │  │
│  │                                                    │  │
│  │  ResumeData → TemplateComponent → A4 HTML          │  │
│  │     │              │                   │           │  │
│  │     │         Pagination Engine        │           │  │
│  │     │         (usePagination)          │           │  │
│  │     │              │                   │           │  │
│  │     │         Preview/Export            │           │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Key principle:** Both config-driven and component-driven templates share the same **section components** and **design tokens**. The only difference is how they compose the layout.

- **Config-driven:** `TemplateRenderer` reads a `TemplateConfig` object and automatically maps resume sections to the right section components with the right variant props.
- **Component-driven:** A standalone React component that directly imports and composes section components with custom layout logic (for timeline, sidebar, creative layouts).

---

## 2. File Structure

```
src/features/resume-builder/design-system/
│
├── tokens/
│   ├── typography.ts          # Font families, size scale, weight scale, line-height
│   ├── spacing.ts             # 8pt grid: 2,4,6,8,12,16,20,24,32,40,48
│   ├── colors.ts              # 15 accent palettes + semantic tokens
│   ├── layout.ts              # A4 dims, grid systems, margin presets
│   └── index.ts               # Barrel export
│
├── sections/
│   ├── SectionHeader.tsx       # 8 header styles (centered/left/split/banner/etc.)
│   ├── ExperienceItem.tsx      # 5 experience layouts (bullets/timeline/cards/compact/role-first)
│   ├── SkillGroup.tsx          # 5 skill styles (list/grouped/tags/pills/categories)
│   ├── EducationItem.tsx       # 3 education layouts (standard/compact/detailed)
│   ├── ProjectCard.tsx         # 3 project layouts (standard/compact/detailed)
│   ├── ContactInfo.tsx         # 3 contact layouts (inline/grid/sidebar)
│   ├── CertificationItem.tsx   # Standard cert display
│   ├── LanguageItem.tsx        # Language + proficiency
│   ├── AwardItem.tsx           # Award display
│   ├── SummarySection.tsx      # Summary/objective display
│   ├── Divider.tsx             # 4 divider styles (thin/accent/none/filled)
│   ├── ProfileImage.tsx        # Photo or initials fallback
│   └── index.ts
│
├── layouts/
│   ├── SingleColumn.tsx        # Full-width single column
│   ├── TwoColumn.tsx           # Configurable split (30/70, 35/65, 40/60, golden)
│   ├── Sidebar.tsx             # Left or right sidebar with main area
│   └── index.ts
│
├── renderer/
│   ├── TemplateRenderer.tsx    # Config-driven: config + data → JSX
│   ├── SectionRenderer.tsx     # Maps section type → section component + variant
│   └── index.ts
│
├── templates/
│   ├── types.ts                # Enhanced TemplateConfig with section variants
│   ├── registry.ts             # Map<string, Entry> with getTemplate(), getAllTemplates()
│   │
│   ├── configs/                # 20 config-driven templates
│   │   ├── classic-ats.ts
│   │   ├── modern-ats.ts
│   │   ├── professional-ats.ts
│   │   ├── executive-ats.ts
│   │   ├── corporate-ats.ts
│   │   ├── clean-ats.ts
│   │   ├── standard-ats.ts
│   │   ├── universal-ats.ts
│   │   ├── executive.ts
│   │   ├── corporate.ts
│   │   ├── consultant.ts
│   │   ├── finance.ts
│   │   ├── healthcare.ts
│   │   ├── business.ts
│   │   ├── leadership.ts
│   │   ├── senior-professional.ts
│   │   ├── modern-two-column.ts
│   │   ├── split-professional.ts
│   │   ├── elegant.ts
│   │   └── balanced.ts
│   │   └── index.ts            # Registers all configs
│   │
│   └── components/             # 10 component-driven templates
│       ├── nova-timeline.tsx    (migrated)
│       ├── obsidian-edge.tsx    (migrated)
│       ├── blue-steel.tsx       (migrated)
│       ├── neon-green.tsx       (migrated)
│       ├── professional-executive.tsx (migrated)
│       ├── minimal-timeline.tsx (new)
│       ├── developer.tsx        (new)
│       ├── designer.tsx         (new)
│       ├── startup.tsx          (new)
│       ├── graduate.tsx         (new)
│       └── index.ts
│
├── fonts/
│   └── index.ts                # Font family constant maps for templates
│
└── index.ts                    # Public API barrel
```

---

## 3. Design Token System

### 3.1 Typography Tokens (`tokens/typography.ts`)

```typescript
// Font families (loaded via next/font in layout.tsx)
export const fontFamilies = {
  inter: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
  ibmPlexSans: "'IBM Plex Sans', sans-serif",
  sourceSans3: "'Source Sans 3', sans-serif",
  lato: "Lato, sans-serif",
  dmSans: "'DM Sans', sans-serif",
  geist: "Geist, sans-serif",
  playfairDisplay: "'Playfair Display', serif",
  jetBrainsMono: "'JetBrains Mono', monospace",
} as const

// Type scale (px) — all templates pick from these tokens
export const typeScale = {
  // Name / hero
  nameXL:    { fontSize: 32, lineHeight: 1.15, fontWeight: 700, letterSpacing: "-0.02em" },
  nameLG:    { fontSize: 28, lineHeight: 1.2,  fontWeight: 700, letterSpacing: "-0.01em" },
  nameMD:    { fontSize: 24, lineHeight: 1.25, fontWeight: 600 },
  // Job title
  titleLG:   { fontSize: 16, lineHeight: 1.3,  fontWeight: 400, letterSpacing: "0.01em" },
  titleMD:   { fontSize: 14, lineHeight: 1.35, fontWeight: 400 },
  titleSM:   { fontSize: 12, lineHeight: 1.4,  fontWeight: 500 },
  // Section headings
  headingLG: { fontSize: 13, lineHeight: 1.3,  fontWeight: 700, letterSpacing: "0.05em" },
  headingMD: { fontSize: 11, lineHeight: 1.35, fontWeight: 700, letterSpacing: "0.08em" },
  headingSM: { fontSize: 10, lineHeight: 1.4,  fontWeight: 600, letterSpacing: "0.1em" },
  // Body
  bodyLG:    { fontSize: 12, lineHeight: 1.55 },
  bodyMD:    { fontSize: 11, lineHeight: 1.5  },
  bodySM:    { fontSize: 10, lineHeight: 1.45 },
  // Meta (dates, locations)
  metaMD:    { fontSize: 10, lineHeight: 1.4,  fontWeight: 500 },
  metaSM:    { fontSize: 9,  lineHeight: 1.35, fontWeight: 400 },
  // Caption (skills, tags)
  captionMD: { fontSize: 10, lineHeight: 1.4  },
  captionSM: { fontSize: 9,  lineHeight: 1.35 },
} as const
```

### 3.2 Spacing Tokens (`tokens/spacing.ts`)

```typescript
// 8pt grid system — all values in px
export const spacing = {
  0:   0,
  1:   2,    // 1/4 unit
  2:   4,    // 1/2 unit
  3:   6,    // 3/4 unit
  4:   8,    // 1 unit
  5:   10,   // 1.25 units
  6:   12,   // 1.5 units
  8:   16,   // 2 units
  10:  20,   // 2.5 units
  12:  24,   // 3 units
  14:  28,   // 3.5 units
  16:  32,   // 4 units
  20:  40,   // 5 units
  24:  48,   // 6 units
} as const

// Named spacing presets for templates
export const spacingPresets = {
  compact:  { sectionGap: 12, itemGap: 6,  intraGap: 4  },
  normal:   { sectionGap: 16, itemGap: 8,  intraGap: 6  },
  spacious: { sectionGap: 24, itemGap: 12, intraGap: 8  },
} as const
```

### 3.3 Color Tokens (`tokens/colors.ts`)

```typescript
export type AccentPalette = {
  name: string
  primary: string      // Main accent (used for headers, dividers, highlights)
  light: string        // 10% opacity variant (backgrounds)
  muted: string        // 20% opacity variant (borders, subtle bg)
  text: string         // Text on accent backgrounds
}

export const accentPalettes: Record<string, AccentPalette> = {
  slate:        { name: "Slate",        primary: "#475569", light: "#f1f5f9", muted: "#e2e8f0", text: "#ffffff" },
  navy:         { name: "Navy",         primary: "#1e3a5f", light: "#eff6ff", muted: "#dbeafe", text: "#ffffff" },
  indigo:       { name: "Indigo",       primary: "#4f46e5", light: "#eef2ff", muted: "#e0e7ff", text: "#ffffff" },
  emerald:      { name: "Emerald",      primary: "#059669", light: "#ecfdf5", muted: "#d1fae5", text: "#ffffff" },
  teal:         { name: "Teal",         primary: "#0d9488", light: "#f0fdfa", muted: "#ccfbf1", text: "#ffffff" },
  burgundy:     { name: "Burgundy",     primary: "#9f1239", light: "#fff1f2", muted: "#fecdd3", text: "#ffffff" },
  charcoal:     { name: "Charcoal",     primary: "#36454f", light: "#f8fafc", muted: "#e2e8f0", text: "#ffffff" },
  forest:       { name: "Forest Green", primary: "#166534", light: "#f0fdf4", muted: "#dcfce7", text: "#ffffff" },
  steel:        { name: "Steel Blue",   primary: "#4682b4", light: "#f0f7ff", muted: "#dbeafe", text: "#ffffff" },
  deepPurple:   { name: "Deep Purple",  primary: "#5b21b6", light: "#f5f3ff", muted: "#ede9fe", text: "#ffffff" },
  crimson:      { name: "Crimson",      primary: "#dc2626", light: "#fef2f2", muted: "#fee2e2", text: "#ffffff" },
  ocean:        { name: "Ocean Blue",   primary: "#0369a1", light: "#f0f9ff", muted: "#e0f2fe", text: "#ffffff" },
  sage:         { name: "Sage Green",   primary: "#65a30d", light: "#f7fee7", muted: "#ecfccb", text: "#ffffff" },
  warmGray:     { name: "Warm Gray",    primary: "#78716c", light: "#fafaf9", muted: "#e7e5e4", text: "#ffffff" },
  obsidian:     { name: "Obsidian",     primary: "#18181b", light: "#f4f4f5", muted: "#e4e4e7", text: "#ffffff" },
}

// Semantic text colors (same for all templates)
export const textColors = {
  primary:   "#111827",  // Near black — headings, name
  secondary: "#374151",  // Dark gray — body text
  muted:     "#6b7280",  // Gray — dates, meta, secondary info
  subtle:    "#9ca3af",  // Light gray — placeholders, icons
  white:     "#ffffff",  // On dark backgrounds
} as const

// Background colors
export const bgColors = {
  white:     "#ffffff",  // Page background (always)
  offWhite:  "#f9fafb",  // Subtle section bg
  lightGray: "#f3f4f6",  // Sidebar bg, card bg
  paleGray:  "#e5e7eb",  // Borders, dividers
} as const
```

### 3.4 Layout Tokens (`tokens/layout.ts`)

```typescript
export const A4 = {
  WIDTH_PX: 794,
  HEIGHT_PX: 1123,
  WIDTH_MM: 210,
  HEIGHT_MM: 297,
} as const

export const pageMargins = {
  standard: { top: 32, right: 32, bottom: 32, left: 32 },    // 0.75in ≈ 32px
  narrow:   { top: 24, right: 24, bottom: 24, left: 24 },    // ~0.5in
  wide:     { top: 40, right: 40, bottom: 40, left: 40 },    // ~0.85in
  asymmetric: { top: 32, right: 32, bottom: 32, left: 40 },  // Extra left for sidebar
} as const

export const gridSystems = {
  single:        { columns: [1], gap: 0 },
  singleWide:    { columns: [1], gap: 0 },
  split3070:     { columns: [0.30, 0.70], gap: 24 },
  split3565:     { columns: [0.35, 0.65], gap: 24 },
  split4060:     { columns: [0.40, 0.60], gap: 24 },
  goldenRatio:   { columns: [0.382, 0.618], gap: 24 },
  sidebarLeft:   { columns: [0.28, 0.72], gap: 20 },
  sidebarRight:  { columns: [0.72, 0.28], gap: 20 },
  narrowSidebar: { columns: [0.22, 0.78], gap: 16 },
} as const
```

---

## 4. Section Components

Each section component accepts **variant** props to control its visual style. Templates pass the appropriate variant based on their config.

### 4.1 `SectionHeader`

**Props:**
```typescript
type SectionHeaderProps = {
  title: string
  variant: "underline" | "border" | "filled" | "minimal" | "accent-line" | "two-tone" | "icon-left" | "sidebar"
  colors: { primary: string; text: string; muted: string; border: string }
  typography?: Partial<typeof typeScale.headingMD>
  icon?: ReactNode
}
```

**8 Variants:**
1. `underline` — Title with thin bottom border
2. `border` — Title wrapped in a border box
3. `filled` — Title with filled background
4. `minimal` — Title only, muted color, no decoration
5. `accent-line` — Title with colored left border
6. `two-tone` — Title in two colors (label + line)
7. `icon-left` — Icon + title inline
8. `sidebar` — Title styled for sidebar (small, uppercase, colored)

### 4.2 `ExperienceItem`

**Props:**
```typescript
type ExperienceItemProps = {
  item: ExperienceItem
  variant: "bullets" | "timeline" | "cards" | "compact" | "role-first"
  colors: { primary: string; text: string; secondary: string; muted: string }
  showLocation: boolean
  showBullets: boolean
}
```

**5 Variants:**
1. `bullets` — Classic: Company | Role | Date, then bullet list
2. `timeline` — Left timeline line with dot, role + company + bullets
3. `cards` — Each experience in a subtle card with border
4. `compact` — Single line: Role at Company (Date) — bullets inline
5. `role-first` — Role emphasized larger, company secondary

### 4.3 `SkillGroup`

**Props:**
```typescript
type SkillGroupProps = {
  skills: SkillGroup[]
  variant: "list" | "grouped" | "tags" | "pills" | "categories"
  colors: { primary: string; text: string; muted: string; border: string }
  columns: 1 | 2
}
```

**5 Variants:**
1. `list` — Comma-separated per group
2. `grouped` — Group name bold, skills after em-dash
3. `tags` — Skill names in bordered tag chips
4. `pills` — Skill names in filled rounded pills
5. `categories` — Two-column grid, category headers

### 4.4 `EducationItem`

**3 Variants:** `standard` | `compact` | `detailed`

### 4.5 `ProjectCard`

**3 Variants:** `standard` | `compact` | `detailed`

### 4.6 `ContactInfo`

**3 Variants:** `inline` | `grid` | `sidebar`

### 4.7 `Divider`

**4 Styles:** `thin` | `accent` | `thick` | `none`

---

## 5. Template Config System

### 5.1 Enhanced `TemplateConfig` Type (`templates/types.ts`)

```typescript
export type TemplateConfig = {
  id: string
  name: string
  description: string
  category: "ats" | "professional" | "two-column" | "timeline" | "creative"
  tags: string[]

  // Layout
  layout: "single" | "two-column-left" | "two-column-right" | "sidebar-left" | "sidebar-right" | "timeline"
  grid: keyof typeof gridSystems
  pageMargin: keyof typeof pageMargins

  // Typography
  fonts: {
    heading: keyof typeof fontFamilies
    body: keyof typeof fontFamilies
    mono?: keyof typeof fontFamilies  // For code-style templates
  }

  // Colors
  colors: {
    palette: keyof typeof accentPalettes  // References an accent palette
    text: keyof typeof textColors
    background: keyof typeof bgColors
  }

  // Spacing
  spacing: keyof typeof spacingPresets

  // Section variants — which variant each section type uses
  sections: {
    header:      { variant: SectionHeaderProps["variant"] }
    experience:  { variant: ExperienceItemProps["variant"] }
    skills:      { variant: SkillGroupProps["variant"] }
    education:   { variant: EducationItemProps["variant"] }
    projects:    { variant: ProjectCardProps["variant"] }
    contact:     { variant: ContactInfoProps["variant"] }
    divider:     { variant: DividerProps["variant"] }
  }

  // Features
  features: {
    showProfileImage: boolean
    showIcons: boolean
    showDivider: boolean
    accentHeaders: boolean  // Section headers use accent color
  }
}
```

### 5.2 Template Registry (`templates/registry.ts`)

```typescript
type TemplateEntry =
  | { type: "config"; config: TemplateConfig }
  | { type: "component"; component: BuilderTemplateComponent; metadata: TemplateMetadata }

const registry = new Map<string, TemplateEntry>()

export function registerTemplate(entry: TemplateEntry & { id: string }): void
export function getTemplate(id: string): TemplateEntry | undefined
export function getAllTemplates(): TemplateEntry[]
export function getTemplatesByCategory(cat: string): TemplateEntry[]
```

### 5.3 Template Renderer (`renderer/TemplateRenderer.tsx`)

```typescript
// Config-driven renderer — takes a TemplateConfig + ResumeData → JSX
export function ConfigTemplateRenderer({ config, resume }: {
  config: TemplateConfig
  resume: ResumeData
}) {
  // 1. Resolve palette + text colors from tokens
  // 2. Choose layout wrapper (SingleColumn / TwoColumn / Sidebar)
  // 3. Map visible sections → SectionRenderer
  // 4. Pass variant props from config to each section component
}
```

---

## 6. Template Catalog — 30 Templates

### ATS-Optimized (8) — Config-driven

| # | ID | Name | Grid | Accent | Heading Font | Body Font | Header Variant | Experience | Skills |
|---|-----|------|------|--------|-------------|-----------|----------------|------------|--------|
| 1 | `classic-ats` | Classic ATS | single | slate | inter | inter | underline | bullets | list |
| 2 | `modern-ats` | Modern ATS | single | indigo | ibmPlexSans | ibmPlexSans | accent-line | bullets | grouped |
| 3 | `professional-ats` | Professional ATS | single | navy | dmSans | dmSans | border | bullets | list |
| 4 | `executive-ats` | Executive ATS | single | charcoal | inter | inter | filled | bullets | grouped |
| 5 | `corporate-ats` | Corporate ATS | single | steel | sourceSans3 | sourceSans3 | underline | bullets | list |
| 6 | `clean-ats` | Clean ATS | single | slate | lato | lato | minimal | bullets | list |
| 7 | `standard-ats` | Standard ATS | single | slate | inter | inter | minimal | bullets | list |
| 8 | `universal-ats` | Universal ATS | single | none | inter | inter | none | bullets | list |

### Professional (8) — Config-driven

| # | ID | Name | Grid | Accent | Heading Font | Body Font | Header | Experience | Skills |
|---|-----|------|------|--------|-------------|-----------|--------|------------|--------|
| 9 | `executive` | Executive | single | navy | ibmPlexSans | ibmPlexSans | filled | bullets | grouped |
| 10 | `corporate` | Corporate | single | charcoal | dmSans | dmSans | border | bullets | list |
| 11 | `consultant` | Consultant | single | indigo | inter | inter | accent-line | cards | tags |
| 12 | `finance` | Finance | single | navy | sourceSans3 | sourceSans3 | underline | bullets | list |
| 13 | `healthcare` | Healthcare | single | teal | lato | lato | accent-line | bullets | grouped |
| 14 | `business` | Business | single | slate | inter | inter | border | compact | list |
| 15 | `leadership` | Leadership | single | burgundy | ibmPlexSans | ibmPlexSans | filled | bullets | grouped |
| 16 | `senior-pro` | Senior Professional | single | steel | dmSans | dmSans | underline | role-first | tags |

### Two-Column (8) — Hybrid

| # | ID | Name | Grid | Accent | Heading Font | Body Font | Sidebar | Experience | Skills |
|---|-----|------|------|--------|-------------|-----------|---------|------------|--------|
| 17 | `modern-two-col` | Modern Two-Column | split3070 | emerald | inter | inter | left | bullets | tags |
| 18 | `split-pro` | Split Professional | split3565 | navy | ibmPlexSans | ibmPlexSans | left | bullets | grouped |
| 19 | `elegant` | Elegant | split3565 | warmGray | lato | lato | right | bullets | list |
| 20 | `technical` | Technical | sidebarLeft | charcoal | geist | geist | left | compact | pills |
| 21 | `creative-min` | Creative Minimal | sidebarRight | forest | dmSans | dmSans | right | bullets | tags |
| 22 | `balanced` | Balanced | goldenRatio | teal | sourceSans3 | sourceSans3 | left | bullets | grouped |
| 23 | `profile` | Profile | sidebarLeft | indigo | inter | inter | left | bullets | categories |
| 24 | `compact-pro` | Compact Pro | narrowSidebar | slate | dmSans | dmSans | left | compact | list |

### Timeline & Creative (6) — Component-driven

| # | ID | Name | Layout | Accent | Font | Style |
|---|-----|------|--------|--------|------|-------|
| 25 | `nova-timeline` | Nova Timeline | sidebar-left | `#00FFF0` | Inter | Timeline dots + sidebar |
| 26 | `minimal-timeline` | Minimal Timeline | timeline | warmGray | Lato | Subtle timeline line |
| 27 | `developer` | Developer | sidebar-left | charcoal | Geist + JetBrainsMono | Code-inspired, monospace accents |
| 28 | `designer` | Designer | two-column | deepPurple | DM Sans | Creative typography, asymmetric |
| 29 | `startup` | Startup | single | crimson | Inter | Bold, energetic, accent blocks |
| 30 | `graduate` | Graduate | single | sage | SourceSans3 | Clean, academic, simple |

---

## 7. Font Loading Strategy

Add to `layout.tsx` via `next/font/google`:

```typescript
import { Inter, IBM_Plex_Sans, Source_Sans_3, Lato, DM_Sans, Geist_Mono } from "next/font/google"

// Inter — most common resume font (already used in templates)
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

// IBM Plex Sans — professional/technical
const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400","500","600","700"],
  variable: "--font-ibm-plex",
})

// Source Sans 3 — clean, readable
const sourceSans3 = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
})

// Lato — friendly, professional
const lato = Lato({
  subsets: ["latin"],
  weight: ["400","700"],
  variable: "--font-lato",
})

// DM Sans — already loaded (app body font)

// Geist Mono — for developer/technical templates
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})
```

All font variables are applied to `<html>` and referenced in template inline styles via `var(--font-inter)` etc.

---

## 8. Preview System Enhancement

The viewer modal already has zoom, fit-width, fit-page. Verify these work correctly with the new templates. No major changes needed — the existing `useViewerZoom` hook and `ViewerToolbar` handle everything.

---

## 9. Implementation Phases

### Phase 1: Design System Foundation
**Files to create:**
- `design-system/tokens/typography.ts`
- `design-system/tokens/spacing.ts`
- `design-system/tokens/colors.ts`
- `design-system/tokens/layout.ts`
- `design-system/tokens/index.ts`
- `design-system/sections/SectionHeader.tsx`
- `design-system/sections/ExperienceItem.tsx`
- `design-system/sections/SkillGroup.tsx`
- `design-system/sections/EducationItem.tsx`
- `design-system/sections/ProjectCard.tsx`
- `design-system/sections/ContactInfo.tsx`
- `design-system/sections/CertificationItem.tsx`
- `design-system/sections/LanguageItem.tsx`
- `design-system/sections/AwardItem.tsx`
- `design-system/sections/SummarySection.tsx`
- `design-system/sections/Divider.tsx`
- `design-system/sections/ProfileImage.tsx`
- `design-system/sections/index.ts`
- `design-system/layouts/SingleColumn.tsx`
- `design-system/layouts/TwoColumn.tsx`
- `design-system/layouts/Sidebar.tsx`
- `design-system/layouts/index.ts`
- `design-system/fonts/index.ts`
- `design-system/index.ts`

**Files to modify:**
- `src/app/layout.tsx` — Add font loading (IBM Plex, Source Sans 3, Lato, Geist Mono)

### Phase 2: Template System + Registry
**Files to create:**
- `design-system/templates/types.ts`
- `design-system/templates/registry.ts`
- `design-system/renderer/TemplateRenderer.tsx`
- `design-system/renderer/SectionRenderer.tsx`
- `design-system/renderer/index.ts`

### Phase 3: Migrate Existing 5 Templates
**Files to create:**
- `design-system/templates/components/nova-timeline.tsx` — Refactored to use shared sections
- `design-system/templates/components/obsidian-edge.tsx` — Refactored to use shared sections
- `design-system/templates/components/blue-steel.tsx` — Refactored to use shared sections
- `design-system/templates/components/neon-green.tsx` — Refactored to use shared sections
- `design-system/templates/components/professional-executive.tsx` — Refactored to use shared sections
- `design-system/templates/components/index.ts`

**Files to modify:**
- `features/resume-builder/preview/templates/index.ts` — Update registry to use new system
- `features/resume-builder/preview/resume-page.tsx` — Update shared components

### Phase 4: Create 20 Config-Driven Templates
**Files to create:**
- `design-system/templates/configs/classic-ats.ts` through `balanced.ts` (20 files)
- `design-system/templates/configs/index.ts`

### Phase 5: Create 5 Component-Driven Templates (new)
**Files to create:**
- `design-system/templates/components/minimal-timeline.tsx`
- `design-system/templates/components/developer.tsx`
- `design-system/templates/components/designer.tsx`
- `design-system/templates/components/startup.tsx`
- `design-system/templates/components/graduate.tsx`

---

## 10. Migration Strategy for Existing 5

Each existing template will be refactored to:
1. Import and use shared section components (`SectionHeader`, `ExperienceItem`, etc.)
2. Remove hardcoded color constants — use token-based color resolution
3. Remove hardcoded typography — use `typeScale` tokens
4. Keep their unique layout logic (they're component-driven for a reason)
5. Register in the new template registry

The existing 5 templates keep their visual identity but gain consistency through shared components.

---

## 11. What This Plan Does NOT Change

- `ResumeData` type — unchanged
- Pagination engine (`use-pagination.tsx`) — unchanged
- PDF export system — unchanged
- Preview canvas / viewer modal — unchanged (zoom already works)
- Builder editor (forms, section management) — unchanged
- Backend template builder — unchanged
