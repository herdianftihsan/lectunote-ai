// src/app/(study-kit)/study-kit/[id]/flashcard/page.tsx
// Halaman Flashcard Interaktif (PRD Golden Rule #5: 1-Card Flip Mode)
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { RotateCw, CheckCircle, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { mockStudyKitContent } from "@/lib/mock-data";

export default function FlashcardPage() {
  const params = useParams();
  const id = (params?.id as string) || "demo-jaringan-komputer";

  const cards = mockStudyKitContent.flashcards;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCount, setMasteredCount] = useState(2);

  const currentCard = cards[currentIndex] || cards[0];
  const progressPercent = ((currentIndex + 1) / cards.length) * 100;

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  };

  const handleMastered = () => {
    setMasteredCount((prev) => prev + 1);
    handleNext();
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Progress & Status Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-main">
            Kartu {currentIndex + 1} dari {cards.length}
          </h2>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-success bg-success-light px-3 py-1 rounded-full">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{masteredCount} kartu sudah paham</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Single Interactive Flip Card (PRD Golden Rule #5) */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full min-h-[340px] bg-surface border-2 border-border hover:border-primary/40 rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-sm cursor-pointer transition-all duration-200 select-none"
      >
        {!isFlipped ? (
          /* Sisi Depan (Pertanyaan) */
          <>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary bg-primary-light px-3 py-1 rounded-full uppercase tracking-wider">
                ○ Pertanyaan
              </span>
              <span className="text-xs text-text-muted flex items-center gap-1">
                <RotateCw className="w-3 h-3" />
                Klik kartu untuk membalik
              </span>
            </div>

            <div className="my-auto py-6">
              <h3 className="text-xl sm:text-2xl font-bold text-text-main leading-relaxed">
                {currentCard.question}
              </h3>
            </div>

            <div className="text-xs text-text-secondary">
              {currentCard.question_hint}
            </div>
          </>
        ) : (
          /* Sisi Belakang (Jawaban) */
          <>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal bg-teal-light px-3 py-1 rounded-full uppercase tracking-wider">
                ✓ Jawaban · Terbuka
              </span>
              <span className="text-xs text-text-muted flex items-center gap-1">
                <RotateCw className="w-3 h-3" />
                Klik untuk melihat pertanyaan
              </span>
            </div>

            <div className="my-auto py-6 flex flex-col gap-3">
              <h3 className="text-xl sm:text-2xl font-bold text-primary">
                {currentCard.answer_heading}
              </h3>
              <p className="text-sm sm:text-base text-text-main/90 leading-relaxed">
                {currentCard.answer_body}
              </p>
            </div>

            <div className="text-xs font-semibold text-primary">
              Rujukan contoh · {currentCard.page_reference}
            </div>
          </>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="inline-flex items-center gap-2 h-11 px-5 bg-surface border border-border disabled:opacity-40 hover:bg-background text-text-main text-xs sm:text-sm font-semibold rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Sebelumnya</span>
        </button>

        <button
          type="button"
          onClick={() => setIsFlipped(!isFlipped)}
          className="inline-flex items-center gap-2 h-11 px-6 bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all"
        >
          <RotateCw className="w-4 h-4" />
          <span>Balik kartu</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
          className="inline-flex items-center gap-2 h-11 px-5 bg-surface border border-border disabled:opacity-40 hover:bg-background text-text-main text-xs sm:text-sm font-semibold rounded-xl transition-all"
        >
          <span>Berikutnya</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Comprehension Assessment Card */}
      <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-text-main">Seberapa paham konsep ini?</h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Penandaan ini membantu mengatur pengulangan, bukan bagian dari skor kuis.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleNext}
            className="h-10 px-4 bg-surface border border-border hover:bg-background text-text-secondary text-xs font-semibold rounded-xl"
          >
            Pelajari lagi
          </button>
          <button
            type="button"
            onClick={handleMastered}
            className="h-10 px-4 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl shadow-xs"
          >
            Sudah paham
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="flex items-center gap-2 p-3 bg-teal-light text-teal rounded-xl text-xs font-semibold">
        <Sparkles className="w-4 h-4 shrink-0" />
        <span>Konten AI dapat kurang akurat. Periksa kembali dengan PDF sumber dan catatan dosen.</span>
      </div>

      {/* CTA Mulai Kuis */}
      <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-text-main">Siap menguji pemahamanmu?</h3>
          <p className="text-xs text-text-secondary mt-1">
            Kuis berisi 5 pilihan ganda dan 2 esai. Umpan balik ditampilkan setelah jawaban dikirim.
          </p>
        </div>
        <Link
          href={`/study-kit/${id}/kuis`}
          className="inline-flex items-center justify-center h-11 px-6 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl shadow-xs whitespace-nowrap"
        >
          Mulai Kuis
        </Link>
      </div>
    </div>
  );
}
