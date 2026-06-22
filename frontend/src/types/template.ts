import type { SectionType } from "./resume"

export type ColumnLayout = "single" | "two-column-left" | "two-column-right"

export type TemplateSectionStyle = {
  showTitle: boolean
  titleAlignment: "left" | "center"
  titleStyle: "underline" | "border" | "filled" | "minimal"
  showIcon: boolean
  iconPosition: "left" | "top"
}

export type TemplateField = {
  key: string
  label: string
  type: "text" | "textarea" | "date" | "email" | "tel" | "url" | "select" | "bullets"
  placeholder: string
  required: boolean
  characterLimit?: number
  validation?: Record<string, unknown>
  options?: { label: string; value: string }[]
}

export type TemplateSectionConfig = {
  type: SectionType
  defaultTitle: string
  maxItems?: number
  fields: Record<string, TemplateSectionFieldConfig>
  layout: "full-width" | "sidebar"
  styles: TemplateSectionStyle
}

export type TemplateSectionFieldConfig = {
  label: string
  type: "text" | "textarea" | "date" | "email" | "tel" | "url" | "bullets" | "select"
  placeholder: string
  required: boolean
  characterLimit?: number
  showInSidebar?: boolean
}

export type TemplateConfig = {
  id: string
  name: string
  description: string
  preview: string
  layout: ColumnLayout
  sidebarWidth?: string
  fonts: {
    heading: string
    body: string
  }
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
    muted: string
    border: string
  }
  spacing: {
    pageMargin: string
    sectionGap: string
    itemGap: string
  }
  fontSize: {
    name: string
    title: string
    heading: string
    body: string
    small: string
  }
  sections: TemplateSectionConfig[]
  atsOptimized: boolean
  features: {
    timeline: boolean
    sidebar: boolean
    headerStyle: "centered" | "left-aligned" | "two-column"
    showProfileImage: boolean
    showDivider: boolean
  }
}

export const novaTemplateConfig: TemplateConfig = {
  id: "nova-timeline",
  name: "Nova Timeline",
  description: "Modern two-column timeline layout with sidebar",
  preview: "/templates/nova.png",
  layout: "two-column-left",
  sidebarWidth: "30%",
  fonts: {
    heading: "Inter, sans-serif",
    body: "Inter, sans-serif",
  },
  colors: {
    primary: "#1a3a5c",
    secondary: "#4a6572",
    accent: "#00FFF0",
    background: "#ffffff",
    text: "#333333",
    muted: "#6b7280",
    border: "#e5e7eb",
  },
  spacing: {
    pageMargin: "0.75in",
    sectionGap: "24px",
    itemGap: "12px",
  },
  fontSize: {
    name: "24px",
    title: "14px",
    heading: "12px",
    body: "11px",
    small: "10px",
  },
  sections: [
    {
      type: "contact",
      defaultTitle: "Contact",
      fields: {
        fullName: { label: "Full Name", type: "text", placeholder: "Jane Doe", required: true },
        title: { label: "Title", type: "text", placeholder: "Marketing Manager", required: true },
        email: { label: "Email", type: "email", placeholder: "hello@example.com", required: true },
        phone: { label: "Phone", type: "tel", placeholder: "+1 (555) 123-4567", required: true },
        location: { label: "Location", type: "text", placeholder: "San Francisco, CA", required: false },
        website: { label: "Website", type: "url", placeholder: "https://", required: false },
        linkedin: { label: "LinkedIn", type: "url", placeholder: "https://linkedin.com/in/", required: false },
        github: { label: "GitHub", type: "url", placeholder: "https://github.com/", required: false },
      },
      layout: "sidebar",
      styles: { showTitle: false, titleAlignment: "left", titleStyle: "underline", showIcon: false, iconPosition: "left" },
    },
    {
      type: "summary",
      defaultTitle: "Professional Summary",
      fields: {
        content: { label: "Summary", type: "textarea", placeholder: "Brief professional summary...", required: false, characterLimit: 500 },
      },
      layout: "full-width",
      styles: { showTitle: true, titleAlignment: "left", titleStyle: "underline", showIcon: true, iconPosition: "left" },
    },
    {
      type: "experience",
      defaultTitle: "Experience",
      maxItems: 10,
      fields: {
        company: { label: "Company", type: "text", placeholder: "Company name", required: true },
        role: { label: "Role", type: "text", placeholder: "Job title", required: true },
        startDate: { label: "Start Date", type: "date", placeholder: "MMM YYYY", required: true },
        endDate: { label: "End Date", type: "date", placeholder: "MMM YYYY or Present", required: false },
        current: { label: "Current Position", type: "text", placeholder: "", required: false },
        location: { label: "Location", type: "text", placeholder: "City, State", required: false },
        bullets: { label: "Description", type: "bullets", placeholder: "Describe your achievements...", required: false },
      },
      layout: "full-width",
      styles: { showTitle: true, titleAlignment: "left", titleStyle: "underline", showIcon: true, iconPosition: "left" },
    },
    {
      type: "education",
      defaultTitle: "Education",
      maxItems: 5,
      fields: {
        institution: { label: "Institution", type: "text", placeholder: "School name", required: true },
        degree: { label: "Degree", type: "text", placeholder: "B.S., M.A., etc.", required: true },
        field: { label: "Field of Study", type: "text", placeholder: "Major", required: false },
        startDate: { label: "Start Date", type: "date", placeholder: "YYYY", required: false },
        endDate: { label: "End Date", type: "date", placeholder: "YYYY", required: false },
        gpa: { label: "GPA", type: "text", placeholder: "3.8", required: false },
      },
      layout: "full-width",
      styles: { showTitle: true, titleAlignment: "left", titleStyle: "underline", showIcon: true, iconPosition: "left" },
    },
    {
      type: "skills",
      defaultTitle: "Skills",
      fields: {
        groups: { label: "Skill Groups", type: "bullets", placeholder: "Add skill...", required: false },
      },
      layout: "sidebar",
      styles: { showTitle: true, titleAlignment: "left", titleStyle: "underline", showIcon: false, iconPosition: "left" },
    },
    {
      type: "languages",
      defaultTitle: "Languages",
      maxItems: 10,
      fields: {
        name: { label: "Language", type: "text", placeholder: "English", required: true },
        proficiency: { label: "Proficiency", type: "select", placeholder: "Select level", required: true },
      },
      layout: "sidebar",
      styles: { showTitle: true, titleAlignment: "left", titleStyle: "underline", showIcon: false, iconPosition: "left" },
    },
    {
      type: "certifications",
      defaultTitle: "Certifications",
      maxItems: 10,
      fields: {
        name: { label: "Name", type: "text", placeholder: "Certification name", required: true },
        issuer: { label: "Issuer", type: "text", placeholder: "Issuing organization", required: true },
        date: { label: "Date", type: "date", placeholder: "YYYY", required: false },
        url: { label: "URL", type: "url", placeholder: "https://", required: false },
      },
      layout: "full-width",
      styles: { showTitle: true, titleAlignment: "left", titleStyle: "underline", showIcon: false, iconPosition: "left" },
    },
    {
      type: "projects",
      defaultTitle: "Projects",
      maxItems: 10,
      fields: {
        name: { label: "Name", type: "text", placeholder: "Project name", required: true },
        role: { label: "Role", type: "text", placeholder: "Your role", required: false },
        url: { label: "URL", type: "url", placeholder: "https://", required: false },
        startDate: { label: "Start Date", type: "date", placeholder: "YYYY", required: false },
        endDate: { label: "End Date", type: "date", placeholder: "YYYY", required: false },
        bullets: { label: "Description", type: "bullets", placeholder: "Describe your contributions...", required: false },
      },
      layout: "full-width",
      styles: { showTitle: true, titleAlignment: "left", titleStyle: "underline", showIcon: false, iconPosition: "left" },
    },
    {
      type: "awards",
      defaultTitle: "Awards",
      maxItems: 10,
      fields: {
        name: { label: "Award", type: "text", placeholder: "Award name", required: true },
        issuer: { label: "Issuer", type: "text", placeholder: "Issuing organization", required: true },
        date: { label: "Date", type: "date", placeholder: "YYYY", required: false },
        description: { label: "Description", type: "textarea", placeholder: "Brief description", required: false },
      },
      layout: "full-width",
      styles: { showTitle: true, titleAlignment: "left", titleStyle: "underline", showIcon: false, iconPosition: "left" },
    },
    {
      type: "interests",
      defaultTitle: "Interests",
      maxItems: 20,
      fields: {
        name: { label: "Interest", type: "text", placeholder: "Interest", required: true },
      },
      layout: "sidebar",
      styles: { showTitle: true, titleAlignment: "left", titleStyle: "underline", showIcon: false, iconPosition: "left" },
    },
    {
      type: "references",
      defaultTitle: "References",
      maxItems: 5,
      fields: {
        name: { label: "Name", type: "text", placeholder: "Reference name", required: true },
        role: { label: "Role", type: "text", placeholder: "Job title", required: true },
        company: { label: "Company", type: "text", placeholder: "Company", required: true },
        email: { label: "Email", type: "email", placeholder: "email@example.com", required: false },
        phone: { label: "Phone", type: "tel", placeholder: "+1 (555) 000-0000", required: false },
      },
      layout: "sidebar",
      styles: { showTitle: true, titleAlignment: "left", titleStyle: "underline", showIcon: false, iconPosition: "left" },
    },
  ],
  atsOptimized: true,
  features: {
    timeline: true,
    sidebar: true,
    headerStyle: "left-aligned",
    showProfileImage: false,
    showDivider: true,
  },
}
