/**
 * Normalize Supabase AuthError (and generic errors) into a stable app shape.
 */

export type NormalizedAuthError = {
  message: string
  code: string
  /** Original Supabase status if present */
  status?: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

/**
 * Map common Supabase auth messages/codes to stable app codes.
 */
export function normalizeAuthError(err: unknown): NormalizedAuthError {
  if (!err) {
    return { message: "Something went wrong", code: "UNKNOWN_ERROR" }
  }

  if (typeof err === "string") {
    return { message: err, code: "UNKNOWN_ERROR" }
  }

  if (err instanceof Error || isRecord(err)) {
    const message =
      (isRecord(err) && typeof err.message === "string" && err.message) ||
      (err instanceof Error ? err.message : "Something went wrong")
    const rawCode =
      (isRecord(err) && typeof err.code === "string" && err.code) ||
      (isRecord(err) && typeof err.name === "string" && err.name) ||
      ""
    const status =
      isRecord(err) && typeof err.status === "number" ? err.status : undefined

    const lower = message.toLowerCase()

    if (
      lower.includes("invalid login credentials") ||
      lower.includes("invalid credentials")
    ) {
      return { message: "Incorrect email or password", code: "INVALID_CREDENTIALS", status }
    }

    if (
      lower.includes("email not confirmed") ||
      lower.includes("email_not_confirmed") ||
      rawCode === "email_not_confirmed"
    ) {
      return {
        message: "Please verify your email before signing in",
        code: "EMAIL_NOT_VERIFIED",
        status,
      }
    }

    if (
      lower.includes("already registered") ||
      lower.includes("already been registered") ||
      lower.includes("user already exists")
    ) {
      return {
        message: "An account with this email already exists. Please sign in.",
        code: "CONFLICT",
        status,
      }
    }

    if (
      lower.includes("security purposes") ||
      lower.includes("rate limit") ||
      lower.includes("too many requests") ||
      lower.includes("over_email_send_rate_limit") ||
      rawCode === "over_email_send_rate_limit"
    ) {
      return {
        message: "Too many requests. Please wait a moment and try again.",
        code: "RATE_LIMIT_EXCEEDED",
        status,
      }
    }

    if (
      lower.includes("expired") ||
      rawCode === "otp_expired" ||
      rawCode === "flow_state_expired"
    ) {
      return {
        message: "This link has expired. Please request a new one.",
        code: "LINK_EXPIRED",
        status,
      }
    }

    if (
      lower.includes("invalid") &&
      (lower.includes("token") || lower.includes("otp") || lower.includes("code"))
    ) {
      return {
        message: "This link is invalid. Please request a new one.",
        code: "LINK_INVALID",
        status,
      }
    }

    if (rawCode === "same_password") {
      return {
        message: "New password must be different from your current password.",
        code: "SAME_PASSWORD",
        status,
      }
    }

    if (rawCode === "weak_password") {
      return {
        message: message || "Password is too weak.",
        code: "WEAK_PASSWORD",
        status,
      }
    }

    return {
      message,
      code: rawCode || "UNKNOWN_ERROR",
      status,
    }
  }

  return { message: "Something went wrong", code: "UNKNOWN_ERROR" }
}
