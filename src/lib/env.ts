import { z } from 'zod';

/**
 * Centralized, typed environment-variable access.
 *
 * Validation is intentionally non-throwing: `next build` runs with
 * `NODE_ENV=production` but without runtime secrets, so throwing here would
 * break the build. Instead we parse leniently and surface a single readable
 * warning for missing/invalid required variables. Use `assertServerEnv()` from
 * runtime server code (route handlers) when you need a hard guarantee.
 */
const envSchema = z.object({
  // App
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),

  // Database (Supabase Postgres)
  DATABASE_URL: z.string().optional(),
  DIRECT_URL: z.string().optional(),

  // Auth
  NEXTAUTH_URL: z.string().optional(),
  NEXTAUTH_SECRET: z.string().optional(),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // AI providers
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  NVIDIA_NIM_API_KEY: z.string().optional(),
  NVIDIA_NIM_BASE_URL: z.string().optional(),
  DEFAULT_AI_PROVIDER: z
    .enum(['google', 'groq', 'openai', 'anthropic', 'nvidia'])
    .default('google'),

  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

const parsed = envSchema.safeParse(process.env);

if (!parsed.success && typeof window === 'undefined') {
  console.warn(
    '[env] Some environment variables are missing or invalid:\n' +
      parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n')
  );
}

export const env: Env = parsed.success
  ? parsed.data
  : ({ DEFAULT_AI_PROVIDER: 'google', NODE_ENV: 'development' } as Env);

/**
 * The variables that must be present for the server to function at runtime.
 * Call this from a server entrypoint (e.g. a route handler) to fail fast.
 */
const REQUIRED_SERVER_VARS = ['DATABASE_URL', 'NEXTAUTH_SECRET'] as const;

export function assertServerEnv(): void {
  const missing = REQUIRED_SERVER_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required server environment variables: ${missing.join(', ')}`);
  }
}
