import type { TextItem } from "pdfjs-dist/types/src/display/api"

const TEXT_THRESHOLD = 50

export async function isScannedPdf(file: File): Promise<boolean> {
  if (file.type !== "application/pdf") return false

  const pdfjsLib = await import("pdfjs-dist")
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).href

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  let totalChars = 0
  const pagesToCheck = Math.min(pdf.numPages, 3)

  for (let i = 1; i <= pagesToCheck; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    for (const item of content.items) {
      if ("str" in item) {
        totalChars += (item as TextItem).str.length
      }
    }
  }

  return totalChars < TEXT_THRESHOLD
}
