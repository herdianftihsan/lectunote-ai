// src/app/(quiz-focus)/study-kit/[id]/kuis/page.tsx
// Gabungan State Kuis PG & Esai (PRD Golden Rule #4)
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Send, AlertCircle } from "lucide-react";
import { mockStudyKitContent } from "@/lib/mock-data";

export default function QuizSessionPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || "demo-jaringan-komputer";

  const mcqs = mockStudyKitContent.quiz.multiple_choice;
  const essays = mockStudyKitContent.quiz.essays;

  // Active step: 1..5 for MCQs, 6 for Essay 1, 7 for Essay 2
  const [currentStep, setCurrentStep] = useState(1);
  const [mcqAnswers, setMcqAnswers] = useState<Record<number, number>>({ 1: 1, 2: 0, 3: 2 });
  const [essayAnswers, setEssayAnswers] = useState<Record<number, string>>({
    1: "TCP menjaga pengiriman data tetap andal dan berurutan melalui acknowledgment serta retransmisi. Saya memilih TCP untuk transfer berkas agar data lengkap. UDP tidak menjamin urutan atau kedatangan dan overhead-nya lebih kecil.",
    2: "Data aplikasi turun ke transport dan menjadi segmen TCP atau datagram UDP. Kemudian IP menambahkan informasi alamat menjadi paket. Data Link membungkus paket sebagai frame, lalu Physical mengirim bit.",
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Sync state to sessionStorage (PRD Golden Rule #4)
  useEffect(() => {
    const storageKey = `lectunote_active_quiz_${id}`;
    const saved = sessionStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.mcqAnswers) setMcqAnswers(parsed.mcqAnswers);
        if (parsed.essayAnswers) setEssayAnswers(parsed.essayAnswers);
      } catch (e) {
        console.error("Failed to parse saved quiz state", e);
      }
    }
  }, [id]);

  const saveToStorage = (newMcq = mcqAnswers, newEssay = essayAnswers) => {
    sessionStorage.setItem(
      `lectunote_active_quiz_${id}`,
      JSON.stringify({ mcqAnswers: newMcq, essayAnswers: newEssay })
    );
  };

  const handleSelectOption = (qNum: number, optIndex: number) => {
    const updated = { ...mcqAnswers, [qNum]: optIndex };
    setMcqAnswers(updated);
    saveToStorage(updated, essayAnswers);
  };

  const handleEssayChange = (essayNum: number, text: string) => {
    const updated = { ...essayAnswers, [essayNum]: text };
    setEssayAnswers(updated);
    saveToStorage(mcqAnswers, updated);
  };

  const isMcqMode = currentStep <= 5;
  const currentMcq = mcqs[currentStep - 1];
  const currentEssay = isMcqMode ? null : essays[currentStep - 6];

  const handleSubmitQuiz = () => {
    setShowConfirmModal(false);
    sessionStorage.removeItem(`lectunote_active_quiz_${id}`);
    router.push(`/study-kit/${id}/hasil`);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Back Link & Header */}
      <div className="flex flex-col gap-2">
        <Link
          href={`/study-kit/${id}/ringkasan`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Study Kit</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-main">
          Kuis {mockStudyKitContent.study_kit_metadata.course_name}
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary">
          {mockStudyKitContent.study_kit_metadata.topic_title} · 5 pilihan ganda + 2 esai
        </p>
      </div>

      {/* Main Grid: Quiz Form vs Sidebar Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Left Column: Question Area */}
        <div className="flex flex-col gap-6">
          <section className="bg-surface border border-border rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
            {/* Question Meta Row */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-xs font-bold text-primary bg-primary-light px-3 py-1 rounded-full">
                {isMcqMode ? "○ Pilihan ganda" : "✧ Soal Esai"}
              </span>
              <span className="text-xs font-semibold text-text-secondary">
                {isMcqMode
                  ? `Soal ${currentStep} dari 5`
                  : `Esai ${currentStep - 5} dari 2`}
              </span>
            </div>

            {/* MCQ View */}
            {isMcqMode && currentMcq && (
              <div className="flex flex-col gap-4">
                <h2 className="text-lg sm:text-xl font-bold text-text-main leading-relaxed">
                  {currentMcq.question}
                </h2>
                <p className="text-xs text-text-secondary">Pilih satu jawaban yang paling tepat.</p>

                {/* Options List */}
                <div className="flex flex-col gap-3">
                  {currentMcq.options.map((opt, idx) => {
                    const isSelected = mcqAnswers[currentStep] === idx;
                    const letter = String.fromCharCode(65 + idx);
                    return (
                      <div
                        key={idx}
                        onClick={() => handleSelectOption(currentStep, idx)}
                        className={`p-4 rounded-xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                          isSelected
                            ? "bg-primary-light/50 border-primary"
                            : "bg-surface border-border hover:bg-background"
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "bg-primary text-white"
                              : "bg-background text-text-secondary border border-border"
                          }`}
                        >
                          {letter}
                        </span>
                        <div className="text-xs sm:text-sm font-medium text-text-main flex-1">
                          {opt}
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Essay View */}
            {!isMcqMode && currentEssay && (
              <div className="flex flex-col gap-4">
                <h2 className="text-lg sm:text-xl font-bold text-text-main leading-relaxed">
                  Esai {currentStep - 5} / {currentEssay.topic}
                </h2>
                <p className="text-xs sm:text-sm text-text-main leading-relaxed">
                  {currentEssay.prompt}
                </p>

                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-xs font-bold text-text-main">Jawabanmu</label>
                  <textarea
                    rows={5}
                    value={essayAnswers[currentStep - 5] || ""}
                    onChange={(e) => handleEssayChange(currentStep - 5, e.target.value)}
                    placeholder="Tuliskan jawaban penjelasanmu..."
                    className="w-full p-4 border border-border rounded-xl text-xs sm:text-sm text-text-main focus:outline-none focus:border-primary resize-y"
                  />
                  <div className="text-[11px] text-text-secondary">
                    Gunakan kata-katamu sendiri. Periksa kembali sebelum mengirim.
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions Row */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                disabled={currentStep === 1}
                className="h-11 px-5 border border-border bg-surface disabled:opacity-40 hover:bg-background text-xs sm:text-sm font-semibold rounded-xl text-text-main"
              >
                Sebelumnya
              </button>

              {currentStep < 7 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => Math.min(7, prev + 1))}
                  className="inline-flex items-center gap-2 h-11 px-5 bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs"
                >
                  <span>Berikutnya</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(true)}
                  className="inline-flex items-center gap-2 h-11 px-6 bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Jawaban</span>
                </button>
              )}
            </div>
          </section>

          <p className="text-xs text-text-secondary">
            Jawaban benar dan pembahasan baru tersedia setelah seluruh jawaban dikirim.
          </p>
        </div>

        {/* Right Column: Quiz Navigation Sidebar */}
        <div className="flex flex-col gap-6">
          <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
            <h3 className="text-sm font-bold text-text-main">Navigasi soal</h3>
            <div className="text-xs text-text-secondary">Pilihan ganda · 5 soal</div>

            {/* MCQ 1-5 Grid */}
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((num) => {
                const isAnswered = mcqAnswers[num] !== undefined;
                const isActive = currentStep === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCurrentStep(num)}
                    className={`h-10 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-primary text-white shadow-xs"
                        : isAnswered
                        ? "bg-primary-light text-primary border border-primary/40"
                        : "bg-background border border-border text-text-secondary hover:bg-slate-100"
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>

            <div className="text-xs text-text-secondary mt-2">Esai · 2 soal</div>
            <div className="grid grid-cols-2 gap-2">
              {[1, 2].map((num) => {
                const isActive = currentStep === num + 5;
                const isFilled = Boolean(essayAnswers[num]?.trim());
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCurrentStep(num + 5)}
                    className={`h-10 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-primary text-white shadow-xs"
                        : isFilled
                        ? "bg-primary-light text-primary border border-primary/40"
                        : "bg-background border border-border text-text-secondary hover:bg-slate-100"
                    }`}
                  >
                    Esai {num}
                  </button>
                );
              })}
            </div>

            <div className="text-[11px] text-text-muted leading-relaxed pt-2 border-t border-border">
              <strong>Biru terisi:</strong> sudah dijawab.<br />
              <strong>Biru penuh:</strong> soal aktif.<br />
              Urutan bebas sebelum dikirim.
            </div>
          </div>

          {/* Academic Integrity Card */}
          <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-2 shadow-sm text-xs text-text-secondary leading-relaxed">
            <div className="font-bold text-text-main flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-primary" />
              <span>Belajar dengan jujur</span>
            </div>
            <p>5 PG × 20 poin = 100 poin. Dua esai ditinjau AI secara kualitatif dan tidak masuk skor PG.</p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal Popup Overlay (PRD Golden Rule #4 & State E) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 max-w-md w-full flex flex-col gap-4 shadow-xl animate-in fade-in duration-200">
            <h3 className="text-xl font-bold text-text-main">Kirim jawaban sekarang?</h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              5 pilihan ganda dan 2 esai sudah terisi. Setelah dikirim, jawaban sesi ini tidak dapat diubah.
            </p>

            <div className="p-3 bg-success-light text-success rounded-xl text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Lengkap: 5/5 PG · 2/2 esai</span>
            </div>

            <div className="text-[11px] text-text-muted">
              Skor PG maksimal 100. Esai menerima umpan balik kualitatif AI terpisah.
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 h-11 border border-border bg-surface hover:bg-background text-text-main text-xs font-semibold rounded-xl"
              >
                Periksa lagi
              </button>
              <button
                type="button"
                onClick={handleSubmitQuiz}
                className="flex-1 h-11 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl shadow-xs"
              >
                Ya, kirim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
