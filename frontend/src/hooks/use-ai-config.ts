"use client"

import { useState, useEffect } from "react"
import { listProvidersApi } from "@/lib/api/ai-providers"

let cache: { configured: boolean; ts: number } | null = null
const STALE_MS = 30_000

export function invalidateAiConfig() {
  cache = null
}

export function useAiConfig() {
  const [isConfigured, setIsConfigured] = useState(() => {
    if (cache && Date.now() - cache.ts < STALE_MS) return cache.configured
    return false
  })
  const [loading, setLoading] = useState(() =>
    !(cache && Date.now() - cache.ts < STALE_MS),
  )

  useEffect(() => {
    if (cache && Date.now() - cache.ts < STALE_MS) {
      setIsConfigured(cache.configured)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    listProvidersApi()
      .then((providers) => {
        if (cancelled) return
        const ok = providers.length > 0
        cache = { configured: ok, ts: Date.now() }
        setIsConfigured(ok)
      })
      .catch(() => {
        if (cancelled) return
        cache = { configured: false, ts: Date.now() }
        setIsConfigured(false)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  return { isConfigured, loading }
}
