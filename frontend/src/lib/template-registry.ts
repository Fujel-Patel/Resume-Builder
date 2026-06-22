import type { TemplateConfig, TemplateSectionConfig } from "@/types/template"
import { novaTemplateConfig } from "@/types/template"

const registry = new Map<string, TemplateConfig>()

export function registerTemplate(config: TemplateConfig) {
  registry.set(config.id, config)
}

export function getTemplate(id: string): TemplateConfig | undefined {
  return registry.get(id)
}

export function getAllTemplates(): TemplateConfig[] {
  return Array.from(registry.values())
}

export function getTemplateSections(templateId: string): TemplateSectionConfig[] {
  const template = getTemplate(templateId)
  return template?.sections ?? []
}

export function getTemplateSection(
  templateId: string,
  sectionType: string
): TemplateSectionConfig | undefined {
  const template = getTemplate(templateId)
  return template?.sections.find((s) => s.type === sectionType)
}

registerTemplate(novaTemplateConfig)
