import { z } from "zod"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_SPECIAL_CHARS = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\/;]/

// ── Sanitizers ───────────────────────────────────────────────────

function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function sanitizeName(name: string): string {
  return name.trim().replace(/<[^>]*>/g, "")
}

// ── Schemas ──────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .transform(sanitizeEmail)
    .pipe(z.string().regex(EMAIL_REGEX, "Invalid email address")),
  password: z.string().min(1, "Password is required"),
})

export const signupSchema = z
  .object({
    name: z
      .string()
      .min(1, "Full name is required")
      .transform(sanitizeName)
      .pipe(z.string().max(255, "Name must be under 255 characters")),
    email: z
      .string()
      .min(1, "Email is required")
      .transform(sanitizeEmail)
      .pipe(z.string().regex(EMAIL_REGEX, "Invalid email address")),
    password: z
      .string()
      .min(8, "Must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/\d/, "Must contain a digit")
      .regex(PASSWORD_SPECIAL_CHARS, "Must contain a special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .transform(sanitizeEmail)
    .pipe(z.string().regex(EMAIL_REGEX, "Invalid email address")),
})

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/\d/, "Must contain a digit")
      .regex(PASSWORD_SPECIAL_CHARS, "Must contain a special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    password: z
      .string()
      .min(8, "Must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/\d/, "Must contain a digit")
      .regex(PASSWORD_SPECIAL_CHARS, "Must contain a special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.password, {
    message: "New password must be different from current password",
    path: ["password"],
  })

// ── Types ────────────────────────────────────────────────────────

export type LoginFormData = z.infer<typeof loginSchema>
export type SignupFormData = z.infer<typeof signupSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
