import Link from "next/link"

export function Cta() {
  return (
    <section className="border-y border-border/40 py-16 lg:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-sweep" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full bg-brand/5 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-h2 text-foreground font-heading">
            Ready to Build Your Resume?
          </h2>
          <p className="mt-3 text-body text-muted-foreground">
            Join thousands of professionals who land interviews with
            AI-optimized resumes.
          </p>
          <div className="mt-8">
            <Link
              href="/signup"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand px-6 text-base font-medium text-black transition-all duration-200 hover:bg-brand-dark hover:scale-105 hover:shadow-glow-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
