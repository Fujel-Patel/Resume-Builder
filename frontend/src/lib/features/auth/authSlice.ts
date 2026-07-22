import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import {
  signup as signupSupabase,
  logout as logoutSupabase,
  getMeApi,
  type UserOut,
} from "@/lib/api/auth"
import { createClient } from "@/lib/supabase/client"
import { ApiRequestError } from "@/lib/api/client"
import { normalizeAuthError, type NormalizedAuthError } from "@/lib/auth/errors"

export type AuthError = NormalizedAuthError & {
  fields?: Record<string, string[]>
}

function toAuthError(payload: unknown): AuthError {
  if (payload && typeof payload === "object" && "message" in payload && "code" in payload) {
    return payload as AuthError
  }
  return normalizeAuthError(payload)
}

type AuthState = {
  user: UserOut | null
  loading: boolean
  error: AuthError | null
  /** Set after successful signup so the UI can show "check your email". */
  signupEmail: string | null
  /** True once initializeAuth has settled (success or failure). */
  initialized: boolean
}

const initialState: AuthState = {
  user: null,
  loading: true,
  error: null,
  signupEmail: null,
  initialized: false,
}

export const login = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const supabase = createClient()
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        return rejectWithValue(normalizeAuthError(signInError))
      }

      // Supabase may allow sessions for unconfirmed users depending on project
      // settings. Always treat email_confirmed_at as the source of truth.
      if (!data.user.email_confirmed_at) {
        await supabase.auth.signOut()
        return rejectWithValue({
          message: "Please verify your email before signing in",
          code: "EMAIL_NOT_VERIFIED",
        } satisfies AuthError)
      }

      const user = await getMeApi()
      return { user }
    } catch (err: unknown) {
      if (err instanceof ApiRequestError) {
        return rejectWithValue({
          message: err.message,
          code: err.code,
          fields: err.fields,
        } satisfies AuthError)
      }
      return rejectWithValue(normalizeAuthError(err))
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
      const data = await signupSupabase(name, email, password)

      // Supabase anti-enumeration: existing confirmed users return a user with
      // empty identities array and no error.
      const supabaseUser = data.user
      if (
        supabaseUser &&
        Array.isArray(supabaseUser.identities) &&
        supabaseUser.identities.length === 0
      ) {
        return rejectWithValue({
          message: "An account with this email already exists. Please sign in.",
          code: "CONFLICT",
        } satisfies AuthError)
      }

      // If email confirmation is disabled, session is returned immediately.
      // Still send the user through the normal "check email" UX when no session,
      // which is the production default (confirmations enabled).
      return { email, hasSession: !!data.session }
    } catch (err: unknown) {
      if (err instanceof ApiRequestError) {
        return rejectWithValue({
          message: err.message,
          code: err.code,
          fields: err.fields,
        } satisfies AuthError)
      }
      return rejectWithValue(normalizeAuthError(err))
    }
  },
)

export const initializeAuth = createAsyncThunk("auth/initialize", async () => {
  try {
    const supabase = createClient()
    // getUser() validates the JWT with Supabase (more secure than getSession alone)
    const {
      data: { user: authUser },
      error,
    } = await supabase.auth.getUser()

    if (error || !authUser) {
      return { user: null }
    }

    if (!authUser.email_confirmed_at) {
      await supabase.auth.signOut()
      return { user: null }
    }

    const user = await getMeApi()
    return { user }
  } catch {
    return { user: null }
  }
})

export const logout = createAsyncThunk("auth/logout", async () => {
  await logoutSupabase()
})

/**
 * Called when onAuthStateChange fires (multi-tab sync, token refresh, sign-out).
 * Loads profile only when a verified user session exists.
 */
export const syncSession = createAsyncThunk(
  "auth/syncSession",
  async (_: void, { rejectWithValue }) => {
    try {
      const supabase = createClient()
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        return { user: null }
      }

      if (!authUser.email_confirmed_at) {
        return { user: null }
      }

      const user = await getMeApi()
      return { user }
    } catch (err) {
      return rejectWithValue(normalizeAuthError(err))
    }
  },
)

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
        state.signupEmail = null
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = toAuthError(action.payload)
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
        state.error = toAuthError(action.payload)
      })
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false
        state.initialized = true
        state.user = action.payload.user
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.loading = false
        state.initialized = true
        state.user = null
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.signupEmail = null
        state.error = null
      })
      .addCase(syncSession.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.loading = false
        state.initialized = true
      })
      .addCase(syncSession.rejected, (state) => {
        // Keep existing user on transient sync failure
        state.loading = false
      })
  },
})

export { logout as logoutUser }
export const {
  clearError,
  resetAuth,
  setUser,
  setServerFieldErrors,
  clearSignupEmail,
} = authSlice.actions
export default authSlice.reducer
