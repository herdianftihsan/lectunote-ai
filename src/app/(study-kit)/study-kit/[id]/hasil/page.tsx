// src/app/(study-kit)/study-kit/[id]/hasil/page.tsx
// Halaman Hasil Kuis & Umpan Balik AI (Konversi dari hasil.html)
"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Check, X, Sparkles, AlertTriangle, RotateCcw, ArrowLeft } from "lucide-react";
import { mockQuizEvaluation, mockStudyKitContent } from "@/lib/mock-data";

export default function HasilKuisPage() {
  const params = useParams();
  const id = (params?.id as string) || "demo-jaringan-komputer";
  const result = mockQuizEvaluation.quiz_result;

  return (
    <div className="flex flex-col gap-6">
      {/* Title Area */}
      <section className="flex flex-col gap-1">
        <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          Hasil kuis / {mockStudyKitContent.study_kit_metadata.course_name}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-main">
          Langkah bagus, Aditya!
        </h1>
        <p className="text-sm text-text-secondary">
          Kamu sudah menguasai sebagian besar konsep. Mari perkuat bagian yang masih perlu latihan.
        </p>
      </section>

      {/* Score Summary Card (Responsive Donut Chart) */}
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-8 shadow-sm">
        {/* Radial SVG Donut Score */}
        <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 168 168">
            <circle
              cx="84"
              cy="84"
              r="72"
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="14"
            />
            <circle
              cx="84"
              cy="84"
              r="72"
              fill="none"
              stroke="#1565C0"
              strokeWidth="14"
              strokeDasharray="452"
              strokeDashoffset={452 - (452 * result.mcq_score) / 100}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="text-3xl font-bold text-text-main leading-none">
              {result.mcq_score}
            </div>
            <div className="text-xs font-semibold text-text-muted">/100</div>
            <div className="text-[10px] text-text-secondary mt-1">Skor PG</div>
          </div>
        </div>

        {/* Breakdown Details */}
        <div className="flex flex-col gap-3">
          <div className="text-xs font-bold text-success bg-success-light px-3 py-1 rounded-full w-fit">
            ✓ Kuis selesai
          </div>
          <h2 className="text-xl font-bold text-text-main">
            {result.correct_answers} dari {result.correct_answers + result.wrong_answers} pilihan ganda benar
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
            <span className="text-success">✓ {result.correct_answers} benar</span>
            <span className="text-danger">× {result.wrong_answers} salah</span>
            <span className="text-teal">✧ 2 esai · Ditinjau AI secara terpisah</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Skor 80/100 hanya untuk 5 PG × 20 poin. Dua esai menerima umpan balik kualitatif AI dan tidak dihitung dalam skor ini.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Link
          href={`/study-kit/${id}/kuis`}
          className="inline-flex items-center gap-2 h-11 px-5 bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Coba Lagi</span>
        </Link>
        <Link
          href={`/study-kit/${id}/ringkasan`}
          className="inline-flex items-center gap-2 h-11 px-5 border border-border bg-surface hover:bg-background text-text-main text-xs sm:text-sm font-semibold rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Study Kit</span>
        </Link>
      </div>

      {/* Amber Priority Alert Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-900 text-xs sm:text-sm">
        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
        <span>
          <strong>Prioritas belajarmu:</strong> {result.priority_focus.topic}. {result.priority_focus.reason}
        </span>
      </div>

      {/* Multiple Choice Reviews */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-bold text-text-main">Tinjauan jawaban pilihan ganda</h2>
          <p className="text-xs text-text-secondary">
            Bandingkan jawabanmu dengan kunci dan pahami alasan di baliknya.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {result.mcq_reviews.map((rev) => (
            <div
              key={rev.question_number}
              className={`p-6 rounded-2xl border ${
                rev.is_correct
                  ? "bg-surface border-border"
                  : "bg-red-50/40 border-red-200"
              } flex flex-col gap-3 shadow-xs`}
            >
              <div className="flex items-center gap-2">
                {rev.is_correct ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-success bg-success-light px-2.5 py-0.5 rounded-md">
                    <Check className="w-3.5 h-3.5" />
                    <span>Soal {rev.question_number} · Benar · 20/20 poin</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-danger bg-red-100 px-2.5 py-0.5 rounded-md">
                    <X className="w-3.5 h-3.5" />
                    <span>Soal {rev.question_number} · Salah · 0/20 poin</span>
                  </span>
                )}
              </div>

              <div className="text-xs leading-relaxed text-text-secondary bg-background p-3.5 rounded-xl border border-border">
                <div className="font-semibold text-text-main mb-1">Pembahasan:</div>
                {rev.explanation}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Essay AI Feedback */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-bold text-text-main">Umpan balik esai</h2>
          <p className="text-xs text-text-secondary">
            Ditinjau AI secara kualitatif, bukan angka. Gunakan masukan ini untuk memperbaiki penjelasanmu.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.essay_reviews.map((es) => (
            <div
              key={es.essay_number}
              className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-xs"
            >
              <div className="text-xs font-bold text-teal bg-teal-light px-3 py-1 rounded-full w-fit">
                ✧ Ditinjau AI
              </div>
              <h3 className="text-base font-bold text-text-main">
                Esai {es.essay_number} / {es.topic}
              </h3>
              <div className="text-xs text-text-secondary bg-background p-3 rounded-xl">
                <strong className="block text-text-main mb-1">Jawabanmu:</strong>
                {es.user_answer}
              </div>
              <div className="p-3.5 bg-teal-light/50 border border-teal/20 rounded-xl text-xs text-text-main leading-relaxed flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-teal shrink-0 mt-0.5" />
                <span>{es.ai_feedback}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recommendation Card */}
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 flex flex-col gap-4 shadow-sm">
        <div className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full w-fit">
          ⚠ Disarankan untukmu
        </div>
        <h2 className="text-xl font-bold text-text-main">{result.recommendation.title}</h2>
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
          {result.recommendation.description}
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href={`/study-kit/${id}/ringkasan${result.recommendation.target_section_anchor}`}
            className="inline-flex items-center h-10 px-4 border border-border bg-surface hover:bg-background text-text-main text-xs font-semibold rounded-xl"
          >
            Tinjau Subnet /24
          </Link>
          <Link
            href={`/study-kit/${id}/flashcard`}
            className="inline-flex items-center h-10 px-4 border border-border bg-surface hover:bg-background text-text-main text-xs font-semibold rounded-xl"
          >
            Ulangi Flashcards
          </Link>
        </div>
      </div>
    </div>
  );
}
