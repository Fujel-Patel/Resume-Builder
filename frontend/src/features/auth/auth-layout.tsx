import Link from "next/link"
import { Sparkles } from "lucide-react"

type AuthLayoutProps = {
  children: React.ReactNode
  title: string
  subtitle: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-[40%] flex-col items-center justify-center overflow-hidden border-r bg-background p-8 lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(175_100%_50%/0.06),transparent_60%)]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, hsl(175 100% 50%) 1px, transparent 0)`,
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-xl bg-brand shadow-lg shadow-brand/20">
            <Sparkles className="size-7 text-black" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            Generative-CV
          </h2>
          <h1 className="mt-6 text-2xl font-bold text-foreground">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
            {subtitle}
          </p>
        </div>

        <div className="absolute bottom-8 left-0 right-0 text-center">
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Back to home
          </Link>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
