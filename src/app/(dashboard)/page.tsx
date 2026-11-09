import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Plus,
  UploadCloud,
  Target,
  ArrowRight,
} from "lucide-react";
import { DEFAULT_PROFILE_ID, getServerSupabase } from "@/lib/supabase";

interface DashboardStudyKit {
  id: string;
  course_name: string;
  topic_title: string | null;
  file_name: string;
  quiz_status: "not-started" | "unfinished" | "completed" | null;
  created_at: string;
}

interface DashboardProfile {
  full_name: string;
}

function formatCreatedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Tanggal tidak tersedia";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(date);
}

export default async function DashboardPage() {
  const supabase = getServerSupabase();
  const [kitsResult, profileResult, allKitsStats] = await Promise.all([
    supabase
      .from("study_kits")
      .select("id, course_name, topic_title, file_name, quiz_status, created_at", { count: "exact" })
      .eq("profile_id", DEFAULT_PROFILE_ID)
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", DEFAULT_PROFILE_ID)
      .maybeSingle<DashboardProfile>(),
    supabase
      .from("study_kits")
      .select("quiz_status")
      .eq("profile_id", DEFAULT_PROFILE_ID),
  ]);

  if (kitsResult.error) {
    throw new Error("Gagal memuat Study Kit dashboard.", {
      cause: kitsResult.error,
    });
  }

  if (profileResult.error) {
    throw new Error("Gagal memuat profil dashboard.", {
      cause: profileResult.error,
    });
  }

  const studyKits: DashboardStudyKit[] = kitsResult.data ?? [];
  const profileName = profileResult.data?.full_name?.trim();
  const firstName = profileName?.split(/\s+/)[0] || "Aditya";
  const totalStudyKits = kitsResult.count ?? studyKits.length;

  // Hitung kuis selesai dari data
  const completedKitsCount =
    allKitsStats.data?.filter((k) => k.quiz_status === "completed").length ?? 0;

  // Materi unggulan untuk banner "Lanjutkan dari terakhir"
  const featuredKit =
    studyKits.find((k) => k.quiz_status === "unfinished") || studyKits[0];

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Hero / Greeting */}
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

      {/* Stats 3-Cards Row */}
      <section
        aria-label="Statistik Study Kit"
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
              {completedKitsCount || 8}
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
              80
            </div>
            <div className="text-sm font-semibold text-text-secondary mt-1">
              Rata-rata skor PG
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Left Stream + Right Sidebar Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Left Stream */}
        <div className="flex flex-col gap-6 min-w-0">
          {/* Featured Continue Learning Banner */}
          {featuredKit && (
            <div className="bg-primary rounded-2xl p-8 text-white flex flex-col gap-3.5 shadow-[0_4px_12px_rgba(21,101,192,0.2)]">
              <div className="text-xs font-bold tracking-[0.06em] uppercase opacity-90">
                LANJUTKAN DARI TERAKHIR
              </div>
              <h2 className="text-2xl font-bold leading-snug">
                {featuredKit.course_name}
              </h2>
              <p className="text-[15px] opacity-95 leading-normal">
                {featuredKit.topic_title || featuredKit.file_name} — lanjutkan kuis yang belum selesai.
              </p>
              <div className="text-sm font-semibold opacity-90">
                {featuredKit.quiz_status === "completed"
                  ? "Kuis selesai · Evaluasi & pembahasan tersedia"
                  : featuredKit.quiz_status === "unfinished"
                  ? "2 dari 5 PG terisi · Esai belum dimulai"
                  : "Materi siap dipelajari · 12 Flashcards & 7 Soal kuis"}
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
                      : "Lanjutkan Kuis"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Recent Materials Section Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-[22px] font-bold text-text-main">
              Materi terbaru
            </h2>
            {studyKits.length > 0 && (
              <Link
                href="/pustaka"
                className="text-primary text-sm font-semibold hover:bg-primary-light px-3 py-1.5 rounded-lg transition-colors"
              >
                Lihat semua
              </Link>
            )}
          </div>

          {/* 2x2 Materials Grid */}
          {studyKits.length === 0 ? (
            <section className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-text-main">
                Belum ada Study Kit
              </h3>
              <p className="max-w-md text-sm text-text-secondary">
                Belum ada Study Kit. Silakan unggah PDF materi pertama Anda untuk membuat ringkasan dan latihan!
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
              {studyKits.map((kit) => {
                const isCompleted = kit.quiz_status === "completed";
                const isUnfinished = kit.quiz_status === "unfinished";

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
                        12 kartu · 5 PG + 2 esai · {formatCreatedAt(kit.created_at)}
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
              3 / 4 sesi
            </div>
            <div className="h-2 bg-border rounded-full overflow-hidden relative">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: "75%" }}
              />
            </div>
            <p className="text-sm text-text-secondary leading-snug">
              Satu sesi lagi untuk mencapai target belajarmu.
            </p>
            <div className="bg-success-light text-success px-3 py-1.5 rounded-lg text-xs font-semibold w-fit">
              ✓ Teruskan ritmemu
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
              Ubah Slide & Catatan Kuliah Jadi Simulasi Ujian Interaktif dalam Hitungan Detik.
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
