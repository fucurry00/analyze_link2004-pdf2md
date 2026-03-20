import { Mistral } from "@mistralai/mistralai";
import fs from "node:fs";
import path from "node:path";

// Re-export the OCRResponse type from Mistral SDK for consumers
export type { OCRResponse } from "@mistralai/mistralai/src/models/components/ocrresponse.js";

export interface Page {
  index: number;
  markdown: string;
  images: Array<{
    id: string;
    imageBase64?: string;
  }>;
}

export interface ConvertResult {
  pages: Page[];
  markdown: string;
}

export interface ConvertOptions {
  /** Include base64 image data in results (default: true) */
  includeImageBase64?: boolean;
  /** Mistral API key (default: process.env.MISTRAL_API_KEY) */
  apiKey?: string;
}

function getMistralClient(apiKey?: string): Mistral {
  const key = apiKey ?? process.env.MISTRAL_API_KEY;
  if (!key) {
    throw new Error(
      "MISTRAL_API_KEY is not set. Pass it via options.apiKey or set the environment variable."
    );
  }
  return new Mistral({ apiKey: key });
}

function ocrResponseToResult(ocrResponse: any): ConvertResult {
  const pages: Page[] = (ocrResponse.pages ?? []).map(
    (page: any, i: number) => ({
      index: page.index ?? i,
      markdown: page.markdown ?? "",
      images: (page.images ?? []).map((img: any) => ({
        id: img.id ?? "",
        ...(img.imageBase64 ? { imageBase64: img.imageBase64 } : {}),
      })),
    })
  );

  const markdown = pages.map((p) => p.markdown).join("\n\n");
  return { pages, markdown };
}

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".bmp": "image/bmp",
  ".tiff": "image/tiff",
  ".tif": "image/tiff",
};

/**
 * Convert a PDF file to Markdown using Mistral OCR.
 * Reads the file, encodes as base64 data URL, and sends directly to Mistral — no S3 needed.
 */
export async function convertPdfToMarkdown(
  pdfPath: string,
  options: ConvertOptions = {}
): Promise<ConvertResult> {
  const { includeImageBase64 = true } = options;

  const absolutePath = path.resolve(pdfPath);
  const fileBuffer = fs.readFileSync(absolutePath);
  const base64 = fileBuffer.toString("base64");
  const dataUrl = `data:application/pdf;base64,${base64}`;

  const client = getMistralClient(options.apiKey);
  const ocrResponse = await client.ocr.process({
    model: "mistral-ocr-latest",
    document: {
      type: "document_url",
      documentUrl: dataUrl,
    },
    includeImageBase64,
  });

  return ocrResponseToResult(ocrResponse);
}

/**
 * Convert an image file to Markdown using Mistral OCR.
 * Reads the file, encodes as base64 data URL, and sends directly to Mistral.
 */
export async function convertImageToMarkdown(
  imagePath: string,
  options: ConvertOptions = {}
): Promise<ConvertResult> {
  const { includeImageBase64 = true } = options;

  const absolutePath = path.resolve(imagePath);
  const ext = path.extname(absolutePath).toLowerCase();
  const mimeType = MIME_TYPES[ext];
  if (!mimeType) {
    throw new Error(
      `Unsupported image format: ${ext}. Supported: ${Object.keys(MIME_TYPES).join(", ")}`
    );
  }

  const fileBuffer = fs.readFileSync(absolutePath);
  const base64 = fileBuffer.toString("base64");
  const dataUrl = `data:${mimeType};base64,${base64}`;

  const client = getMistralClient(options.apiKey);
  const ocrResponse = await client.ocr.process({
    model: "mistral-ocr-latest",
    document: {
      type: "image_url",
      imageUrl: dataUrl,
    },
    includeImageBase64,
  });

  return ocrResponseToResult(ocrResponse);
}
