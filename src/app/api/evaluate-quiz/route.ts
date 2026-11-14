// src/app/api/evaluate-quiz/route.ts
// Hybrid Evaluation Engine (PRD Section 5.2, Endpoint 2)

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  evaluateEssays,
  generateQuizInsights,
  type EssayInputForEvaluation,
  type WrongMcqInput,
} from "@/lib/gemini";
import {
  getActiveProfile,
  getAuthenticatedProfileId,
  getServiceSupabase,
} from "@/lib/supabase";
import type {
  EssayQuestion,
  EssayReviewItem,
  McqQuestion,
  McqReviewItem,
  QuizEvaluationResult,
  QuizSubmissionPayload,
  StudyKitContent,
} from "@/types/study-kit";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface StudyKitDatabaseRow {
  id: string;
  profile_id?: string | null;
  course_name: string;
  topic_title: string;
  kit_content: StudyKitContent | string | null;
}

export async function POST(request: Request): Promise<NextResponse> {
  const tStart = performance.now();
  const profileId = await getAuthenticatedProfileId();
  if (!profileId) {
    return NextResponse.json(
      { error: "Sesi login tidak valid.", error_code: "UNAUTHENTICATED" },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "Request body harus berupa format JSON yang valid.",
        error_code: "INVALID_JSON_BODY",
      },
      { status: 400 },
    );
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json(
      {
        error: "Payload kuis tidak valid.",
        error_code: "INVALID_SUBMISSION_PAYLOAD",
      },
      { status: 400 },
    );
  }

  const payload = body as Partial<QuizSubmissionPayload>;
  const studyKitId = payload.study_kit_id?.trim();

  // Validasi format UUID untuk study_kit_id
  if (!studyKitId || !UUID_REGEX.test(studyKitId)) {
    return NextResponse.json(
      {
        error: "study_kit_id tidak valid. Harus berupa format UUID.",
        error_code: "INVALID_STUDY_KIT_ID",
      },
      { status: 400 },
    );
  }

  const rawMcqAnswers = Array.isArray(payload.mcq_answers)
    ? payload.mcq_answers
    : [];
  const rawEssayAnswers = Array.isArray(payload.essay_answers)
    ? payload.essay_answers
    : [];

  let supabase;
  try {
    supabase = getServiceSupabase();
  } catch (err: unknown) {
    console.error("[evaluate-quiz] Gagal inisialisasi Supabase service role:", err);
    return NextResponse.json(
      {
        error: "Layanan database belum terkonfigurasi dengan benar.",
        error_code: "DATABASE_NOT_CONFIGURED",
      },
      { status: 500 },
    );
  }

  // 1. Ambil Kunci Jawaban Asli dari Server (Server-Side Truth)
  const tFetchStart = performance.now();
  const { data: studyKitRow, error: fetchError } = await supabase
    .from("study_kits")
    .select("id, profile_id, course_name, topic_title, kit_content")
    .eq("id", studyKitId)
    .eq("profile_id", profileId)
    .maybeSingle<StudyKitDatabaseRow>();
  const tFetchEnd = performance.now();

  if (fetchError || !studyKitRow) {
    return NextResponse.json(
      {
        error: "Study Kit tidak ditemukan.",
        error_code: "STUDY_KIT_NOT_FOUND",
      },
      { status: 404 },
    );
  }

  let content: StudyKitContent | null = null;
  if (typeof studyKitRow.kit_content === "string") {
    try {
      content = JSON.parse(studyKitRow.kit_content) as StudyKitContent;
    } catch {
      content = null;
    }
  } else if (
    typeof studyKitRow.kit_content === "object" &&
    studyKitRow.kit_content !== null
  ) {
    content = studyKitRow.kit_content;
  }

  const mcqs: McqQuestion[] = content?.quiz?.multiple_choice ?? [];
  const essays: EssayQuestion[] = content?.quiz?.essays ?? [];

  if (mcqs.length === 0 && essays.length === 0) {
    return NextResponse.json(
      {
        error: "Konten kuis pada Study Kit ini belum tersedia atau masih diproses.",
        error_code: "QUIZ_CONTENT_NOT_FOUND",
      },
      { status: 404 },
    );
  }

  try {
    // 2. Hybrid Grading Engine - Bagian A: Pilihan Ganda (Deterministik Server O(N))
    const tMcqStart = performance.now();
    let correctCount = 0;
    let wrongCount = 0;
    const mcqReviews: McqReviewItem[] = [];
    const wrongMcqsForInsights: WrongMcqInput[] = [];

    mcqs.forEach((mcq, idx) => {
      const questionNumber = mcq.question_number ?? idx + 1;
      const userSelected =
        typeof rawMcqAnswers[idx] === "number" ? rawMcqAnswers[idx] : -1;
      const isCorrect = userSelected === mcq.correct_index;

      if (isCorrect) {
        correctCount++;
      } else {
        wrongCount++;
        const userChoiceText =
          userSelected >= 0 && userSelected < mcq.options.length
            ? `${String.fromCharCode(65 + userSelected)}. ${mcq.options[userSelected]}`
            : "Tidak dijawab";
        const correctChoiceText =
          mcq.correct_index >= 0 && mcq.correct_index < mcq.options.length
            ? `${String.fromCharCode(65 + mcq.correct_index)}. ${mcq.options[mcq.correct_index]}`
            : "Kunci belum ditentukan";

        wrongMcqsForInsights.push({
          question_number: questionNumber,
          question: mcq.question,
          user_answer: userChoiceText,
          correct_answer: correctChoiceText,
          explanation: mcq.explanation ?? "",
        });
      }

      mcqReviews.push({
        question_number: questionNumber,
        is_correct: isCorrect,
        user_selected_index: userSelected,
        correct_index: mcq.correct_index,
        explanation: mcq.explanation ?? "",
      });
    });

    const mcqScore = correctCount * 20; // 5 soal PG masing-masing bernilai 20 poin (0 - 100)
    const tMcqEnd = performance.now();

    // 2. Hybrid Grading Engine - Bagian B: Esai (Gemini AI Penilai Esai)
    const tEssayStart = performance.now();
    const userEssayMap = new Map<number, string>();
    for (const item of rawEssayAnswers) {
      if (
        typeof item.essay_number === "number" &&
        typeof item.user_answer === "string"
      ) {
        userEssayMap.set(item.essay_number, item.user_answer);
      }
    }

    const essaysToGrade: EssayInputForEvaluation[] = essays.map((eq, idx) => {
      const essayNum = eq.essay_number ?? idx + 1;
      return {
        id: essayNum,
        topic: eq.topic,
        prompt: eq.prompt,
        reference_points: eq.reference_points,
        user_answer: userEssayMap.get(essayNum) ?? "",
      };
    });

    // Panggil fungsi penilai esai (dengan Zero-Token Optimization & Hard Timeout 20s internal)
    const activeProfile = await getActiveProfile().catch(() => null);
    const evaluatedEssays = await evaluateEssays(essaysToGrade, {
      programStudi: activeProfile?.program_studi,
      university: activeProfile?.university,
      semester: activeProfile?.semester,
    });
    const tEssayEnd = performance.now();

    const essayReviews: EssayReviewItem[] = essays.map((eq, idx) => {
      const essayNum = eq.essay_number ?? idx + 1;
      const evaluated = evaluatedEssays.find((e) => e.id === essayNum);
      const userAnswer = userEssayMap.get(essayNum) ?? "";

      return {
        essay_number: essayNum,
        topic: eq.topic || `Esai ${essayNum}`,
        user_answer: userAnswer,
        ai_feedback:
          evaluated?.feedback ??
          "Jawaban esai telah dicatat dan ditinjau oleh sistem.",
        score: evaluated?.score ?? 0,
        strengths: evaluated?.strengths,
        improvements: evaluated?.improvements,
      };
    });

    // 2. Hybrid Grading Engine - Bagian C: Kalkulasi Skor Tertimbang Total
    const avgEssayScore =
      evaluatedEssays.length > 0
        ? Math.round(
            evaluatedEssays.reduce((acc, curr) => acc + curr.score, 0) /
              evaluatedEssays.length,
          )
        : 0;

    // Bobot: 60% Pilihan Ganda + 40% Esai
    const totalWeightedScore = Math.round(
      mcqScore * 0.6 + avgEssayScore * 0.4,
    );

    // 2. Hybrid Grading Engine - Bagian D: Priority Focus & Rekomendasi (Deterministik instan)
    const summarySections = content?.summary?.sections ?? [];
    const insights = await generateQuizInsights({
      courseName: studyKitRow.course_name,
      topicTitle: studyKitRow.topic_title,
      wrongMcqs: wrongMcqsForInsights,
      sections: summarySections.map((s) => ({
        section_number: s.section_number,
        title: s.title,
      })),
    });

    // 3. Bangun Objek Hasil Evaluasi Kuis (Sesuai Kontrak PRD 5.1)
    const evaluationResult: QuizEvaluationResult = {
      quiz_result: {
        mcq_score: mcqScore,
        correct_answers: correctCount,
        wrong_answers: wrongCount,
        priority_focus: insights.priority_focus,
        recommendation: insights.recommendation,
        mcq_reviews: mcqReviews,
        essay_reviews: essayReviews,
        total_score: totalWeightedScore,
        essay_score: avgEssayScore,
        evaluated_at: new Date().toISOString(),
      },
    };

    // 4. Persistensi Database (Supabase)
    const tDbStart = performance.now();
    let studyKitUpdateDuration = 0;
    let activityLogDuration = 0;
    if (content) {
      const updatedKitContent: StudyKitContent = {
        ...content,
        last_evaluation: evaluationResult.quiz_result,
      };

      // Simpan perubahan ke study_kits (kit_content menyimpan last_evaluation lengkap, plus last_score)
      const updatePayload: Record<string, unknown> = {
        quiz_status: "completed",
        kit_content: updatedKitContent,
        last_score: mcqScore,
      };

      const tUpdateStart = performance.now();
      const { error: updateError } = await supabase
        .from("study_kits")
        .update(updatePayload)
        .eq("id", studyKitId);
      studyKitUpdateDuration = performance.now() - tUpdateStart;

      if (updateError) {
        console.error(
          "[evaluate-quiz] Gagal menyimpan hasil evaluasi ke study_kits:",
          updateError,
        );
        return NextResponse.json(
          {
            error:
              "Hasil kuis sudah dinilai, tetapi gagal disimpan. Silakan coba kirim kembali.",
            error_code: "EVALUATION_PERSISTENCE_FAILED",
          },
          { status: 500 },
        );
      }
    }

    // Catat ke tabel activity_logs (best effort: jangan gagalkan respons utama jika log gagal)
    const tActivityLogStart = performance.now();
    try {
      const { error: activityLogError } = await supabase
        .from("activity_logs")
        .insert({
          profile_id: studyKitRow.profile_id || profileId,
          study_kit_id: studyKitId,
          course_name: studyKitRow.course_name || "Materi Pembelajaran",
          activity_type: "complete_quiz",
          action_description: `Kuis "${studyKitRow.course_name}" diselesaikan dengan skor ${mcqScore}/100`,
          score: mcqScore,
        });
      if (activityLogError) {
        console.warn(
          "[evaluate-quiz] Gagal insert activity_logs (diabaikan):",
          activityLogError.message,
        );
      }
    } catch (logErr) {
      console.warn(
        "[evaluate-quiz] Gagal insert activity_logs (diabaikan):",
        logErr,
      );
    } finally {
      activityLogDuration = performance.now() - tActivityLogStart;
    }
    const tDbEnd = performance.now();

    // Log performa lengkap di setiap tahap
    console.log(`[evaluate-quiz] ⏱️ PERFORMANCE AUDIT:
- 1. Fetch study_kits: ${Math.round(tFetchEnd - tFetchStart)}ms
- 2. MCQ Grading: ${Math.round(tMcqEnd - tMcqStart)}ms
- 3. Gemini evaluateEssays: ${Math.round(tEssayEnd - tEssayStart)}ms
- 4. Update study_kits: ${Math.round(studyKitUpdateDuration)}ms
- 5. Insert activity_logs: ${Math.round(activityLogDuration)}ms
- DB Persistence & Logs: ${Math.round(tDbEnd - tDbStart)}ms
- TOTAL API DURATION: ${Math.round(tDbEnd - tStart)}ms`);

    // 5. Revalidasi cache rute hasil & pustaka
    try {
      revalidatePath(`/study-kit/${studyKitId}/hasil`);
      revalidatePath(`/study-kit/${studyKitId}`);
      revalidatePath("/pustaka");
      revalidatePath("/");
    } catch (revalidateErr) {
      console.warn("[evaluate-quiz] Gagal revalidatePath (diabaikan):", revalidateErr);
    }

    // 6. Kembalikan Respons JSON HTTP 200
    const response = NextResponse.json(evaluationResult, { status: 200 });
    response.headers.set(
      "Server-Timing",
      [
        `study-kits-fetch;dur=${(tFetchEnd - tFetchStart).toFixed(1)}`,
        `mcq-grading;dur=${(tMcqEnd - tMcqStart).toFixed(1)}`,
        `gemini-essays;dur=${(tEssayEnd - tEssayStart).toFixed(1)}`,
        `study-kits-update;dur=${studyKitUpdateDuration.toFixed(1)}`,
        `activity-logs-insert;dur=${activityLogDuration.toFixed(1)}`,
        `total;dur=${(tDbEnd - tStart).toFixed(1)}`,
      ].join(", "),
    );
    return response;
  } catch (error: unknown) {
    console.error("[evaluate-quiz] Terjadi kesalahan saat evaluasi kuis:", error);
    return NextResponse.json(
      {
        error:
          "Terjadi kendala teknis saat mengevaluasi kuis. Silakan coba lagi.",
        error_code: "EVALUATION_FAILED",
      },
      { status: 500 },
    );
  }
}
