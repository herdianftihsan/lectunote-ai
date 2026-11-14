// src/app/(auth)/layout.tsx
import React from "react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-background flex flex-col justify-between items-center px-4 py-8 sm:py-12">
      {/* Brand Header */}
      <header className="flex flex-col items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-3 text-inherit no-underline hover:opacity-90 transition-opacity"
        >
          <div className="w-10 h-11 bg-primary rounded-xl flex items-center justify-center shrink-0 shadow-[0_4px_10px_rgba(21,101,192,0.25)]">
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
              <path d="M4 5.5v15M8 7h7M8 10h5" />
              <path d="m14 13 5-5 2 2-5 5-3 1z" />
            </svg>
          </div>
          <div className="text-2xl font-bold leading-tight text-text-main tracking-tight">
            LectuNote <span className="text-teal">AI</span>
          </div>
        </Link>
        <p className="text-xs sm:text-sm text-text-secondary font-medium">
          Asisten Pembelajaran &amp; Generator Study Kit Berbasis AI
        </p>
      </header>

      {/* Main Form Content */}
      <main className="w-full max-w-[480px] my-6">
        {children}
      </main>

      {/* Auth Footer */}
      <footer className="text-center text-xs text-text-muted flex flex-col sm:flex-row items-center gap-2">
        <span>&copy; 2026 LectuNote AI. Seluruh hak cipta dilindungi.</span>
        <span className="hidden sm:inline">&bull;</span>
        <span>Ruang Belajar Mandiri Mahasiswa</span>
      </footer>
    </div>
  );
}
