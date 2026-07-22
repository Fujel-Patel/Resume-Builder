import { getAuthCallbackUrl, getSiteUrl, resolvePostAuthPath } from "../urls"

describe("resolvePostAuthPath", () => {
  it("defaults signup to /dashboard", () => {
    expect(resolvePostAuthPath("signup", null)).toBe("/dashboard")
  })

  it("defaults recovery to /reset-password", () => {
    expect(resolvePostAuthPath("recovery", null)).toBe("/reset-password")
  })

  it("honors safe relative next paths", () => {
    expect(resolvePostAuthPath("signup", "/profile")).toBe("/profile")
  })

  it("rejects open redirects", () => {
    expect(resolvePostAuthPath("signup", "//evil.com")).toBe("/dashboard")
    expect(resolvePostAuthPath("signup", "https://evil.com")).toBe("/dashboard")
  })
})

describe("getSiteUrl / getAuthCallbackUrl", () => {
  it("uses browser origin in jsdom", () => {
    const url = getSiteUrl()
    expect(url).toMatch(/^https?:\/\//)
  })

  it("always targets /auth/callback never verify-email-sent", () => {
    const url = getAuthCallbackUrl("signup", "/dashboard")
    expect(url).toContain("/auth/callback")
    expect(url).toContain("type=signup")
    expect(url).toContain("next=%2Fdashboard")
    expect(url).not.toContain("verify-email-sent")
    expect(url).not.toContain("verify-email")
  })

  it("includes next for recovery", () => {
    const url = getAuthCallbackUrl("recovery", "/reset-password")
    expect(url).toContain("type=recovery")
    expect(url).toContain("next=%2Freset-password")
    expect(url).toContain("/auth/callback")
  })
})
