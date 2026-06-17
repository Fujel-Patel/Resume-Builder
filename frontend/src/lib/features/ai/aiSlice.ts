import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

type AiState = {
  step: number
  jobDescription: string
  file: { name: string; size: number } | null
  processing: boolean
  progress: number
}

const initialState: AiState = {
  step: 1,
  jobDescription: "",
  file: null,
  processing: false,
  progress: 0,
}

const aiSlice = createSlice({
  name: "ai",
  initialState,
  reducers: {
    setStep(state, action: PayloadAction<number>) {
      state.step = action.payload
    },
    nextStep(state) {
      if (state.step < 5) state.step++
    },
    prevStep(state) {
      if (state.step > 1) state.step--
    },
    setJobDescription(state, action: PayloadAction<string>) {
      state.jobDescription = action.payload
    },
    setFile(state, action: PayloadAction<{ name: string; size: number } | null>) {
      state.file = action.payload
    },
    setProcessing(state, action: PayloadAction<boolean>) {
      state.processing = action.payload
    },
    setProgress(state, action: PayloadAction<number>) {
      state.progress = action.payload
    },
    resetWizard(state) {
      state.step = 1
      state.jobDescription = ""
      state.file = null
      state.processing = false
      state.progress = 0
    },
  },
})

export const {
  setStep,
  nextStep,
  prevStep,
  setJobDescription,
  setFile,
  setProcessing,
  setProgress,
  resetWizard,
} = aiSlice.actions
export default aiSlice.reducer
