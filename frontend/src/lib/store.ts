import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./features/auth/authSlice"
import resumeReducer from "./features/resume/resumeSlice"
import uiReducer from "./features/ui/uiSlice"
import aiReducer from "./features/ai/aiSlice"
import atsReducer from "./features/ats/atsSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    resume: resumeReducer,
    ui: uiReducer,
    ai: aiReducer,
    ats: atsReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
