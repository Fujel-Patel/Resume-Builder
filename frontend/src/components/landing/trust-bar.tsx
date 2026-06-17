const companies = [
  { name: "Google", initial: "G", color: "from-blue-500 to-green-400" },
  { name: "Microsoft", initial: "M", color: "from-blue-600 to-cyan-400" },
  { name: "Amazon", initial: "A", color: "from-orange-500 to-yellow-400" },
  { name: "Meta", initial: "M", color: "from-blue-500 to-purple-500" },
  { name: "Netflix", initial: "N", color: "from-red-500 to-rose-400" },
]

export function TrustBar() {
  return (
    <section className="border-y border-border/40 py-8">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <p className="mb-6 text-center text-xs text-muted-foreground">
          Trusted by professionals at
        </p>
        <div className="flex items-center justify-center gap-8 lg:gap-16">
          {companies.map((company, index) => (
            <div
              key={company.name}
              className="flex items-center gap-2 text-muted-foreground/40 transition-all duration-300 hover:text-muted-foreground/70 hover:scale-110"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`flex size-8 items-center justify-center rounded-md bg-gradient-to-br ${company.color} text-xs font-bold text-white shadow-sm`}>
                {company.initial}
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
