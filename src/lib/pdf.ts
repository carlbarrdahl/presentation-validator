import pdf from "pdf-parse";

// import parser from "pdf-parse";

// import { PdfParser as Parser } from "./pdf.js";

export class PdfParser {
  async parse(buffer: Buffer) {
    return pdf(buffer);
  }
}
