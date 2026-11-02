// src/app/api/test-supabase/route.ts
// Endpoint diagnostik koneksi Supabase (database + storage + seed profil default).
// HANYA untuk development: otomatis menolak akses (403) di production.

import { connection, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  DEFAULT_PROFILE_ID,
  getSupabase,
  SupabaseConfigError,
} from "@/lib/supabase";

// Catatan: `export const dynamic = 'force-dynamic'` sengaja TIDAK dipakai.
// next.config.ts mengaktifkan `cacheComponents: true`, dan pada mode itu route
// segment config tersebut sudah digantikan oleh Request-time API. `await connection()`
// di bawah menjamin handler selalu berjalan saat request (tidak diprerender/di-cache).

const TABLES = ["profiles", "study_kits", "activity_logs"] as const;
type TableName = (typeof TABLES)[number];

const STORAGE_BUCKET = "study-docs";

// Profil seed WAJIB memakai DEFAULT_PROFILE_ID agar insert study_kits tidak melanggar FK.
const DEFAULT_PROFILE_SEED = {
  id: DEFAULT_PROFILE_ID,
  full_name: "Aditya Ramadhan",
  role_title: "Mahasiswa teknik",
  major: "Teknik Informatika",
  semester: 5,
} as const;

const PROFILE_COLUMNS = "id, full_name, role_title, major, semester";

interface ProfileRow {
  id: string;
  full_name: string;
  role_title: string;
  major: string;
  semester: number;
}

interface SafeError {
  code: string | null;
  message: string;
  status: number | null;
}

interface TableCheck {
  ok: boolean;
  count: number | null;
  error: SafeError | null;
}

interface StorageCheck {
  ok: boolean;
  bucket: string;
  error: SafeError | null;
}

interface DefaultProfileCheck {
  ok: boolean;
  skipped: boolean;
  seeded: boolean;
  profile: ProfileRow | null;
  error: SafeError | null;
}

interface Checks {
  database_tables: Record<TableName, TableCheck> | null;
  storage_bucket: StorageCheck | null;
  default_profile: DefaultProfileCheck | null;
}

type HealthStatus = "HEALTHY" | "UNHEALTHY";

interface HealthResponse {
  status: HealthStatus;
  latency_ms: number;
  checks: Checks;
  troubleshooting_hint: string | null;
}

/* -------------------------------------------------------------------------- */
/* Redaksi & normalisasi error (zero credential leak)                         */
/* -------------------------------------------------------------------------- */

const REDACTED = "[REDACTED]";

function collectSecrets(): string[] {
  const secrets: string[] = [];
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (url) {
    secrets.push(url, url.replace(/\/+$/, ""));
    try {
      secrets.push(new URL(url).host);
    } catch {
      // URL tidak valid: cukup redaksi string mentahnya.
    }
  }
  for (const value of [
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  ]) {
    if (value?.trim()) secrets.push(value.trim());
  }
  // Urutkan terpanjang dulu agar URL penuh diganti sebelum host-nya.
  return [...new Set(secrets)].sort((a, b) => b.length - a.length);
}

// Pola umum sebagai jaring pengaman kedua bila nilai env tidak cocok persis.
const JWT_PATTERN = /eyJ[\w-]+\.[\w-]+\.[\w-]*/g;
const SB_KEY_PATTERN = /sb_(?:publishable|secret)_[\w-]+/g;
const SUPABASE_URL_PATTERN =
  /https?:\/\/[^\s"'<>]*supabase\.(?:co|in|net)[^\s"'<>]*/gi;
const SUPABASE_HOST_PATTERN = /[a-z0-9-]+\.supabase\.(?:co|in|net)/gi;

function redact(text: string): string {
  let result = text;
  for (const secret of collectSecrets()) {
    result = result.split(secret).join(REDACTED);
  }
  return result
    .replace(JWT_PATTERN, REDACTED)
    .replace(SB_KEY_PATTERN, REDACTED)
    .replace(SUPABASE_URL_PATTERN, REDACTED)
    .replace(SUPABASE_HOST_PATTERN, REDACTED);
}

function readString(
  source: Record<string, unknown>,
  key: string,
): string | null {
  const value = source[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function toSafeError(error: unknown, httpStatus?: number): SafeError {
  const record: Record<string, unknown> =
    typeof error === "object" && error !== null
      ? (error as Record<string, unknown>)
      : {};

  const rawMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : (readString(record, "message") ?? "Unknown error");

  // Supabase Storage mengirim status sebagai `status` (number) atau `statusCode` (string).
  const rawStatus = record["status"] ?? record["statusCode"];
  const parsedStatus =
    httpStatus ??
    (rawStatus !== undefined && !Number.isNaN(Number(rawStatus))
      ? Number(rawStatus)
      : null);

  return {
    code: readString(record, "code"),
    message: redact(rawMessage),
    status: parsedStatus,
  };
}

function logSafe(scope: string, error: SafeError): void {
  console.error(
    `[test-supabase] ${scope} gagal: code=${error.code ?? "-"} status=${error.status ?? "-"} message=${error.message}`,
  );
}

/* -------------------------------------------------------------------------- */
/* Troubleshooting hint                                                       */
/* -------------------------------------------------------------------------- */

function hintFor(scope: string, error: SafeError): string {
  const code = error.code ?? "";
  const message = error.message.toLowerCase();

  if (
    code === "42P01" ||
    code === "PGRST205" ||
    /does not exist|could not find the table/.test(message)
  ) {
    return "Tabel belum dibuat. Jalankan SQL schema dari PRD Section 4 di Supabase Dashboard > SQL Editor.";
  }
  if (
    /bucket not found/.test(message) ||
    (scope === "storage" && error.status === 404)
  ) {
    return `Bucket "${STORAGE_BUCKET}" belum ada. Buat di Dashboard > Storage > New bucket dengan nama persis "${STORAGE_BUCKET}".`;
  }
  if (
    code === "42501" ||
    /row-level security|permission denied|not authorized|policy/.test(message)
  ) {
    return 'Akses diblokir RLS. Tambahkan policy untuk role "anon" (SELECT/INSERT pada tabel, atau SELECT pada storage.objects), atau nonaktifkan RLS sementara untuk MVP demo.';
  }
  if (error.status === 401 || /invalid api key|invalid jwt|jwt/.test(message)) {
    return "API key ditolak. Periksa NEXT_PUBLIC_SUPABASE_ANON_KEY di .env.local (gunakan anon/public key dari Project Settings > API), lalu restart dev server.";
  }
  if (
    /fetch failed|network|enotfound|econnrefused|etimedout|timeout/.test(
      message,
    )
  ) {
    return "Server Supabase tidak terjangkau. Periksa NEXT_PUBLIC_SUPABASE_URL, koneksi internet, dan pastikan project tidak berstatus paused.";
  }
  return `Error tak terduga (code: ${error.code ?? "tidak ada"}). Lihat terminal dev server untuk detail yang sudah disanitasi.`;
}

/** Gabungkan hint identik dari beberapa check menjadi satu kalimat: "[a, b] pesan". */
function buildHint(
  entries: ReadonlyArray<readonly [scope: string, text: string]>,
): string | null {
  if (entries.length === 0) return null;
  const grouped = new Map<string, string[]>();
  for (const [scope, text] of entries) {
    grouped.set(text, [...(grouped.get(text) ?? []), scope]);
  }
  return [...grouped]
    .map(([text, scopes]) => `[${scopes.join(", ")}] ${text}`)
    .join(" ");
}

/* -------------------------------------------------------------------------- */
/* Pengecekan individual                                                      */
/* -------------------------------------------------------------------------- */

async function checkTable(
  supabase: SupabaseClient,
  table: TableName,
): Promise<TableCheck> {
  try {
    // head: true + count: exact => hanya header Content-Range, tanpa body baris.
    const { count, error, status } = await supabase
      .from(table)
      .select("id", { count: "exact", head: true });

    if (error) {
      const safe = toSafeError(error, status);
      logSafe(`tabel ${table}`, safe);
      return { ok: false, count: null, error: safe };
    }
    return { ok: true, count: count ?? 0, error: null };
  } catch (error: unknown) {
    const safe = toSafeError(error);
    logSafe(`tabel ${table}`, safe);
    return { ok: false, count: null, error: safe };
  }
}

async function checkStorage(supabase: SupabaseClient): Promise<StorageCheck> {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list("", { limit: 1 });
    if (error) {
      const safe = toSafeError(error);
      logSafe(`storage ${STORAGE_BUCKET}`, safe);
      return { ok: false, bucket: STORAGE_BUCKET, error: safe };
    }
    return { ok: true, bucket: STORAGE_BUCKET, error: null };
  } catch (error: unknown) {
    const safe = toSafeError(error);
    logSafe(`storage ${STORAGE_BUCKET}`, safe);
    return { ok: false, bucket: STORAGE_BUCKET, error: safe };
  }
}

async function ensureDefaultProfile(
  supabase: SupabaseClient,
  profilesCount: number,
): Promise<DefaultProfileCheck> {
  let seeded = false;

  try {
    if (profilesCount === 0) {
      const { error } = await supabase
        .from("profiles")
        .insert(DEFAULT_PROFILE_SEED);
      // 23505 = unique_violation: request paralel lain sudah men-seed lebih dulu (idempoten).
      if (error && error.code !== "23505") {
        const safe = toSafeError(error);
        logSafe("seed profiles", safe);
        return {
          ok: false,
          skipped: false,
          seeded: false,
          profile: null,
          error: safe,
        };
      }
      seeded = !error;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .eq("id", DEFAULT_PROFILE_ID)
      .maybeSingle<ProfileRow>();

    if (error) {
      const safe = toSafeError(error);
      logSafe("baca profil default", safe);
      return { ok: false, skipped: false, seeded, profile: null, error: safe };
    }

    if (!data) {
      // Dua kemungkinan: baris ada tapi diblokir RLS (SELECT), atau tabel terisi tanpa ID default.
      const message =
        profilesCount === 0
          ? "Profil default berhasil di-insert tetapi tidak bisa dibaca kembali (kemungkinan RLS memblokir SELECT)."
          : `Tabel profiles berisi data, tetapi profil dengan ID default ${DEFAULT_PROFILE_ID} tidak ditemukan atau tidak bisa dibaca.`;
      const safe: SafeError = {
        code: profilesCount === 0 ? "42501" : null,
        message,
        status: null,
      };
      logSafe("baca profil default", safe);
      return { ok: false, skipped: false, seeded, profile: null, error: safe };
    }

    return { ok: true, skipped: false, seeded, profile: data, error: null };
  } catch (error: unknown) {
    const safe = toSafeError(error);
    logSafe("profil default", safe);
    return { ok: false, skipped: false, seeded, profile: null, error: safe };
  }
}

/* -------------------------------------------------------------------------- */
/* Response helper                                                            */
/* -------------------------------------------------------------------------- */

function respond(body: HealthResponse, status: number): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

const EMPTY_CHECKS: Checks = {
  database_tables: null,
  storage_bucket: null,
  default_profile: null,
};

/* -------------------------------------------------------------------------- */
/* Handler                                                                    */
/* -------------------------------------------------------------------------- */

export async function GET(): Promise<NextResponse> {
  // Tunggu request nyata: cegah prerender/caching saat build (cacheComponents aktif).
  await connection();

  // Production guard: endpoint diagnostik tidak boleh pernah terekspos di Vercel.
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      {
        status: "FORBIDDEN",
        error: "Endpoint ini dinonaktifkan di production.",
      },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  const startedAt = performance.now();
  const elapsed = (): number =>
    Math.round((performance.now() - startedAt) * 100) / 100;

  let supabase: SupabaseClient;
  try {
    supabase = getSupabase();
  } catch (error: unknown) {
    // SupabaseConfigError hanya memuat nama variabel, bukan nilainya.
    const hint =
      error instanceof SupabaseConfigError
        ? error.message
        : "Gagal menginisialisasi client Supabase. Periksa konfigurasi .env.local.";
    console.error(`[test-supabase] Konfigurasi tidak valid: ${redact(hint)}`);
    return respond(
      {
        status: "UNHEALTHY",
        latency_ms: elapsed(),
        checks: EMPTY_CHECKS,
        troubleshooting_hint: redact(hint),
      },
      500,
    );
  }

  // Tiga tabel + storage tidak saling bergantung: jalankan paralel untuk menekan latency.
  const [profilesCheck, studyKitsCheck, activityLogsCheck, storageCheck] =
    await Promise.all([
      checkTable(supabase, "profiles"),
      checkTable(supabase, "study_kits"),
      checkTable(supabase, "activity_logs"),
      checkStorage(supabase),
    ]);

  const tables: Record<TableName, TableCheck> = {
    profiles: profilesCheck,
    study_kits: studyKitsCheck,
    activity_logs: activityLogsCheck,
  };

  // Seeding hanya bermakna bila tabel profiles dapat diakses.
  const defaultProfile: DefaultProfileCheck = profilesCheck.ok
    ? await ensureDefaultProfile(supabase, profilesCheck.count ?? 0)
    : { ok: false, skipped: true, seeded: false, profile: null, error: null };

  const hints: Array<readonly [string, string]> = [];
  for (const table of TABLES) {
    const { error } = tables[table];
    if (error)
      hints.push([`database:${table}`, hintFor(`database:${table}`, error)]);
  }
  if (storageCheck.error)
    hints.push(["storage", hintFor("storage", storageCheck.error)]);
  if (defaultProfile.error)
    hints.push([
      "default_profile",
      hintFor("default_profile", defaultProfile.error),
    ]);
  if (defaultProfile.skipped) {
    hints.push([
      "default_profile",
      'Dilewati karena tabel "profiles" tidak dapat diakses. Perbaiki error tabel terlebih dahulu.',
    ]);
  }

  const healthy =
    TABLES.every((table) => tables[table].ok) &&
    storageCheck.ok &&
    defaultProfile.ok;

  return respond(
    {
      status: healthy ? "HEALTHY" : "UNHEALTHY",
      latency_ms: elapsed(),
      checks: {
        database_tables: tables,
        storage_bucket: storageCheck,
        default_profile: defaultProfile,
      },
      troubleshooting_hint: buildHint(hints),
    },
    healthy ? 200 : 500,
  );
}
