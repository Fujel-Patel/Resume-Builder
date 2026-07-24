"use client"

import { useState } from "react"
import { templateMap, builderTemplates } from "@/features/resume-builder/preview/templates"
import type { ResumeData, SkillGroup } from "@/types/resume"

const testResume: ResumeData = {
  id: "audit-test",
  name: "Audit Test Resume",
  targetRole: "Senior Product Designer",
  targetIndustry: "Technology",
  sections: [
    { id: "contact", type: "contact", title: "Contact", order: 0, visible: true },
    { id: "summary", type: "summary", title: "Professional Summary", order: 1, visible: true },
    { id: "experience", type: "experience", title: "Experience", order: 2, visible: true },
    { id: "education", type: "education", title: "Education", order: 3, visible: true },
    { id: "skills", type: "skills", title: "Skills", order: 4, visible: true },
    { id: "projects", type: "projects", title: "Projects", order: 5, visible: true },
    { id: "certifications", type: "certifications", title: "Certifications", order: 6, visible: true },
    { id: "languages", type: "languages", title: "Languages", order: 7, visible: true },
  ],
  content: {
    contact: {
      fullName: "Alexandra Chen",
      title: "Senior Product Designer",
      email: "alex.chen@email.com",
      phone: "(415) 555-0142",
      location: "San Francisco, CA",
      website: "alexchen.design",
      linkedin: "linkedin.com/in/alexandrachen",
      github: "github.com/alexchen",
      photoUrl: "",
    },
    summary:
      "Award-winning product designer with 8+ years of experience crafting intuitive digital experiences for Fortune 500 companies and high-growth startups. Led design systems serving 200+ engineers across 12 product lines. Passionate about accessibility, design tokens, and bridging the gap between user needs and business goals.",
    jobDescription: "",
    experience: [
      {
        id: "exp1",
        company: "Stripe",
        role: "Senior Product Designer",
        startDate: "Mar 2021",
        endDate: "",
        current: true,
        location: "San Francisco, CA",
        bullets: [
          "Redesigned the merchant onboarding flow, increasing completion rates by 34% and reducing support tickets by 28%",
          "Led the design system migration from Sketch to Figma, establishing component libraries used by 45 designers and 180 engineers",
          "Designed real-time fraud detection dashboard that processes $2B+ daily transactions with 99.7% accuracy",
          "Mentored 3 junior designers, with 2 promoted to mid-level within 18 months",
        ],
      },
      {
        id: "exp2",
        company: "Figma",
        role: "Product Designer",
        startDate: "Jun 2019",
        endDate: "Feb 2021",
        current: false,
        location: "San Francisco, CA",
        bullets: [
          "Designed collaborative editing features supporting 50+ simultaneous users with sub-100ms latency",
          "Created the auto-layout v2 specification, reducing frame setup time by 60% for power users",
          "Conducted 120+ user research sessions across 8 countries to inform internationalization strategy",
        ],
      },
      {
        id: "exp3",
        company: "Airbnb",
        role: "UX Designer",
        startDate: "Jan 2017",
        endDate: "May 2019",
        current: false,
        location: "San Francisco, CA",
        bullets: [
          "Designed the host pricing tool that increased host revenue by 22% through dynamic pricing suggestions",
          "Built and maintained accessibility audit framework achieving WCAG 2.1 AA compliance across 14 product surfaces",
        ],
      },
    ],
    education: [
      {
        id: "edu1",
        institution: "Rhode Island School of Design",
        degree: "Bachelor of Fine Arts",
        field: "Graphic Design",
        startDate: "2013",
        endDate: "2017",
        current: false,
        gpa: "3.9",
      },
    ],
    skills: [
      {
        id: "sk1",
        name: "Design Tools",
        skills: ["Figma", "Sketch", "Adobe Creative Suite", "Framer", "Principle", "Miro"],
      },
      {
        id: "sk2",
        name: "Specialties",
        skills: ["Design Systems", "User Research", "Prototyping", "Accessibility", "Interaction Design", "Information Architecture"],
      },
      {
        id: "sk3",
        name: "Technical",
        skills: ["HTML/CSS", "JavaScript", "React", "Tailwind CSS", "Storybook", "Git"],
      },
    ] as SkillGroup[],
    languages: [
      { id: "lang1", name: "English", proficiency: "native" },
      { id: "lang2", name: "Mandarin", proficiency: "fluent" },
      { id: "lang3", name: "Spanish", proficiency: "intermediate" },
    ],
    certifications: [
      { id: "cert1", name: "Google UX Design Professional Certificate", issuer: "Google", date: "2023", url: "" },
      { id: "cert2", name: "Certified Accessibility Specialist (CPACC)", issuer: "IAAP", date: "2022", url: "" },
    ],
    projects: [
      {
        id: "proj1",
        name: "DesignTokens.io",
        role: "Creator & Lead Designer",
        url: "designtokens.io",
        startDate: "2022",
        endDate: "",
        bullets: [
          "Open-source design token management platform with 4,200+ GitHub stars and 800+ active monthly users",
          "Built collaborative token editor supporting real-time sync across Figma, code, and documentation",
        ],
      },
    ],
    awards: [],
    interests: [
      { id: "int1", name: "Open source contributor" },
      { id: "int2", name: "Design podcast host" },
      { id: "int3", name: "Amateur ceramics" },
    ],
    references: [],
    custom: [],
  },
  theme: {
    primaryColor: "#2563EB",
    secondaryColor: "#1E40AF",
    textColor: "#111827",
    backgroundColor: "#FFFFFF",
    accentColor: "#3B82F6",
    fontFamily: "Inter",
    headingFont: "Inter",
    fontSize: "medium",
    spacing: "normal",
    sectionStyle: "underline",
  },
  templateId: "ats-clean",
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z",
}

export default function PreviewAllPage() {
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null)
  const templates = builderTemplates

  return (
    <div style={{ fontFamily: "Inter, sans-serif", padding: "20px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Resume Template Audit</h1>
        <p style={{ fontSize: 14, color: "#666", marginBottom: 20 }}>
          {templates.length} templates | Test: Alexandra Chen, Senior Product Designer
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          <button
            onClick={() => setActiveTemplate(activeTemplate === "all" ? null : "all")}
            style={{
              padding: "8px 16px",
              backgroundColor: activeTemplate === "all" ? "#2563EB" : "#fff",
              color: activeTemplate === "all" ? "#fff" : "#333",
              border: "1px solid #ddd",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            Render All ({templates.length})
          </button>
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTemplate(activeTemplate === t.id ? null : t.id)}
              style={{
                padding: "6px 12px",
                backgroundColor: activeTemplate === t.id ? "#2563EB" : "#fff",
                color: activeTemplate === t.id ? "#fff" : "#333",
                border: "1px solid #ddd",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              {t.name}
            </button>
          ))}
        </div>

        <div>
          {activeTemplate === "all" &&
            templates.map((t) => {
              const TemplateComponent = templateMap[t.id]
              if (!TemplateComponent) return null
              return (
                <div
                  key={t.id}
                  id={`template-${t.id}`}
                  style={{
                    marginBottom: 40,
                    backgroundColor: "#fff",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#f8f9fa",
                      borderBottom: "1px solid #e5e7eb",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#374151",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>
                      {t.name} <span style={{ color: "#9ca3af", fontWeight: 400 }}>({t.id})</span>
                    </span>
                    <span style={{ color: "#9ca3af", fontWeight: 400, textTransform: "capitalize" }}>
                      {t.category || "legacy"}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      padding: "20px",
                      backgroundColor: "#e5e7eb",
                    }}
                  >
                    <div style={{ transform: "scale(0.65)", transformOrigin: "top center" }}>
                      <TemplateComponent resume={testResume} />
                    </div>
                  </div>
                </div>
              )
            })}

          {activeTemplate && activeTemplate !== "all" && (() => {
            const t = templates.find((tpl) => tpl.id === activeTemplate)
            if (!t) return null
            const TemplateComponent = templateMap[t.id]
            if (!TemplateComponent) return null
            return (
              <div
                id={`template-${t.id}`}
                style={{
                  backgroundColor: "#fff",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#f8f9fa",
                    borderBottom: "1px solid #e5e7eb",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#374151",
                  }}
                >
                  {t.name} ({t.id})
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: "20px",
                    backgroundColor: "#e5e7eb",
                  }}
                >
                  <TemplateComponent resume={testResume} />
                </div>
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
