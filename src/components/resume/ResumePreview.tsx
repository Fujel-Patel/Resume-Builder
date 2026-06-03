"use client";
import { useMemo } from 'react';
import type { ResumeData } from '@/types/resume';
import { getTemplateComponent } from '@/components/templates';
import ResumePreviewDefault from './ResumePreviewDefault';

interface ResumePreviewProps {
  data: ResumeData;
  selectedTemplateId?: string;
}

export default function ResumePreview({ data, selectedTemplateId }: ResumePreviewProps) {
  const payload = useMemo(() => ({ data, selectedTemplateId }), [data, selectedTemplateId]);

  const template = useMemo(() => {
    if (!selectedTemplateId) return null;
    return getTemplateComponent(selectedTemplateId);
  }, [selectedTemplateId]);

  if (template) {
    const Template = template.Component;
    return (
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <Template data={data} />
      </div>
    );
  }

  return <ResumePreviewDefault data={data} />;
}
