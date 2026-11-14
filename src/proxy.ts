// src/middleware.ts
// Route Protection & Session Gatekeeper

import { NextResponse, type NextRequest } from "next/server";
import { getSessionProfileId, SESSION_COOKIE_NAME } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const profileId = await getSessionProfileId(sessionToken);
  const isAuthenticated = profileId !== null;

  const isAuthRoute = pathname === "/login" || pathname === "/register";

  // 1. Jika belum login dan mencoba mengakses halaman terproteksi, arahkan ke /login
  if (!isAuthenticated && !isAuthRoute) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Jika sudah login dan mencoba mengakses /login atau /register, arahkan ke dashboard
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Kecualikan:
     * - /api/* (Route Handlers)
     * - /_next/* (Next.js internals & static bundles)
     * - File statis gambar, ikon, fonts, pdf
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|pdf)$).*)",
  ],
};
