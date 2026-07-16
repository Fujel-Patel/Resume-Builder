import type { TemplateConfig, TemplateEntry, TemplateMetadata, BuilderTemplateComponent } from "./types"

const registry = new Map<string, TemplateEntry>()

export function registerConfigTemplate(config: TemplateConfig): void {
  registry.set(config.id, { type: "config", config })
}

export function registerComponentTemplate(
  id: string,
  metadata: TemplateMetadata,
  component: BuilderTemplateComponent,
): void {
  registry.set(id, { type: "component", component, metadata })
}

export function getTemplate(id: string): TemplateEntry | undefined {
  return registry.get(id)
}

export function getAllTemplates(): TemplateEntry[] {
  return Array.from(registry.values())
}

export function getTemplatesByCategory(category: string): TemplateEntry[] {
  return getAllTemplates().filter((entry) => {
    if (entry.type === "config") return entry.config.category === category
    return entry.metadata.category === category
  })
}

export function getTemplateMetadata(id: string): TemplateMetadata | undefined {
  const entry = registry.get(id)
  if (!entry) return undefined
  if (entry.type === "config") {
    return {
      id: entry.config.id,
      name: entry.config.name,
      description: entry.config.description,
      tags: entry.config.tags,
      category: entry.config.category,
    }
  }
  return entry.metadata
}

export function getAllMetadata(): TemplateMetadata[] {
  return getAllTemplates().map((entry) => {
    if (entry.type === "config") {
      return {
        id: entry.config.id,
        name: entry.config.name,
        description: entry.config.description,
        tags: entry.config.tags,
        category: entry.config.category,
      }
    }
    return entry.metadata
  })
}
