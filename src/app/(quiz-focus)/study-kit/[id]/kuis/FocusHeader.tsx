// src/app/(quiz-focus)/study-kit/[id]/kuis/FocusHeader.tsx
"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
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
      <Logo variant="sidebar" href="/" />

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
