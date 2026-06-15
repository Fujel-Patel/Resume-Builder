const companies = [
  { name: "Google", logo: "G" },
  { name: "Microsoft", logo: "M" },
  { name: "Amazon", logo: "A" },
  { name: "Meta", logo: "M" },
  { name: "Netflix", logo: "N" },
]

export function TrustBar() {
  return (
    <section className="border-y py-8">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <p className="mb-6 text-center text-xs text-muted-foreground">
          Trusted by professionals at
        </p>
        <div className="flex items-center justify-center gap-8 lg:gap-16">
          {companies.map((company) => (
            <div
              key={company.name}
              className="flex items-center gap-2 text-muted-foreground/40 transition-colors hover:text-muted-foreground/70"
            >
              <div className="flex size-8 items-center justify-center rounded-md border bg-muted/50 text-xs font-bold">
                {company.logo}
              </div>
              <span className="hidden text-sm font-medium sm:inline">
                {company.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
