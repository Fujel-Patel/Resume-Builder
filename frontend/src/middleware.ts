/**
 * Next.js middleware — session refresh + route protection.
 *
 * IMPORTANT:
 * - Does NOT exchange verification codes (that is /auth/callback only).
 * - Does NOT treat /verify-email-sent as a callback.
 * - Refreshes the Supabase session so Server Components see fresh cookies.
 */

import { type NextRequest, NextResponse } from "next/server"
import { createMiddlewareClient } from "@/lib/supabase/middleware"

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/resume",
  "/ai-generator",
  "/ats-score",
  "/profile",
  "/settings",
]

/** Auth pages that signed-in verified users should leave. */
const AUTH_PAGES = new Set([
  "/login",
  "/signup",
  "/forgot-password",
  "/verify-email-sent",
  "/verify-email",
])

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  )
}

export async function middleware(request: NextRequest) {
  const { supabase, getResponse } = createMiddlewareClient(request)
  const { pathname } = request.nextUrl

  // Always refresh the session — required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ── Protected routes ────────────────────────────────────────────
  if (isProtected(pathname)) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      url.searchParams.set("from", pathname)
      const redirect = NextResponse.redirect(url)
      // Preserve any refreshed cookies
      getResponse().cookies.getAll().forEach(({ name, value, ...opts }) => {
        redirect.cookies.set(name, value, opts)
      })
      return redirect
    }

    // Supabase is source of truth for verification
    if (!user.email_confirmed_at) {
      await supabase.auth.signOut()
      const url = request.nextUrl.clone()
      url.pathname = "/verify-email-sent"
      url.search = ""
      if (user.email) {
        url.searchParams.set("email", user.email)
      }
      url.searchParams.set("reason", "unverified")
      const redirect = NextResponse.redirect(url)
      getResponse().cookies.getAll().forEach(({ name, value, ...opts }) => {
        redirect.cookies.set(name, value, opts)
      })
      return redirect
    }
  }

  // ── Reset password requires an active (recovery) session ────────
  if (pathname === "/reset-password" || pathname.startsWith("/reset-password/")) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = "/forgot-password"
      url.search = ""
      url.searchParams.set("error", "link_invalid")
      const redirect = NextResponse.redirect(url)
      getResponse().cookies.getAll().forEach(({ name, value, ...opts }) => {
        redirect.cookies.set(name, value, opts)
      })
      return redirect
    }
  }

  // ── Signed-in verified users skip auth pages ────────────────────
  if (user?.email_confirmed_at && AUTH_PAGES.has(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    url.search = ""
    const redirect = NextResponse.redirect(url)
    getResponse().cookies.getAll().forEach(({ name, value, ...opts }) => {
      redirect.cookies.set(name, value, opts)
    })
    return redirect
  }

  return getResponse()
}

export const config = {
  matcher: [
    /*
     * Run on app routes that need session awareness.
     * Explicitly include auth pages + protected areas.
     * Exclude static assets and the callback route handler itself
     * (callback manages its own cookies).
     */
    "/dashboard/:path*",
    "/resume/:path*",
    "/ai-generator/:path*",
    "/ats-score/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/verify-email-sent",
    "/verify-email",
  ],
}
