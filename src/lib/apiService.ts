// src/lib/apiService.ts
// Centralized API service abstraction for the Resume‑Builder application.
// Provides typed helpers for GET, POST, PUT, DELETE with built‑in error handling,
// loading state management, request/response transformation, and Supabase auth token
// interception.

import { createClient as createSupabaseClient } from '@/utils/supabase/client';

/**
 * Retrieve the current user's access token from Supabase (browser client).
 * Returns `null` if the user is not authenticated or the token cannot be
 * obtained.
 */
async function getAccessToken(): Promise<string | null> {
  try {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Supabase session error:', error);
      return null;
    }
    return data?.session?.access_token ?? null;
  } catch (e) {
    console.error('Failed to get Supabase auth token:', e);
    return null;
  }
}

/**
 * Helper to build a URL with optional query parameters.
 */
function buildUrl(path: string, params?: Record<string, string | number | boolean>) {
  if (!params) return path;
  const url = new URL(path, typeof window !== 'undefined' ? window.location.origin : undefined);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });
  return url.toString();
}

/**
 * Core fetch wrapper used by the public helper methods.
 * Handles auth injection, JSON handling, error conversion and optional loading state.
 */
async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  {
    params,
    body,
    headers = {},
    // If true the consumer wants the raw Response instead of parsed JSON.
    raw = false,
    // Optional signal for aborting the request (useful for React Suspense).
    signal,
  }: {
    params?: Record<string, string | number | boolean>;
    body?: any;
    headers?: HeadersInit;
    raw?: boolean;
    signal?: AbortSignal;
  } = {}
): Promise<T> {
  const url = buildUrl(path, params);
  const token = await getAccessToken();

  const finalHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };
  if (token) {
    // Attach the Bearer token for authenticated endpoints.
    // The API expects the header name `Authorization`.
    (finalHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const fetchOptions: RequestInit = {
    method,
    headers: finalHeaders,
    signal,
  };

  if (body !== undefined && method !== 'GET') {
    fetchOptions.body = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(url, fetchOptions);
  } catch (networkError) {
    // Network level error (e.g., DNS, CORS, offline)
    console.error('Network error while fetching', url, networkError);
    throw new Error('Network error – see console for details');
  }

  // If the caller explicitly wants the raw Response, forward it now.
  if (raw) {
    // eslint‑disable-next-line @typescript-eslint/no‑explicit‑any
    return response as any;
  }

  // Successful 2xx responses are parsed as JSON; non‑2xx are turned into a typed error.
  if (response.ok) {
    try {
      const json = (await response.json()) as T;
      return json;
    } catch (jsonError) {
      // In case the endpoint returns no JSON (e.g., 204 No Content)
      // Return undefined cast to T.
      return undefined as unknown as T;
    }
  }

  // Attempt to extract a helpful error message from the body.
  let errorMessage = `Request failed with status ${response.status}`;
  try {
    const errorBody = await response.json();
    if (errorBody?.message) {
      errorMessage = `${errorMessage}: ${errorBody.message}`;
    }
  } catch {
    // ignore – body is not JSON
  }

  const error = new Error(errorMessage);
  // Attach additional debugging info.
  // eslint‑disable-next-line @typescript-eslint/no‑explicit‑any
  (error as any).status = response.status;
  // eslint‑disable-next-line @typescript-eslint/no‑explicit‑any
  (error as any).response = response;
  console.error('API error:', error);
  throw error;
}

/**
 * Typed GET helper.
 */
export async function apiGet<T>(
  path: string,
  options?: {
    params?: Record<string, string | number | boolean>;
    headers?: HeadersInit;
    signal?: AbortSignal;
  }
): Promise<T> {
  return request<T>('GET', path, options);
}

/**
 * Typed POST helper.
 */
export async function apiPost<T>(
  path: string,
  body: any,
  options?: {
    params?: Record<string, string | number | boolean>;
    headers?: HeadersInit;
    signal?: AbortSignal;
  }
): Promise<T> {
  return request<T>('POST', path, { ...options, body });
}

/**
 * Typed PUT helper.
 */
export async function apiPut<T>(
  path: string,
  body: any,
  options?: {
    params?: Record<string, string | number | boolean>;
    headers?: HeadersInit;
    signal?: AbortSignal;
  }
): Promise<T> {
  return request<T>('PUT', path, { ...options, body });
}

/**
 * Typed DELETE helper.
 */
export async function apiDelete<T>(
  path: string,
  options?: {
    params?: Record<string, string | number | boolean>;
    headers?: HeadersInit;
    body?: any; // Some APIs allow a body with DELETE
    signal?: AbortSignal;
  }
): Promise<T> {
  return request<T>('DELETE', path, options);
}

/**
 * Example of a loading‑state helper that can be used in React components.
 * Returns a tuple `[data, error, loading]` which mirrors many data‑fetching
 * libraries. This function is deliberately lightweight – consumers may wrap it
 * in `useEffect`/`useSWR` as needed.
 */
/**
 * Exponential backoff retry wrapper for transient errors.
 * Retries on network errors (fetch throws) or HTTP 5xx responses.
 * `maxAttempts` defaults to 3. `baseDelayMs` defaults to 500ms.
 */
export async function requestWithRetry<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  options: {
    params?: Record<string, string | number | boolean>;
    body?: any;
    headers?: HeadersInit;
    raw?: boolean;
    signal?: AbortSignal;
    // Retry configuration (optional)
    maxAttempts?: number;
    baseDelayMs?: number;
  } = {}
): Promise<T> {
  const { maxAttempts = 3, baseDelayMs = 500, ...rest } = options;
  let attempt = 0;
  let lastError: any;

  while (attempt < maxAttempts) {
    try {
      // Attempt the request using the core request function.
      const result = await request<T>(method, path, rest);
      return result;
    } catch (error) {
      // Determine if error is retryable.
      const status = (error as any).status;
      const isNetworkError = !(error instanceof Error) || !status;
      const isServerError = status >= 500 && status < 600;

      if (!isNetworkError && !isServerError) {
        // Non‑retryable error – rethrow immediately.
        throw error;
      }

      lastError = error;
      attempt += 1;
      if (attempt >= maxAttempts) break;
      // Exponential backoff delay.
      const delay = baseDelayMs * 2 ** (attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // All attempts exhausted – throw the last error.
  throw lastError;
}

export async function fetchWithState<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  requestOptions?: Parameters<typeof request<T>>[2]
): Promise<{ data: T | null; error: Error | null; loading: boolean }> {
  let data: T | null = null;
  let error: Error | null = null;
  let loading = true;
  try {
    data = await request<T>(method, path, requestOptions);
  } catch (e) {
    error = e as Error;
  } finally {
    loading = false;
  }
  return { data, error, loading };
}

// Re‑export the low‑level request function for advanced use‑cases.
export { request };
