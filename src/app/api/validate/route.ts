import { NextResponse } from "next/server";
import { SlidesParser } from "@/lib/google";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File;
    const url = formData.get("url") as string;

    const validation = await detectAndParse({ file, url });

    console.log("VALIDATA", validation);
    return NextResponse.json(validation);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: (e as any).toString() },
      { status: 500 }
    );
  }
}

type Input = { url?: string; file?: File };
type ParserFunction = (input: string | File) => void;

// Helper function to check if a string is a URL
function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

// Helper functions to detect specific service URLs
function isGoogleSlidesUrl(url: string): boolean {
  return /docs\.google\.com\/presentation\/d\//.test(url);
}

function isFigmaUrl(url: string): boolean {
  return /figma\.com\/slides\//.test(url);
}

function isCanvaUrl(url: string): boolean {
  return /canva\.com\/design\//.test(url);
}

// Supported file extensions and their corresponding parsers
const fileExtensionParsers: { [key: string]: ParserFunction } = {
  ".pdf": parsePdfFile,
  ".ppt": parsePptFile,
  ".pptx": parsePptxFile,
  ".key": parseKeyFile,
  ".odp": parseOdpFile,
  ".md": parseMarkdownFile,
  // Add other extensions and parsers as needed
};

// Main function to detect and parse input
async function detectAndParse(input: Input) {
  if (input.url && isValidUrl(input.url)) {
    const url = input.url;

    if (isGoogleSlidesUrl(url)) {
      const parser = new SlidesParser();
      // Call the Google Slides parser
      const presentationId = extractPresentationId(url);

      console.log("GOOGLE SLIDE", url, presentationId);
      if (!presentationId) {
        throw new Error("Unable to parse PresentationID");
      }
      const validation = await parser.parse(presentationId);
      return {
        format: "Google Slides",
        ...validation,
      };
    } else if (isFigmaUrl(url)) {
      // Call the Figma parser
      parseFigmaUrl(url);
    } else if (isCanvaUrl(url)) {
      // Call the Canva parser
      parseCanvaUrl(url);
    } else {
      console.error("Unsupported URL format.");
    }
  } else if (input.file) {
    const file = input.file;
    const extension = getFileExtension(file.name).toLowerCase();

    if (extension in fileExtensionParsers) {
      // Call the corresponding parser based on file extension
      fileExtensionParsers[extension](file);
    } else {
      console.error("Unsupported file format.");
    }
  } else {
    console.error("No valid URL or file provided.");
  }
}

// Utility function to get the file extension from a filename
function getFileExtension(filename: string): string {
  const dotIndex = filename.lastIndexOf(".");
  return dotIndex !== -1 ? filename.substring(dotIndex) : "";
}

// Placeholder parser functions for URLs
function parseGoogleSlidesUrl(url: string): void {
  console.log(`Parsing Google Slides URL: ${url}`);
  // Implement the actual parsing logic here
}

function parseFigmaUrl(url: string): void {
  console.log(`Parsing Figma URL: ${url}`);
  throw new Error("Figma not implemented yet");
  // Implement the actual parsing logic here
}

function parseCanvaUrl(url: string): void {
  console.log(`Parsing Canva URL: ${url}`);
  throw new Error("Canva not implemented yet");
  // Implement the actual parsing logic here
}

// Placeholder parser functions for files
function parsePdfFile(file: File): void {
  console.log(`Parsing PDF file: ${file.name}`);
  // Implement the actual parsing logic here
}

function parsePptFile(file: File): void {
  console.log(`Parsing PPT file: ${file.name}`);
  // Implement the actual parsing logic here
}

function parsePptxFile(file: File): void {
  console.log(`Parsing PPTX file: ${file.name}`);
  // Implement the actual parsing logic here
}

function parseKeyFile(file: File): void {
  console.log(`Parsing Keynote file: ${file.name}`);
  // Implement the actual parsing logic here
}

function parseOdpFile(file: File): void {
  console.log(`Parsing ODP file: ${file.name}`);
  // Implement the actual parsing logic here
}

function parseMarkdownFile(file: File): void {
  console.log(`Parsing Markdown file: ${file.name}`);
  // Implement the actual parsing logic here
}

function extractPresentationId(url: string): string | null {
  const regex = /\/presentation\/d\/([a-zA-Z0-9_-]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}
