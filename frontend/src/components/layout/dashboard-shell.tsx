"use client"

import { useState, useCallback } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { SidebarContext } from "@/contexts/sidebar-context"
import { Navbar } from "@/components/layout/navbar"
import type { SidebarState } from "@/contexts/sidebar-context"

type DashboardShellProps = {
  children: React.ReactNode
  title?: string
}

export function DashboardShell({ children, title }: DashboardShellProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggle = useCallback(() => setIsOpen((v) => !v), [])
  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  const sidebarValue: SidebarState = { isOpen, toggle, open, close }

  return (
    <SidebarContext.Provider value={sidebarValue}>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Navbar title={title} />
          <main className="flex-1 overflow-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  )
}
