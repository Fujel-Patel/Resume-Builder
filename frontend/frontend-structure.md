# Generative-CV Frontend Structure

```
frontend/
├── .gitignore
├── components.json                     # shadcn/ui configuration (base-nova style)
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── README.md
├── public/
├── .next/
├── node_modules/
│
└── src/
    ├── app/                                # Next.js App Router pages
    │   ├── globals.css                     # HSL theme tokens (:root + .dark)
    │   ├── layout.tsx                      # Root layout (Inter font, ThemeProvider)
    │   ├── page.tsx                        # Landing page (composes landing components)
    │   ├── favicon.ico
    │   │
    │   ├── login/
    │   │   └── page.tsx                    # /login — AuthLayout + LoginForm
    │   │
    │   ├── signup/
    │   │   └── page.tsx                    # /signup — AuthLayout + SignupForm
    │   │
    │   ├── dashboard/
    │   │   ├── page.tsx                    # /dashboard — server wrapper
    │   │   └── dashboard-home.tsx          # Stats, recent resumes, ATS history
    │   │
    │   ├── resume/
    │   │   ├── page.tsx                    # /resume — server wrapper
    │   │   ├── resume-page.tsx             # Resume list with search/filter
    │   │   └── new/
    │   │       ├── page.tsx                # /resume/new — server wrapper
    │   │       └── resume-builder.tsx      # 45/55 split editor + preview
    │   │
    │   ├── ai-generator/
    │   │   ├── page.tsx                    # /ai-generator — server wrapper
    │   │   └── ai-generator.tsx            # 5-step wizard (JD → Upload → Process → Compare → Export)
    │   │
    │   ├── ats-score/
    │   │   └── page.tsx                    # /ats-score — server wrapper
    │   │
    │   ├── profile/
    │   │   ├── page.tsx                    # /profile — server wrapper
    │   │   └── profile-page.tsx            # User profile form
    │   │
    │   └── settings/
    │       └── ai/
    │           ├── page.tsx                # /settings/ai — server wrapper
    │           └── ai-settings.tsx          # API key, toggles, usage bar
    │
    ├── components/
    │   ├── ui/                             # shadcn/ui primitives (Base UI)
    │   │   ├── accordion.tsx               # Collapsible accordion
    │   │   ├── avatar.tsx                  # User avatar
    │   │   ├── badge.tsx                   # Pill badge (default/secondary/brand/success/warning/error)
    │   │   ├── button.tsx                  # Button (default/brand/brandOutline/ghost, sizes xs-xl)
    │   │   ├── dialog.tsx                  # Modal dialog
    │   │   ├── dropdown-menu.tsx           # Dropdown menu
    │   │   ├── enhanced-card.tsx           # Hover-lift card with optional glow
    │   │   ├── file-upload.tsx             # Drag-and-drop upload
    │   │   ├── input.tsx                   # Text input
    │   │   ├── select.tsx                  # Select dropdown
    │   │   ├── sheet.tsx                   # Slide-in panel
    │   │   ├── skeleton.tsx                # Loading skeleton
    │   │   ├── sonner.tsx                  # Toast notifications
    │   │   ├── stat-card.tsx               # Metric card with icon + trend
    │   │   ├── tabs.tsx                    # Tabbed interface
    │   │   └── textarea.tsx                # Textarea input
    │   │
    │   ├── layout/                         # Dashboard layout system
    │   │   ├── dashboard-shell.tsx         # Sidebar + Navbar + main wrapper
    │   │   ├── navbar.tsx                  # Top bar with hamburger, title, avatar
    │   │   ├── sidebar.tsx                 # Navigation sidebar (6 items)
    │   │   └── theme-toggle.tsx            # Dark/light mode switch
    │   │
    │   └── landing/                        # Public marketing page sections
    │       ├── public-navbar.tsx           # Top navigation
    │       ├── hero.tsx                    # Hero with resume preview mockup
    │       ├── landing-resume-preview.tsx  # Static demo resume preview
    │       ├── trust-bar.tsx               # Company logo strip
    │       ├── features.tsx                # 6-card feature grid
    │       ├── how-it-works.tsx            # 3-step process
    │       ├── pricing.tsx                 # 3 pricing tiers
    │       ├── cta.tsx                     # Call-to-action section
    │       └── footer.tsx                  # 4-column footer
    │
    ├── features/                           # Self-contained feature modules
    │   ├── auth/
    │   │   ├── auth-layout.tsx             # 40/60 split-screen layout
    │   │   ├── login-form.tsx              # Login with validation states
    │   │   └── signup-form.tsx             # Signup with validation states
    │   │
    │   ├── resume/
    │   │   ├── types.ts                    # ResumeData, ExperienceEntry, etc.
    │   │   ├── editor-panel.tsx            # Left form panel (8 accordion sections)
    │   │   ├── form-section.tsx            # Collapsible section with AI improve button
    │   │   ├── tag-input.tsx               # Enter-to-add tag chips
    │   │   ├── preview-panel.tsx           # Right panel header + template switcher
    │   │   ├── resume-preview.tsx          # A4 rendered resume preview
    │   │   └── template-switcher.tsx       # Classic/Modern/Minimal toggle
    │   │
    │   ├── ai/
    │   │   └── ai-suggest-button.tsx       # Sparkle button with loading state
    │   │
    │   └── ats/
    │       ├── score-card.tsx              # SVG circular score gauge
    │       └── ats-score-page.tsx          # Full ATS analysis page
    │
    ├── contexts/
    │   └── sidebar-context.tsx             # SidebarContext + useSidebar hook
    │
    ├── hooks/
    │   └── use-media-query.ts              # Responsive breakpoint hook
    │
    ├── lib/
    │   └── utils.ts                        # cn() utility (clsx + tailwind-merge)
    │
    ├── types/
    │   └── design.ts                       # NavItem, StatCardData, ATSResult
    │
    └── providers/
        └── theme-provider.tsx              # next-themes wrapper (dark default)
```

## Route Map

| Path | Page | Layout |
|------|------|--------|
| `/` | Landing | Public (navbar + hero + sections + footer) |
| `/login` | Sign In | AuthLayout (40% brand / 60% form) |
| `/signup` | Create Account | AuthLayout (40% brand / 60% form) |
| `/dashboard` | Dashboard Home | DashboardShell (sidebar + navbar) |
| `/resume` | My Resumes | DashboardShell |
| `/resume/new` | Resume Builder | DashboardShell (45% editor / 55% preview) |
| `/ai-generator` | AI Generator | DashboardShell (5-step wizard) |
| `/ats-score` | ATS Score Analysis | DashboardShell |
| `/profile` | Profile | DashboardShell |
| `/settings/ai` | AI Settings | DashboardShell |

## File Count

| Directory | Files |
|-----------|-------|
| `src/app/` | 17 |
| `src/components/ui/` | 15 |
| `src/components/layout/` | 4 |
| `src/components/landing/` | 9 |
| `src/features/` | 11 |
| `src/contexts/` | 1 |
| `src/hooks/` | 1 |
| `src/lib/` | 1 |
| `src/types/` | 1 |
| `src/providers/` | 1 |
| **Total** | **61 source files** |
