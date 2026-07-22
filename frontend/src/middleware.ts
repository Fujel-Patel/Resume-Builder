import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Handle PKCE code exchange for legacy email verification and password reset links.
  // New links use /auth/callback (handled by Route Handler), but old links may still
  // point to /verify-email or /reset-password directly.
  const code = request.nextUrl.searchParams.get("code");
  if (code && (request.nextUrl.pathname === "/verify-email" || request.nextUrl.pathname === "/reset-password")) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const redirectUrl = request.nextUrl.pathname === "/verify-email" ? "/dashboard" : "/reset-password";
      const response = NextResponse.redirect(new URL(redirectUrl, request.url));
      // Copy session cookies from supabaseResponse to the redirect response
      supabaseResponse.cookies.getAll().forEach(({ name, value, ...opts }) =>
        response.cookies.set(name, value, opts)
      );
      return response;
    }
    // Exchange failed — link was invalid or expired
    if (request.nextUrl.pathname === "/verify-email") {
      return NextResponse.redirect(new URL("/verify-email-sent", request.url));
    }
    return NextResponse.redirect(new URL("/forgot-password", request.url));
  }

  // Refresh session if expired — required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect dashboard routes
  const protectedRoutes = [
    "/dashboard",
    "/resume",
    "/ai-generator",
    "/ats-score",
    "/profile",
    "/settings",
  ];
  const isProtected = protectedRoutes.some((r) =>
    request.nextUrl.pathname.startsWith(r)
  );

  if (isProtected) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // Block unverified users — sign out and redirect to verify-email-sent
    if (!user.email_confirmed_at) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = "/verify-email-sent";
      url.searchParams.set("email", user.email ?? "");
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/resume/:path*",
    "/ai-generator/:path*",
    "/ats-score/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/verify-email",
    "/reset-password",
  ],
};
