import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import {
  signupApi,
  loginApi,
  logoutApi,
  getMeApi,
  refreshApi,
  type UserOut,
} from "@/lib/api/auth"
import { setAccessToken, getAccessToken, clearAccessToken } from "@/lib/auth/token-manager"
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
  token: string | null
  loading: boolean
  error: AuthError | null
}

const initialState: AuthState = {
  user: null,
  token: getAccessToken(),
  loading: true,
  error: null,
}

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const tokenData = await loginApi(email, password)
      const user = await getMeApi()
      return { user, access_token: tokenData.access_token }
    } catch (err: unknown) {
      if (err instanceof ApiRequestError) {
        return rejectWithValue({ message: err.message, code: err.code, fields: err.fields })
      }
      const message = err instanceof Error ? err.message : "Login failed"
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
      const user = await signupApi(name, email, password)
      const tokenData = await loginApi(email, password)
      return { user, access_token: tokenData.access_token }
    } catch (err: unknown) {
      if (err instanceof ApiRequestError) {
        return rejectWithValue({ message: err.message, code: err.code, fields: err.fields })
      }
      const message = err instanceof Error ? err.message : "Signup failed"
      return rejectWithValue({ message, code: "UNKNOWN_ERROR" })
    }
  },
)

export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { rejectWithValue }) => {
    let token = getAccessToken()
    try {
      if (token) {
        const user = await getMeApi()
        return { user, access_token: token }
      }
    } catch {
      // token may be stale — try refresh
    }
    const refreshed = await refreshApi()
    if (refreshed) {
      token = refreshed.access_token
      try {
        const user = await getMeApi()
        return { user, access_token: token }
      } catch {
        clearAccessToken()
        return rejectWithValue({ message: "Session expired", code: "SESSION_EXPIRED" })
      }
    }
    clearAccessToken()
    return { user: null, access_token: null }
  },
)

export const logout = createAsyncThunk("auth/logout", async () => {
  await logoutApi()
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
      state.token = null
      state.error = null
      clearAccessToken()
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
        state.token = action.payload.access_token
        setAccessToken(action.payload.access_token)
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = normalizeError(action.payload)
      })
      .addCase(signup.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.access_token
        setAccessToken(action.payload.access_token)
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false
        state.error = normalizeError(action.payload)
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload.user) {
          state.user = action.payload.user
          state.token = action.payload.access_token
        }
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.loading = false
        state.error = normalizeError(action.payload)
        clearAccessToken()
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.token = null
        clearAccessToken()
      })
  },
})

export { logout as logoutUser }
export const { clearError, resetAuth, setUser, setServerFieldErrors } = authSlice.actions
export default authSlice.reducer
