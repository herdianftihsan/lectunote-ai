// src/lib/rate-limit.ts
// In-Memory Sliding-Window Rate Limiter dengan Auto-Cleanup TTL (Anti-Memory Leak)

interface RateLimitRecord {
  timestamps: number[];
  expiresAt: number;
}

// In-memory store untuk pelacakan request
const rateLimitStore = new Map<string, RateLimitRecord>();

// Interval pembersihan berkala (setiap 60 detik)
const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

function purgeExpiredEntries(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, record] of rateLimitStore.entries()) {
    if (record.expiresAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
  remaining: number;
  totalLimit: number;
}

/**
 * Memeriksa batasan frekuensi request (Rate Limiting) berdasarkan key unik.
 * Menggunakan algoritma sliding-window berbasis riwayat timestamp request.
 *
 * @param key Identifier unik (misal: `generate-kit:${profileId || ip}`)
 * @param limit Jumlah maksimal request yang diizinkan dalam rentang waktu
 * @param windowMs Durasi rentang waktu dalam milidetik
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  purgeExpiredEntries();

  const now = Date.now();
  const windowStart = now - windowMs;

  const record = rateLimitStore.get(key);
  // Ambil hanya timestamp yang masih berada dalam window aktif
  const validTimestamps = record
    ? record.timestamps.filter((ts) => ts > windowStart)
    : [];

  if (validTimestamps.length >= limit) {
    // Hitung waktu tunggu sampai request tertua dalam window kedaluwarsa
    const oldestTimestamp = validTimestamps[0] || now;
    const retryAfterMs = Math.max(0, oldestTimestamp + windowMs - now);
    const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));

    return {
      allowed: false,
      retryAfterSeconds,
      remaining: 0,
      totalLimit: limit,
    };
  }

  // Tambahkan request saat ini
  validTimestamps.push(now);
  rateLimitStore.set(key, {
    timestamps: validTimestamps,
    expiresAt: now + windowMs,
  });

  return {
    allowed: true,
    retryAfterSeconds: 0,
    remaining: Math.max(0, limit - validTimestamps.length),
    totalLimit: limit,
  };
}

/**
 * Helper untuk mengekstrak client IP dari request headers
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || "127.0.0.1";
}
