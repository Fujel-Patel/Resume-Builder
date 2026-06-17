import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

type AtsState = {
  file: { name: string; size: number } | null
  jobDescription: string
  activeTab: "upload" | "paste"
  score: number | null
}

const initialState: AtsState = {
  file: null,
  jobDescription: "",
  activeTab: "upload",
  score: null,
}

const atsSlice = createSlice({
  name: "ats",
  initialState,
  reducers: {
    setAtsFile(state, action: PayloadAction<{ name: string; size: number } | null>) {
      state.file = action.payload
    },
    setAtsJobDescription(state, action: PayloadAction<string>) {
      state.jobDescription = action.payload
    },
    setActiveTab(state, action: PayloadAction<"upload" | "paste">) {
      state.activeTab = action.payload
    },
    setScore(state, action: PayloadAction<number | null>) {
      state.score = action.payload
    },
    resetAts(state) {
      state.file = null
      state.jobDescription = ""
      state.activeTab = "upload"
      state.score = null
    },
  },
})

export const {
  setAtsFile,
  setAtsJobDescription,
  setActiveTab,
  setScore,
  resetAts,
} = atsSlice.actions
export default atsSlice.reducer
