// src/app/(dashboard)/page.tsx
// Dashboard Ruang Belajar (1:1 _html_design_reference/dashboard.html)

import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Plus,
  UploadCloud,
  Target,
  ArrowRight,
  Clock,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import {
  DEFAULT_PROFILE_ID,
  getActiveProfile,
  getServiceSupabase,
} from "@/lib/supabase";
import type { StudyKitContent } from "@/types/study-kit";

export const instant = false;

interface DashboardStudyKitRow {
  id: string;
  course_name: string;
  topic_title: string | null;
  file_name: string;
  file_size_bytes: number | null;
  quiz_status: "not-started" | "unfinished" | "completed" | null;
  kit_content: StudyKitContent | string | null;
  created_at: string;
}

interface DashboardActivityLog {
  id: string;
  study_kit_id: string;
  action_description: string;
  created_at: string;
}

function formatIndonesianTime(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "Baru saja";

  const now = new Date();
  const hoursStr = String(date.getHours()).padStart(2, "0");
  const minutesStr = String(date.getMinutes()).padStart(2, "0");

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isToday) {
    return `Hari ini, ${hoursStr}.${minutesStr}`;
  }
  if (isYesterday) {
    return `Kemarin, ${hoursStr}.${minutesStr}`;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
  }).format(date) + `, ${hoursStr}.${minutesStr}`;
}

export default async function DashboardPage() {
  const supabase = getServiceSupabase();

  // 1. Fetch seluruh data secara paralel dengan Service Role Supabase
  const [kitsResult, profile, logsResult] = await Promise.all([
    supabase
      .from("study_kits")
      .select(
        "id, course_name, topic_title, file_name, file_size_bytes, quiz_status, kit_content, created_at",
      )
      .eq("profile_id", DEFAULT_PROFILE_ID)
      .order("created_at", { ascending: false }),
    getActiveProfile().catch(() => null),
    supabase
      .from("activity_logs")
      .select("id, study_kit_id, action_description, created_at")
      .order("created_at", { ascending: false })
      .limit(6)
      .returns<DashboardActivityLog[]>(),
  ]);

  // Ungkap detail error Supabase jika terjadi (anti-console `{}`)
  if (kitsResult.error) {
    console.error("[Dashboard] Error fetch study_kits:", {
      message: kitsResult.error.message,
      code: kitsResult.error.code,
      details: kitsResult.error.details,
      hint: kitsResult.error.hint,
    });
  }

  if (logsResult.error) {
    console.warn("[Dashboard] Error fetch activity_logs:", {
      message: logsResult.error.message,
      code: logsResult.error.code,
      details: logsResult.error.details,
      hint: logsResult.error.hint,
    });
  }

  // Graceful Fallback: gunakan array kosong jika fetch database bermasalah
  const allKits: DashboardStudyKitRow[] = kitsResult.data ?? [];
  const activityLogs: DashboardActivityLog[] = logsResult.data ?? [];

  const profileName = profile?.full_name?.trim();
  const firstName = profileName?.split(/\s+/)[0] || "Aditya";
  const courseNamesMap = new Map(allKits.map((k) => [k.id, k.course_name] as const));

  // 2. Kalkulasi Statistik Otomatis
  // a. Total Study Kits
  const totalStudyKits = allKits.length;

  // b. Kuis Selesai & Rata-rata Skor Kuis
  let completedKitsCount = 0;
  const quizScores: number[] = [];

  for (const kit of allKits) {
    let content: StudyKitContent | null = null;
    if (typeof kit.kit_content === "string") {
      try {
        content = JSON.parse(kit.kit_content) as StudyKitContent;
      } catch {
        content = null;
      }
    } else if (kit.kit_content && typeof kit.kit_content === "object") {
      content = kit.kit_content;
    }

    const evaluation = content?.last_evaluation;
    const isCompleted =
      kit.quiz_status === "completed" || Boolean(evaluation);

    if (isCompleted) {
      completedKitsCount += 1;
      if (evaluation) {
        const mcqScore =
          evaluation.mcq_score ??
          (evaluation as unknown as { quiz_result?: { mcq_score?: number } })
            ?.quiz_result?.mcq_score;
        if (typeof mcqScore === "number" && !Number.isNaN(mcqScore)) {
          quizScores.push(mcqScore);
        }
      }
    }
  }

  const avgScore =
    quizScores.length > 0
      ? Math.round(
          quizScores.reduce((acc, score) => acc + score, 0) / quizScores.length,
        )
      : null;

  // c. Target Mingguan (Jumlah sesi dalam 7 hari terakhir)
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const completedSessionsThisWeek = allKits.filter((k) => {
    const createdTime = new Date(k.created_at).getTime();
    return createdTime >= sevenDaysAgo.getTime();
  }).length;

  const weeklyTarget = profile?.weekly_target || 4;
  const targetPercent = Math.min(
    100,
    Math.round((completedSessionsThisWeek / weeklyTarget) * 100),
  );
  const isTargetAchieved = completedSessionsThisWeek >= weeklyTarget;

  // 3. Featured Continue Learning Banner
  // Prioritas: kit dengan status "unfinished", jika tidak ada gunakan kit terbaru
  const featuredKit =
    allKits.find((k) => k.quiz_status === "unfinished") || allKits[0];

  const recentKits = allKits.slice(0, 4);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Graceful Error Fallback Banner */}
      {kitsResult.error && (
        <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-sm">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              Terjadi kendala saat memuat data materi: {kitsResult.error.message || "Koneksi database terganggu"}. Data ditampilkan dengan fallback lokal.
            </span>
          </div>
          <Link
            href="/"
            className="px-3 py-1 bg-white hover:bg-amber-100 border border-amber-300 rounded-lg text-xs font-semibold text-amber-900 transition-colors shrink-0"
          >
            Muat Ulang
          </Link>
        </div>
      )}

      {/* 1. Hero / Greeting */}
      <section className="flex flex-col gap-3">
        <div className="text-sm font-semibold text-primary">
          Halo, {firstName}. Siap memahami hal baru?
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-1.5 min-w-[280px]">
            <h1 className="text-3xl sm:text-[32px] font-bold text-text-main leading-tight tracking-tight">
              Belajar Lebih Cerdas.
            </h1>
            <p className="text-base text-text-secondary leading-normal">
              Ubah materi kuliah menjadi latihan belajar yang lebih terarah.
            </p>
          </div>
          <Link
            href="/unggah-materi"
            className="inline-flex items-center justify-center gap-2 h-12 px-5 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Study Kit Baru</span>
          </Link>
        </div>
      </section>

      {/* 2. Stats 3-Cards Row */}
      <section
        aria-label="Statistik Belajar"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {/* Stat 1: Total Study Kits */}
        <div className="bg-surface border border-border rounded-2xl p-6 flex items-center gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="w-11 h-11 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="text-3xl font-bold text-text-main leading-none">
              {totalStudyKits}
            </div>
            <div className="text-sm font-semibold text-text-secondary mt-1">
              Study Kits
            </div>
          </div>
        </div>

        {/* Stat 2: Kuis selesai */}
        <div className="bg-surface border border-border rounded-2xl p-6 flex items-center gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="w-11 h-11 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="text-3xl font-bold text-text-main leading-none">
              {completedKitsCount}
            </div>
            <div className="text-sm font-semibold text-text-secondary mt-1">
              Kuis selesai
            </div>
          </div>
        </div>

        {/* Stat 3: Rata-rata skor PG */}
        <div className="bg-surface border border-border rounded-2xl p-6 flex items-center gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="w-11 h-11 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="text-3xl font-bold text-text-main leading-none">
              {avgScore !== null ? avgScore : "-"}
            </div>
            <div className="text-sm font-semibold text-text-secondary mt-1">
              Rata-rata skor PG
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Grid: Left Stream + Right Sidebar Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Left Stream */}
        <div className="flex flex-col gap-6 min-w-0">
          {/* Featured Continue Learning Banner */}
          {featuredKit ? (
            <div className="bg-primary rounded-2xl p-8 text-white flex flex-col gap-3.5 shadow-[0_4px_12px_rgba(21,101,192,0.2)]">
              <div className="text-xs font-bold tracking-[0.06em] uppercase opacity-90">
                LANJUTKAN DARI TERAKHIR
              </div>
              <h2 className="text-2xl font-bold leading-snug">
                {featuredKit.course_name}
              </h2>
              <p className="text-[15px] opacity-95 leading-normal">
                {featuredKit.topic_title || featuredKit.file_name} —{" "}
                {featuredKit.quiz_status === "completed"
                  ? "kuis telah dievaluasi oleh AI."
                  : featuredKit.quiz_status === "unfinished"
                  ? "lanjutkan kuis yang belum selesai."
                  : "materi siap dipelajari."}
              </p>
              <div className="text-sm font-semibold opacity-90">
                {featuredKit.quiz_status === "completed"
                  ? "Kuis selesai · Pembahasan & umpan balik AI siap ditinjau"
                  : featuredKit.quiz_status === "unfinished"
                  ? "Sebagian soal telah terisi · Selesaikan untuk melihat hasil"
                  : "Materi siap dipelajari · Ringkasan, Flashcards & Kuis tersedia"}
              </div>
              <div className="mt-1">
                <Link
                  href={
                    featuredKit.quiz_status === "completed"
                      ? `/study-kit/${featuredKit.id}/hasil`
                      : `/study-kit/${featuredKit.id}/kuis`
                  }
                  className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-white text-primary text-sm font-semibold hover:bg-slate-50 transition-colors shadow-xs"
                >
                  <span>
                    {featuredKit.quiz_status === "completed"
                      ? "Lihat Hasil Kuis"
                      : "Lanjutkan Kuis →"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-primary to-[#0D47A1] rounded-2xl p-8 text-white flex flex-col gap-4 shadow-[0_4px_12px_rgba(21,101,192,0.2)]">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-2xl font-bold leading-snug">
                  Mulai Belajar dengan AI
                </h2>
                <p className="text-sm opacity-90 leading-relaxed max-w-xl">
                  Unggah file slide perkuliahan atau catatan PDF Anda. LectuNote
                  AI akan secara otomatis menyusun ringkasan terstruktur,
                  flashcards siap hafalan, dan simulasi kuis ujian interaktif!
                </p>
              </div>
              <Link
                href="/unggah-materi"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-white text-primary text-sm font-semibold hover:bg-slate-50 transition-colors shadow-xs w-fit"
              >
                <span>Unggah Materi Pertama</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Recent Materials Section Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-[22px] font-bold text-text-main">
              Materi terbaru
            </h2>
            {allKits.length > 0 && (
              <Link
                href="/pustaka"
                className="text-primary text-sm font-semibold hover:bg-primary-light px-3 py-1.5 rounded-lg transition-colors"
              >
                Lihat semua
              </Link>
            )}
          </div>

          {/* 2x2 Materials Grid */}
          {allKits.length === 0 ? (
            <section className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-text-main">
                Belum ada Study Kit
              </h3>
              <p className="max-w-md text-sm text-text-secondary">
                Belum ada Study Kit. Silakan unggah PDF materi pertama Anda untuk
                membuat ringkasan dan latihan!
              </p>
              <Link
                href="/unggah-materi"
                className="mt-2 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Unggah Materi</span>
              </Link>
            </section>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentKits.map((kit) => {
                let content: StudyKitContent | null = null;
                if (typeof kit.kit_content === "string") {
                  try {
                    content = JSON.parse(kit.kit_content) as StudyKitContent;
                  } catch {
                    content = null;
                  }
                } else if (kit.kit_content && typeof kit.kit_content === "object") {
                  content = kit.kit_content;
                }

                const isCompleted = kit.quiz_status === "completed" || Boolean(content?.last_evaluation);
                const isUnfinished = kit.quiz_status === "unfinished";

                const flashcardCount = content?.flashcards?.length ?? 12;
                const mcqCount = content?.quiz?.multiple_choice?.length ?? 5;
                const essayCount = content?.quiz?.essays?.length ?? 2;

                return (
                  <article
                    key={kit.id}
                    className="bg-surface border border-border rounded-2xl p-6 flex flex-col justify-between gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col gap-1.5">
                      {isCompleted ? (
                        <div className="text-xs font-semibold text-success flex items-center gap-1.5">
                          <span>✓</span> Kuis selesai
                        </div>
                      ) : isUnfinished ? (
                        <div className="text-xs font-semibold text-warning-text flex items-center gap-1.5">
                          <span>△</span> Kuis belum selesai
                        </div>
                      ) : (
                        <div className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                          <span>○</span> Belum dikerjakan
                        </div>
                      )}

                      <h3 className="text-lg font-bold text-text-main leading-snug">
                        {kit.course_name}
                      </h3>
                      <div className="text-sm text-text-secondary">
                        {kit.topic_title || kit.file_name}
                      </div>
                      <div className="text-xs text-text-secondary mt-1">
                        {flashcardCount} kartu · {mcqCount} PG + {essayCount} esai
                      </div>
                    </div>

                    <Link
                      href={`/study-kit/${kit.id}/ringkasan`}
                      className="h-11 w-full rounded-xl border border-border bg-surface text-primary text-sm font-semibold hover:bg-background hover:border-slate-300 transition-all inline-flex items-center justify-center text-center"
                    >
                      {isUnfinished ? "Lanjutkan belajar" : "Buka Study Kit"}
                    </Link>
                  </article>
                );
              })}
            </div>
          )}

          {/* Panel Riwayat Aktivitas di Dashboard */}
          {activityLogs.length > 0 && (
            <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-text-main">
                  Aktivitas terbaru
                </h2>
                <Link
                  href="/pustaka"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Lihat di Pustaka
                </Link>
              </div>

              <div className="flex flex-col divide-y divide-border">
                {activityLogs.map((log) => (
                  <div key={log.id} className="py-3 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-light text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="text-sm font-semibold text-text-main">
                        {courseNamesMap.get(log.study_kit_id) || "Study Kit"}
                      </div>
                      <div className="text-xs text-text-secondary mt-0.5">
                        {log.action_description}
                      </div>
                      <div className="text-[11px] text-text-muted mt-1">
                        {formatIndonesianTime(log.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar Widgets */}
        <div className="flex flex-col gap-6">
          {/* Target Minggu Ini */}
          <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-2.5 text-text-main text-lg font-bold">
              <Target className="w-5 h-5 text-primary" />
              <span>Target minggu ini</span>
            </div>
            <div className="text-[32px] font-bold text-text-main leading-none">
              {completedSessionsThisWeek} / {weeklyTarget} sesi
            </div>
            <div className="h-2 bg-border rounded-full overflow-hidden relative">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${targetPercent}%` }}
              />
            </div>
            <p className="text-sm text-text-secondary leading-snug">
              {isTargetAchieved
                ? "Hebat! Kamu telah mencapai target belajarmu minggu ini."
                : `${weeklyTarget - completedSessionsThisWeek} sesi lagi untuk mencapai target belajarmu.`}
            </p>
            <div className="bg-success-light text-success px-3 py-1.5 rounded-lg text-xs font-semibold w-fit">
              {isTargetAchieved ? "✓ Target tercapai!" : "✓ Teruskan ritmemu"}
            </div>
            <div className="text-xs text-text-secondary">
              Senin–Minggu · Target pribadi
            </div>
          </div>

          {/* Ada Materi Baru? */}
          <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="text-primary">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-text-main">
              Ada materi baru?
            </h3>
            <p className="text-sm text-text-secondary leading-snug">
              Mulai dari PDF, tambahkan catatan, lalu susun latihanmu.
            </p>
            <Link
              href="/unggah-materi"
              className="mt-1 h-11 w-full rounded-xl border border-border bg-surface text-primary text-sm font-semibold hover:bg-background hover:border-slate-300 transition-all inline-flex items-center justify-center text-center"
            >
              Unggah Materi
            </Link>
          </div>

          {/* Info/Promo Card */}
          <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="text-sm font-bold text-primary-dark leading-relaxed">
              Ubah Slide & Catatan Kuliah Jadi Simulasi Ujian Interaktif dalam
              Hitungan Detik.
            </div>
            <div className="text-xs text-text-secondary leading-relaxed">
              Belajar mandiri, tetap berpikir kritis.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
