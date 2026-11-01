// src/app/api/generate-kit/route.ts
// Route Handler: Buat Study Kit Baru (PRD Section 5.2 Endpoint 1)
import { NextRequest, NextResponse } from "next/server";
import { mockStudyKitContent } from "@/lib/mock-data";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const notes = formData.get("notes") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "Berkas PDF wajib diunggah.", error_code: "NO_FILE_PROVIDED" },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      return NextResponse.json(
        {
          error: "Format berkas belum didukung. Harap pilih berkas PDF.",
          error_code: "INVALID_FILE_FORMAT",
        },
        { status: 400 }
      );
    }

    // TODO: Dev 2 can hook up pdf-parse and Gemini Flash generation here
    // Automatic fallback data provided for seamless dev & testing
    const kitId = `kit-${Date.now()}`;

    return NextResponse.json(
      {
        id: kitId,
        message: "Study Kit berhasil dibuat.",
        content: {
          ...mockStudyKitContent,
          study_kit_metadata: {
            ...mockStudyKitContent.study_kit_metadata,
            course_name: file.name.replace(".pdf", "").replace(/_/g, " "),
          },
        },
        user_notes: notes || null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating study kit:", error);
    return NextResponse.json(
      {
        error: "Study Kit belum berhasil dibuat. Terjadi kendala teknis.",
        error_code: "GENERATION_FAILED",
      },
      { status: 500 }
    );
  }
}
