// src/app/(dashboard)/page.tsx
// Halaman Dashboard Utama (Konversi dari dashboard.html)
import React from "react";
import Link from "next/link";
import { Plus, BookOpen, CheckCircle, TrendingUp, ArrowRight } from "lucide-react";
import { mockStudyKitsList, mockDefaultProfile } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Hero Greeting Section */}
      <section className="flex flex-col gap-3">
        <div className="text-sm font-semibold text-primary">
          Halo, {mockDefaultProfile.full_name.split(" ")[0]}. Siap memahami hal baru?
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-main">
              Belajar Lebih Cerdas.
            </h1>
            <p className="text-sm sm:text-base text-text-secondary mt-1">
              Ubah materi kuliah menjadi latihan belajar yang lebih terarah.
            </p>
          </div>
          <Link
            href="/unggah-materi"
            className="inline-flex items-center justify-center gap-2 h-12 px-5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl shadow-sm transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Study Kit Baru</span>
          </Link>
        </div>
      </section>

      {/* Stats 3-Cards Row */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-2xl p-6 flex items-center gap-4 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-text-main">12</div>
            <div className="text-sm font-semibold text-text-secondary">Study Kits</div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 flex items-center gap-4 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-text-main">8</div>
            <div className="text-sm font-semibold text-text-secondary">Kuis selesai</div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 flex items-center gap-4 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-text-main">80</div>
            <div className="text-sm font-semibold text-text-secondary">Rata-rata skor PG</div>
          </div>
        </div>
      </section>

      {/* Main Grid: Stream & Widgets */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          {/* Continue Card */}
          <div className="bg-primary rounded-2xl p-6 sm:p-8 text-white flex flex-col gap-3 shadow-md">
            <div className="text-xs font-bold tracking-wider uppercase opacity-90">
              LANJUTKAN DARI TERAKHIR
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">Jaringan Komputer</h2>
            <p className="text-sm sm:text-base opacity-95">
              Model OSI & TCP/IP — lanjutkan kuis yang belum selesai.
            </p>
            <div className="text-sm font-semibold opacity-90">
              2 dari 5 PG terisi · Esai belum dimulai
            </div>
            <div className="pt-2">
              <Link
                href="/study-kit/demo-jaringan-komputer/kuis"
                className="inline-flex items-center gap-2 h-11 px-5 bg-white text-primary hover:bg-slate-50 text-sm font-semibold rounded-xl transition-all"
              >
                <span>Lanjutkan Kuis</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Section Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-text-main">Materi terbaru</h2>
            <Link
              href="/pustaka"
              className="text-sm font-semibold text-primary hover:bg-primary-light px-3 py-1.5 rounded-lg transition-colors"
            >
              Lihat semua
            </Link>
          </div>

          {/* Materials Grid (2x2) */}
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
                  Buka Study Kit
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar Widgets */}
        <div className="flex flex-col gap-6">
          {/* Target Minggu Ini */}
          <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
            <h3 className="text-base font-bold text-text-main">Target minggu ini</h3>
            <div className="text-2xl font-bold text-text-main">3 / 4 sesi</div>
            <div className="h-2 w-full bg-border rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full w-3/4"></div>
            </div>
            <p className="text-sm text-text-secondary">
              Satu sesi lagi untuk mencapai target belajarmu.
            </p>
            <div className="bg-success-light text-success text-xs font-semibold px-3 py-1.5 rounded-lg w-fit">
              ✓ Teruskan ritmemu
            </div>
          </div>

          {/* New Material Widget */}
          <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-3 shadow-sm">
            <h3 className="text-base font-bold text-text-main">Ada materi baru?</h3>
            <p className="text-sm text-text-secondary">
              Mulai dari PDF, tambahkan catatan, lalu susun latihanmu.
            </p>
            <Link
              href="/unggah-materi"
              className="inline-flex items-center justify-center h-11 px-4 border border-border bg-surface hover:bg-background text-primary text-sm font-semibold rounded-xl transition-all"
            >
              Unggah Materi
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
