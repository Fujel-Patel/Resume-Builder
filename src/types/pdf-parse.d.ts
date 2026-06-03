declare module 'pdf-parse' {
  interface PDFOptions {
    max?: number;
    version?: string;
  }

  interface PDFMetadata {
    [key: string]: any;
  }

  interface PDFInfo {
    PDFFormatVersion?: string;
    IsAcroFormPresent?: boolean;
    IsXFAPresent?: boolean;
    Creator?: string;
    Producer?: string;
    CreationDate?: string;
    ModDate?: string;
  }

  interface PDFPage {
    pageInfo: PDFInfo;
    textContent: {
      items: Array<{
        str?: string;
        hasEOL?: boolean;
        [key: string]: any;
      }>;
    };
    prev?: any;
    next?: any;
  }

  export interface PDFData {
    numpages: number;
    numrender: number;
    info: PDFInfo;
    metadata: PDFMetadata | null;
    text: string;
    version: string;
    content: any[];
  }

  function pdfParse(dataBuffer: Buffer, options?: PDFOptions): Promise<PDFData>;

  export default pdfParse;
}