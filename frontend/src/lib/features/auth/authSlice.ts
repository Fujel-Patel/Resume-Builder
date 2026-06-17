import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

type AuthState = {
  user: { name: string; email: string } | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
}

export const login = createAsyncThunk(
  "auth/login",
  async ({ email }: { email: string; _password: string }) => {
    await new Promise((r) => setTimeout(r, 1500))
    return { name: email.split("@")[0], email }
  }
)

export const signup = createAsyncThunk(
  "auth/signup",
  async ({ name, email }: { name: string; email: string; _password: string }) => {
    await new Promise((r) => setTimeout(r, 1500))
    return { name, email }
  }
)

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null
    },
    clearError(state) {
      state.error = null
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
        state.user = action.payload
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? "Login failed"
      })
      .addCase(signup.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? "Signup failed"
      })
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
