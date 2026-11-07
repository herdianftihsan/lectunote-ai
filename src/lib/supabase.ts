// src/lib/supabase.ts
// Supabase Client Initialization (Singleton, runtime-validated)

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

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
