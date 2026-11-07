import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";
import { fetchStudyKitContent } from "@/lib/study-kit-content";

interface QuizResultPageProps {
  params: Promise<{ id: string }>;
}

export default async function HasilKuisPage({
  params,
}: QuizResultPageProps) {
  const { id } = await params;
  const studyKit = await fetchStudyKitContent(id);

  if (!studyKit.found) {
    notFound();
  }

  const courseName = studyKit.content?.study_kit_metadata?.course_name || "Materi Pembelajaran";
  const topicTitle = studyKit.content?.study_kit_metadata?.topic_title || "Evaluasi Belajar";
  const mcqQuestions = studyKit.content?.quiz?.multiple_choice ?? [];
  const essays = studyKit.content?.quiz?.essays ?? [];

  // Default demonstration score values aligning with hasil.html
  const score = 80;
  const correctCount = 4;
  const wrongCount = 1;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Title Area */}
      <div className="flex flex-col gap-2">
        <div className="text-sm font-semibold text-primary">
          03 Hasil kuis · Ringkasan skor &amp; pembahasan
        </div>
        <h1 className="text-3xl sm:text-[32px] font-bold text-text-main leading-tight tracking-tight">
          Hasil Kuis: {courseName}
        </h1>
        <p className="text-base text-text-secondary leading-normal">
          Evaluasi pemahaman untuk {topicTitle}. Skor pilihan ganda, prioritas materi yang perlu dipelajari ulang, dan umpan balik kualitatif AI.
        </p>
      </div>

      {/* Score Summary Card */}
      <section className="bg-surface border border-border rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        {/* Radial SVG Score Donut */}
        <div className="w-[168px] h-[168px] shrink-0 relative flex flex-col items-center justify-center">
          <svg className="w-full h-full -rotate-90 absolute inset-0" viewBox="0 0 168 168">
            <circle
              cx="84"
              cy="84"
              r="70"
              className="fill-none stroke-border"
              strokeWidth="14"
            />
            <circle
              cx="84"
              cy="84"
              r="70"
              className="fill-none stroke-primary"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={440}
              strokeDashoffset={440 - (440 * score) / 100}
            />
          </svg>
          <div className="flex flex-col items-center justify-center z-10">
            <div className="text-4xl font-bold text-primary leading-none">
              {score}
              <span className="text-lg text-text-secondary font-semibold">/100</span>
            </div>
            <div className="text-xs text-text-secondary mt-1">
              Skor Pilihan Ganda
            </div>
          </div>
        </div>

        {/* Score Details */}
        <div className="flex flex-col gap-3 flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-success-light text-success rounded-lg text-sm font-semibold w-fit mx-auto md:mx-0">
            <span>✓</span>
            <span>Kuis selesai dievaluasi</span>
          </div>

          <h2 className="text-2xl font-bold text-text-main leading-snug">
            Pemahaman Cukup Baik
          </h2>

          <div className="flex items-center justify-center md:justify-start gap-6 text-lg flex-wrap">
            <span className="text-success font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-5 h-5" />
              <span>{correctCount} Benar</span>
            </span>
            <span className="text-danger font-semibold flex items-center gap-1.5">
              <XCircle className="w-5 h-5" />
              <span>{wrongCount} Salah</span>
            </span>
            <span className="text-text-secondary font-medium">
              {essays.length} Esai dinilai
            </span>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-3 pt-2 flex-wrap">
            <Link
              href={`/study-kit/${id}/kuis`}
              className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-sm transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Coba Kuis Lagi</span>
            </Link>
            <Link
              href={`/study-kit/${id}/ringkasan`}
              className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-border bg-surface text-primary text-sm font-semibold hover:bg-slate-50 transition-all shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Ringkasan</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Recommended Priority Topic Banner */}
      <section className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col gap-2.5 text-amber-950 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="text-xs font-bold uppercase tracking-wider text-amber-800">
          Prioritas Belajar Ulang
        </div>
        <h3 className="text-lg font-bold">
          Fokuskan belajarmu ke topik: Subnetting dan Pengalamatan IPv4
        </h3>
        <p className="text-sm text-amber-900 leading-relaxed">
          Berdasarkan evaluasi kuis, pembedaan antara jumlah total alamat IP (/24 = 256) dengan jumlah host yang dapat dialokasikan (254 host) perlu ditinjau ulang di Bab 05.
        </p>
        <Link
          href={`/study-kit/${id}/ringkasan#section-05`}
          className="text-primary font-bold text-sm hover:underline inline-flex items-center gap-1.5 mt-1 w-fit"
        >
          <span>Buka Bab 05 di Ringkasan</span>
          <span>→</span>
        </Link>
      </section>

      {/* Review Soal Pilihan Ganda & Esai */}
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-text-main">
          Pembahasan Soal Pilihan Ganda
        </h2>

        <div className="flex flex-col gap-4">
          {mcqQuestions.map((q, idx) => {
            const isCorrect = idx !== 4; // demo: question 5 is the wrong one
            return (
              <article
                key={`review-mcq-${idx}`}
                className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                    Soal {idx + 1}
                  </span>
                  <div
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold ${
                      isCorrect
                        ? "bg-success-light text-success"
                        : "bg-red-50 text-danger border border-red-200"
                    }`}
                  >
                    {isCorrect ? "✓ Jawaban Benar" : "✕ Perlu Dipelajari Ulang"}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-text-main leading-snug">
                  {q.question}
                </h3>

                <div className="p-3.5 rounded-xl bg-background border border-border text-sm text-text-secondary leading-relaxed">
                  <strong className="text-text-main block mb-1">
                    Pembahasan:
                  </strong>
                  {q.explanation ||
                    "Jawaban tepat sesuai materi modul perkuliahan. Pastikan mengingat kembali konsep dasar layer dan fungsinya."}
                </div>
              </article>
            );
          })}
        </div>

        {/* Review Esai AI Feedback */}
        {essays.length > 0 && (
          <div className="flex flex-col gap-4 mt-4">
            <h2 className="text-2xl font-bold text-text-main">
              Evaluasi Jawaban Esai dari Gemini AI
            </h2>

            {essays.map((essay, idx) => (
              <article
                key={`review-essay-${idx}`}
                className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-primary">
                  <span>Esai {idx + 1}</span>
                  {essay.topic && <span>· {essay.topic}</span>}
                </div>

                <h3 className="text-lg font-bold text-text-main leading-snug">
                  {essay.prompt}
                </h3>

                <div className="p-4 bg-teal-light rounded-xl border border-teal/20 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-teal font-bold text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>Umpan Balik AI:</span>
                  </div>
                  <p className="text-sm text-text-main leading-relaxed">
                    Jawaban Anda menunjukkan pemahaman konseptual yang kuat mengenai perbedaan reliabilitas protokol transport. Analisis perbedaan overhead dan skenario penggunaan waktu nyata sudah tepat.
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
