import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { TEMPLATE_REGISTRY } from './index';

interface Props {
  templateId: string;
}

// Find the component path from the registry entry
// The registry currently stores the component itself; we map id to import path manually.
// For simplicity, we use a switch to resolve the dynamic import.
function loadComponent(id: string) {
  switch (id) {
    case 'modern-professional':
      return dynamic(() => import('./ModernProfessionalTemplate'));
    case 'classic-conservative':
      return dynamic(() => import('./ClassicConservativeTemplate'));
    case 'minimal-clean':
      return dynamic(() => import('./MinimalCleanTemplate'));
    case 'creative-bold':
      return dynamic(() => import('./CreativeBoldTemplate'));
    case 'executive-senior':
      return dynamic(() => import('./ExecutiveSeniorTemplate'));
    case 'technical-developer':
      return dynamic(() => import('./TechnicalDeveloperTemplate'));
    case 'academic-scholar':
      return dynamic(() => import('./AcademicScholarTemplate'));
    case 'fresh-graduate':
      return dynamic(() => import('./FreshGraduateTemplate'));
    default:
      return null;
  }
}

export default function LazyTemplatePreview({ templateId }: Props) {
  const Component = loadComponent(templateId);
  if (!Component) return <p>Preview not available</p>;
  return (
    <Suspense fallback={<div>Loading preview...</div>}>
      <Component />
    </Suspense>
  );
}
