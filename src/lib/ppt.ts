import decompress from "decompress";

// import parser from "pdf-parse";

// import { PdfParser as Parser } from "./pdf.js";

export class PowerpointParser {
  async parse(buffer: Buffer) {
    decompress();
    return parseOfficeAsync(buffer);
  }
}
