import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import {
  signup as signupSupabase,
  login as loginSupabase,
  logout as logoutSupabase,
  getMeApi,
  type UserOut,
} from "@/lib/api/auth"
import { createClient } from "@/lib/supabase/client"
import { ApiRequestError } from "@/lib/api/client"

export type AuthError = {
  message: string
  code: string
  fields?: Record<string, string[]>
}

function normalizeError(payload: unknown): AuthError {
  if (payload && typeof payload === "object" && "message" in payload) {
    return payload as AuthError
  }
  if (typeof payload === "string") {
    return { message: payload, code: "UNKNOWN_ERROR" }
  }
  return { message: "Something went wrong", code: "UNKNOWN_ERROR" }
}

type AuthState = {
  user: UserOut | null
  loading: boolean
  error: AuthError | null
  signupEmail: string | null
}

const initialState: AuthState = {
  user: null,
  loading: true,
  error: null,
  signupEmail: null,
}

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      await loginSupabase(email, password)
      const user = await getMeApi()
      return { user }
    } catch (err: unknown) {
      if (err instanceof ApiRequestError) {
        return rejectWithValue({ message: err.message, code: err.code, fields: err.fields })
      }
      // Map Supabase auth errors to our error format
      const message = err instanceof Error ? err.message : "Login failed"
      if (message.includes("Invalid login credentials")) {
        return rejectWithValue({ message: "Incorrect email or password", code: "INVALID_CREDENTIALS" })
      }
      if (message.includes("Email not confirmed")) {
        return rejectWithValue({ message: "Please verify your email address", code: "EMAIL_NOT_VERIFIED" })
      }
      return rejectWithValue({ message, code: "UNKNOWN_ERROR" })
    }
  },
)

export const signup = createAsyncThunk(
  "auth/signup",
  async (
    { name, email, password }: { name: string; email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      await signupSupabase(name, email, password)
      return { email, message: "Signup successful" }
    } catch (err: unknown) {
      if (err instanceof ApiRequestError) {
        return rejectWithValue({ message: err.message, code: err.code, fields: err.fields })
      }
      const message = err instanceof Error ? err.message : "Signup failed"
      if (message.includes("already registered")) {
        return rejectWithValue({ message: "Account with this email already exists", code: "CONFLICT" })
      }
      return rejectWithValue({ message, code: "UNKNOWN_ERROR" })
    }
  },
)

export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { rejectWithValue }) => {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return { user: null }

      const user = await getMeApi()
      return { user }
    } catch {
      return { user: null }
    }
  },
)

export const logout = createAsyncThunk("auth/logout", async () => {
  await logoutSupabase()
})

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null
    },
    resetAuth(state) {
      state.user = null
      state.error = null
      state.signupEmail = null
    },
    clearSignupEmail(state) {
      state.signupEmail = null
    },
    setServerFieldErrors(state, action: { payload: Record<string, string[]> }) {
      if (state.error) {
        state.error.fields = action.payload
      }
    },
    setUser(state, action) {
      state.user = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = normalizeError(action.payload)
      })
      .addCase(signup.pending, (state) => {
        state.loading = true
        state.error = null
        state.signupEmail = null
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false
        state.signupEmail = action.payload.email
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false
        state.error = normalizeError(action.payload)
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload.user) {
          state.user = action.payload.user
        }
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.loading = false
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
      })
  },
})

export { logout as logoutUser }
export const { clearError, resetAuth, setUser, setServerFieldErrors, clearSignupEmail } = authSlice.actions
export default authSlice.reducer
