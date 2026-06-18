let inMemoryToken: string | null = null
const STORAGE_KEY = "gc_access_token"

export function getAccessToken(): string | null {
  if (inMemoryToken) return inMemoryToken
  if (typeof window !== "undefined") {
    inMemoryToken = localStorage.getItem(STORAGE_KEY)
  }
  return inMemoryToken
}

export function setAccessToken(token: string | null): void {
  inMemoryToken = token
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem(STORAGE_KEY, token)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }
}

export function clearAccessToken(): void {
  setAccessToken(null)
}
