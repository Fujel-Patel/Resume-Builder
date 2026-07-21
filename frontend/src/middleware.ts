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

  // Handle PKCE code exchange for email verification and password reset
  // The code_verifier cookie is unreliable on client-side redirects from email links,
  // so we exchange the code server-side here where cookies are guaranteed to work.
  const code = request.nextUrl.searchParams.get("code");
  if (code && (request.nextUrl.pathname === "/verify-email" || request.nextUrl.pathname === "/reset-password")) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    const url = request.nextUrl.clone();
    url.searchParams.delete("code");
    if (!error) {
      // Success — redirect without the code param, session is now set in cookies
      if (request.nextUrl.pathname === "/verify-email") {
        url.pathname = "/dashboard";
      } else {
        // reset-password: keep on the page, session is now active for password update
        url.pathname = "/reset-password";
      }
    } else {
      // Exchange failed — redirect to page without code so client can show appropriate error
      url.pathname = request.nextUrl.pathname;
    }
    return NextResponse.redirect(url);
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
