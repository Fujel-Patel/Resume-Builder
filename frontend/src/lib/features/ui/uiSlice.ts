import { createSlice } from "@reduxjs/toolkit"

type UiState = {
  sidebarOpen: boolean
  mobileMenuOpen: boolean
}

const initialState: UiState = {
  sidebarOpen: true,
  mobileMenuOpen: false,
}

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen
    },
    openSidebar(state) {
      state.sidebarOpen = true
    },
    closeSidebar(state) {
      state.sidebarOpen = false
    },
    toggleMobileMenu(state) {
      state.mobileMenuOpen = !state.mobileMenuOpen
    },
    openMobileMenu(state) {
      state.mobileMenuOpen = true
    },
    closeMobileMenu(state) {
      state.mobileMenuOpen = false
    },
  },
})

export const {
  toggleSidebar,
  openSidebar,
  closeSidebar,
  toggleMobileMenu,
  openMobileMenu,
  closeMobileMenu,
} = uiSlice.actions
export default uiSlice.reducer
