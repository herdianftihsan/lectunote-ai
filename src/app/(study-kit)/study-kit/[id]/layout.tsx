// src/app/(study-kit)/study-kit/[id]/layout.tsx
// Server Layout untuk Study Kit dengan Suspense boundary
import React, { Suspense } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import StudyKitHeader from "./StudyKitHeader";

export default function StudyKitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-border bg-surface p-6 sticky top-0 h-screen overflow-y-auto">
        <div className="flex flex-col gap-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-sm">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="text-xl font-bold tracking-tight text-text-main">
              LectuNote <span className="text-teal">AI</span>
            </div>
          </Link>
          <div className="text-[11px] font-bold tracking-wider text-text-secondary uppercase">
            Ruang Belajar
          </div>
          <nav className="flex flex-col gap-1.5">
            <Link
              href="/"
              className="px-3.5 py-2.5 rounded-xl text-sm font-semibold text-text-secondary hover:bg-background hover:text-primary transition-all"
            >
              Dashboard
            </Link>
            <Link
              href="/unggah-materi"
              className="px-3.5 py-2.5 rounded-xl text-sm font-semibold text-text-secondary hover:bg-background hover:text-primary transition-all"
            >
              Unggah Materi
            </Link>
            <Link
              href="/pustaka"
              className="px-3.5 py-2.5 rounded-xl text-sm font-semibold text-text-secondary hover:bg-background hover:text-primary transition-all"
            >
              Pustaka Materi
            </Link>
            <Link
              href="/pengaturan"
              className="px-3.5 py-2.5 rounded-xl text-sm font-semibold text-text-secondary hover:bg-background hover:text-primary transition-all"
            >
              Pengaturan
            </Link>
          </nav>
        </div>

        <div className="pt-5 border-t border-border flex flex-col gap-1">
          <div className="text-sm font-semibold text-text-main">Aditya Ramadhan</div>
          <div className="text-xs text-text-secondary">Mahasiswa teknik</div>
        </div>
      </aside>

      {/* Main Study Kit Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-4 sm:p-6 lg:p-10 max-w-7xl w-full mx-auto flex flex-col gap-6">
          <Suspense fallback={<div className="h-32 bg-surface animate-pulse rounded-2xl" />}>
            <StudyKitHeader />
          </Suspense>

          {/* Child Page Content */}
          <main>
            <Suspense fallback={<div className="p-8 text-center text-xs text-text-secondary">Memuat materi...</div>}>
              {children}
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}
