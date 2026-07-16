"use client"

import type { ComponentType } from "react"
import type { ResumeData } from "@/types/resume"
import { NovaTemplate } from "./nova-template"
import { ProfessionalExecutiveTemplate } from "./professional-executive"
import { ObsidianEdgeTemplate } from "./obsidian-edge"
import { BlueSteelTemplate } from "./blue-steel"
import { NeonGreenTemplate } from "./neon-green"
import { MinimalTimelineTemplate } from "../../design-system/templates/components/minimal-timeline"
import { DeveloperPortfolioTemplate } from "../../design-system/templates/components/developer-portfolio"
import { DesignerCreativeTemplate } from "../../design-system/templates/components/designer-creative"
import { StartupFounderTemplate } from "../../design-system/templates/components/startup-founder"
import { GraduateEntryTemplate } from "../../design-system/templates/components/graduate-entry"
import { ConfigTemplateRenderer } from "../../design-system/renderer/TemplateRenderer"
import type { TemplateConfig } from "../../design-system/templates/types"
import {
  atsCleanConfig,
  atsMinimalConfig,
  atsBoldHeadingsConfig,
  atsSerifConfig,
  atsModernSansConfig,
  atsCompactConfig,
  atsExecutiveConfig,
  atsCreativeSafeConfig,
  executiveNavyConfig,
  corporateGrayConfig,
  consultantConfig,
  financeFormalConfig,
  techProfessionalConfig,
  healthcareConfig,
  legalConfig,
  sidebarClassicConfig,
  sidebarModernConfig,
  sidebarDarkConfig,
  splitEvenConfig,
  splitGoldenConfig,
  sidebarRightConfig,
  sidebarNarrowConfig,
  creativeGradientConfig,
  creativeBoldConfig,
  creativeElegantConfig,
  creativeOceanConfig,
  creativeSageConfig,
} from "../../design-system/templates"

export type BuilderTemplateComponent = ComponentType<{ resume: ResumeData }>

export type BuilderTemplateEntry = {
  id: string
  name: string
  description: string
  tags: string[]
  category?: string
  component: BuilderTemplateComponent
}

function makeConfigComponent(config: TemplateConfig): BuilderTemplateComponent {
  return function ConfigDrivenTemplate({ resume }: { resume: ResumeData }) {
    return <ConfigTemplateRenderer config={config} resume={resume} />
  }
}

export const builderTemplates: BuilderTemplateEntry[] = [
  // --- Legacy component-driven templates ---
  {
    id: "nova-timeline",
    name: "Nova Timeline",
    description: "Modern two-column timeline layout with sidebar",
    tags: ["ATS Friendly", "Modern"],
    component: NovaTemplate,
  },
  {
    id: "professional-executive",
    name: "Professional Executive",
    description: "Corporate navy design with structured sections",
    tags: ["Executive", "ATS Friendly"],
    component: ProfessionalExecutiveTemplate,
  },
  {
    id: "obsidian-edge",
    name: "Obsidian Edge",
    description:
      "Bold black header with white body, icon section headings, multi-column skills — print-ready A4",
    tags: ["Modern", "ATS Friendly", "Professional"],
    category: "professional",
    component: ObsidianEdgeTemplate,
  },
  {
    id: "blue-steel",
    name: "Blue Steel",
    description: "Minimalist European design with elegant typography and card-based layout",
    tags: ["Executive", "ATS Friendly", "Professional"],
    component: BlueSteelTemplate,
  },
  {
    id: "neon-green",
    name: "Neon Green",
    description: "Modern software-engineer resume with clean typography and subtle green accents",
    tags: ["ATS Friendly", "Modern", "Professional"],
    component: NeonGreenTemplate,
  },

  // --- Component-driven templates ---
  {
    id: "minimal-timeline",
    name: "Minimal Timeline",
    description: "Clean timeline layout with dot markers and dark sidebar",
    tags: ["Timeline", "Modern", "ATS Friendly"],
    category: "two-column",
    component: MinimalTimelineTemplate,
  },
  {
    id: "developer-portfolio",
    name: "Developer Portfolio",
    description: "Terminal-inspired template with monospace accents for developers",
    tags: ["Developer", "Tech", "Modern"],
    category: "professional",
    component: DeveloperPortfolioTemplate,
  },
  {
    id: "designer-creative",
    name: "Designer Creative",
    description: "Bold asymmetric layout with skill bars for designers",
    tags: ["Creative", "Designer", "Bold"],
    category: "creative",
    component: DesignerCreativeTemplate,
  },
  {
    id: "startup-founder",
    name: "Startup Founder",
    description: "Modern startup-style with large typography and card projects",
    tags: ["Startup", "Founder", "Modern"],
    category: "professional",
    component: StartupFounderTemplate,
  },
  {
    id: "graduate-entry",
    name: "Graduate Entry",
    description: "Clean entry-level template emphasizing education and projects",
    tags: ["Graduate", "Entry-Level", "ATS Friendly"],
    category: "ats",
    component: GraduateEntryTemplate,
  },

  // --- ATS templates ---
  {
    id: atsCleanConfig.id,
    name: atsCleanConfig.name,
    description: atsCleanConfig.description,
    tags: atsCleanConfig.tags,
    category: "ats",
    component: makeConfigComponent(atsCleanConfig),
  },
  {
    id: atsMinimalConfig.id,
    name: atsMinimalConfig.name,
    description: atsMinimalConfig.description,
    tags: atsMinimalConfig.tags,
    category: "ats",
    component: makeConfigComponent(atsMinimalConfig),
  },
  {
    id: atsBoldHeadingsConfig.id,
    name: atsBoldHeadingsConfig.name,
    description: atsBoldHeadingsConfig.description,
    tags: atsBoldHeadingsConfig.tags,
    category: "ats",
    component: makeConfigComponent(atsBoldHeadingsConfig),
  },
  {
    id: atsSerifConfig.id,
    name: atsSerifConfig.name,
    description: atsSerifConfig.description,
    tags: atsSerifConfig.tags,
    category: "ats",
    component: makeConfigComponent(atsSerifConfig),
  },
  {
    id: atsModernSansConfig.id,
    name: atsModernSansConfig.name,
    description: atsModernSansConfig.description,
    tags: atsModernSansConfig.tags,
    category: "ats",
    component: makeConfigComponent(atsModernSansConfig),
  },
  {
    id: atsCompactConfig.id,
    name: atsCompactConfig.name,
    description: atsCompactConfig.description,
    tags: atsCompactConfig.tags,
    category: "ats",
    component: makeConfigComponent(atsCompactConfig),
  },
  {
    id: atsExecutiveConfig.id,
    name: atsExecutiveConfig.name,
    description: atsExecutiveConfig.description,
    tags: atsExecutiveConfig.tags,
    category: "ats",
    component: makeConfigComponent(atsExecutiveConfig),
  },
  {
    id: atsCreativeSafeConfig.id,
    name: atsCreativeSafeConfig.name,
    description: atsCreativeSafeConfig.description,
    tags: atsCreativeSafeConfig.tags,
    category: "ats",
    component: makeConfigComponent(atsCreativeSafeConfig),
  },

  // --- Professional templates ---
  {
    id: executiveNavyConfig.id,
    name: executiveNavyConfig.name,
    description: executiveNavyConfig.description,
    tags: executiveNavyConfig.tags,
    category: "professional",
    component: makeConfigComponent(executiveNavyConfig),
  },
  {
    id: corporateGrayConfig.id,
    name: corporateGrayConfig.name,
    description: corporateGrayConfig.description,
    tags: corporateGrayConfig.tags,
    category: "professional",
    component: makeConfigComponent(corporateGrayConfig),
  },
  {
    id: consultantConfig.id,
    name: consultantConfig.name,
    description: consultantConfig.description,
    tags: consultantConfig.tags,
    category: "professional",
    component: makeConfigComponent(consultantConfig),
  },
  {
    id: financeFormalConfig.id,
    name: financeFormalConfig.name,
    description: financeFormalConfig.description,
    tags: financeFormalConfig.tags,
    category: "professional",
    component: makeConfigComponent(financeFormalConfig),
  },
  {
    id: techProfessionalConfig.id,
    name: techProfessionalConfig.name,
    description: techProfessionalConfig.description,
    tags: techProfessionalConfig.tags,
    category: "professional",
    component: makeConfigComponent(techProfessionalConfig),
  },
  {
    id: healthcareConfig.id,
    name: healthcareConfig.name,
    description: healthcareConfig.description,
    tags: healthcareConfig.tags,
    category: "professional",
    component: makeConfigComponent(healthcareConfig),
  },
  {
    id: legalConfig.id,
    name: legalConfig.name,
    description: legalConfig.description,
    tags: legalConfig.tags,
    category: "professional",
    component: makeConfigComponent(legalConfig),
  },

  // --- Two-Column templates ---
  {
    id: sidebarClassicConfig.id,
    name: sidebarClassicConfig.name,
    description: sidebarClassicConfig.description,
    tags: sidebarClassicConfig.tags,
    category: "two-column",
    component: makeConfigComponent(sidebarClassicConfig),
  },
  {
    id: sidebarModernConfig.id,
    name: sidebarModernConfig.name,
    description: sidebarModernConfig.description,
    tags: sidebarModernConfig.tags,
    category: "two-column",
    component: makeConfigComponent(sidebarModernConfig),
  },
  {
    id: sidebarDarkConfig.id,
    name: sidebarDarkConfig.name,
    description: sidebarDarkConfig.description,
    tags: sidebarDarkConfig.tags,
    category: "two-column",
    component: makeConfigComponent(sidebarDarkConfig),
  },
  {
    id: splitEvenConfig.id,
    name: splitEvenConfig.name,
    description: splitEvenConfig.description,
    tags: splitEvenConfig.tags,
    category: "two-column",
    component: makeConfigComponent(splitEvenConfig),
  },
  {
    id: splitGoldenConfig.id,
    name: splitGoldenConfig.name,
    description: splitGoldenConfig.description,
    tags: splitGoldenConfig.tags,
    category: "two-column",
    component: makeConfigComponent(splitGoldenConfig),
  },
  {
    id: sidebarRightConfig.id,
    name: sidebarRightConfig.name,
    description: sidebarRightConfig.description,
    tags: sidebarRightConfig.tags,
    category: "two-column",
    component: makeConfigComponent(sidebarRightConfig),
  },
  {
    id: sidebarNarrowConfig.id,
    name: sidebarNarrowConfig.name,
    description: sidebarNarrowConfig.description,
    tags: sidebarNarrowConfig.tags,
    category: "two-column",
    component: makeConfigComponent(sidebarNarrowConfig),
  },

  // --- Creative templates ---
  {
    id: creativeGradientConfig.id,
    name: creativeGradientConfig.name,
    description: creativeGradientConfig.description,
    tags: creativeGradientConfig.tags,
    category: "creative",
    component: makeConfigComponent(creativeGradientConfig),
  },
  {
    id: creativeBoldConfig.id,
    name: creativeBoldConfig.name,
    description: creativeBoldConfig.description,
    tags: creativeBoldConfig.tags,
    category: "creative",
    component: makeConfigComponent(creativeBoldConfig),
  },
  {
    id: creativeElegantConfig.id,
    name: creativeElegantConfig.name,
    description: creativeElegantConfig.description,
    tags: creativeElegantConfig.tags,
    category: "creative",
    component: makeConfigComponent(creativeElegantConfig),
  },
  {
    id: creativeOceanConfig.id,
    name: creativeOceanConfig.name,
    description: creativeOceanConfig.description,
    tags: creativeOceanConfig.tags,
    category: "creative",
    component: makeConfigComponent(creativeOceanConfig),
  },
  {
    id: creativeSageConfig.id,
    name: creativeSageConfig.name,
    description: creativeSageConfig.description,
    tags: creativeSageConfig.tags,
    category: "creative",
    component: makeConfigComponent(creativeSageConfig),
  },
]

export const templateMap: Record<string, BuilderTemplateComponent> = Object.fromEntries(
  builderTemplates.map((t) => [t.id, t.component])
)
