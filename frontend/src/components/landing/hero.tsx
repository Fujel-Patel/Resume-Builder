import Link from "next/link"
import { Play } from "lucide-react"
import { LandingResumePreview } from "./landing-resume-preview"

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-16 lg:pt-32 lg:pb-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(175_100%_50%/0.12),transparent_60%)]" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(175 100% 50%) 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute top-1/4 right-1/4 size-64 rounded-full bg-brand/5 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-xl">
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/5 px-3 py-1 text-xs text-brand animate-fade-in">
              <span className="size-1.5 rounded-full bg-brand animate-glow-pulse" />
              AI-Powered Resume Builder
            </div>

            <h1 className="text-h1 text-foreground tracking-tight font-heading animate-slide-up" style={{ animationDelay: "100ms", animationFillMode: "backwards" }}>
              Build ATS-Friendly
              <br />
              Resumes With{" "}
              <span className="text-brand text-glow-brand">AI</span>
            </h1>

            <p className="mt-4 text-body text-muted-foreground leading-relaxed animate-slide-up" style={{ animationDelay: "200ms", animationFillMode: "backwards" }}>
              Create, optimize, and tailor resumes using your own AI provider.
              Land more interviews with resumes that pass ATS filters.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 animate-slide-up" style={{ animationDelay: "300ms", animationFillMode: "backwards" }}>
              <Link
                href="/signup"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand px-4 text-base font-medium text-black transition-all duration-200 hover:bg-brand-dark hover:scale-105 hover:shadow-glow-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
              >
                Start Building
              </Link>
              <Link
                href="#features"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-brand/30 bg-transparent px-4 text-base font-medium text-brand transition-all duration-200 hover:bg-brand/10 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
              >
                <Play className="size-4" />
                Watch Demo
              </Link>
            </div>
          </div>

          <div className="relative flex justify-center animate-slide-up" style={{ animationDelay: "400ms", animationFillMode: "backwards" }}>
            <div className="absolute inset-0 bg-gradient-to-tr from-brand/30 via-brand/10 to-transparent rounded-3xl blur-3xl" />
            <div className="relative w-full max-w-md rounded-card border border-brand/20 bg-card p-1 shadow-2xl shadow-glow-brand transition-all duration-300 hover:shadow-glow-brand hover:border-brand/40">
              <LandingResumePreview />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
