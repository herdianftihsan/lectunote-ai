// src/app/api/auth/logout/route.ts
// Logout API Handler (Clears Session Cookie)

import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/session";

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json({
    success: true,
    message: "Logout berhasil.",
  });

  clearSessionCookie(response);

  return response;
}
