// src/app/api/auth/login/route.ts
// Login API Handler (Supports Regular Supabase Auth & Instant Demo Mode)

import { NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_PROFILE_ID,
  getActiveProfile,
  getSupabase,
} from "@/lib/supabase";
import { setSessionCookie } from "@/lib/session";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(`auth-login:${clientIp}`, 10, 5 * 60 * 1000);
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
    const { email, password, is_demo } = body as {
      email?: unknown;
      password?: unknown;
      is_demo?: unknown;
    };

    // 1. Opsi Masuk Instan Mode Demo (Aditya Ramadhan)
    if (is_demo === true) {
      // Pastikan profil default sudah siap di database
      await getActiveProfile().catch(() => null);

      const response = NextResponse.json({
        success: true,
        message: "Masuk dengan Akun Demo (Aditya Ramadhan) berhasil.",
        user: {
          id: DEFAULT_PROFILE_ID,
          full_name: "Aditya Ramadhan",
        },
      });

      await setSessionCookie(response, DEFAULT_PROFILE_ID);

      return response;
    }

    // 2. Login Reguler via Supabase Auth
    if (typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { error: "Alamat surel (email) wajib diisi." },
        { status: 400 },
      );
    }

    if (typeof password !== "string" || !password) {
      return NextResponse.json(
        { error: "Kata sandi wajib diisi." },
        { status: 400 },
      );
    }

    const supabase = getSupabase();
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: "Email atau kata sandi yang Anda masukkan salah." },
        { status: 401 },
      );
    }

    const userId = authData.user.id;

    const response = NextResponse.json({
      success: true,
      message: "Login berhasil.",
      user: {
        id: userId,
        email: authData.user.email,
      },
    });

    await setSessionCookie(response, userId);

    return response;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[login] Unexpected error:", msg);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal saat memproses login." },
      { status: 500 },
    );
  }
}
