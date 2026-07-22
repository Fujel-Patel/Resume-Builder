import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const type = searchParams.get("type") ?? "signup"
  const next = searchParams.get("next") ?? "/dashboard"

  if (code) {
    const cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[] = []

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.headers.get("cookie")?.split(";").map((c) => {
              const [name, ...rest] = c.trim().split("=")
              return { name, value: rest.join("=") }
            }) ?? []
          },
          setAll(cookies) {
            cookiesToSet.push(...cookies)
          },
        },
      },
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const redirectUrl = type === "recovery" ? "/reset-password" : next
      const response = NextResponse.redirect(`${origin}${redirectUrl}`)

      cookiesToSet.forEach(({ name, value, ...opts }) => {
        response.cookies.set(name, value, opts as Record<string, unknown>)
      })

      return response
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
