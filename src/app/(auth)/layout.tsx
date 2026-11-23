// src/app/(auth)/layout.tsx
import React from "react";
import { Logo } from "@/components/brand/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-background flex flex-col justify-between items-center px-4 py-8 sm:py-12">
      {/* Brand Header */}
      <header className="flex flex-col items-center gap-2 mb-1">
        <Logo variant="auth" href="/" />
        <p className="text-xs sm:text-sm text-text-secondary font-medium text-center">
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
