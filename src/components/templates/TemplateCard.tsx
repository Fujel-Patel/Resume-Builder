import React from 'react';
import type { TemplateRegistryItem } from './index';

interface TemplateCardProps {
  template: TemplateRegistryItem;
  selected: boolean;
  onSelect: () => void;
}

export default function TemplateCard({ template, selected, onSelect }: TemplateCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex flex-col items-start p-2 rounded-xl border border-[--border] w-48 h-48 overflow-hidden transition-all duration-200 hover:shadow-lg ${
        selected ? 'bg-gradient-to-r from-[--color-primary] to-[--color-accent] text-white border-[--color-primary]/20' : 'bg-[--bg-surface]' }
      `}
    >
      {/* Simple placeholder thumbnail */}
      <div className="w-full flex-1 bg-[--bg-elevated] rounded-md mb-2 flex items-center justify-center text-[--text-muted]">
        {template.name}
      </div>
      <div className="text-sm font-medium" title={template.description}>
        {template.name}
      </div>
    </button>
  );
}
