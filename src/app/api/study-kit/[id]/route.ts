// src/app/api/study-kit/[id]/route.ts
// Clean Delete API Handler (PRD Section 5.2)

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getAuthenticatedProfileId,
  getServiceSupabase,
} from "@/lib/supabase";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface StudyKitDeleteTarget {
  id: string;
  profile_id: string;
  storage_path: string | null;
  course_name: string;
  topic_title: string;
}

export async function GET(
  _request: Request,
  { params }: RouteParams,
): Promise<NextResponse> {
  const activeProfileId = await getAuthenticatedProfileId();
  if (!activeProfileId) {
    return NextResponse.json({ error: "Sesi login tidak valid." }, { status: 401 });
  }

  const { id } = await params;

  if (!id || !UUID_REGEX.test(id)) {
    return NextResponse.json(
      {
        error: "Format ID Study Kit tidak valid. Harus berupa UUID.",
        error_code: "INVALID_UUID",
      },
      { status: 400 },
    );
  }

  let supabase;
  try {
    supabase = getServiceSupabase();
  } catch (err: unknown) {
    console.error("[study-kit/get] Gagal inisialisasi Supabase client:", err);
    return NextResponse.json(
      {
        error: "Layanan database belum terkonfigurasi dengan benar.",
        error_code: "DATABASE_NOT_CONFIGURED",
      },
      { status: 500 },
    );
  }

  const { data, error } = await supabase
    .from("study_kits")
    .select("id, profile_id, course_name, topic_title, file_name, file_size_bytes, storage_path, quiz_status, kit_content, created_at")
    .eq("id", id)
    .eq("profile_id", activeProfileId)
    .maybeSingle();

  if (error) {
    console.error("[study-kit/get] Error fetch study_kit:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data materi.", error_code: "DATABASE_ERROR" },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json(
      {
        error: "Study Kit tidak ditemukan atau bukan milik Anda.",
        error_code: "NOT_FOUND",
      },
      { status: 404 },
    );
  }

  return NextResponse.json(data, { status: 200 });
}

export async function DELETE(
  _request: Request,
  { params }: RouteParams,
): Promise<NextResponse> {
  const activeProfileId = await getAuthenticatedProfileId();
  if (!activeProfileId) {
    return NextResponse.json({ error: "Sesi login tidak valid." }, { status: 401 });
  }

  const { id } = await params;

  // 1. Validasi format UUID
  if (!id || !UUID_REGEX.test(id)) {
    return NextResponse.json(
      {
        error: "Format ID Study Kit tidak valid. Harus berupa format UUID yang valid.",
        error_code: "INVALID_UUID",
      },
      { status: 400 },
    );
  }

  let supabase;
  try {
    supabase = getServiceSupabase();
  } catch (err: unknown) {
    console.error("[study-kit/delete] Gagal inisialisasi Supabase service role:", err);
    return NextResponse.json(
      {
        error: "Layanan database belum terkonfigurasi dengan benar.",
        error_code: "DATABASE_NOT_CONFIGURED",
      },
      { status: 500 },
    );
  }

  // 2. Ambil baris Study Kit untuk validasi kepemilikan dan storage_path
  const { data: studyKit, error: fetchError } = await supabase
    .from("study_kits")
    .select("id, profile_id, storage_path, course_name, topic_title")
    .eq("id", id)
    .eq("profile_id", activeProfileId)
    .maybeSingle<StudyKitDeleteTarget>();

  if (fetchError) {
    console.error("[study-kit/delete] Gagal query study kit:", fetchError);
    return NextResponse.json(
      {
        error: "Terjadi kesalahan saat memeriksa data materi di database.",
        error_code: "DATABASE_FETCH_FAILED",
      },
      { status: 500 },
    );
  }

  if (!studyKit) {
    return NextResponse.json(
      {
        error: "Study Kit tidak ditemukan atau Anda tidak memiliki izin untuk menghapusnya.",
        error_code: "NOT_FOUND",
      },
      { status: 404 },
    );
  }

  // 3. Pembersihan Storage Anti-Orphan (Hapus file PDF dari bucket study-docs)
  if (studyKit.storage_path) {
    try {
      const { error: storageError } = await supabase.storage
        .from("study-docs")
        .remove([studyKit.storage_path]);

      if (storageError) {
        console.warn(
          `[study-kit/delete] Peringatan: File storage (${studyKit.storage_path}) gagal dihapus:`,
          storageError.message,
        );
      } else {
        console.log(
          `[study-kit/delete] File PDF storage "${studyKit.storage_path}" berhasil dibersihkan.`,
        );
      }
    } catch (storageErr) {
      console.warn(
        `[study-kit/delete] Pengecualian saat menghapus file storage:`,
        storageErr,
      );
    }
  }

  // 4. Bersihkan data di activity_logs yang berelasi dengan study_kit_id ini
  try {
    const { error: activityError } = await supabase
      .from("activity_logs")
      .delete()
      .eq("study_kit_id", id);

    if (activityError) {
      console.warn(
        "[study-kit/delete] Peringatan: Log aktivitas terkait gagal dibersihkan:",
        activityError.message,
      );
    }
  } catch (actErr) {
    console.warn(
      "[study-kit/delete] Pengecualian saat menghapus activity_logs:",
      actErr,
    );
  }

  // 5. Hapus baris study_kits dari database
  const { error: deleteError } = await supabase
    .from("study_kits")
    .delete()
    .eq("id", id)
    .eq("profile_id", activeProfileId);

  if (deleteError) {
    console.error(
      "[study-kit/delete] Gagal menghapus baris study_kits:",
      deleteError,
    );
    return NextResponse.json(
      {
        error: "Gagal menghapus Study Kit dari database.",
        error_code: "DATABASE_DELETE_FAILED",
      },
      { status: 500 },
    );
  }

  // 6. Revalidasi cache Server Component agar Dashboard & Pustaka langsung ter-update
  try {
    revalidatePath("/");
    revalidatePath("/pustaka");
    revalidatePath("/pustaka-materi");
    revalidatePath(`/study-kit/${id}`);
  } catch (revalErr) {
    console.warn("[study-kit/delete] Gagal revalidatePath:", revalErr);
  }

  console.log(
    `[study-kit/delete] Berhasil menghapus Study Kit ID: ${id} ("${studyKit.course_name}")`,
  );

  return NextResponse.json(
    {
      success: true,
      message: `Study Kit "${studyKit.course_name}" dan file terkait berhasil dihapus.`,
      deleted_id: id,
    },
    { status: 200 },
  );
}
