// src/lib/pdf-extractor.ts
// Ekstraksi teks PDF per halaman dengan penanda `--- [HALAMAN X] ---` (PRD Section 1 poin 6).
// Memakai pdf-parse v2 (class `PDFParse`), bukan API fungsi v1.

import { PDFParse } from "pdf-parse";

/**
 * Dilempar HANYA saat isi PDF tidak bisa dibaca (rusak, terenkripsi password, atau bukan PDF valid).
 * Masalah infrastruktur (mis. worker pdf.js gagal dimuat) dilempar apa adanya sebagai error biasa,
 * supaya tidak salah dilaporkan ke pengguna sebagai "PDF tidak valid".
 */
export class PdfExtractionError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "PdfExtractionError";
  }
}

const CONTENT_ERROR_NAMES = new Set([
  "InvalidPDFException",
  "PasswordException",
  "FormatError",
]);

export interface ExtractedPdf {
  /** Jumlah halaman pada dokumen asli. */
  pageCount: number;
  /** Teks berpenanda halaman, siap dikirim ke Gemini. Halaman tanpa teks dilewati. */
  formattedText: string;
  /** Jumlah karakter bermakna (tanpa penanda & whitespace berlebih) untuk deteksi PDF hasil scan. */
  plainCharCount: number;
  /** True bila teks dipotong karena melebihi `maxChars`. */
  truncated: boolean;
}

export interface ExtractOptions {
  /** Batas panjang `formattedText` agar prompt tidak membengkak. Pemotongan dilakukan per halaman. */
  maxChars?: number;
}

const DEFAULT_MAX_CHARS = 120_000;

export async function extractPdfText(
  data: Uint8Array,
  { maxChars = DEFAULT_MAX_CHARS }: ExtractOptions = {},
): Promise<ExtractedPdf> {
  // pdf.js dapat mengambil alih (detach) buffer yang diberikan, jadi kirim salinan
  // supaya `data` asli tetap utuh untuk pemanggil.
  const parser = new PDFParse({ data: new Uint8Array(data) });

  try {
    const result = await parser.getText();

    let plainCharCount = 0;
    let formattedLength = 0;
    let truncated = false;
    const chunks: string[] = [];

    for (const page of result.pages) {
      const text = page.text
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
      if (!text) continue;

      plainCharCount += text.replace(/\s+/g, " ").length;

      // Setelah batas terlampaui, berhenti menambah halaman (hindari halaman yang bolong-bolong),
      // tetapi plainCharCount tetap dihitung untuk sisa halaman.
      const chunk = `--- [HALAMAN ${page.num}] ---\n${text}`;
      if (truncated || formattedLength + chunk.length > maxChars) {
        truncated = true;
        continue;
      }
      chunks.push(chunk);
      formattedLength += chunk.length + 2;
    }

    return {
      pageCount: result.total,
      formattedText: chunks.join("\n\n"),
      plainCharCount,
      truncated,
    };
  } catch (error: unknown) {
    if (error instanceof Error && CONTENT_ERROR_NAMES.has(error.name)) {
      throw new PdfExtractionError("Gagal membaca isi PDF.", { cause: error });
    }
    throw error;
  } finally {
    await parser.destroy().catch(() => undefined);
  }
}
