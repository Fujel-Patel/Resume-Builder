"use client";

import dynamic from 'next/dynamic';

/**
 * Client-only wrapper around the resume builder wizard. `ssr: false` dynamic
 * imports are only permitted inside Client Components, so the server page
 * renders this wrapper instead of calling `dynamic` directly.
 */
const BuilderWizardClient = dynamic(() => import('@/components/resume/BuilderWizard'), {
  ssr: false,
});

export default BuilderWizardClient;
