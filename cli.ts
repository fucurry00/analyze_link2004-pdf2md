import fs from "node:fs";
import path from "node:path";
import { convertPdfToMarkdown, convertImageToMarkdown } from "./pdf2md.js";

const IMAGE_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".tiff", ".tif",
]);

function printUsage(): void {
  console.error(`Usage: npx tsx extracted/cli.ts <input-file> [options]

Options:
  -o, --output <file>   Write output to file instead of stdout
  --no-images           Disable image base64 extraction
  -h, --help            Show this help message

Examples:
  npx tsx extracted/cli.ts document.pdf
  npx tsx extracted/cli.ts document.pdf -o output.md
  npx tsx extracted/cli.ts photo.png -o output.md --no-images`);
}

function parseArgs(argv: string[]): {
  inputFile: string;
  outputFile: string | null;
  includeImages: boolean;
} {
  const args = argv.slice(2); // skip node and script path

  let inputFile = "";
  let outputFile: string | null = null;
  let includeImages = true;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "-h" || arg === "--help") {
      printUsage();
      process.exit(0);
    } else if (arg === "--no-images") {
      includeImages = false;
    } else if (arg === "-o" || arg === "--output") {
      i++;
      if (i >= args.length) {
        console.error("Error: --output requires a file path");
        process.exit(1);
      }
      outputFile = args[i];
    } else if (arg.startsWith("-")) {
      console.error(`Error: Unknown option: ${arg}`);
      printUsage();
      process.exit(1);
    } else {
      inputFile = arg;
    }
  }

  if (!inputFile) {
    console.error("Error: No input file specified");
    printUsage();
    process.exit(1);
  }

  return { inputFile, outputFile, includeImages };
}

async function main(): Promise<void> {
  const { inputFile, outputFile, includeImages } = parseArgs(process.argv);

  const absolutePath = path.resolve(inputFile);
  if (!fs.existsSync(absolutePath)) {
    console.error(`Error: File not found: ${absolutePath}`);
    process.exit(1);
  }

  const ext = path.extname(absolutePath).toLowerCase();
  const isImage = IMAGE_EXTENSIONS.has(ext);

  console.error(`Processing: ${path.basename(absolutePath)}`);

  const result = isImage
    ? await convertImageToMarkdown(absolutePath, {
        includeImageBase64: includeImages,
      })
    : await convertPdfToMarkdown(absolutePath, {
        includeImageBase64: includeImages,
      });

  console.error(`Done: ${result.pages.length} page(s) processed`);

  if (outputFile) {
    const outputPath = path.resolve(outputFile);
    fs.writeFileSync(outputPath, result.markdown, "utf-8");
    console.error(`Written to: ${outputPath}`);
  } else {
    process.stdout.write(result.markdown);
  }
}

main().catch((err) => {
  console.error("Error:", err.message ?? err);
  process.exit(1);
});
