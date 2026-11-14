// src/app/api/auth/register/route.ts
// Registration API Handler with Program Studi & Direct Session Cookie

import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { setSessionCookie } from "@/lib/session";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(`auth-register:${clientIp}`, 10, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error:
            "Terlalu banyak permintaan dalam waktu singkat. Silakan tunggu beberapa saat sebelum mencoba lagi.",
          error_code: "RATE_LIMIT_EXCEEDED",
          retry_after_seconds: rateCheck.retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateCheck.retryAfterSeconds),
          },
        },
      );
    }

    const body = await request.json();
    const { full_name, email, password, university, program_studi, semester } =
      body as {
        full_name?: unknown;
        email?: unknown;
        password?: unknown;
        university?: unknown;
        program_studi?: unknown;
        semester?: unknown;
      };

    // 1. Validasi Input
    if (typeof full_name !== "string" || full_name.trim().length < 2) {
      return NextResponse.json(
        { error: "Nama lengkap wajib diisi minimal 2 karakter." },
        { status: 400 },
      );
    }

    if (
      typeof email !== "string" ||
      !EMAIL_REGEX.test(email.trim().toLowerCase())
    ) {
      return NextResponse.json(
        { error: "Format alamat surel (email) tidak valid." },
        { status: 400 },
      );
    }

    if (typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Kata sandi minimal harus 6 karakter." },
        { status: 400 },
      );
    }

    if (typeof program_studi !== "string" || program_studi.trim().length < 2) {
      return NextResponse.json(
        { error: "Program studi wajib diisi untuk penyesuaian materi AI." },
        { status: 400 },
      );
    }

    const sanitizedFullName = full_name.trim().slice(0, 100);
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedProgramStudi = program_studi.trim().slice(0, 100);
    const sanitizedUniversity =
      typeof university === "string" && university.trim().length > 0
        ? university.trim().slice(0, 120)
        : null;

    let semesterNum = 1;
    if (semester !== undefined && semester !== null) {
      const parsed = typeof semester === "number" ? semester : Number(semester);
      if (Number.isInteger(parsed) && parsed >= 1 && parsed <= 14) {
        semesterNum = parsed;
      }
    }

    const serviceSupabase = getServiceSupabase();

    // 2. Buat user di Supabase Auth Admin (email_confirm: true agar langsung aktif tanpa SMTP)
    const { data: authData, error: authError } =
      await serviceSupabase.auth.admin.createUser({
        email: sanitizedEmail,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: sanitizedFullName,
          university: sanitizedUniversity,
          program_studi: sanitizedProgramStudi,
          semester: semesterNum,
        },
      });

    if (authError || !authData.user) {
      console.error("[register] Auth error:", authError);
      const isAlreadyRegistered =
        authError?.message?.toLowerCase().includes("already registered") ||
        authError?.message?.toLowerCase().includes("already been registered") ||
        (authError as { code?: string })?.code === "email_exists";

      return NextResponse.json(
        {
          error: isAlreadyRegistered
            ? "Alamat surel ini sudah terdaftar. Silakan gunakan surel lain atau masuk ke akun Anda."
            : authError?.message || "Gagal membuat akun baru.",
        },
        { status: 400 },
      );
    }

    const userId = authData.user.id;

    // 3. Upsert baris di public.profiles
    const profilePayload = {
      id: userId,
      full_name: sanitizedFullName,
      email: sanitizedEmail,
      university: sanitizedUniversity,
      program_studi: sanitizedProgramStudi,
      major: sanitizedProgramStudi,
      role_title: `Mahasiswa ${sanitizedProgramStudi}`,
      semester: semesterNum,
      weekly_target: 5,
      updated_at: new Date().toISOString(),
    };

    const { error: profileError } = await serviceSupabase
      .from("profiles")
      .upsert(profilePayload, { onConflict: "id" });

    if (profileError) {
      console.warn("[register] Upsert profile error:", profileError);
    }

    // 4. Langsung set HTTP-Only cookie sesi agar user langsung login
    const response = NextResponse.json({
      success: true,
      message: "Pendaftaran akun berhasil.",
      user: {
        id: userId,
        email: sanitizedEmail,
        full_name: sanitizedFullName,
      },
    });

    await setSessionCookie(response, userId);

    return response;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[register] Unexpected error:", msg);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal saat mendaftarkan akun." },
      { status: 500 },
    );
  }
}
