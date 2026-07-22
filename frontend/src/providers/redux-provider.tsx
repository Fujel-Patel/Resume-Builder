"use client"

import { useEffect, useRef } from "react"
import { Provider } from "react-redux"
import { store } from "@/lib/store"
import {
  initializeAuth,
  syncSession,
  resetAuth,
} from "@/lib/features/auth/authSlice"
import { createClient } from "@/lib/supabase/client"

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    store.dispatch(initializeAuth())

    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      // Keep Redux in sync across tabs and after callback session establishment
      if (event === "SIGNED_OUT") {
        store.dispatch(resetAuth())
        return
      }
      if (
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED" ||
        event === "PASSWORD_RECOVERY"
      ) {
        store.dispatch(syncSession())
      }
    })

    return () => {
      subscription.unsubscribe()
    }
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
