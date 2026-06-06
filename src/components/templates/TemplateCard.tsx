"use client";

import React from "react";
import Button from "@/components/ui/Button";
import type { TemplateRegistryItem } from "./index";

/**
 * Card displaying a resume template preview and actions.
 */
export default function TemplateCard({
  template,
  selected,
  onSelect,
  onPreview,
}: {
  template: TemplateRegistryItem;
  selected: boolean;
  onSelect: () => void;
  onPreview?: () => void;
}) {
  return (
    <div className="border border-[--border] rounded-xl bg-[--bg-surface] shadow-sm overflow-hidden">
      {/* Thumbnail placeholder */}
      <div className="h-40 bg-gray-100 flex items-center justify-center">
        <span className="text-[--text-muted]">Thumbnail</span>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-[--text-primary] mb-1" title={template.description}>
          {template.name}
        </h3>
        <p className="text-sm text-[--text-secondary] mb-2">{template.description}</p>
        <div className="flex flex-wrap gap-1 mb-3">
          {template.tags.map(tag => (
            <span
              key={tag}
              className="rounded-full bg-[--bg-elevated] px-2 py-0.5 text-xs text-[--text-muted]"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex space-x-2">
          <Button variant="secondary" size="sm" onClick={onPreview}>
            Preview
          </Button>
          <Button variant="primary" size="sm" onClick={onSelect}>
            {selected ? "Selected" : "Select"}
          </Button>
        </div>
      </div>
    </div>
  );
}
