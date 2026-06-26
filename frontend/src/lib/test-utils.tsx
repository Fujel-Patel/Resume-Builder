import type { ReactElement } from "react"
import { render, type RenderOptions } from "@testing-library/react"
import { Provider } from "react-redux"
import { store } from "@/lib/store"
import { ThemeProvider } from "@/providers/theme-provider"

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider>{children}</ThemeProvider>
    </Provider>
  )
}

function customRender(ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  return render(ui, { wrapper: AllProviders, ...options })
}

export * from "@testing-library/react"
export { customRender as render }
