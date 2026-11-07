import { NextResponse } from "next/server";

export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    {
      error: "Evaluasi kuis belum tersedia.",
      error_code: "EVALUATION_NOT_IMPLEMENTED",
    },
    { status: 501 },
  );
}
