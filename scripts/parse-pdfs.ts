import * as pdfParseModule from "pdf-parse";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// pdf-parse@2.x exports PDFParse as a named class (not a default function)
const { PDFParse } = pdfParseModule as unknown as {
  PDFParse: new (options: { data: Uint8Array }) => {
    load: () => Promise<unknown>;
    getText: () => Promise<{ text: string; pages: unknown[] }>;
    destroy: () => Promise<void>;
  };
};

const PDF_DIR = join(__dirname, "../CS201-Exam2");
const OUTPUT_DIR = join(__dirname, "output/raw");

mkdirSync(OUTPUT_DIR, { recursive: true });

const PDF_MAP: Array<{ src: string; dest: string }> = [
  { src: "Huffman Codes.pdf", dest: "huffman-codes.txt" },
  { src: "Non-Binary Trees and Traversals.pdf", dest: "non-binary-trees.txt" },
  { src: "Red-Black Trees.pdf", dest: "red-black-trees.txt" },
  { src: "Red-Black Trees Continued.pdf", dest: "red-black-trees-continued.txt" },
  { src: "B-Trees Search and Insert.pdf", dest: "b-trees-search-insert.txt" },
  { src: "B-Trees Deletion.pdf", dest: "b-trees-deletion.txt" },
  { src: "Exam2-Outline.pdf", dest: "exam2-outline.txt" },
  { src: "Exam 2.pdf", dest: "exam2-review.txt" },
  { src: "Binary Search Trees.pdf", dest: "binary-search-trees.txt" },
  { src: "Building Trees from Traversals.pdf", dest: "building-trees.txt" },
  { src: "Trees and Stacks.pdf", dest: "trees-and-stacks.txt" },
];

async function extractAll(): Promise<void> {
  console.log(`Extracting text from ${PDF_MAP.length} PDFs...\n`);

  for (const { src, dest } of PDF_MAP) {
    const srcPath = join(PDF_DIR, src);
    const destPath = join(OUTPUT_DIR, dest);

    try {
      const data = readFileSync(srcPath);
      const parser = new PDFParse({ data });
      const result = await parser.getText();

      const text = result.text;
      writeFileSync(destPath, text, "utf-8");

      const charCount = text.length;
      const pageCount = result.pages.length;

      if (charCount < 100) {
        console.warn(
          `WARNING: ${src} — only ${charCount} chars extracted (${pageCount} pages). Likely image-only PDF. Manual transcription required.`
        );
      } else {
        console.log(
          `OK  ${src} -> ${dest} (${charCount} chars, ${pageCount} pages)`
        );
      }

      await parser.destroy();
    } catch (err) {
      console.error(`FAILED: ${src} — ${(err as Error).message}`);
      process.exitCode = 1;
    }
  }

  console.log("\nExtraction complete. Check scripts/output/raw/ for results.");
}

extractAll().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
