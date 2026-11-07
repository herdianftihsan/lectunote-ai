import Link from "next/link";
import { Clock, Plus, Search, BookOpen } from "lucide-react";
import { DEFAULT_PROFILE_ID, getSupabase } from "@/lib/supabase";

interface LibraryStudyKit {
  id: string;
  course_name: string;
  topic_title: string;
  file_name: string;
  file_size_bytes: number | null;
  quiz_status: string;
  created_at: string;
}

interface ActivityLog {
  id: string;
  study_kit_id: string;
  action_description: string;
  created_at: string;
}

function formatFileSize(bytes: number | null): string | null {
  if (bytes == null || !Number.isFinite(bytes)) {
    return null;
  }

  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Tanggal tidak tersedia";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function PustakaPage() {
  const supabase = getSupabase();
  const { data: kits, error: kitsError } = await supabase
    .from("study_kits")
    .select(
      "id, course_name, topic_title, file_name, file_size_bytes, quiz_status, created_at",
    )
    .eq("profile_id", DEFAULT_PROFILE_ID)
    .order("created_at", { ascending: false })
    .returns<LibraryStudyKit[]>();

  if (kitsError) {
    throw new Error("Gagal memuat Pustaka Materi.", { cause: kitsError });
  }

  const studyKits = kits ?? [];
  const kitIds = studyKits.map((kit) => kit.id);
  let activities: ActivityLog[] = [];

  if (kitIds.length > 0) {
    const { data, error } = await supabase
      .from("activity_logs")
      .select("id, study_kit_id, action_description, created_at")
      .in("study_kit_id", kitIds)
      .order("created_at", { ascending: false })
      .limit(5)
      .returns<ActivityLog[]>();

    if (error) {
      throw new Error("Gagal memuat aktivitas materi.", { cause: error });
    }

    activities = data ?? [];
  }

  const courseNames = new Map(
    studyKits.map((kit) => [kit.id, kit.course_name] as const),
  );

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Action Row */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1.5">
          <div className="text-sm font-semibold text-primary">
            RUANG BELAJAR PRIBADI
          </div>
          <h1 className="text-3xl sm:text-[32px] font-bold text-text-main leading-tight tracking-tight">
            Pustaka Materi
          </h1>
          <p className="text-base text-text-secondary leading-normal">
            Semua sumber, pemahaman, dan latihanmu dalam satu tempat.
          </p>
        </div>
        <Link
          href="/unggah-materi"
          className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Study Kit Baru</span>
        </Link>
      </section>

      {/* Search & Filter Card */}
      <section className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Cari mata kuliah atau topik…"
            aria-label="Cari materi"
            className="w-full h-12 rounded-xl border border-border bg-white pl-11 pr-4 text-sm text-text-main focus:border-primary focus:outline-none transition-colors"
          />
        </div>
        <div className="text-xs text-text-secondary">
          Menampilkan {studyKits.length} materi
        </div>
      </section>

      {/* Materials Grid */}
      {studyKits.length === 0 ? (
        <section className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface px-6 py-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-text-main">
            Belum ada materi di pustaka
          </h2>
          <p className="text-sm text-text-secondary max-w-md">
            Unggah PDF materi kuliah untuk membuat Study Kit pertama Anda.
          </p>
          <Link
            href="/unggah-materi"
            className="mt-2 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Unggah Materi</span>
          </Link>
        </section>
      ) : (
        <section
          aria-label="Daftar Study Kit"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {studyKits.map((kit) => {
            const isCompleted = kit.quiz_status === "completed";
            const isUnfinished = kit.quiz_status === "unfinished";

            return (
              <article
                key={kit.id}
                className="bg-surface border border-border rounded-2xl p-6 flex flex-col justify-between gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md transition-all"
              >
                <div className="flex flex-col gap-1.5">
                  <div className="text-xs font-semibold flex items-center gap-1.5">
                    {isCompleted ? (
                      <span className="text-success flex items-center gap-1">
                        <span>✓</span> Kuis selesai
                      </span>
                    ) : isUnfinished ? (
                      <span className="text-warning-text flex items-center gap-1">
                        <span>△</span> Kuis belum selesai
                      </span>
                    ) : (
                      <span className="text-text-secondary flex items-center gap-1">
                        <span>○</span> Belum dikerjakan
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-text-main leading-snug">
                    {kit.course_name}
                  </h2>
                  <div className="text-sm font-medium text-text-secondary">
                    {kit.topic_title}
                  </div>
                  <div className="text-xs text-text-muted mt-1">
                    {kit.file_name} · {formatFileSize(kit.file_size_bytes) ?? "PDF"} · {formatDate(kit.created_at)}
                  </div>
                </div>

                <Link
                  href={`/study-kit/${kit.id}/ringkasan`}
                  className="h-12 w-full rounded-xl border border-border bg-surface text-primary text-sm font-semibold hover:bg-background hover:border-slate-300 transition-all inline-flex items-center justify-center text-center"
                >
                  {isUnfinished ? "Lanjutkan belajar" : "Buka Study Kit"}
                </Link>
              </article>
            );
          })}
        </section>
      )}

      {/* Activity Logs */}
      <section className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <h2 className="text-lg font-bold text-text-main">Aktivitas terbaru</h2>
        {activities.length === 0 ? (
          <p className="text-sm text-text-secondary">
            Belum ada aktivitas yang tercatat.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {activities.map((activity) => (
              <li
                key={activity.id}
                className="flex items-start gap-3 rounded-xl bg-background p-3.5 border border-border"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-text-main">
                    {courseNames.get(activity.study_kit_id) ?? "Study Kit"}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {activity.action_description}
                  </p>
                  <time
                    dateTime={activity.created_at}
                    className="mt-1 block text-[11px] text-text-muted"
                  >
                    {formatDate(activity.created_at)}
                  </time>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
