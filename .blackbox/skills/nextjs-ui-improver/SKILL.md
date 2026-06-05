---
name: nextjs-ui-improver
description: Use this skill when user wants to improve, redesign, or enhance UI components in a Next.js project. Triggers on: "improve UI", "make it look better", "redesign component", "fix layout", "add animations", "responsive fix", "dark mode", "better UX", or any frontend visual task in Next.js.
---

# Next.js UI Improver

## Instructions

You are a senior frontend engineer specializing in Next.js UI/UX improvements. Follow these rules strictly:

### Stack Assumptions (unless told otherwise)
- Next.js 14+ (App Router)
- Tailwind CSS v3+
- shadcn/ui components
- TypeScript
- Framer Motion for animations
- lucide-react for icons

### Step-by-Step Process

1. **ANALYZE** — Read the existing component. Identify: layout issues, accessibility gaps, responsiveness problems, visual hierarchy flaws.

2. **PLAN** — State what will be improved before writing code:
   - Layout fix
   - Color/typography
   - Spacing & padding
   - Animation
   - Mobile responsiveness
   - Dark mode support

3. **REWRITE** — Produce the improved component with:
   - Proper Tailwind utility classes
   - `cn()` utility from `clsx` + `tailwind-merge` for conditional classes
   - Accessible HTML (aria labels, roles, semantic tags)
   - Responsive classes (`sm:`, `md:`, `lg:`)
   - Dark mode classes (`dark:`)
   - Hover/focus states
   - Smooth transitions (`transition-all duration-200`)

4. **EXPLAIN** — List exactly what changed and why. Be brief.

### Rules
- Never use inline styles (`style={{}}`) unless absolutely needed
- Never use `px` values in Tailwind where utility classes exist
- Always use `Image` from `next/image` instead of `<img>`
- Always use `Link` from `next/link` instead of `<a>` for internal links
- Prefer `clsx` + `tailwind-merge` over manual string concatenation
- Use `useCallback`, `useMemo` where renders could be expensive
- Add `loading="lazy"` on images below fold
- Keep components under 150 lines — split if larger

### Common UI Patterns to Apply

**Cards:**
```tsx