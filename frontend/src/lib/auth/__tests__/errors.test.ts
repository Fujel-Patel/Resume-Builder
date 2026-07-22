import { normalizeAuthError } from "../errors"

describe("normalizeAuthError", () => {
  it("maps invalid credentials", () => {
    const err = normalizeAuthError({ message: "Invalid login credentials" })
    expect(err.code).toBe("INVALID_CREDENTIALS")
  })

  it("maps email not confirmed", () => {
    const err = normalizeAuthError({
      message: "Email not confirmed",
      code: "email_not_confirmed",
    })
    expect(err.code).toBe("EMAIL_NOT_VERIFIED")
  })

  it("maps rate limits", () => {
    const err = normalizeAuthError({
      message: "For security purposes, you can only request this after 60 seconds.",
    })
    expect(err.code).toBe("RATE_LIMIT_EXCEEDED")
  })

  it("maps expired otp", () => {
    const err = normalizeAuthError({ message: "Token has expired", code: "otp_expired" })
    expect(err.code).toBe("LINK_EXPIRED")
  })

  it("handles plain strings", () => {
    const err = normalizeAuthError("boom")
    expect(err.message).toBe("boom")
  })
})
