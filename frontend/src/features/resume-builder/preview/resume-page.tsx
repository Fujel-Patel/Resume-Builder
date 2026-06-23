"use client"

import { forwardRef, type ReactNode } from "react"

type ResumePageProps = {
  children: ReactNode
  className?: string
}

export const ResumePage = forwardRef<HTMLDivElement, ResumePageProps>(
  ({ children, className = "" }, ref) => {
    return (
      <div
        ref={ref}
        className={`resume-page bg-white text-[#333333] ${className}`}
        style={{
          width: "210mm",
          padding: "0.75in",
          fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
          lineHeight: 1.4,
        }}
      >
        {children}
      </div>
    )
  }
)
ResumePage.displayName = "ResumePage"

type ResumeSectionTitleProps = {
  children: ReactNode
  icon?: ReactNode
  style?: "underline" | "border" | "filled" | "minimal"
  className?: string
}

export function ResumeSectionTitle({
  children,
  icon,
  style = "underline",
  className = "",
}: ResumeSectionTitleProps) {
  return (
    <div className={`mb-1.5 ${className}`}>
      {style === "underline" && (
        <div className="flex items-center gap-2 pb-1 border-b border-gray-300">
          {icon && <span className="text-blue-900 shrink-0">{icon}</span>}
          <h2 className="text-[11px] font-bold uppercase tracking-[1.5px] text-gray-800">
            {children}
          </h2>
        </div>
      )}
      {style === "border" && (
        <div className="flex items-center gap-2 mb-1.5">
          {icon && <span className="text-blue-900 shrink-0">{icon}</span>}
          <h2 className="text-[11px] font-bold uppercase tracking-[1.5px] text-gray-800 px-3 py-1 border-2 border-gray-800 inline-block">
            {children}
          </h2>
        </div>
      )}
      {style === "filled" && (
        <div className="flex items-center gap-2 mb-1.5">
          {icon && <span className="text-white shrink-0">{icon}</span>}
          <h2 className="text-[11px] font-bold uppercase tracking-[1.5px] text-white px-3 py-1 bg-gray-800 inline-block">
            {children}
          </h2>
        </div>
      )}
      {style === "minimal" && (
        <div className="flex items-center gap-2 mb-1.5">
          {icon && <span className="text-gray-400 shrink-0">{icon}</span>}
          <h2 className="text-[9px] font-bold uppercase tracking-[2px] text-gray-400">
            {children}
          </h2>
        </div>
      )}
    </div>
  )
}
