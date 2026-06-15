# Generative-CV Design System & Stitch Design Specification

## Project Overview

**Product:** Generative-CV

**Type:** AI-Powered Resume Builder SaaS

**Platforms:**
- Desktop Web
- Tablet Web
- Mobile Responsive

**Primary Goal:**
Help job seekers create, optimize, analyze, and export ATS-friendly resumes using AI.

---

# Stitch Design Goal

Design a premium SaaS product that combines the aesthetics of:

- Linear
- Notion
- Vercel
- Stripe Dashboard
- Framer

The UI should feel:

- Modern
- Professional
- Intelligent
- Minimal
- Fast
- Premium

Avoid:

- Generic dashboard templates
- Corporate enterprise software styling
- Excessive gradients
- Heavy glassmorphism
- Cartoon illustrations
- Cluttered layouts

---

# Brand Personality

Keywords:

- Professional
- Modern
- Minimal
- Smart
- Premium
- Productive
- Career-focused
- Technical

The design should make users feel confident about applying for jobs.

---

# Visual Theme

## Primary Brand Color

#00FFF0

## Secondary Brand Color

#00D8CC

## Success

#22C55E

## Warning

#F59E0B

## Error

#EF4444

---

# Dark Theme (Default)

Background:
#080808

Surface:
#111111

Card:
#171717

Border:
#2A2A2A

Primary Text:
#FFFFFF

Secondary Text:
#A1A1AA

Muted Text:
#71717A

---

# Light Theme

Background:
#FFFFFF

Surface:
#F8FAFC

Card:
#FFFFFF

Border:
#E5E7EB

Primary Text:
#111827

Secondary Text:
#6B7280

---

# Typography

Font Family:
Inter

Fallback:
System UI

Heading Weight:
700

Body Weight:
400

Button Weight:
600

Scale:

- H1: 48px
- H2: 36px
- H3: 28px
- H4: 22px
- Body: 16px
- Small: 14px
- Caption: 12px

---

# Border Radius

Buttons: 12px

Inputs: 12px

Cards: 20px

Modals: 24px

Pills: 999px

---

# Spacing System

Base Unit: 8px

Common Values:

- 8
- 16
- 24
- 32
- 48
- 64
- 96

Use generous whitespace.

Never create crowded screens.

---

# User Journey

Primary Flow:

Landing Page
→ Signup
→ Dashboard
→ Create Resume
→ AI Optimization
→ ATS Analysis
→ Export PDF

Secondary Flow:

Upload Existing Resume
→ Parse Resume
→ Edit Resume
→ ATS Analysis
→ Export

---

# Landing Page

Route: /

## Hero Section

Layout:

Two Columns

Left Side:

Headline:
Build ATS-Friendly Resumes With AI

Subheadline:
Create, optimize, and tailor resumes using your own AI provider.

Primary CTA:
Start Building

Secondary CTA:
Watch Demo

Right Side:

Interactive Resume Preview

Preview should resemble a real professional resume.

Background:

Subtle grid pattern

Soft cyan glow accents

---

## Trusted Companies Section

Display logos:

- Google
- Microsoft
- Amazon
- Meta
- Netflix

Monochrome styling.

---

## Features Section

Six feature cards.

Features:

1. AI Resume Builder
2. Resume Upload Parsing
3. ATS Score Analysis
4. Multiple AI Providers
5. Live Preview
6. PDF Export

Card Interaction:

Hover lift effect

Subtle glow

---

## How It Works

Three-step process.

1. Upload Resume
2. Optimize With AI
3. Export Resume

---

## Pricing Preview

Three pricing cards.

- Free
- Pro
- Enterprise

Modern SaaS pricing design.

---

## Final CTA

Large conversion section.

Single primary button.

---

# Authentication

Routes:

- /login
- /signup

Layout:

Split Screen

Left:
Branding Illustration

Right:
Authentication Form

---

# Login Screen

Fields:

- Email
- Password

Actions:

- Login
- Forgot Password

Secondary Link:

Create Account

---

# Signup Screen

Fields:

- Name
- Email
- Password
- Confirm Password

Primary CTA:

Create Account

---

# Dashboard

Route:

/dashboard

Purpose:

User workspace.

Layout:

Sidebar + Main Content

---

## Sidebar

Navigation:

- Dashboard
- My Resumes
- AI Generator
- ATS Score
- Profile
- AI Settings

Bottom:

- Theme Toggle
- Logout

---

## Main Content

Sections:

Welcome Banner

Quick Actions

Statistics

Recent Resumes

ATS History

---

## Statistics Cards

Display:

- Total Resumes
- ATS Scans
- Templates Used
- AI Suggestions Generated

---

# Resume Builder

Routes:

- /resume/new
- /resume/[id]

Most important screen.

---

## Desktop Layout

Left Panel:
45%

Right Panel:
55%

---

## Left Panel

Accordion Sections:

- Personal Information
- Links
- Summary
- Skills
- Experience
- Projects
- Education
- Certifications
- Custom Sections

---

## AI Enhancement Buttons

Place AI buttons beside:

- Summary
- Skills
- Experience
- Projects

Style:

Sparkle icon

Primary brand color

---

## Right Panel

Live Resume Preview

Requirements:

- Sticky Preview
- A4 Paper Layout
- Real-time Updates
- Professional Appearance

---

## Template Selector

Templates:

- Classic
- Modern
- Minimal
- Creative

Show visual thumbnails.

---

# AI Resume Generator

Route:

/ai-generator

Layout:

Multi-step wizard.

---

## Step 1

Paste Job Description

Large textarea.

---

## Step 2

Upload Existing Resume

Drag and drop uploader.

---

## Step 3

AI Processing

Modern loading state.

Progress indicator.

---

## Step 4

Comparison View

Two-column layout.

Left:
Original Resume

Right:
Optimized Resume

Highlight changes visually.

---

## Step 5

Apply Suggestions

Export Resume

---

# ATS Score Checker

Route:

/ats-score

---

## Upload Area

Large drag-and-drop zone.

Supported:

- PDF
- DOCX

---

## Results Layout

Top:

Large ATS Score Circle

Display:
0-100 Score

---

## Metrics Grid

Cards:

- Formatting Score
- Keyword Match
- Readability
- Completeness

---

## Missing Keywords

Display as tags/chips.

---

## Recommendations

Prioritized recommendations.

Priority Levels:

- High
- Medium
- Low

---

# Profile Page

Route:

/profile

Sections:

- Personal Information
- Avatar Upload
- Change Password
- Account Settings
- Delete Account

---

# AI Settings

Route:

/settings/ai

Purpose:

Manage AI Providers.

Providers:

- Anthropic
- Gemini
- NVIDIA NIM
- Custom Provider

Actions:

- Add API Key
- Verify
- Set Default
- Delete

Verified providers display success badge.

---

# Mobile Design

Breakpoint:
768px

---

## Dashboard

Sidebar becomes drawer.

---

## Resume Builder

Replace split screen with tabs.

Tabs:

- Editor
- Preview

---

## ATS Page

Single-column layout.

---

# Component Library

Generate reusable components:

- Button
- Input
- Textarea
- Select
- Dropdown
- Modal
- Drawer
- Sidebar
- Navbar
- Accordion
- Tabs
- Card
- Badge
- Avatar
- Table
- Pagination
- Toast
- Loading Skeleton
- File Upload
- Resume Preview
- ATS Score Card
- AI Suggest Button

---

# Interactions

Buttons:
150ms transition

Cards:
Hover lift

Inputs:
Focus glow

Modals:
Fade + Scale

Dropdowns:
Smooth expand

---

# Imagery Guidelines

Use:

- Professional workers
- Resume screenshots
- Productivity visuals
- Career-focused illustrations

Avoid:

- Cartoons
- Gaming visuals
- Abstract blobs
- Random stock photos

---

# Accessibility

Requirements:

- WCAG AA
- Keyboard Navigation
- Visible Focus States
- Screen Reader Friendly
- High Contrast Support

---

# Stitch Output Requirements

Generate complete production-quality screens for:

1. Landing Page
2. Login
3. Signup
4. Dashboard
5. Resume Builder
6. Resume Editor
7. AI Resume Generator
8. ATS Score Checker
9. Profile Page
10. AI Settings Page

Generate:

- Desktop Version
- Tablet Version
- Mobile Version
- Dark Theme
- Light Theme

Create a complete clickable prototype with realistic content, modern SaaS layouts, polished interactions, and developer-handoff-quality UI.