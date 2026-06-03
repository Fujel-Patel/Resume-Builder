import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import type { ResumeData } from '@/types/resume';

export async function createDraft(userId: string, title?: string, templateId?: string) {
  const supabase = await createClient(await cookies());
  const { data, error } = await supabase.from('resumes').insert({
    user_id: userId,
    title: title ?? 'Untitled Resume',
    template_id: templateId ?? null,
    data: {} as ResumeData,
  }).select('id, data').single();
  if (error) throw error;
  return { id: data.id, data: data.data as ResumeData };
}

export async function getDraft(id: string) {
  const supabase = await createClient(await cookies());
  const { data, error } = await supabase.from('resumes').select('id, data').eq('id', id).single();
  if (error) throw error;
  return { id: data.id, data: data.data as ResumeData };
}

export async function updateDraft(id: string, patch: Partial<ResumeData>) {
  const supabase = await createClient(await cookies());
  // fetch existing data
  const { data: existing, error: fetchErr } = await supabase.from('resumes').select('data').eq('id', id).single();
  if (fetchErr) throw fetchErr;
  const merged = { ...(existing?.data as ResumeData), ...patch };
  const { data, error } = await supabase.from('resumes').update({ data: merged }).eq('id', id).select('id, data').single();
  if (error) throw error;
  return { id: data.id, data: data.data as ResumeData };
}
