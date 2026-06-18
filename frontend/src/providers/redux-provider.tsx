"use client"

import { useEffect } from "react"
import { Provider } from "react-redux"
import { store } from "@/lib/store"
import { initializeAuth } from "@/lib/features/auth/authSlice"

function AuthInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(initializeAuth())
  }, [])

  return <>{children}</>
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>{children}</AuthInitializer>
    </Provider>
  )
}
