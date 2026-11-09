// src/app/api/generate-kit/route.ts
// Core Engine: POST multipart/form-data -> Study Kit (PRD Section 5.2 Endpoint 1)
//
// Alur: input -> validasi file -> upload Storage -> ekstraksi teks -> validasi teks
//       -> Gemini (Structured Output) -> simpan DB -> respons.
import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { classifyGeminiError, generateStudyKit } from "@/lib/gemini";
import { extractPdfText, PdfExtractionError } from "@/lib/pdf-extractor";
import {
  DEFAULT_PROFILE_ID,
  getActiveProfile,
  getServiceSupabase,
  SupabaseConfigError,
} from "@/lib/supabase";

// Gemini + parsing PDF bisa memakan waktu puluhan detik (termasuk satu kali retry).
// Di Vercel, nilai ini dibatasi oleh plan (Hobby tanpa Fluid Compute: 60 detik).
export const maxDuration = 180;

const STORAGE_BUCKET = "study-docs";
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const MIN_TEXT_CHARS = 50;
const MAX_COURSE_NAME_LENGTH = 100;
const MAX_NOTES_LENGTH = 20_000;

const PDF_MIME = "application/pdf";
const PDF_MAGIC = "%PDF-";

/* -------------------------------------------------------------------------- */
/* Helper                                                                     */
/* -------------------------------------------------------------------------- */

function fail(status: number, errorCode: string, error: string): NextResponse {
  return NextResponse.json({ error, error_code: errorCode }, { status });
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

/** Nama file aman untuk path Storage: ASCII saja, tanpa spasi/karakter khusus. */
function toSafeStorageName(fileName: string): string {
  const base = fileName.replace(/\.pdf$/i, "");
  const slug = base
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 60);
  return `${slug || "materi"}.pdf`;
}

/** Hapus file yang sudah terupload bila langkah setelahnya gagal (cegah file yatim di bucket). */
async function removeUploadedFile(
  supabase: SupabaseClient,
  storagePath: string,
  log: (message: string) => void,
): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([storagePath]);
    if (error) log(`Cleanup storage gagal: ${error.message}`);
    else log("Cleanup storage berhasil (file dihapus).");
  } catch (error: unknown) {
    log(`Cleanup storage gagal: ${errorMessage(error)}`);
  }
}

/* -------------------------------------------------------------------------- */
/* Handler                                                                    */
/* -------------------------------------------------------------------------- */

export async function POST(req: NextRequest): Promise<NextResponse> {
  const requestId = crypto.randomUUID().slice(0, 8);
  const log = (message: string): void =>
    console.log(`[generate-kit:${requestId}] ${message}`);
  const logError = (message: string): void =>
    console.error(`[generate-kit:${requestId}] ERROR ${message}`);

  let uploadedPath: string | null = null;
  let supabase: SupabaseClient | null = null;

  try {
    /* 1. Terima input ------------------------------------------------------ */
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return fail(
        400,
        "INVALID_FORM_DATA",
        "Request harus berupa multipart/form-data yang valid.",
      );
    }

    const file = formData.get("file");
    const rawNotes = formData.get("notes");
    const rawCourseName = formData.get("course_name");

    const courseName =
      typeof rawCourseName === "string" ? rawCourseName.trim() : "";
    const notes =
      typeof rawNotes === "string" && rawNotes.trim() ? rawNotes.trim() : null;

    if (!courseName) {
      return fail(
        400,
        "INVALID_COURSE_NAME",
        'Field "course_name" wajib diisi.',
      );
    }
    if (courseName.length > MAX_COURSE_NAME_LENGTH) {
      return fail(
        400,
        "INVALID_COURSE_NAME",
        `Nama mata kuliah maksimal ${MAX_COURSE_NAME_LENGTH} karakter.`,
      );
    }
    if (notes && notes.length > MAX_NOTES_LENGTH) {
      return fail(
        400,
        "NOTES_TOO_LONG",
        `Catatan maksimal ${MAX_NOTES_LENGTH} karakter.`,
      );
    }

    /* 2. Validasi file ----------------------------------------------------- */
    if (!(file instanceof File) || file.size === 0) {
      return fail(400, "NO_FILE_PROVIDED", "Berkas PDF wajib diunggah.");
    }
    if (file.type !== PDF_MIME) {
      return fail(
        400,
        "INVALID_FILE_FORMAT",
        "Format berkas belum didukung. Harap pilih berkas PDF.",
      );
    }
    if (file.size > MAX_FILE_BYTES) {
      return fail(
        400,
        "FILE_TOO_LARGE",
        `Ukuran berkas ${formatFileSize(file.size)} melebihi batas ${formatFileSize(MAX_FILE_BYTES)}.`,
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    // MIME dari client mudah dipalsukan, jadi cek juga signature file.
    if (buffer.subarray(0, PDF_MAGIC.length).toString("latin1") !== PDF_MAGIC) {
      return fail(
        400,
        "INVALID_FILE_FORMAT",
        "Isi berkas bukan PDF yang valid.",
      );
    }
    log(
      `Input valid: "${file.name}" (${formatFileSize(file.size)}), mata kuliah "${courseName}"`,
    );

    /* 3. Upload ke Supabase Storage ---------------------------------------- */
    supabase = getServiceSupabase();
    const storagePath = `${DEFAULT_PROFILE_ID}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${toSafeStorageName(file.name)}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, buffer, { contentType: PDF_MIME, upsert: false });

    if (uploadError) {
      logError(`Upload storage gagal: ${uploadError.message}`);
      const bucketMissing = /bucket not found/i.test(uploadError.message);
      return fail(
        500,
        bucketMissing ? "STORAGE_BUCKET_MISSING" : "STORAGE_UPLOAD_FAILED",
        bucketMissing
          ? `Bucket "${STORAGE_BUCKET}" belum dibuat di Supabase Storage.`
          : "Berkas belum berhasil disimpan. Silakan coba lagi.",
      );
    }
    uploadedPath = storagePath;
    log(`Upload berhasil: ${storagePath}`);

    /* 4. Ekstraksi teks (pdf-parse) ---------------------------------------- */
    let extracted;
    try {
      extracted = await extractPdfText(buffer);
    } catch (error: unknown) {
      if (error instanceof PdfExtractionError) {
        logError(`Ekstraksi PDF gagal: ${errorMessage(error.cause ?? error)}`);
        await removeUploadedFile(supabase, uploadedPath, log);
        return fail(
          422,
          "UNREADABLE_PDF_TEXT",
          "PDF tidak dapat dibaca. Berkas mungkin rusak atau dilindungi password.",
        );
      }
      throw error;
    }
    log(
      `Ekstraksi selesai: ${extracted.pageCount} halaman, ${extracted.plainCharCount} karakter${extracted.truncated ? " (dipotong)" : ""}`,
    );

    /* 5. Validasi teks (anti PDF gambar/scan) ------------------------------ */
    if (extracted.plainCharCount < MIN_TEXT_CHARS) {
      log(
        `Teks terlalu sedikit (${extracted.plainCharCount} < ${MIN_TEXT_CHARS}), ditolak.`,
      );
      await removeUploadedFile(supabase, uploadedPath, log);
      return fail(
        422,
        "UNREADABLE_PDF_TEXT",
        "Teks materi tidak cukup. PDF sepertinya berupa gambar atau hasil scan.",
      );
    }

    /* 6. Gemini AI (Structured Output) ------------------------------------- */
    const startedAt = performance.now();
    let content;
    const activeProfile = await getActiveProfile().catch(() => null);
    try {
      content = await generateStudyKit(
        {
          courseName,
          pdfText: extracted.formattedText,
          notes,
        },
        {
          programStudi: activeProfile?.program_studi,
          university: activeProfile?.university,
          semester: activeProfile?.semester,
        },
      );
    } catch (error: unknown) {
      const failure = classifyGeminiError(error);
      logError(`Gemini gagal [${failure.code}]: ${errorMessage(error)}`);
      await removeUploadedFile(supabase, uploadedPath, log);
      return fail(failure.status, failure.code, failure.message);
    }
    log(`Gemini selesai dalam ${Math.round(performance.now() - startedAt)} ms`);

    /* 7. Simpan ke database ------------------------------------------------ */
    // Kolom mengikuti skema tabel `study_kits` yang AKTUAL di Supabase (profile_id,
    // file_size_bytes, dst.), yang berbeda dari DDL di PRD Section 4.
    // Prasyarat: ALTER TABLE study_kits ADD COLUMN kit_content jsonb;
    const { data: inserted, error: insertError } = await supabase
      .from("study_kits")
      .insert({
        profile_id: activeProfile?.id || DEFAULT_PROFILE_ID,
        course_name: courseName,
        topic_title: content.study_kit_metadata.topic_title,
        file_name: file.name,
        file_size_bytes: file.size,
        storage_path: uploadedPath,
        user_notes: notes,
        quiz_status: "not-started",
        kit_content: content,
      })
      .select("id")
      .single<{ id: string }>();

    if (insertError || !inserted) {
      const code = insertError?.code ?? "unknown";
      logError(
        `Insert study_kits gagal: code=${code} message=${insertError?.message ?? "no row returned"}`,
      );
      await removeUploadedFile(supabase, uploadedPath, log);
      // PGRST204 = kolom tidak ada di schema cache PostgREST (migrasi belum dijalankan).
      const columnMissing =
        code === "PGRST204" && /kit_content/.test(insertError?.message ?? "");
      const fkViolation = code === "23503";
      return fail(
        500,
        columnMissing ? "DATABASE_SCHEMA_OUTDATED" : "DATABASE_ERROR",
        columnMissing
          ? "Kolom study_kits.kit_content belum ada. Jalankan di Supabase SQL Editor: ALTER TABLE study_kits ADD COLUMN kit_content jsonb;"
          : fkViolation
            ? "Profil default belum ada di database. Buka /api/test-supabase untuk men-seed profil, lalu coba lagi."
            : "Study Kit berhasil dibuat tetapi gagal disimpan ke database. Silakan coba lagi.",
      );
    }
    uploadedPath = null; // sudah terhubung ke baris DB, jangan dibersihkan lagi
    log(`Study kit tersimpan: id=${inserted.id}`);

    // Catatan aktivitas untuk Dashboard & Pustaka (PRD 5.2 langkah 5). Best-effort:
    // kegagalan di sini tidak boleh menggagalkan Study Kit yang sudah tersimpan.
    const { error: activityError } = await supabase
      .from("activity_logs")
      .insert({
        profile_id: activeProfile?.id || DEFAULT_PROFILE_ID,
        study_kit_id: inserted.id,
        course_name: courseName,
        activity_type: "generate_kit",
        action_description: `Study Kit "${courseName}" dibuat dari ${file.name}`,
      });
    if (activityError) {
      logError(
        `Insert activity_logs gagal (diabaikan): ${activityError.message}`,
      );
    }

    /* 8. Respons final ----------------------------------------------------- */
    return NextResponse.json(
      { id: inserted.id, message: "Study Kit berhasil dibuat.", content },
      { status: 200 },
    );
  } catch (error: unknown) {
    logError(`Kesalahan tak terduga: ${errorMessage(error)}`);
    if (error instanceof Error && error.stack) console.error(error.stack);

    if (supabase && uploadedPath) {
      await removeUploadedFile(supabase, uploadedPath, log);
    }

    if (error instanceof SupabaseConfigError) {
      return fail(500, "SUPABASE_NOT_CONFIGURED", error.message);
    }
    return fail(
      500,
      "GENERATION_FAILED",
      "Study Kit belum berhasil dibuat. Terjadi kendala teknis.",
    );
  }
}
