"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  BarChart3,
  User,
  Settings2,
  LogOut,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./theme-toggle"
import { useSidebar } from "@/contexts/sidebar-context"
import { useAppDispatch } from "@/lib/hooks"
import { resetAuth } from "@/lib/features/auth/authSlice"
import { logoutApi } from "@/lib/api/auth"
import type { NavItem } from "@/types/design"

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Resumes", href: "/resume", icon: FileText },
  { label: "AI Generator", href: "/ai-generator", icon: Sparkles },
  { label: "ATS Score", href: "/ats-score", icon: BarChart3 },
  { label: "Profile", href: "/profile", icon: User },
  { label: "AI Settings", href: "/settings/ai", icon: Settings2 },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isOpen, close } = useSidebar()

  return (
    <>
      {isOpen && (
        <div
          className="no-print fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={close}
        />
      )}

      <aside
        className={cn(
          "no-print fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-sidebar transition-transform duration-200 lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="size-7 rounded-md bg-brand" />
            <span className="text-sm font-semibold text-sidebar-foreground">
              Generative-CV
            </span>
          </Link>
          <Button variant="ghost" size="icon" onClick={close} className="lg:hidden" aria-label="Close sidebar">
            <X className="size-4" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t p-3 space-y-1">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs text-sidebar-foreground/50">Theme</span>
            <ThemeToggle />
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-sidebar-foreground/70"
            onClick={() => {
              dispatch(resetAuth())
              logoutApi()
              router.push("/login")
            }}
          >
            <LogOut className="size-4" />
            Logout
          </Button>
        </div>
      </aside>
    </>
  )
}
