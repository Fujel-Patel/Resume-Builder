import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
// Prefer the service‑role key for server‑side operations; fall back to the public anon key for local/dev environments.
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

// Warn if the client cannot be properly constructed; this prevents a hard crash at import time.
if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "Supabase URL or key is missing – Supabase client calls will fail.\n" +
    "Set NEXT_PUBLIC_SUPABASE_URL and either SUPABASE_SERVICE_ROLE_KEY (prod) or NEXT_PUBLIC_SUPABASE_ANON_KEY (dev) in your .env files."
  );
}

type CookieStore = Awaited<ReturnType<typeof cookies>>;

export const createClient = async (cookieStore: CookieStore | Promise<CookieStore>) => {
  const resolvedCookieStore = await Promise.resolve(cookieStore);
  return createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return resolvedCookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // In Server Components we can set cookies via the Next.js cookies API.
        cookiesToSet.forEach(({ name, value, options }) => {
          resolvedCookieStore.set(name, value, options);
        });
      },
    },
  });
};
