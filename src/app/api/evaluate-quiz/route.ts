// src/app/api/evaluate-quiz/route.ts
// Route Handler: Evaluasi Kuis PG & Ulasan Esai AI (PRD Section 5.2 Endpoint 2)
import { NextRequest, NextResponse } from "next/server";
import { QuizSubmissionPayload } from "@/types/study-kit";
import { mockQuizEvaluation } from "@/lib/mock-data";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as QuizSubmissionPayload;

    if (!body || !body.study_kit_id) {
      return NextResponse.json(
        { error: "Payload kuis tidak valid.", error_code: "INVALID_QUIZ_PAYLOAD" },
        { status: 400 }
      );
    }

    // TODO: Dev 2 can hook up Gemini grading logic here
    // Calculating score dynamically or returning validated mock structure
    return NextResponse.json(mockQuizEvaluation, { status: 200 });
  } catch (error) {
    console.error("Error evaluating quiz:", error);
    return NextResponse.json(
      {
        error: "Gagal memproses penilaian kuis.",
        error_code: "EVALUATION_FAILED",
      },
      { status: 500 }
    );
  }
}
