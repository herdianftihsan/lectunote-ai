// src/app/(quiz-focus)/study-kit/[id]/kuis/FocusHeader.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { X } from "lucide-react";

export default function FocusHeader() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const handleExit = () => {
    if (confirm("Apakah kamu yakin ingin keluar dari kuis? Progres jawabanmu tersimpan secara otomatis.")) {
      router.push(`/study-kit/${id}/ringkasan`);
    }
  };

  return (
    <header className="h-[72px] bg-surface border-b border-border flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30">
      <Link href="/" className="inline-flex items-center gap-3">
        <div className="w-9 h-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-[0_4px_10px_rgba(21,101,192,0.2)]">
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
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
        <div className="text-xl font-bold tracking-tight text-text-main">
          LectuNote <span className="text-teal">AI</span>
        </div>
      </Link>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-medium text-text-secondary">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Moda fokus</span>
        </div>
        <button
          type="button"
          onClick={handleExit}
          className="w-10 h-10 rounded-xl border border-border flex items-center justify-center text-text-secondary hover:bg-red-50 hover:text-danger hover:border-red-200 transition-colors"
          aria-label="Tutup kuis"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
