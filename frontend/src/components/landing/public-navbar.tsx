"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, Menu, X } from "lucide-react"
import { useState } from "react"

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
]

export function PublicNavbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex size-7 items-center justify-center rounded-md bg-brand transition-all duration-300 group-hover:shadow-glow-brand">
            <Sparkles className="size-4 text-black" />
          </div>
          <span className="text-sm font-heading font-semibold text-foreground">Generative-CV</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-sm text-muted-foreground transition-colors hover:text-foreground after:absolute after:bottom-[-2px] after:left-0 after:h-px after:w-0 after:bg-brand after:transition-all after:duration-300 hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-2">
            <Link href="/login" className="inline-flex h-7 items-center justify-center rounded-lg px-2.5 text-sm font-medium text-muted-foreground transition-all hover:text-foreground">
              Sign In
            </Link>
            <Link href="/signup" className="inline-flex h-7 items-center justify-center rounded-lg bg-brand px-2.5 text-sm font-medium text-black transition-all duration-200 hover:bg-brand-dark hover:scale-105 hover:shadow-glow-brand">
              Get Started
            </Link>
          </div>
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </Button>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out md:hidden ${
          open ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-border/40 bg-background/95 backdrop-blur-xl px-4 py-4">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
              <Link href="/login" onClick={() => setOpen(false)} className="inline-flex h-9 items-center justify-center rounded-lg px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                Sign In
              </Link>
              <Link href="/signup" onClick={() => setOpen(false)} className="inline-flex h-9 items-center justify-center rounded-lg bg-brand px-2.5 text-sm font-medium text-black transition-all hover:bg-brand-dark">
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
