import BuilderWizard from '@/components/resume/BuilderWizard';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

/**
 * Server component that creates (or loads) a draft resume and renders the client‑side wizard.
 * If a `draftId` query param is present, the existing draft is loaded; otherwise a new draft
 * is created via the `/api/resumes/draft` endpoint.
 */
export default async function BuilderPage({ searchParams }: { searchParams?: { [key: string]: string } }) {
  // Authentication removed – all users can access the builder page.

  const resolvedSearchParams = await searchParams;
  const draftId = resolvedSearchParams?.draftId;
  let initialDraft: { id: string; data: any } | null = null;

  if (draftId) {
    try {
      // Load an existing draft if the backing table is available.
      const supabase = await createClient(await cookies());
      const { data, error } = await supabase.from('resumes').select('id, data').eq('id', draftId).single();
      if (!error) {
        initialDraft = { id: data.id, data: data.data };
      }
    } catch {
      initialDraft = null;
    }
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <BuilderWizard initialDraft={initialDraft} />
    </div>
  );
}
