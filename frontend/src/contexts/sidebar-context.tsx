"use client"

import { createContext, useContext } from "react"

export type SidebarState = {
  isOpen: boolean
  toggle: () => void
  open: () => void
  close: () => void
}

export const SidebarContext = createContext<SidebarState | null>(null)

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}
