import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function Page() {
  const cookieStore = await cookies();
  let todos: any[] = [];
  try {
    const supabase = await createClient(cookieStore);
    const { data } = await supabase.from('todos').select();
    todos = data ?? [];
  } catch (e) {
    // If Supabase is not configured or query fails, fall back to empty array.
    todos = [];
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-3xl w-full text-center">
        <h1 className="text-4xl font-bold mb-4">Resume AI</h1>
        <p className="text-lg text-gray-600 mb-6">AI-powered resume builder & ATS optimizer.</p>

        {todos.length > 0 ? (
          <ul className="space-y-2">
            {todos.map((todo: any) => (
              <li key={todo.id} className="p-3 border rounded text-left">{todo.name}</li>
            ))}
          </ul>
        ) : (
          <div className="p-6 border rounded bg-white shadow-sm">
            <p className="mb-4">No items yet. Create your first resume to get started.</p>
            <div className="flex justify-center">
              <Link href="/builder" className="px-4 py-2 bg-blue-600 text-white rounded">
                Create Resume
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
