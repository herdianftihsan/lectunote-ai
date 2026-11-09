"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";

export interface QuizMultipleChoiceItem {
  question: string;
  options: string[];
}

export interface QuizEssayItem {
  question: string;
  topic?: string;
}

interface QuizEngineProps {
  studyKitId?: string;
  multipleChoice: QuizMultipleChoiceItem[];
  essay: QuizEssayItem[];
  courseName?: string;
  topicTitle?: string;
}

export default function QuizEngine({
  studyKitId,
  multipleChoice,
  essay,
  courseName,
  topicTitle,
}: QuizEngineProps) {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const effectiveId = (studyKitId || params?.id || "").trim();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const totalMcq = multipleChoice.length;
  const totalEssay = essay.length;
  const totalQuestions = totalMcq + totalEssay;

  const isMcq = activeIndex < totalMcq;
  const currentMcqIndex = isMcq ? activeIndex : -1;
  const currentEssayIndex = !isMcq ? activeIndex - totalMcq : -1;

  const currentMcqItem = isMcq ? multipleChoice[currentMcqIndex] : null;
  const currentEssayItem = !isMcq ? essay[currentEssayIndex] : null;

  function selectOption(questionIndex: number, optionIndex: number) {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [`mcq_${questionIndex}`]: String.fromCharCode(65 + optionIndex),
    }));
  }

  function updateEssay(essayIndex: number, answer: string) {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [`essay_${essayIndex}`]: answer,
    }));
  }

  async function submitAnswers() {
    if (!effectiveId) {
      setSubmitError("ID Study Kit tidak valid. Silakan muat ulang halaman.");
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 30_000);

    try {
      const mcq_answers = Array.from({ length: totalMcq }).map((_, i) => {
        const val = answers[`mcq_${i}`];
        if (!val) return -1;
        return val.charCodeAt(0) - 65; // 'A' -> 0, 'B' -> 1, dst.
      });

      const essay_answers = Array.from({ length: totalEssay }).map((_, i) => ({
        essay_number: i + 1,
        user_answer: answers[`essay_${i}`] ?? "",
      }));

      const response = await fetch("/api/evaluate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          study_kit_id: effectiveId,
          mcq_answers,
          essay_answers,
        }),
        signal: controller.signal,
      });

      const data: unknown = await response.json();

      if (
        !response.ok ||
        typeof data !== "object" ||
        data === null ||
        !("quiz_result" in data)
      ) {
        throw new Error(
          (typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof data.error === "string"
            ? data.error
            : null) ||
            "Gagal mengevaluasi kuis. Periksa koneksi internet Anda dan coba lagi.",
        );
      }

      // Berhasil dievaluasi, tutup modal dan langsung navigasikan ke halaman hasil kuis
      setShowSubmitModal(false);
      router.push(`/study-kit/${effectiveId}/hasil`);
      router.refresh();
    } catch (err: unknown) {
      console.error("Gagal submit kuis:", err);
      let errorMsg = "Terjadi gangguan saat mengevaluasi kuis.";
      if (err instanceof Error) {
        if (err.name === "AbortError") {
          errorMsg =
            "Waktu evaluasi kuis habis (timeout 30 detik). Silakan periksa kembali jawabanmu dan coba lagi.";
        } else {
          errorMsg = err.message;
        }
      }
      setSubmitError(errorMsg);
    } finally {
      clearTimeout(timeoutId);
      setIsSubmitting(false);
    }
  }

  // Count answered items
  const answeredMcqCount = Array.from({ length: totalMcq }).filter(
    (_, i) => Boolean(answers[`mcq_${i}`]),
  ).length;

  const answeredEssayCount = Array.from({ length: totalEssay }).filter(
    (_, i) => Boolean(answers[`essay_${i}`]?.trim()),
  ).length;

  const progressPercent =
    totalQuestions > 0 ? ((activeIndex + 1) / totalQuestions) * 100 : 0;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Back Link & Header Title */}
      <div className="flex flex-col gap-2">
        <Link
          href={`/study-kit/${effectiveId}/ringkasan`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Study Kit</span>
        </Link>
        <h1 className="text-3xl sm:text-[32px] font-bold text-text-main leading-tight tracking-tight">
          Kuis: {courseName || "Jaringan Komputer"}
        </h1>
        <p className="text-base text-text-secondary leading-normal">
          Uji pemahamanmu tentang {topicTitle || "Model OSI, TCP/IP, routing, dan subnetting"}. {totalMcq} pilihan ganda &amp; {totalEssay} esai.
        </p>
      </div>

      {/* Main Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
        {/* Left Column: Active Question Card */}
        <div className="flex flex-col gap-4 min-w-0">
          <section className="bg-surface border border-border rounded-2xl p-6 sm:p-8 flex flex-col gap-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            {/* Meta Row */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-light text-primary rounded-lg text-xs font-semibold">
                <span>{isMcq ? "◉" : "✍"}</span>
                <span>{isMcq ? "Pilihan Ganda" : "Pertanyaan Esai"}</span>
              </div>
              <div className="text-sm font-semibold text-text-secondary">
                {isMcq
                  ? `Soal ${currentMcqIndex + 1} dari ${totalMcq}`
                  : `Soal ${currentEssayIndex + 1} dari ${totalEssay}`}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Question Title & Instruction */}
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl sm:text-[28px] font-bold text-text-main leading-snug tracking-tight">
                {isMcq
                  ? currentMcqItem?.question
                  : currentEssayItem?.topic
                    ? `${currentEssayItem.topic}: ${currentEssayItem.question}`
                    : currentEssayItem?.question}
              </h2>
              <p className="text-sm font-medium text-text-secondary">
                {isMcq
                  ? "Pilih satu jawaban yang paling tepat:"
                  : "Tuliskan penjelasan terstruktur berdasarkan materi yang telah kamu pelajari:"}
              </p>
            </div>

            {/* MCQ Options View */}
            {isMcq && currentMcqItem && (
              <div className="flex flex-col gap-3">
                {currentMcqItem.options.map((option, optionIndex) => {
                  const letter = String.fromCharCode(65 + optionIndex);
                  const answerKey = `mcq_${currentMcqIndex}`;
                  const isSelected = answers[answerKey] === letter;

                  return (
                    <button
                      key={`${answerKey}_option_${optionIndex}`}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => selectOption(currentMcqIndex, optionIndex)}
                      className={`min-h-[64px] p-4 sm:px-5 rounded-xl border text-left transition-all flex items-center gap-4 cursor-pointer select-none ${
                        isSelected
                          ? "border-2 border-primary bg-primary-light shadow-2xs"
                          : "border-border bg-surface hover:bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      <div
                        className={`w-7 text-base font-semibold flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "text-primary font-bold"
                            : "text-text-secondary"
                        }`}
                      >
                        {letter}
                      </div>

                      <div className="flex-1 flex flex-col gap-1">
                        <span className="text-[15px] text-text-main leading-normal">
                          {option}
                        </span>
                        {isSelected && (
                          <div className="text-xs font-semibold text-primary flex items-center gap-1">
                            <span>✓</span>
                            <span>Pilihanmu</span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Essay Textarea View */}
            {!isMcq && currentEssayItem && (
              <div className="flex flex-col gap-2.5">
                <label
                  htmlFor={`essay-${currentEssayIndex}`}
                  className="text-sm font-bold text-text-main"
                >
                  Jawabanmu
                </label>
                <textarea
                  id={`essay-${currentEssayIndex}`}
                  rows={6}
                  value={answers[`essay_${currentEssayIndex}`] ?? ""}
                  onChange={(e) =>
                    updateEssay(currentEssayIndex, e.target.value)
                  }
                  placeholder="Tuliskan argumen atau analisis teknismu di sini secara mendalam..."
                  className="w-full min-h-[160px] p-4 rounded-xl border border-border bg-surface text-sm text-text-main focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/15 transition-all leading-relaxed"
                />
                <div className="text-xs text-text-secondary">
                  Usahakan sertakan contoh kasus dan alasan teknis dalam argumenmu.
                </div>
              </div>
            )}

            {/* Actions Row */}
            <div className="flex items-center gap-3 pt-3 border-t border-border flex-wrap">
              <button
                type="button"
                onClick={() => setActiveIndex((prev) => Math.max(0, prev - 1))}
                disabled={activeIndex === 0}
                className="inline-flex items-center gap-2 h-12 px-5 rounded-xl border border-border bg-surface text-primary text-sm font-semibold hover:bg-slate-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Soal sebelumnya</span>
              </button>

              {activeIndex < totalQuestions - 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setActiveIndex((prev) =>
                      Math.min(totalQuestions - 1, prev + 1),
                    )
                  }
                  className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-sm transition-all"
                >
                  <span>Soal berikutnya</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(true)}
                  className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-sm transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Selesai &amp; Kumpulkan Jawaban</span>
                </button>
              )}
            </div>
          </section>

          {/* Footnote Notice */}
          <div className="text-xs text-text-secondary px-2">
            Jawabanmu tersimpan secara otomatis. Kamu bebas berpindah nomor soal sebelum mengirim jawaban.
          </div>
        </div>

        {/* Right Column: Question Numbers & Status Sidebar */}
        <aside className="flex flex-col gap-5">
          {/* Card 1: Pilihan Ganda Nav */}
          <section className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex flex-col gap-0.5">
              <h3 className="text-lg font-bold text-text-main">
                Pilihan Ganda
              </h3>
              <div className="text-xs text-text-secondary">
                {totalMcq} soal pilihan ganda
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: totalMcq }).map((_, index) => {
                const isCurrent = activeIndex === index;
                const isAnswered = Boolean(answers[`mcq_${index}`]);

                return (
                  <button
                    key={`mcq-nav-${index}`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`h-11 rounded-lg font-semibold text-sm flex items-center justify-center transition-all ${
                      isCurrent
                        ? "bg-primary border-2 border-primary text-white shadow-[0_2px_6px_rgba(21,101,192,0.3)]"
                        : isAnswered
                          ? "bg-primary-light border border-primary text-primary"
                          : "bg-background border border-border text-primary hover:bg-white hover:border-primary"
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Card 2: Pertanyaan Esai Nav */}
          <section className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex flex-col gap-0.5">
              <h3 className="text-lg font-bold text-text-main">
                Pertanyaan Esai
              </h3>
              <div className="text-xs text-text-secondary">
                {totalEssay} soal studi kasus
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: totalEssay }).map((_, index) => {
                const questionIndex = totalMcq + index;
                const isCurrent = activeIndex === questionIndex;
                const isAnswered = Boolean(answers[`essay_${index}`]?.trim());

                return (
                  <button
                    key={`essay-nav-${index}`}
                    type="button"
                    onClick={() => setActiveIndex(questionIndex)}
                    className={`h-11 rounded-lg font-semibold text-sm flex items-center justify-center transition-all ${
                      isCurrent
                        ? "bg-primary border-2 border-primary text-white shadow-[0_2px_6px_rgba(21,101,192,0.3)]"
                        : isAnswered
                          ? "bg-primary-light border border-primary text-primary"
                          : "bg-background border border-border text-text-secondary hover:bg-white hover:border-slate-400"
                    }`}
                  >
                    Esai {index + 1}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Card 3: Status Ringkasan Jawaban */}
          <section className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <h3 className="text-lg font-bold text-text-main">
              Ringkasan Jawaban
            </h3>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between text-text-main font-semibold">
                <span>Pilihan Ganda</span>
                <span className="text-primary font-bold">
                  {answeredMcqCount} / {totalMcq} terisi
                </span>
              </div>
              <div className="flex items-center justify-between text-text-main font-semibold">
                <span>Esai</span>
                <span className="text-primary font-bold">
                  {answeredEssayCount} / {totalEssay} terisi
                </span>
              </div>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed pt-2 border-t border-border">
              Tekan tombol kumpulkan di soal terakhir untuk mengirim jawaban dan meminta penilaian evaluasi kualitatif dari AI.
            </p>

            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="mt-1 h-11 w-full rounded-xl border border-border bg-surface text-primary text-sm font-semibold hover:bg-background hover:border-slate-300 transition-all flex items-center justify-center text-center shadow-2xs"
            >
              Kumpulkan Jawaban
            </button>
          </section>
        </aside>
      </div>

      {/* Confirmation & Evaluation Modal Overlay (Ref: sattus&pemulihan.html State E) */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-surface border border-border rounded-2xl max-w-md w-full p-6 sm:p-8 flex flex-col gap-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {isSubmitting ? (
              <div className="flex flex-col items-center justify-center py-6 gap-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-teal-light text-teal flex items-center justify-center shadow-inner">
                  <Loader2 className="w-7 h-7 animate-spin" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-xl font-bold text-text-main">
                    AI sedang mengoreksi jawaban esai Anda...
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Mohon tunggu sebentar, sistem sedang menilai jawaban pilihan ganda dan menganalisis argumentasi esaimu untuk menyusun umpan balik akademis.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitError(null);
                      setShowSubmitModal(false);
                    }}
                    className="p-1 text-text-secondary hover:text-text-main rounded-lg hover:bg-background"
                    aria-label="Tutup"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col gap-1.5">
                  <h3 className="text-xl font-bold text-text-main">
                    Kumpulkan Jawaban Kuis?
                  </h3>
                  <p className="text-sm text-text-secondary leading-normal">
                    Kamu telah mengisi <strong>{answeredMcqCount} dari {totalMcq}</strong> soal PG dan <strong>{answeredEssayCount} dari {totalEssay}</strong> soal esai.
                  </p>
                </div>

                {submitError && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                    <span>{submitError}</span>
                  </div>
                )}

                {answeredMcqCount < totalMcq || answeredEssayCount < totalEssay ? (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                    <span>
                      Masih ada soal yang belum kamu jawab. Jawaban yang kosong tidak akan mendapatkan poin nilai.
                    </span>
                  </div>
                ) : null}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="flex-1 h-12 rounded-xl border border-border bg-surface text-primary font-semibold text-sm hover:bg-background transition-all"
                  >
                    Periksa Kembali
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={submitAnswers}
                    className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span>Kumpulkan Sekarang</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
