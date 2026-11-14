// src/lib/supabase.ts
// Supabase Client Initialization (Singleton, runtime-validated)

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ProfileRow } from "@/types/database";
import { getSessionProfileId, SESSION_COOKIE_NAME } from "@/lib/session";

/**
 * ID profil statis "Aditya Ramadhan" (PRD Section 4). Kolom `study_kits.profile_id`
 * mereferensikan profil ini pada skema database yang dipakai aplikasi.
 */
export const DEFAULT_PROFILE_ID = "00000000-0000-0000-0000-000000000001";

/**
 * Dilempar saat konfigurasi environment Supabase tidak valid.
 * Pesan hanya menyebut NAMA variabel, tidak pernah nilainya.
 */
export class SupabaseConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SupabaseConfigError";
  }
}

// MVP memakai default user session tanpa login, jadi sesi tidak perlu disimpan
// dan token tidak perlu di-refresh di background (hemat memori & timer).
const CLIENT_OPTIONS = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
} as const;

// Nilai bawaan dari `.env.example` yang belum diganti oleh developer.
const PLACEHOLDER_PATTERN = /your-|placeholder/i;

function requireEnv(name: string, value: string | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new SupabaseConfigError(
      `Environment variable ${name} belum diset. Tambahkan ke .env.local lalu restart dev server.`,
    );
  }
  if (PLACEHOLDER_PATTERN.test(trimmed)) {
    throw new SupabaseConfigError(
      `Environment variable ${name} masih berisi nilai placeholder dari .env.example. Isi dengan nilai asli dari Supabase Dashboard > Project Settings > API.`,
    );
  }
  return trimmed;
}

function readPublicConfig(): { url: string; anonKey: string } {
  // Akses HARUS berupa `process.env.NEXT_PUBLIC_*` literal agar Next.js dapat
  // meng-inline nilainya ke bundle client.
  const url = requireEnv(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  );
  const anonKey = requireEnv(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  let protocol: string;
  try {
    protocol = new URL(url).protocol;
  } catch {
    throw new SupabaseConfigError(
      "NEXT_PUBLIC_SUPABASE_URL bukan URL yang valid (contoh format: https://<project-ref>.supabase.co).",
    );
  }
  if (protocol !== "https:" && protocol !== "http:") {
    throw new SupabaseConfigError(
      "NEXT_PUBLIC_SUPABASE_URL harus diawali http:// atau https://.",
    );
  }

  return { url, anonKey };
}

// Singleton disimpan di globalThis agar tetap satu instance walau modul ini
// dievaluasi ulang oleh HMR di mode development.
const globalForSupabase = globalThis as typeof globalThis & {
  __lectunoteSupabase?: SupabaseClient;
  __lectunoteSupabaseAdmin?: SupabaseClient;
};

/**
 * Client Supabase (anon key, tunduk pada RLS). Aman dipakai di server maupun browser.
 * Dipanggil lazy supaya error konfigurasi bisa ditangkap oleh pemanggil
 * (mis. route handler) alih-alih menjatuhkan seluruh modul saat di-import.
 */
export function getSupabase(): SupabaseClient {
  if (!globalForSupabase.__lectunoteSupabase) {
    const { url, anonKey } = readPublicConfig();
    globalForSupabase.__lectunoteSupabase = createClient(
      url,
      anonKey,
      CLIENT_OPTIONS,
    );
  }
  return globalForSupabase.__lectunoteSupabase;
}

/**
 * Client Supabase dengan Service Role Key (mem-bypass RLS). HANYA untuk server.
 * Sengaja tidak fallback ke anon key: kegagalan konfigurasi harus terlihat jelas.
 */
export function getServiceSupabase(): SupabaseClient {
  if (typeof window !== "undefined") {
    throw new SupabaseConfigError(
      "getServiceSupabase() tidak boleh dipanggil di sisi browser.",
    );
  }
  if (!globalForSupabase.__lectunoteSupabaseAdmin) {
    const { url } = readPublicConfig();
    const serviceRoleKey = requireEnv(
      "SUPABASE_SERVICE_ROLE_KEY",
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
    globalForSupabase.__lectunoteSupabaseAdmin = createClient(
      url,
      serviceRoleKey,
      CLIENT_OPTIONS,
    );
  }
  return globalForSupabase.__lectunoteSupabaseAdmin;
}

/**
 * Client Supabase untuk Server Components, Server Actions, dan Route Handlers.
 * Memakai Service Role Key (bypassing RLS) agar query server dijamin berhasil membaca
 * dan menulis data tanpa terhalang kebijakan RLS anonim. Jika Service Role Key belum
 * tersedia, fallback ke anon client. HANYA dipanggil di sisi server.
 */
export function getServerSupabase(): SupabaseClient {
  if (typeof window !== "undefined") {
    throw new SupabaseConfigError(
      "getServerSupabase() tidak boleh dipanggil di sisi browser.",
    );
  }
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (serviceRoleKey && !PLACEHOLDER_PATTERN.test(serviceRoleKey)) {
    return getServiceSupabase();
  }
  return getSupabase();
}

/**
 * Mengembalikan profile_id dari cookie sesi bertanda tangan jika user sudah login.
 * Mengembalikan null jika belum ada sesi terautentikasi.
 */
export async function getAuthenticatedProfileId(): Promise<string | null> {
  try {
    const { connection } = await import("next/server");
    await connection();
  } catch {
    // Di luar request scope Next.js (misal script standalone), lanjutkan
  }
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  return getSessionProfileId(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}

/**
 * Mengambil ID profil user yang sedang aktif.
 * Mengutamakan user yang login (melalui cookie sesi bertanda tangan).
 * Jika belum login / fallback, mengembalikan DEFAULT_PROFILE_ID.
 */
export async function getActiveProfileId(): Promise<string> {
  const authenticatedId = await getAuthenticatedProfileId();
  if (authenticatedId) {
    return authenticatedId;
  }
  return DEFAULT_PROFILE_ID;
}

/**
 * Mengambil baris data profil user aktif dari tabel `profiles`.
 * Jika profil belum tersedia (misal akun demo baru atau user baru terdaftar),
 * fungsi ini melakukan auto-seed / sinkronisasi dari auth.users secara otomatis.
 */
export async function getActiveProfile(): Promise<ProfileRow> {
  if (typeof window !== "undefined") {
    throw new SupabaseConfigError(
      "getActiveProfile() tidak boleh dipanggil di sisi browser.",
    );
  }

  const profileId = await getActiveProfileId();
  const supabase = getServerSupabase();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .maybeSingle<ProfileRow>();

  if (!error && profile) {
    return profile;
  }

  // Jika profileId adalah DEFAULT_PROFILE_ID, lakukan auto-seed profil demo
  if (profileId === DEFAULT_PROFILE_ID) {
    const defaultProfileData: Partial<ProfileRow> = {
      id: profileId,
      full_name: "Aditya Ramadhan",
      email: "aditya.r@example.com",
      role_title: "Mahasiswa teknik",
      major: "Teknik Informatika",
      university: "Politeknik / Universitas",
      program_studi: "Teknik Informatika",
      semester: 5,
      weekly_target: 4,
    };

    const { data: seededProfile, error: seedError } = await getServiceSupabase()
      .from("profiles")
      .upsert(defaultProfileData, { onConflict: "id" })
      .select("*")
      .single<ProfileRow>();

    if (!seedError && seededProfile) {
      return seededProfile;
    }
  }

  // Jika akun terdaftar via auth.users tapi profil belum ter-seed:
  try {
    const serviceSupabase = getServiceSupabase();
    const { data: userData } = await serviceSupabase.auth.admin.getUserById(profileId);
    if (userData?.user) {
      const meta = userData.user.user_metadata || {};
      const fallbackProfile: Partial<ProfileRow> = {
        id: profileId,
        full_name:
          (meta.full_name as string) ||
          userData.user.email?.split("@")[0] ||
          "Mahasiswa",
        email: userData.user.email || null,
        university: (meta.university as string) || null,
        program_studi: (meta.program_studi as string) || "Teknik Informatika",
        major: (meta.program_studi as string) || "Teknik Informatika",
        role_title: meta.program_studi
          ? `Mahasiswa ${meta.program_studi}`
          : "Mahasiswa teknik",
        semester: Number(meta.semester) || 1,
        weekly_target: 5,
      };

      const { data: syncedProfile, error: syncError } = await serviceSupabase
        .from("profiles")
        .upsert(fallbackProfile, { onConflict: "id" })
        .select("*")
        .single<ProfileRow>();

      if (!syncError && syncedProfile) {
        return syncedProfile;
      }
    }
  } catch (authErr) {
    console.warn("[getActiveProfile] Gagal lookup auth user:", authErr);
  }

  throw new Error(
    `Gagal memuat profil aktif dari database (ID: ${profileId}): ${error?.message || "Profile not found"}`,
  );
}
