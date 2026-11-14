// src/app/(study-kit)/study-kit/[id]/error.tsx
// Error Boundary untuk Ruang Belajar Study Kit
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

export default function StudyKitError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[StudyKitError] Error tak terduga pada materi Study Kit:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[420px] p-6 text-center w-full max-w-xl mx-auto">
      <div className="bg-surface border border-border rounded-2xl p-8 flex flex-col items-center gap-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] w-full">
        <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-danger shrink-0">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-text-main">
            Gagal Memuat Materi Belajar
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed max-w-md">
            Materi Study Kit tidak dapat ditampilkan saat ini. Pastikan materi tersebut belum dihapus atau coba muat ulang halaman.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 flex-wrap w-full pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-all shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Coba Muat Ulang</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl border border-border bg-surface hover:bg-background text-text-main text-sm font-semibold transition-all"
          >
            <Home className="w-4 h-4 text-text-secondary" />
            <span>Kembali ke Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
