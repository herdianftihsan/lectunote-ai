"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

export interface FlashcardViewerItem {
  question: string;
  question_hint?: string;
  answer_heading?: string;
  answer_body?: string;
  answer?: string;
  page_reference?: string;
}

interface FlashcardViewerProps {
  flashcards: FlashcardViewerItem[];
}

export default function FlashcardViewer({
  flashcards,
}: FlashcardViewerProps) {
  const { id } = useParams<{ id: string }>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<Set<number>>(new Set());

  const currentCard = flashcards[currentIndex];
  const total = flashcards.length;
  const progressPercent = total > 0 ? ((currentIndex + 1) / total) * 100 : 0;

  function navigateTo(index: number) {
    if (index >= 0 && index < total) {
      setCurrentIndex(index);
      setIsFlipped(false);
    }
  }

  function toggleMastered(index: number) {
    setMasteredCards((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  const isCurrentMastered = masteredCards.has(currentIndex);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Flashcard Top Status Row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-text-main">
          Kartu {currentIndex + 1} dari {total}
        </h2>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-success-light text-success rounded-lg text-sm font-semibold">
          <span>✓</span>
          <span>{masteredCards.size} kartu dikuasai</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Interactive 3D Flip Card */}
      <div
        className="w-full max-w-[520px] mx-auto aspect-[4/3] min-h-[360px] sm:min-h-[400px] [perspective:1200px] cursor-pointer select-none"
        onClick={() => setIsFlipped((prev) => !prev)}
      >
        <div
          className={`relative w-full h-full rounded-2xl transition-transform duration-500 [transform-style:preserve-3d] ${
            isFlipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          {/* Sisi Depan (Pertanyaan) */}
          <div className="absolute inset-0 flex flex-col justify-between rounded-2xl border border-primary bg-primary-light p-6 sm:p-8 shadow-[0_4px_12px_rgba(0,0,0,0.04)] [backface-visibility:hidden] overflow-y-auto">
            <div className="flex flex-col items-start gap-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary-dark rounded-lg text-sm font-semibold">
                <span>○</span>
                <span>Pertanyaan · Sisi depan</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-text-main leading-snug pt-2">
                {currentCard?.question ?? "Pertanyaan belum tersedia."}
              </h3>
            </div>

            <div className="flex items-center justify-between text-xs text-text-secondary pt-6 mt-auto">
              <span className="line-clamp-2">
                {currentCard?.question_hint
                  ? `Petunjuk: ${currentCard.question_hint}`
                  : "Klik kartu atau tekan tombol 'Balik kartu' untuk melihat jawaban."}
              </span>
              <span className="font-medium text-primary shrink-0 ml-2">Klik untuk balik ⟲</span>
            </div>
          </div>

          {/* Sisi Belakang (Jawaban) */}
          <div className="absolute inset-0 flex flex-col justify-between rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-[0_4px_12px_rgba(0,0,0,0.04)] [transform:rotateY(180deg)] [backface-visibility:hidden] overflow-y-auto">
            <div className="flex flex-col items-start gap-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-background text-text-secondary rounded-lg text-sm font-semibold">
                <span>✓</span>
                <span>Jawaban · Sisi belakang</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-text-main leading-snug pt-1">
                {currentCard?.answer_heading || currentCard?.answer || "Jawaban belum tersedia."}
              </h3>
              {currentCard?.answer_body && (
                <p className="text-sm sm:text-base text-text-main leading-relaxed mt-1">
                  {currentCard.answer_body}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-text-secondary pt-6 mt-auto border-t border-border">
              <span>
                Rujukan materi · {currentCard?.page_reference || "hlm. sumber"}
              </span>
              <span className="font-medium text-primary shrink-0 ml-2">Klik untuk balik ⟲</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Row */}
      <div className="flex items-center justify-center gap-3 flex-wrap max-w-[520px] mx-auto w-full">
        <button
          type="button"
          onClick={() => navigateTo(currentIndex - 1)}
          disabled={currentIndex === 0}
          className="inline-flex items-center gap-2 h-12 px-5 rounded-xl border border-border bg-surface text-primary text-sm font-semibold hover:bg-slate-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Sebelumnya</span>
        </button>

        <button
          type="button"
          onClick={() => setIsFlipped((prev) => !prev)}
          className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-all shadow-sm"
        >
          <RotateCw className="w-4 h-4" />
          <span>Balik kartu</span>
        </button>

        <button
          type="button"
          onClick={() => navigateTo(currentIndex + 1)}
          disabled={currentIndex === total - 1}
          className="inline-flex items-center gap-2 h-12 px-5 rounded-xl border border-border bg-surface text-primary text-sm font-semibold hover:bg-slate-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
        >
          <span>Berikutnya</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Comprehension Feedback Card */}
      <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] max-w-[520px] mx-auto w-full">
        <h3 className="text-lg font-bold text-text-main">
          Evaluasi pemahamanmu
        </h3>
        <p className="text-sm text-text-secondary leading-normal">
          Tandai apakah kamu sudah mengingat konsep ini sebelum melihat jawabannya.
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => {
              if (isCurrentMastered) toggleMastered(currentIndex);
              if (currentIndex < total - 1) navigateTo(currentIndex + 1);
            }}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-border bg-surface text-text-secondary hover:text-text-main text-sm font-semibold transition-all"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Masih ragu</span>
          </button>

          <button
            type="button"
            onClick={() => {
              toggleMastered(currentIndex);
              if (currentIndex < total - 1) navigateTo(currentIndex + 1);
            }}
            className={`inline-flex items-center gap-2 h-11 px-5 rounded-xl text-sm font-semibold transition-all ${
              isCurrentMastered
                ? "bg-success text-white"
                : "bg-teal-light text-teal hover:bg-teal/20"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isCurrentMastered ? "Sudah Dikuasai ✓" : "Sudah paham"}</span>
          </button>
        </div>
      </div>

      {/* Active Recall Notice Banner */}
      <div className="p-4 bg-teal-light text-teal rounded-xl text-sm font-semibold flex items-center gap-2.5">
        <Sparkles className="w-4 h-4 shrink-0" />
        <span>
          Metode active recall: usahakan mengingat sebelum membalik kartu untuk memperkuat ingatan jangka panjang.
        </span>
      </div>

      {/* CTA Quiz Card */}
      {id && (
        <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 flex flex-col gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <h3 className="text-2xl font-bold text-text-main">
            Sudah mengulang semua kartu?
          </h3>
          <p className="text-base text-text-secondary leading-normal">
            Uji pemahamanmu secara menyeluruh dengan kuis pilihan ganda dan pertanyaan esai.
          </p>
          <Link
            href={`/study-kit/${id}/kuis`}
            className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-sm transition-all w-fit mt-1"
          >
            <span>Mulai Kuis Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
