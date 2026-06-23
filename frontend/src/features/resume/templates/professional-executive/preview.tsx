"use client"

import type { ResumeData } from "../../types"
import { ProfessionalExecutiveTemplate } from "./template"

type Props = { data: ResumeData }

export function ProfessionalExecutivePreview({ data }: Props) {
  return (
    <div
      style={{
        width: 794,
        transform: "scale(0.2)",
        transformOrigin: "top left",
        overflow: "hidden",
      }}
    >
      <ProfessionalExecutiveTemplate data={data} />
    </div>
  )
}
