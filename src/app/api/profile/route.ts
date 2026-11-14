// src/app/api/profile/route.ts
// Profile Management API (GET & PATCH/PUT)

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getActiveProfile,
  getAuthenticatedProfileId,
  getServerSupabase,
  getServiceSupabase,
} from "@/lib/supabase";
import type { ProfileRow } from "@/types/database";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(): Promise<NextResponse> {
  try {
    if (!(await getAuthenticatedProfileId())) {
      return NextResponse.json({ error: "Sesi login tidak valid." }, { status: 401 });
    }

    const profile = await getActiveProfile();
    const supabase = getServerSupabase();

    // Query statistik ringkasan study kit & kuis
    const [kitsCountResult, completedQuizzesResult] = await Promise.all([
      supabase
        .from("study_kits")
        .select("id", { count: "exact", head: true })
        .eq("profile_id", profile.id),
      supabase
        .from("study_kits")
        .select("id", { count: "exact", head: true })
        .eq("profile_id", profile.id)
        .eq("quiz_status", "completed"),
    ]);

    const totalStudyKits = kitsCountResult.count ?? 0;
    const completedQuizzes = completedQuizzesResult.count ?? 0;

    return NextResponse.json({
      profile,
      stats: {
        total_study_kits: totalStudyKits,
        completed_quizzes: completedQuizzes,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[api/profile] Error GET profile:", message);
    return NextResponse.json(
      { error: "Gagal mengambil data profil.", details: message },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  return handleUpdateProfile(request);
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  return handleUpdateProfile(request);
}

async function handleUpdateProfile(request: NextRequest): Promise<NextResponse> {
  try {
    const profileId = await getAuthenticatedProfileId();
    if (!profileId) {
      return NextResponse.json({ error: "Sesi login tidak valid." }, { status: 401 });
    }

    const body = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Format request body tidak valid (harus objek JSON)." },
        { status: 400 },
      );
    }

    const {
      full_name,
      email,
      university,
      program_studi,
      semester,
      weekly_target,
    } = body as {
      full_name?: unknown;
      email?: unknown;
      university?: unknown;
      program_studi?: unknown;
      semester?: unknown;
      weekly_target?: unknown;
    };

    // 1. Validasi & Sanitasi: full_name (wajib, 2 - 100 karakter)
    if (typeof full_name !== "string" || full_name.trim().length < 2) {
      return NextResponse.json(
        { error: "Nama lengkap wajib diisi minimal 2 karakter." },
        { status: 400 },
      );
    }
    const sanitizedFullName = full_name.trim().slice(0, 100);

    // 2. Validasi & Sanitasi: email (opsional, maks 120 karakter, validasi format jika diisi)
    let sanitizedEmail: string | null = null;
    if (typeof email === "string" && email.trim().length > 0) {
      const trimmedEmail = email.trim().toLowerCase();
      if (!EMAIL_REGEX.test(trimmedEmail) || trimmedEmail.length > 120) {
        return NextResponse.json(
          { error: "Format alamat surel (email) tidak valid." },
          { status: 400 },
        );
      }
      sanitizedEmail = trimmedEmail;
    }

    // 3. Validasi & Sanitasi: university (opsional, maks 120 karakter)
    let sanitizedUniversity: string | null = null;
    if (typeof university === "string" && university.trim().length > 0) {
      sanitizedUniversity = university.trim().slice(0, 120);
    }

    // 4. Validasi & Sanitasi: program_studi (opsional, maks 100 karakter)
    let sanitizedProgramStudi: string | null = null;
    if (typeof program_studi === "string" && program_studi.trim().length > 0) {
      sanitizedProgramStudi = program_studi.trim().slice(0, 100);
    }

    // 5. Validasi & Sanitasi: semester (integer 1 - 14)
    let semesterNumber = 5;
    if (semester !== undefined && semester !== null) {
      const sem = typeof semester === "number" ? semester : Number(semester);
      if (!Number.isInteger(sem) || sem < 1 || sem > 14) {
        return NextResponse.json(
          { error: "Semester harus berupa bilangan bulat antara 1 sampai 14." },
          { status: 400 },
        );
      }
      semesterNumber = sem;
    }

    // 6. Validasi & Sanitasi: weekly_target (integer 1 - 50)
    let weeklyTargetNumber = 4;
    if (weekly_target !== undefined && weekly_target !== null) {
      const target =
        typeof weekly_target === "number"
          ? weekly_target
          : Number(weekly_target);
      if (!Number.isInteger(target) || target < 1 || target > 50) {
        return NextResponse.json(
          {
            error:
              "Target belajar mingguan harus berupa bilangan bulat antara 1 sampai 50 sesi.",
          },
          { status: 400 },
        );
      }
      weeklyTargetNumber = target;
    }

    // 7. Simpan ke database Supabase
    const serviceSupabase = getServiceSupabase();

    const updatePayload: Partial<ProfileRow> = {
      full_name: sanitizedFullName,
      email: sanitizedEmail,
      university: sanitizedUniversity,
      program_studi: sanitizedProgramStudi,
      major: sanitizedProgramStudi, // Sinkronkan ke kolom legacy major
      role_title: sanitizedProgramStudi
        ? `Mahasiswa ${sanitizedProgramStudi}`
        : "Mahasiswa teknik",
      semester: semesterNumber,
      weekly_target: weeklyTargetNumber,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedProfile, error: updateError } = await serviceSupabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", profileId)
      .select("*")
      .single<ProfileRow>();

    if (updateError || !updatedProfile) {
      console.error("[api/profile] Update error:", updateError);
      return NextResponse.json(
        {
          error: "Gagal memperbarui profil di database.",
          details: updateError?.message,
        },
        { status: 500 },
      );
    }

    // 8. Revalidasi halaman agar Sidebar, Topbar, dan Dashboard ter-update real-time
    revalidatePath("/", "layout");

    return NextResponse.json({
      success: true,
      message: "Perubahan profil berhasil disimpan.",
      profile: updatedProfile,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[api/profile] Unexpected update error:", message);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server.", details: message },
      { status: 500 },
    );
  }
}
