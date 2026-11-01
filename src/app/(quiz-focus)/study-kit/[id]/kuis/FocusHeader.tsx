// src/app/(quiz-focus)/study-kit/[id]/kuis/FocusHeader.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BookOpen, X } from "lucide-react";

export default function FocusHeader() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || "demo-jaringan-komputer";

  const handleExit = () => {
    if (confirm("Apakah kamu yakin ingin keluar dari kuis? Progres jawabanmu tersimpan secara otomatis.")) {
      router.push(`/study-kit/${id}/ringkasan`);
    }
  };

  return (
    <header className="h-18 bg-surface border-b border-border flex items-center justify-between px-4 sm:px-8 lg:px-12 sticky top-0 z-30">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="w-9 h-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-xs">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div className="text-xl font-bold tracking-tight text-text-main">
          LectuNote <span className="text-teal">AI</span>
        </div>
      </Link>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-medium text-text-secondary">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
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
