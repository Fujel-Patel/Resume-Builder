// src/components/resume/LazyResumePreview.tsx
import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import type { ResumeData } from '@/types/resume';

/**
 * Lazy loads the selected template component for the resume preview.
 * Falls back to the default static preview if no template is selected or the import fails.
 */
interface Props {
  data: ResumeData;
  selectedTemplateId?: string;
}

function loadTemplateComponent(id: string) {
  switch (id) {
    case 'modern-professional':
      return dynamic(() => import('@/components/templates/ModernProfessionalTemplate'));
    case 'classic-conservative':
      return dynamic(() => import('@/components/templates/ClassicConservativeTemplate'));
    case 'minimal-clean':
      return dynamic(() => import('@/components/templates/MinimalCleanTemplate'));
    case 'creative-bold':
      return dynamic(() => import('@/components/templates/CreativeBoldTemplate'));
    case 'executive-senior':
      return dynamic(() => import('@/components/templates/ExecutiveSeniorTemplate'));
    case 'technical-developer':
      return dynamic(() => import('@/components/templates/TechnicalDeveloperTemplate'));
    case 'academic-scholar':
      return dynamic(() => import('@/components/templates/AcademicScholarTemplate'));
    case 'fresh-graduate':
      return dynamic(() => import('@/components/templates/FreshGraduateTemplate'));
    default:
      return null;
  }
}

export default function LazyResumePreview({ data, selectedTemplateId }: Props) {
  if (!selectedTemplateId) {
    // No template selected – use default static preview (loads immediately)
    const Default = dynamic(() => import('./ResumePreviewDefault'));
    return (
      <Suspense fallback={<div>Loading preview...</div>}>
        <Default data={data} />
      </Suspense>
    );
  }

  const Component = loadTemplateComponent(selectedTemplateId);
  if (!Component) {
    const Default = dynamic(() => import('./ResumePreviewDefault'));
    return (
      <Suspense fallback={<div>Loading preview...</div>}>
        <Default data={data} />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<div>Loading preview...</div>}>
      <Component data={data} />
    </Suspense>
  );
}
