import Link from "next/link"
import { Sparkles } from "lucide-react"

const footerLinks = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Templates", href: "#" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Docs", href: "#" },
      { label: "API", href: "#" },
      { label: "Blog", href: "#" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Privacy", href: "#" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 group">
              <div className="flex size-7 items-center justify-center rounded-md bg-brand transition-all duration-300 group-hover:shadow-glow-brand">
                <Sparkles className="size-4 text-black" />
              </div>
              <span className="text-sm font-heading font-semibold text-foreground">
                Generative-CV
              </span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground max-w-xs">
              Build resumes that get you hired. AI-powered, ATS-friendly, and
              beautifully designed.
            </p>
          </div>

          {footerLinks.map((group) => (
            <div key={group.heading}>
              <h4 className="text-xs font-semibold font-heading uppercase tracking-wider text-foreground">
                {group.heading}
              </h4>
              <ul className="mt-4 space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="relative text-sm text-muted-foreground transition-colors hover:text-foreground after:absolute after:bottom-[-2px] after:left-0 after:h-px after:w-0 after:bg-brand after:transition-all after:duration-300 hover:after:w-full"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-border/40 pt-6">
          <p className="text-xs text-muted-foreground/60 text-center">
            &copy; {new Date().getFullYear()} Generative-CV. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
