import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { ResumeData } from '@/types/resume';
import { SAMPLE_RESUME } from '@/lib/sample-resume';

interface Props {
  templateId: string;
}

type TemplateComponent = ComponentType<{ data: ResumeData }>;

// Dynamic components are created once at module scope (never during render).
const TEMPLATE_COMPONENTS: Record<string, TemplateComponent> = {
  'modern-professional': dynamic(() => import('./ModernProfessionalTemplate').then((m) => m.ModernProfessionalTemplate)),
  'classic-conservative': dynamic(() => import('./ClassicConservativeTemplate').then((m) => m.ClassicConservativeTemplate)),
  'minimal-clean': dynamic(() => import('./MinimalCleanTemplate').then((m) => m.MinimalCleanTemplate)),
  'creative-bold': dynamic(() => import('./CreativeBoldTemplate').then((m) => m.CreativeBoldTemplate)),
  'executive-senior': dynamic(() => import('./ExecutiveSeniorTemplate').then((m) => m.ExecutiveSeniorTemplate)),
  'technical-developer': dynamic(() => import('./TechnicalDeveloperTemplate').then((m) => m.TechnicalDeveloperTemplate)),
  'academic-scholar': dynamic(() => import('./AcademicScholarTemplate').then((m) => m.AcademicScholarTemplate)),
  'fresh-graduate': dynamic(() => import('./FreshGraduateTemplate').then((m) => m.FreshGraduateTemplate)),
};

export default function LazyTemplatePreview({ templateId }: Props) {
  const Component = TEMPLATE_COMPONENTS[templateId];
  if (!Component) return <p>Preview not available</p>;
  return (
    <Suspense fallback={<div>Loading preview...</div>}>
      <Component data={SAMPLE_RESUME} />
    </Suspense>
  );
}
