import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"
import { createRoot } from "react-dom/client"
import type { ResumeData } from "@/types/resume"
import type { ResumePageData } from "../engine/types"

type A4Config = {
  WIDTH_PX: number
  HEIGHT_PX: number
  WIDTH_MM: number
  HEIGHT_MM: number
}

export async function exportResumeAsPdfClient(
  resume: ResumeData,
  pages: ResumePageData[],
  a4: A4Config,
  _scale: number,
  onProgress?: (percent: number) => void
): Promise<void> {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  const exportContainer = document.createElement("div")
  exportContainer.style.cssText = `
    position: fixed; top: -99999px; left: -99999px;
    width: ${a4.WIDTH_PX}px; z-index: -1; background: white;
    pointer-events: none;
  `
  document.body.appendChild(exportContainer)

  const { templateMap } = await import("../preview/templates")
  const TemplateComponent = templateMap[resume.templateId]

  if (!TemplateComponent) {
    exportContainer.remove()
    throw new Error(`Template "${resume.templateId}" not found`)
  }

  try {
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i]
      onProgress?.(Math.round(((i + 1) / pages.length) * 100))

      exportContainer.innerHTML = ""

      const pageWrapper = document.createElement("div")
      pageWrapper.style.cssText = `
        width: ${a4.WIDTH_PX}px;
        height: ${a4.HEIGHT_PX}px;
        overflow: hidden;
        background: white;
      `

      const inner = document.createElement("div")
      inner.style.cssText = `
        width: ${a4.WIDTH_PX}px;
        transform: translateY(-${page.offsetY}px);
        transform-origin: top left;
      `

      pageWrapper.appendChild(inner)
      exportContainer.appendChild(pageWrapper)

      const Template = TemplateComponent
      const root = createRoot(inner)
      root.render(<Template resume={resume} />)

      await new Promise((r) => setTimeout(r, 100))
      await document.fonts.ready

      const canvas = await html2canvas(pageWrapper, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: a4.WIDTH_PX,
        height: a4.HEIGHT_PX,
        logging: false,
      })

      root.unmount()

      const imgData = canvas.toDataURL("image/png")

      if (i > 0) pdf.addPage()

      pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        a4.WIDTH_MM,
        a4.HEIGHT_MM,
        undefined,
        "FAST"
      )
    }

    const fileName = resume.name
      ? `${resume.name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}.pdf`
      : "resume.pdf"

    pdf.save(fileName)
  } finally {
    exportContainer.remove()
  }
}
