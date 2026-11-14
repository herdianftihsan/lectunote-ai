// src/app/(study-kit)/study-kit/[id]/hasil/page.tsx
// Pixel-Perfect Hasil Kuis View (1:1 _html_design_reference/hasil.html)

import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getActiveProfileId, getServerSupabase } from "@/lib/supabase";
import type {
  QuizEvaluationResult,
  StudyKitContent,
} from "@/types/study-kit";

export const instant = false;

interface HasilKuisPageProps {
  params: Promise<{ id: string }>;
}

interface StudyKitQueryResult {
  id: string;
  course_name: string;
  topic_title: string;
  kit_content: StudyKitContent | string | null;
}

interface ProfileQueryResult {
  full_name: string;
}

export default async function HasilKuisPage({ params }: HasilKuisPageProps) {
  await connection();
  const { id } = await params;
  const supabase = getServerSupabase();
  const profileId = await getActiveProfileId();

  const [studyKitResult, profileResult] = await Promise.all([
    supabase
      .from("study_kits")
      .select("id, course_name, topic_title, kit_content")
      .eq("id", id)
      .eq("profile_id", profileId)
      .maybeSingle<StudyKitQueryResult>(),
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", profileId)
      .maybeSingle<ProfileQueryResult>(),
  ]);

  if (studyKitResult.error) {
    const errorDetails =
      studyKitResult.error.message ||
      studyKitResult.error.code ||
      JSON.stringify(studyKitResult.error);
    console.error("[HasilKuisPage] Error mengambil data study kit:", errorDetails);
    throw new Error(`Gagal memuat data Study Kit: ${errorDetails}`, {
      cause: studyKitResult.error,
    });
  }

  if (!studyKitResult.data) {
    notFound();
  }

  const studyKit = studyKitResult.data;
  const profileName = profileResult.data?.full_name?.trim();
  const firstName = profileName?.split(/\s+/)[0] || "Aditya";
  const courseName = studyKit.course_name || "Materi Pembelajaran";

  let kitContent: StudyKitContent | null = null;
  if (typeof studyKit.kit_content === "string") {
    try {
      kitContent = JSON.parse(studyKit.kit_content) as StudyKitContent;
    } catch {
      kitContent = null;
    }
  } else if (
    studyKit.kit_content &&
    typeof studyKit.kit_content === "object"
  ) {
    kitContent = studyKit.kit_content;
  }

  // Ambil evaluasi tersimpan
  let evaluation: QuizEvaluationResult["quiz_result"] | null = null;
  if (kitContent?.last_evaluation) {
    const rawEval = kitContent.last_evaluation as unknown as Record<string, unknown>;
    if (rawEval.quiz_result && typeof rawEval.quiz_result === "object") {
      evaluation = rawEval.quiz_result as QuizEvaluationResult["quiz_result"];
    } else {
      evaluation = kitContent.last_evaluation;
    }
  }

  // Jika belum ada riwayat pengerjaan kuis sama sekali
  if (!evaluation) {
    return (
      <div className="flex flex-col gap-6 w-full py-4">
        <section className="flex flex-col gap-2">
          <div className="text-primary text-sm font-semibold leading-5">
            Hasil kuis / {courseName}
          </div>
          <h1 className="text-text-main text-3xl sm:text-[32px] font-semibold leading-[42px] tracking-tight">
            Belum ada evaluasi kuis
          </h1>
          <p className="text-text-secondary text-base font-normal leading-[26px]">
            Kamu belum mengerjakan kuis untuk materi ini. Uji pemahamanmu sekarang untuk mendapatkan penilaian pilihan ganda serta umpan balik AI untuk esai.
          </p>
        </section>

        <div className="bg-surface border border-border rounded-2xl p-8 flex flex-col items-center text-center gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="w-14 h-14 rounded-2xl bg-primary-light text-primary flex items-center justify-center font-bold text-xl">
            ✍
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-text-main">
              Mulai Kuis Sekarang
            </h2>
            <p className="text-sm text-text-secondary max-w-md">
              Kuis terdiri dari 5 soal pilihan ganda dan 2 pertanyaan esai konseptual.
            </p>
          </div>
          <Link
            href={`/study-kit/${id}/kuis`}
            className="h-12 px-6 bg-primary hover:bg-primary-hover rounded-xl text-white text-sm font-semibold inline-flex items-center justify-center transition-all shadow-[0_2px_4px_rgba(21,101,192,0.2)] mt-2"
          >
            Mulai Kuis
          </Link>
        </div>
      </div>
    );
  }

  const mcqScore = evaluation.mcq_score ?? 0;
  const correctCount = evaluation.correct_answers ?? 0;
  const wrongCount = evaluation.wrong_answers ?? 0;
  const totalMcq = correctCount + wrongCount || 5;
  const totalEssays = evaluation.essay_reviews?.length ?? 2;

  const priorityFocus = evaluation.priority_focus || {
    topic: "subnetting dan pengalamatan IPv4",
    reason: "Kamu memilih 256 host; jumlah itu mencakup alamat jaringan dan broadcast.",
  };

  const recommendation = evaluation.recommendation || {
    title: "Kuasai 256 alamat vs 254 host.",
    description: "Ulangi ringkasan subnet /24, tulis rentang host 192.168.1.0/24, lalu latih perbedaan alamat jaringan dan broadcast.",
    target_section_anchor: "#section-05",
  };

  const mcqOriginals = kitContent?.quiz?.multiple_choice ?? [];
  const essayOriginals = kitContent?.quiz?.essays ?? [];

  // Hitung offset lingkaran SVG (r = 72, keliling = 2 * pi * 72 ≈ 452)
  const circleRadius = 72;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset =
    circumference - (circumference * Math.max(0, Math.min(100, mcqScore))) / 100;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 1. Page Header Title Area */}
      <section className="flex flex-col gap-2">
        <div className="text-primary text-sm font-semibold leading-5">
          Hasil kuis / {courseName}
        </div>
        <h1 className="text-text-main text-3xl sm:text-[32px] font-semibold leading-[42px] tracking-tight">
          Langkah bagus, {firstName}!
        </h1>
        <p className="text-text-secondary text-base font-normal leading-[26px]">
          {mcqScore >= 80
            ? "Kamu sudah menguasai sebagian besar konsep. Mari perkuat bagian yang masih perlu latihan."
            : "Evaluasi jawabanmu menunjukkan konsep yang sudah dipahami dan bagian yang perlu diperdalam."}
        </p>
      </section>

      {/* 2. Score Summary Card (Ref: card-score-summary) */}
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        {/* Radial SVG Score Donut */}
        <div className="w-[168px] h-[168px] shrink-0 relative flex flex-col items-center justify-center">
          <svg
            className="w-full h-full -rotate-90 absolute inset-0"
            viewBox="0 0 168 168"
          >
            <circle
              cx="84"
              cy="84"
              r={circleRadius}
              className="fill-none stroke-border"
              strokeWidth="12"
            />
            <circle
              cx="84"
              cy="84"
              r={circleRadius}
              className="fill-none stroke-primary transition-all duration-1000"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <div className="flex flex-col items-center justify-center z-10">
            <div className="flex items-baseline">
              <span className="text-[40px] font-bold text-primary leading-none">
                {mcqScore}
              </span>
              <span className="text-lg font-bold text-text-secondary">/100</span>
            </div>
            <div className="text-xs text-text-secondary mt-1 font-normal">
              Skor pilihan ganda
            </div>
          </div>
        </div>

        {/* Score Details Group */}
        <div className="flex flex-col gap-3 flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-success-light text-success rounded-lg text-sm font-semibold w-fit mx-auto md:mx-0">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Kuis selesai</span>
          </div>

          <h2 className="text-2xl font-semibold text-text-main leading-8">
            {correctCount} dari {totalMcq} pilihan ganda benar
          </h2>

          <div className="flex items-center justify-center md:justify-start gap-6 flex-wrap text-lg leading-8">
            <span className="text-success font-medium">✓ {correctCount} benar</span>
            <span className="text-danger font-medium">× {wrongCount} salah</span>
            <span className="text-teal font-medium">
              ✧ {totalEssays} esai · Ditinjau AI secara terpisah
            </span>
          </div>

          <p className="text-sm font-semibold text-text-secondary leading-5">
            Skor {mcqScore}/100 hanya untuk {totalMcq} PG × 20 poin. Dua esai menerima umpan balik kualitatif AI dan tidak dihitung dalam skor ini.
          </p>
        </div>
      </div>

      {/* 3. Action Buttons Row (Ref: actions-row) */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link
          href={`/study-kit/${id}/kuis`}
          className="h-12 px-6 bg-primary hover:bg-primary-hover rounded-xl text-white text-sm font-semibold inline-flex items-center justify-center transition-all shadow-[0_2px_4px_rgba(21,101,192,0.2)]"
        >
          Coba Lagi
        </Link>
        <Link
          href={`/study-kit/${id}/ringkasan`}
          className="h-12 px-6 bg-surface border border-border hover:bg-slate-50 hover:border-slate-300 rounded-xl text-primary text-sm font-semibold inline-flex items-center justify-center transition-all shadow-2xs"
        >
          Kembali ke Study Kit
        </Link>
      </div>

      {/* 4. Amber Priority Banner (Ref: alert-priority-banner) */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-sm font-semibold leading-[22px] flex items-center gap-2.5">
        <span className="text-base shrink-0">⚠</span>
        <span>
          Prioritas belajarmu: {priorityFocus.topic}. {priorityFocus.reason}
        </span>
      </div>

      {/* 5. Multiple Choice Review Section (Ref: section-header) */}
      <section className="flex flex-col gap-2 mt-3">
        <h2 className="text-2xl sm:text-[32px] font-semibold text-text-main leading-[42px] tracking-tight">
          Tinjauan jawaban pilihan ganda
        </h2>
        <p className="text-base text-text-secondary font-normal leading-[26px]">
          Bandingkan jawabanmu dengan kunci dan pahami alasan di baliknya.
        </p>
      </section>

      {/* Question Review Cards */}
      <div className="flex flex-col gap-4">
        {evaluation.mcq_reviews?.map((review, idx) => {
          const original = mcqOriginals.find(
            (q) => q.question_number === review.question_number,
          ) || mcqOriginals[idx];

          const questionText =
            original?.question || `Pertanyaan #${review.question_number}`;
          const options = original?.options || [];

          const userSelectedText =
            review.user_selected_index >= 0 &&
            review.user_selected_index < options.length
              ? `${String.fromCharCode(65 + review.user_selected_index)}. ${options[review.user_selected_index]}`
              : review.user_selected_index >= 0
                ? `Opsi ${String.fromCharCode(65 + review.user_selected_index)}`
                : "Tidak dijawab";

          const correctText =
            review.correct_index >= 0 && review.correct_index < options.length
              ? `${String.fromCharCode(65 + review.correct_index)}. ${options[review.correct_index]}`
              : `Opsi ${String.fromCharCode(65 + review.correct_index)}`;

          return (
            <div
              key={`review-mcq-${review.question_number}`}
              className={`border rounded-2xl p-6 flex flex-col gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] ${
                review.is_correct
                  ? "bg-surface border-border"
                  : "bg-red-50/60 border-red-200"
              }`}
            >
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-semibold w-fit ${
                  review.is_correct
                    ? "bg-success-light text-success"
                    : "bg-red-100 text-danger"
                }`}
              >
                {review.is_correct ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span className="font-bold">!</span>
                )}
                <span>
                  Soal {review.question_number} ·{" "}
                  {review.is_correct ? "Benar" : "Salah"} ·{" "}
                  {review.is_correct ? "20/20 poin" : "0/20 poin"}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-text-main leading-[27px]">
                {questionText}
              </h3>

              <div className="flex flex-col gap-1.5 text-base leading-[27px]">
                <div
                  className={
                    review.is_correct
                      ? "text-text-main"
                      : "text-danger font-medium"
                  }
                >
                  Jawabanmu: {userSelectedText}
                </div>
                <div className="text-success font-semibold">
                  Kunci: {correctText}
                </div>
                <div className="text-text-main font-normal mt-1.5">
                  {review.explanation}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 6. Essay Feedback Section (Ref: essay-grid) */}
      <section className="flex flex-col gap-2 mt-3">
        <h2 className="text-2xl sm:text-[32px] font-semibold text-text-main leading-[42px] tracking-tight">
          Umpan balik esai
        </h2>
        <p className="text-base text-text-secondary font-normal leading-[26px]">
          Ditinjau AI secara kualitatif, bukan angka. Gunakan masukan ini untuk memperbaiki penjelasanmu.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {evaluation.essay_reviews?.map((essay, idx) => {
          const original = essayOriginals.find(
            (e) => e.essay_number === essay.essay_number,
          ) || essayOriginals[idx];

          const promptText =
            original?.prompt || "Pertanyaan esai tidak tersedia.";

          return (
            <div
              key={`essay-fb-${essay.essay_number}`}
              className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
            >
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-light text-teal rounded-lg text-sm font-semibold w-fit">
                <span>✧</span>
                <span>Ditinjau AI</span>
              </div>

              <h3 className="text-xl font-semibold text-text-main leading-7">
                Esai {essay.essay_number} / {essay.topic}
              </h3>

              <p className="text-sm font-normal text-text-main leading-6">
                {promptText}
              </p>

              <div className="text-sm font-semibold text-text-main leading-6">
                Jawabanmu
              </div>

              <p className="text-sm font-normal text-text-main leading-6 bg-background p-3.5 rounded-xl border border-border/60">
                {essay.user_answer || "(Jawaban tidak diisi)"}
              </p>

              <div className="p-4 bg-teal-light rounded-xl text-teal text-sm font-medium leading-[22px] flex items-start gap-2 mt-auto">
                <span className="shrink-0 mt-0.5">✧</span>
                <div className="flex flex-col gap-1.5">
                  <span>{essay.ai_feedback}</span>
                  {essay.improvements && (
                    <span className="text-xs text-teal/80">
                      <strong>Saran perbaikan:</strong> {essay.improvements}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 7. Recommendation Banner Card (Ref: card-recommendation) */}
      <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-900 rounded-lg text-sm font-semibold w-fit">
          <span>⚠</span>
          <span>Disarankan untukmu</span>
        </div>

        <h2 className="text-2xl font-semibold text-text-main leading-8">
          {recommendation.title}
        </h2>

        <p className="text-base text-text-main font-normal leading-[26px]">
          {recommendation.description}
        </p>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href={`/study-kit/${id}/ringkasan${recommendation.target_section_anchor || ""}`}
            className="h-12 px-6 bg-surface border border-border hover:bg-slate-50 hover:border-slate-300 rounded-xl text-primary text-sm font-semibold inline-flex items-center justify-center transition-all shadow-2xs"
          >
            Tinjau Bab Terkait
          </Link>
          <Link
            href={`/study-kit/${id}/flashcard`}
            className="h-12 px-6 bg-surface border border-border hover:bg-slate-50 hover:border-slate-300 rounded-xl text-primary text-sm font-semibold inline-flex items-center justify-center transition-all shadow-2xs"
          >
            Ulangi Flashcards
          </Link>
        </div>
      </div>

      {/* 8. Notice Banner (Ref: notice-banner) */}
      <div className="p-4 bg-teal-light rounded-xl text-teal text-sm font-semibold leading-[22px] flex items-center gap-2">
        <span>✧</span>
        <span>
          Konten AI dapat kurang akurat. Periksa kembali dengan PDF sumber dan catatan dosen.
        </span>
      </div>
    </div>
  );
}
