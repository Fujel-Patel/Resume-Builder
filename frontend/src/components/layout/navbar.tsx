"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSidebar } from "@/contexts/sidebar-context"

type NavbarProps = {
  title?: string
}

export function Navbar({ title }: NavbarProps) {
  const { open } = useSidebar()

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={open} className="lg:hidden" aria-label="Open sidebar">
          <Menu className="size-4" />
        </Button>
        {title && (
          <h1 className="text-sm font-semibold text-foreground">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Avatar className="size-8">
          <AvatarImage src="" alt="User avatar" />
          <AvatarFallback className="text-xs">U</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
