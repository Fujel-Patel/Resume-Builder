/**
 * Official Supabase Auth callback.
 *
 * Handles BOTH verification flows:
 * 1. PKCE code exchange  — ?code=...  (default when emailRedirectTo is set)
 * 2. Token hash OTP      — ?token_hash=...&type=...  (email template TokenHash links)
 *
 * This route is the ONLY place verification/recovery links should land.
 * /verify-email-sent is a "check your inbox" page — never a callback.
 */

import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import type { EmailOtpType } from "@supabase/supabase-js"
import { resolvePostAuthPath } from "@/lib/auth/urls"

const OTP_TYPES = new Set<string>([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
])

function buildRedirect(
  request: NextRequest,
  path: string,
  params?: Record<string, string>,
) {
  const url = request.nextUrl.clone()
  url.pathname = path
  url.search = ""
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v)
    }
  }
  return url
}

/**
 * Create a redirect response and a Supabase client that writes session
 * cookies onto that same response (critical for production SSR).
 */
function createCallbackClient(request: NextRequest, redirect: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            // Must pass `options` explicitly — never spread the cookie object
            redirect.cookies.set(name, value, options)
          })
        },
      },
    },
  )
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get("code")
  const tokenHash = searchParams.get("token_hash")
  const typeParam = searchParams.get("type")
  const nextParam = searchParams.get("next")
  const errorDescription =
    searchParams.get("error_description") || searchParams.get("error")

  // Supabase may bounce provider errors back to redirect_to
  if (errorDescription) {
    return NextResponse.redirect(
      buildRedirect(request, "/login", {
        error: "auth_callback_error",
        message: errorDescription,
      }),
    )
  }

  const destination = resolvePostAuthPath(typeParam, nextParam)
  const isRecovery = typeParam === "recovery"

  // ── Path 1: PKCE code exchange ──────────────────────────────────
  if (code) {
    const successRedirect = NextResponse.redirect(
      buildRedirect(request, destination),
    )
    const supabase = createCallbackClient(request, successRedirect)
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return successRedirect
    }

    // PKCE failed: expired/used code, or missing code_verifier (different device).
    // Do NOT send recovery failures to verify-email-sent.
    return NextResponse.redirect(
      buildRedirect(
        request,
        isRecovery ? "/forgot-password" : "/verify-email-sent",
        { error: "link_invalid" },
      ),
    )
  }

  // ── Path 2: token_hash OTP (cross-device safe) ───────────────────
  if (tokenHash && typeParam && OTP_TYPES.has(typeParam)) {
    const successRedirect = NextResponse.redirect(
      buildRedirect(request, destination),
    )
    const supabase = createCallbackClient(request, successRedirect)
    const { error } = await supabase.auth.verifyOtp({
      type: typeParam as EmailOtpType,
      token_hash: tokenHash,
    })

    if (!error) {
      return successRedirect
    }

    return NextResponse.redirect(
      buildRedirect(
        request,
        typeParam === "recovery" ? "/forgot-password" : "/verify-email-sent",
        { error: "link_invalid" },
      ),
    )
  }

  // No usable credentials
  return NextResponse.redirect(
    buildRedirect(request, "/login", { error: "auth_callback_error" }),
  )
}
