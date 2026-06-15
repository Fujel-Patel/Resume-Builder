import Link from "next/link"
import { Check } from "lucide-react"

const tiers = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started.",
    features: [
      "1 active resume",
      "Basic templates",
      "AI suggestions (5/month)",
      "PDF export",
    ],
    cta: "Get Started",
    variant: "outline" as const,
    featured: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "/month",
    description: "For serious job seekers.",
    features: [
      "Unlimited resumes",
      "All templates",
      "Unlimited AI suggestions",
      "ATS score analysis",
      "Priority support",
    ],
    cta: "Start Pro",
    variant: "brand" as const,
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For teams and organizations.",
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Custom templates",
      "API access",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    variant: "outline" as const,
    featured: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-h2 text-foreground">Simple Pricing</h2>
          <p className="mt-3 text-body text-muted-foreground">
            No hidden fees. Start free, upgrade when you need more.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-card border p-6 ring-1 ${
                tier.featured
                  ? "border-brand/30 bg-card ring-brand/20"
                  : "border-border bg-card ring-foreground/5"
              }`}
            >
              {tier.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-brand px-3 py-0.5 text-xs font-semibold text-black">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-sm font-semibold text-foreground">
                  {tier.name}
                </h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-sm text-muted-foreground">
                      {tier.period}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {tier.description}
                </p>
              </div>

              <ul className="mb-6 space-y-2.5">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="size-4 text-brand" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={`inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg px-2.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 ${
                  tier.featured
                    ? "bg-brand text-black hover:bg-brand-dark"
                    : "border border-border bg-background text-foreground hover:bg-muted"
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
