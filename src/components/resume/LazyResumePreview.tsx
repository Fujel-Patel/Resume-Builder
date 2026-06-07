// src/components/resume/LazyResumePreview.tsx
import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { ResumeData } from '@/types/resume';

/**
 * Lazy loads the selected template component for the resume preview.
 * Falls back to the default static preview if no template is selected or the import fails.
 */
interface Props {
  data: ResumeData;
  selectedTemplateId?: string;
}

type TemplateComponent = ComponentType<{ data: ResumeData }>;

// Dynamic components are created once at module scope (never during render).
const DefaultPreview = dynamic(() => import('./ResumePreviewDefault'));

const TEMPLATE_COMPONENTS: Record<string, TemplateComponent> = {
  'modern-professional': dynamic(() =>
    import('@/components/templates/ModernProfessionalTemplate').then((m) => m.ModernProfessionalTemplate)
  ),
  'classic-conservative': dynamic(() =>
    import('@/components/templates/ClassicConservativeTemplate').then((m) => m.ClassicConservativeTemplate)
  ),
  'minimal-clean': dynamic(() =>
    import('@/components/templates/MinimalCleanTemplate').then((m) => m.MinimalCleanTemplate)
  ),
  'creative-bold': dynamic(() =>
    import('@/components/templates/CreativeBoldTemplate').then((m) => m.CreativeBoldTemplate)
  ),
  'executive-senior': dynamic(() =>
    import('@/components/templates/ExecutiveSeniorTemplate').then((m) => m.ExecutiveSeniorTemplate)
  ),
  'technical-developer': dynamic(() =>
    import('@/components/templates/TechnicalDeveloperTemplate').then((m) => m.TechnicalDeveloperTemplate)
  ),
  'academic-scholar': dynamic(() =>
    import('@/components/templates/AcademicScholarTemplate').then((m) => m.AcademicScholarTemplate)
  ),
  'fresh-graduate': dynamic(() =>
    import('@/components/templates/FreshGraduateTemplate').then((m) => m.FreshGraduateTemplate)
  ),
};

export default function LazyResumePreview({ data, selectedTemplateId }: Props) {
  const Component = selectedTemplateId ? TEMPLATE_COMPONENTS[selectedTemplateId] : undefined;
  const Resolved: TemplateComponent = Component ?? DefaultPreview;

  return (
    <Suspense fallback={<div>Loading preview...</div>}>
      <Resolved data={data} />
    </Suspense>
  );
}
