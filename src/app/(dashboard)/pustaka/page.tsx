// src/app/(dashboard)/pustaka/page.tsx
// Halaman Pustaka Materi (Konversi dari pustaka-materi.html)
import React from "react";
import Link from "next/link";
import { Plus, Search, Clock } from "lucide-react";
import { mockStudyKitsList, mockActivityLogs } from "@/lib/mock-data";

export default function PustakaPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Ruang belajar pribadi
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-main mt-1">
            Pustaka Materi
          </h1>
          <p className="text-sm text-text-secondary">
            Semua sumber, pemahaman, dan latihanmu dalam satu tempat.
          </p>
        </div>
        <Link
          href="/unggah-materi"
          className="inline-flex items-center gap-2 h-11 px-5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Study Kit Baru</span>
        </Link>
      </div>

      {/* Filter Card */}
      <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Cari mata kuliah atau topik…"
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm text-text-main focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="px-3.5 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg">
            Semua materi ({mockStudyKitsList.length})
          </button>
          <button className="px-3.5 py-1.5 bg-surface border border-border text-text-secondary hover:bg-background text-xs font-semibold rounded-lg">
            Kuis belum selesai
          </button>
          <button className="px-3.5 py-1.5 bg-surface border border-border text-text-secondary hover:bg-background text-xs font-semibold rounded-lg">
            Urutkan: terbaru ↓
          </button>
        </div>
        <div className="text-xs text-text-secondary">
          Menampilkan {mockStudyKitsList.length} materi · Semester ganjil 2026/2027
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockStudyKitsList.map((kit) => (
          <div
            key={kit.id}
            className="bg-surface border border-border rounded-2xl p-6 flex flex-col justify-between gap-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col gap-1.5">
              <div className="text-xs font-semibold text-amber-700">
                {kit.quiz_status === "completed"
                  ? "✓ Kuis selesai"
                  : kit.quiz_status === "unfinished"
                  ? "△ Kuis belum selesai"
                  : "○ Belum dikerjakan"}
              </div>
              <h3 className="text-lg font-bold text-text-main">{kit.course_name}</h3>
              <div className="text-sm text-text-secondary">{kit.topic_title}</div>
              <div className="text-xs text-text-muted mt-1">{kit.file_size_label}</div>
            </div>

            <Link
              href={`/study-kit/${kit.id}/ringkasan`}
              className="inline-flex items-center justify-center h-11 px-4 border border-border bg-surface hover:bg-background text-primary text-sm font-semibold rounded-xl transition-all"
            >
              {kit.quiz_status === "unfinished" ? "Lanjutkan belajar" : "Buka Study Kit"}
            </Link>
          </div>
        ))}
      </div>

      {/* Recent Activity Card */}
      <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
        <h2 className="text-base font-bold text-text-main">Aktivitas terbaru</h2>
        <div className="flex flex-col gap-3">
          {mockActivityLogs.map((act) => (
            <div key={act.id} className="flex items-start gap-3 p-3 bg-background rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-primary-light text-primary flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-text-main">{act.course_name}</div>
                <div className="text-xs text-text-secondary">{act.action_description}</div>
                <div className="text-[11px] text-text-muted mt-0.5">{act.created_at}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
