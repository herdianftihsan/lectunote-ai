// src/components/dashboard/LibraryClient.tsx
// Interactive Pustaka Materi Component (1:1 _html_design_reference/pustaka-materi.html)
"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  BookOpen,
  Plus,
  Trash2,
  Clock,
  AlertTriangle,
  Loader2,
  X,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";

export interface LibraryStudyKit {
  id: string;
  course_name: string;
  topic_title: string;
  file_name: string;
  file_size_bytes: number | null;
  quiz_status: string;
  created_at: string;
  flashcard_count: number;
  mcq_count: number;
  essay_count: number;
  has_evaluation: boolean;
  last_score: number | null;
}

export interface ActivityLogItem {
  id: string;
  study_kit_id: string;
  course_name?: string | null;
  action_description: string;
  created_at: string;
}

interface LibraryClientProps {
  initialKits: LibraryStudyKit[];
  activities: ActivityLogItem[];
  databaseError?: string | null;
}

function formatFileSize(bytes: number | null): string {
  if (bytes == null || !Number.isFinite(bytes)) return "PDF";
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
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

  return (
    new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
    }).format(date) + `, ${hoursStr}.${minutesStr}`
  );
}

export default function LibraryClient({
  initialKits,
  activities,
  databaseError,
}: LibraryClientProps) {
  const router = useRouter();
  const [kits, setKits] = useState<LibraryStudyKit[]>(initialKits);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "incomplete">("all");
  const [sortBy, setSortBy] = useState<"latest" | "oldest" | "name">("latest");

  // Clean Delete states
  const [kitToDelete, setKitToDelete] = useState<LibraryStudyKit | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Extract unique course names for dropdown
  const uniqueCourses = useMemo(() => {
    const set = new Set<string>();
    for (const kit of kits) {
      if (kit.course_name?.trim()) {
        set.add(kit.course_name.trim());
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [kits]);

  // High-performance filter using useMemo
  const filteredKits = useMemo(() => {
    let result = [...kits];

    // 1. Real-time Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (k) =>
          k.course_name.toLowerCase().includes(q) ||
          (k.topic_title && k.topic_title.toLowerCase().includes(q)) ||
          k.file_name.toLowerCase().includes(q),
      );
    }

    // 2. Filter Mata Kuliah
    if (selectedCourse !== "all") {
      result = result.filter((k) => k.course_name === selectedCourse);
    }

    // 3. Filter Status Kuis
    if (statusFilter === "completed") {
      result = result.filter(
        (k) => k.quiz_status === "completed" || k.has_evaluation,
      );
    } else if (statusFilter === "incomplete") {
      result = result.filter(
        (k) => k.quiz_status !== "completed" && !k.has_evaluation,
      );
    }

    // 4. Sorting
    if (sortBy === "latest") {
      result.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    } else if (sortBy === "oldest") {
      result.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
    } else if (sortBy === "name") {
      result.sort((a, b) => a.course_name.localeCompare(b.course_name));
    }

    return result;
  }, [kits, searchQuery, selectedCourse, statusFilter, sortBy]);

  // Clean Delete Handler
  async function handleDeleteConfirm() {
    if (!kitToDelete || isDeleting) return;

    setIsDeleting(true);
    setDeleteError(null);

    const targetId = kitToDelete.id;

    try {
      const res = await fetch(`/api/study-kit/${targetId}`, {
        method: "DELETE",
      });

      const data: unknown = await res.json();

      if (!res.ok) {
        throw new Error(
          typeof data === "object" && data !== null && "error" in data && typeof data.error === "string"
            ? data.error
            : "Gagal menghapus Study Kit. Silakan coba lagi.",
        );
      }

      // Optimistic update: langsung hapus dari local state
      setKits((prev) => prev.filter((k) => k.id !== targetId));
      setKitToDelete(null);

      // Revalidasi server cache
      router.refresh();
    } catch (err: unknown) {
      console.error("[LibraryClient] Gagal delete study kit:", err);
      setDeleteError(
        err instanceof Error ? err.message : "Terjadi kesalahan saat menghapus materi.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  function handleResetFilters() {
    setSearchQuery("");
    setSelectedCourse("all");
    setStatusFilter("all");
    setSortBy("latest");
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Graceful Error Fallback Banner */}
      {databaseError && (
        <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-sm">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              Terjadi kendala saat memuat data pustaka: {databaseError}. Data ditampilkan dengan fallback lokal.
            </span>
          </div>
          <button
            type="button"
            onClick={() => router.refresh()}
            className="px-3 py-1 bg-white hover:bg-amber-100 border border-amber-300 rounded-lg text-xs font-semibold text-amber-900 transition-colors shrink-0"
          >
            Muat Ulang
          </button>
        </div>
      )}

      {/* 1. Header Action Row (Ref: header-action-row) */}
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

      {/* 2. Filter Card (Ref: filter-card) */}
      <section className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        {/* Search Input Box */}
        <div className="flex flex-col gap-2">
          <label htmlFor="searchMateri" className="text-sm font-bold text-text-main">
            Cari materi
          </label>
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="searchMateri"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari mata kuliah atau topik…"
              className="w-full h-12 rounded-xl border border-border bg-white pl-11 pr-10 text-sm text-text-main placeholder:text-text-muted focus:border-primary focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-main"
                aria-label="Hapus teks pencarian"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Tags Row & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
          {/* Status Filter Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`h-9 px-4 rounded-xl text-sm font-semibold transition-all ${
                statusFilter === "all"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-surface border border-border text-text-secondary hover:text-text-main hover:bg-background"
              }`}
            >
              Semua materi ({kits.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("incomplete")}
              className={`h-9 px-4 rounded-xl text-sm font-semibold transition-all ${
                statusFilter === "incomplete"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-surface border border-border text-text-secondary hover:text-text-main hover:bg-background"
              }`}
            >
              Kuis belum selesai
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("completed")}
              className={`h-9 px-4 rounded-xl text-sm font-semibold transition-all ${
                statusFilter === "completed"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-surface border border-border text-text-secondary hover:text-text-main hover:bg-background"
              }`}
            >
              Kuis selesai
            </button>
          </div>

          {/* Course Dropdown & Sort Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {uniqueCourses.length > 0 && (
              <select
                aria-label="Filter Mata Kuliah"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="h-9 px-3 rounded-xl border border-border bg-surface text-sm font-medium text-text-main focus:border-primary focus:outline-none"
              >
                <option value="all">Semua Mata Kuliah</option>
                {uniqueCourses.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}

            <select
              aria-label="Urutkan materi"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "latest" | "oldest" | "name")}
              className="h-9 px-3 rounded-xl border border-border bg-surface text-sm font-medium text-text-main focus:border-primary focus:outline-none"
            >
              <option value="latest">Urutkan: terbaru ↓</option>
              <option value="oldest">Urutkan: terlama ↑</option>
              <option value="name">Urutkan: Nama (A–Z)</option>
            </select>
          </div>
        </div>

        {/* Filter Meta Info */}
        <div className="text-xs text-text-secondary pt-1 flex items-center justify-between">
          <span>
            Menampilkan {filteredKits.length} materi · Semester ganjil 2026/2027
          </span>
          {(searchQuery || selectedCourse !== "all" || statusFilter !== "all") && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-primary hover:underline font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset filter</span>
            </button>
          )}
        </div>
      </section>

      {/* 3. Material Cards Grid (Ref: material-grid) */}
      {kits.length === 0 ? (
        /* Empty Database State */
        <section className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface px-6 py-14 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-primary-light text-primary flex items-center justify-center">
            <BookOpen className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-text-main mt-1">
            Belum ada materi di pustaka
          </h2>
          <p className="text-sm text-text-secondary max-w-md">
            Unggah file slide perkuliahan atau catatan kuliah format PDF untuk
            membuat Study Kit pertama Anda.
          </p>
          <Link
            href="/unggah-materi"
            className="mt-3 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-white hover:bg-primary-hover shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Unggah Materi Pertama</span>
          </Link>
        </section>
      ) : filteredKits.length === 0 ? (
        /* Empty Filter State */
        <section className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface px-6 py-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-text-muted flex items-center justify-center">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-text-main">
            Tidak ada materi yang cocok
          </h2>
          <p className="text-sm text-text-secondary max-w-md">
            {searchQuery
              ? `Tidak ditemukan materi dengan kata kunci "${searchQuery}". Coba kata kunci lain atau reset filter.`
              : "Tidak ada materi yang sesuai dengan kombinasi filter yang Anda pilih."}
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-2 inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-surface px-4 text-xs font-semibold text-primary hover:bg-background transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Pencarian & Filter</span>
          </button>
        </section>
      ) : (
        <section
          aria-label="Daftar Study Kit"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {filteredKits.map((kit) => {
            const isCompleted =
              kit.quiz_status === "completed" || kit.has_evaluation;
            const isUnfinished = kit.quiz_status === "unfinished";

            return (
              <article
                key={kit.id}
                className="bg-surface border border-border rounded-2xl p-6 flex flex-col justify-between gap-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-md transition-all relative group"
              >
                <div className="flex flex-col gap-2">
                  {/* Status Indicator & Delete Action Row */}
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold flex items-center gap-1.5">
                      {isCompleted ? (
                        <span className="text-success flex items-center gap-1">
                          <span>✓</span> Kuis selesai
                          {kit.last_score !== null && (
                            <span className="ml-1 text-[11px] font-bold bg-success-light px-2 py-0.5 rounded-md">
                              {kit.last_score}/100
                            </span>
                          )}
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

                    {/* Clean Delete Trigger Button */}
                    <button
                      type="button"
                      onClick={() => setKitToDelete(kit)}
                      title="Hapus Study Kit ini"
                      aria-label={`Hapus ${kit.course_name}`}
                      className="p-1.5 text-text-muted hover:text-danger hover:bg-red-50 rounded-lg transition-colors opacity-80 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Course Name & Topic Title */}
                  <h2 className="text-lg font-bold text-text-main leading-snug">
                    {kit.course_name}
                  </h2>
                  <div className="text-sm font-medium text-text-secondary line-clamp-1">
                    {kit.topic_title || kit.file_name}
                  </div>

                  {/* Meta stats: flashcards, quiz items, file size */}
                  <div className="text-xs text-text-muted mt-1">
                    {kit.flashcard_count} kartu · {kit.mcq_count} PG +{" "}
                    {kit.essay_count} esai · {formatFileSize(kit.file_size_bytes)}
                  </div>
                </div>

                {/* Primary Card Action */}
                <Link
                  href={
                    isCompleted
                      ? `/study-kit/${kit.id}/hasil`
                      : `/study-kit/${kit.id}/ringkasan`
                  }
                  className="h-12 w-full rounded-xl border border-border bg-surface text-primary text-sm font-semibold hover:bg-background hover:border-slate-300 transition-all inline-flex items-center justify-center text-center shadow-xs"
                >
                  {isCompleted
                    ? "Lihat Hasil & Ringkasan"
                    : isUnfinished
                    ? "Lanjutkan belajar"
                    : "Buka Study Kit"}
                </Link>
              </article>
            );
          })}
        </section>
      )}

      {/* 4. Recent Activity Card (Ref: card-activity) */}
      <section className="bg-surface border border-border rounded-2xl p-6 sm:p-7 flex flex-col gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <h2 className="text-2xl font-semibold text-text-main">
          Aktivitas terbaru
        </h2>

        {activities.length === 0 ? (
          <p className="text-sm text-text-secondary py-2">
            Belum ada aktivitas yang tercatat. Setiap kuis yang kamu selesaikan
            atau materi baru yang dibuat akan tercatat di sini.
          </p>
        ) : (
          <div className="flex flex-col">
            {activities.map((act) => (
              <div
                key={act.id}
                className="py-3.5 border-t border-border first:border-t-0 flex items-start gap-4"
              >
                <div className="w-5 h-5 text-text-secondary shrink-0 mt-0.5">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <div className="text-base font-medium text-text-main">
                    {act.course_name || "Study Kit"}
                  </div>
                  <div className="text-sm font-semibold text-text-secondary">
                    {act.action_description}
                  </div>
                  <div className="text-xs text-text-muted mt-0.5">
                    {formatIndonesianTime(act.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Clean Delete Confirmation Modal */}
      {kitToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-surface border border-border rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-xl bg-red-50 text-danger flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setKitToDelete(null)}
                className="p-1 text-text-muted hover:text-text-main rounded-lg"
                aria-label="Tutup modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <h3 className="text-xl font-bold text-text-main">
                Hapus Study Kit?
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                Apakah Anda yakin ingin menghapus materi{" "}
                <strong className="text-text-main">
                  &ldquo;{kitToDelete.course_name}&rdquo;
                </strong>
                ? File PDF asli di storage dan seluruh data ringkasan,
                flashcards, serta riwayat kuis akan dihapus secara permanen.
              </p>
            </div>

            {deleteError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs">
                {deleteError}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setKitToDelete(null)}
                className="flex-1 h-11 rounded-xl border border-border bg-surface text-text-secondary font-semibold text-sm hover:bg-background transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="flex-1 h-11 rounded-xl bg-danger hover:bg-red-700 text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <span>Hapus Permanen</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
