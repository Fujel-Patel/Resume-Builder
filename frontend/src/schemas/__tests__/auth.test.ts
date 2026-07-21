import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/schemas/auth"

describe("loginSchema", () => {
  it("accepts valid email and password", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "pass123" })
    expect(result.success).toBe(true)
  })

  it("trims and lowercases email", () => {
    const result = loginSchema.safeParse({ email: "  Test@Example.COM  ", password: "pass123" })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.email).toBe("test@example.com")
  })

  it("rejects empty email", () => {
    const result = loginSchema.safeParse({ email: "", password: "pass123" })
    expect(result.success).toBe(false)
  })

  it("rejects invalid email format", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "pass123" })
    expect(result.success).toBe(false)
  })

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "" })
    expect(result.success).toBe(false)
  })
})

describe("signupSchema", () => {
  const valid = { name: "John Doe", email: "john@example.com", password: "Strong1!", confirmPassword: "Strong1!" }

  it("accepts valid input", () => {
    expect(signupSchema.safeParse(valid).success).toBe(true)
  })

  it("sanitizes name (strips HTML tags)", () => {
    const result = signupSchema.safeParse({ ...valid, name: "<b>Bold</b> John" })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.name).toBe("Bold John")
  })

  it("lowercases email", () => {
    const result = signupSchema.safeParse({ ...valid, email: "JOHN@EXAMPLE.COM" })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.email).toBe("john@example.com")
  })

  it("rejects password shorter than 8 chars", () => {
    const result = signupSchema.safeParse({ ...valid, password: "Ab1!", confirmPassword: "Ab1!" })
    expect(result.success).toBe(false)
  })

  it("rejects password without uppercase", () => {
    const result = signupSchema.safeParse({ ...valid, password: "lowercase1!", confirmPassword: "lowercase1!" })
    expect(result.success).toBe(false)
  })

  it("rejects password without lowercase", () => {
    const result = signupSchema.safeParse({ ...valid, password: "UPPERCASE1!", confirmPassword: "UPPERCASE1!" })
    expect(result.success).toBe(false)
  })

  it("rejects password without digit", () => {
    const result = signupSchema.safeParse({ ...valid, password: "NoDigit!!", confirmPassword: "NoDigit!!" })
    expect(result.success).toBe(false)
  })

  it("rejects password without special character", () => {
    const result = signupSchema.safeParse({ ...valid, password: "NoSpecial1a", confirmPassword: "NoSpecial1a" })
    expect(result.success).toBe(false)
  })

  it("rejects mismatched passwords", () => {
    const result = signupSchema.safeParse({ ...valid, confirmPassword: "Different1!" })
    expect(result.success).toBe(false)
  })

  it("rejects empty name", () => {
    const result = signupSchema.safeParse({ ...valid, name: "" })
    expect(result.success).toBe(false)
  })

  it("rejects name over 255 chars", () => {
    const result = signupSchema.safeParse({ ...valid, name: "a".repeat(256) })
    expect(result.success).toBe(false)
  })
})

describe("forgotPasswordSchema", () => {
  it("accepts valid email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "user@test.com" }).success).toBe(true)
  })

  it("lowercases email", () => {
    const result = forgotPasswordSchema.safeParse({ email: "USER@TEST.COM" })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.email).toBe("user@test.com")
  })

  it("rejects invalid email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "bad" }).success).toBe(false)
  })
})

describe("resetPasswordSchema", () => {
  const valid = { password: "Strong1!", confirmPassword: "Strong1!" }

  it("accepts valid passwords", () => {
    expect(resetPasswordSchema.safeParse(valid).success).toBe(true)
  })

  it("rejects weak password", () => {
    expect(resetPasswordSchema.safeParse({ password: "weak", confirmPassword: "weak" }).success).toBe(false)
  })

  it("rejects mismatched passwords", () => {
    expect(resetPasswordSchema.safeParse({ password: "Strong1!", confirmPassword: "Different1!" }).success).toBe(false)
  })
})
