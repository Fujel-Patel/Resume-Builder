"use client";

import React, { useState, useMemo } from "react";
import { getAllTemplates, type TemplateRegistryItem } from "@/components/templates";
import LazyTemplatePreview from "@/components/templates/LazyTemplatePreview";
import TemplateCard from "@/components/templates/TemplateCard";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";

// Helper to collect all unique tags from the registry
function collectTags(templates: TemplateRegistryItem[]): string[] {
  const tagSet = new Set<string>();
  templates.forEach(t => t.tags.forEach(tag => tagSet.add(tag)));
  return Array.from(tagSet);
}

export default function TemplatesPage() {
  const allTemplates = useMemo(() => getAllTemplates(), []);
  const allTags = useMemo(() => collectTags(allTemplates), [allTemplates]);

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<string>("name");
  const [previewTemplate, setPreviewTemplate] = useState<TemplateRegistryItem | null>(null);
  const { addToast } = useToast();

  const filteredTemplates = useMemo(() => {
    let filtered = allTemplates;
    if (selectedTags.length > 0) {
      filtered = filtered.filter(t => selectedTags.every(tag => t.tags.includes(tag)));
    }
    if (sortKey === "name") {
      filtered = filtered.slice().sort((a, b) => a.name.localeCompare(b.name));
    }
    // Placeholder for other sort options (popularity, date)
    return filtered;
  }, [allTemplates, selectedTags, sortKey]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSelect = (template: TemplateRegistryItem) => {
    addToast({ title: "Template Selected", description: `${template.name} chosen for builder`, variant: "default" });
    // In a full implementation, this would store the selection in user context.
  };

  const handlePreview = (template: TemplateRegistryItem) => {
    setPreviewTemplate(template);
  };

  const closePreview = () => setPreviewTemplate(null);

  return (
    <div className="page-container p-6 max-w-7xl mx-auto">
      <h1 className="section-heading text-3xl mb-6">Resume Templates</h1>

      {/* Filter & Sort Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div className="flex flex-wrap gap-2">
          {allTags.map(tag => (
            <label key={tag} className="inline-flex items-center space-x-1 text-sm">
              <input
                type="checkbox"
                checked={selectedTags.includes(tag)}
                onChange={() => toggleTag(tag)}
                className="form-checkbox h-4 w-4 text-[--color-primary] border-[--border] rounded"
              />
              <span className="capitalize text-[--text-secondary]">{tag}</span>
            </label>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-[--text-secondary]" htmlFor="sortSelect">Sort:</label>
          <select
            id="sortSelect"
            value={sortKey}
            onChange={e => setSortKey(e.target.value)}
            className="rounded border border-[--border] bg-white p-1 text-sm"
          >
            <option value="name">Name</option>
            {/* Future options could be added here */}
          </select>
        </div>
      </div>

      {/* Grid of templates */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredTemplates.map(template => (
          <TemplateCard
            key={template.id}
            template={template}
            selected={false}
            onSelect={() => handleSelect(template)}
            onPreview={() => handlePreview(template)}
          />
        ))}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto p-6 relative">
            <button
              type="button"
              onClick={closePreview}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold mb-4">{previewTemplate.name} Preview</h2>
            <div className="border border-[--border] rounded p-4 mb-4">
              {/* Render the actual template component. Assuming it accepts no required props for a demo. */}
              <LazyTemplatePreview templateId={previewTemplate.id} />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="secondary" size="sm" onClick={() => handleSelect(previewTemplate)}>
                Select for Builder
              </Button>
              <Button variant="primary" size="sm" onClick={closePreview}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
