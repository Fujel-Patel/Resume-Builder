"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, Menu } from "lucide-react"
import { useState } from "react"


const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
]

export function PublicNavbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-transparent bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-brand">
            <Sparkles className="size-4 text-black" />
          </div>
          <span className="text-sm font-semibold text-foreground">Generative-CV</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-2">
            <Link href="/login" className="inline-flex h-7 items-center justify-center rounded-lg px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Sign In
            </Link>
            <Link href="/signup" className="inline-flex h-7 items-center justify-center rounded-lg bg-brand px-2.5 text-sm font-medium text-black transition-colors hover:bg-brand-dark">
              Get Started
            </Link>
          </div>
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setOpen(!open)}
        >
          <Menu className="size-4" />
        </Button>
      </div>

      {open && (
        <div className="border-t bg-background px-4 py-4 md:hidden">
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
            <div className="flex flex-col gap-2 pt-2 border-t">
              <Link href="/login" className="inline-flex h-7 items-center justify-center rounded-lg px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                Sign In
              </Link>
              <Link href="/signup" className="inline-flex h-7 items-center justify-center rounded-lg bg-brand px-2.5 text-sm font-medium text-black transition-colors hover:bg-brand-dark">
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
