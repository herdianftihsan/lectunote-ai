// src/app/(study-kit)/study-kit/[id]/StudyKitHeader.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Sparkles, Layers, ArrowLeft } from "lucide-react";
import { mockStudyKitContent } from "@/lib/mock-data";

export default function StudyKitHeader() {
  const params = useParams();
  const pathname = usePathname();
  const id = (params?.id as string) || "demo-jaringan-komputer";

  const tabs = [
    { label: "Ringkasan", href: `/study-kit/${id}/ringkasan` },
    { label: "Flashcards", href: `/study-kit/${id}/flashcard` },
    { label: "Kuis", href: `/study-kit/${id}/kuis` },
  ];

  return (
    <section className="flex flex-col gap-4">
      <Link
        href="/pustaka"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline w-fit"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Pustaka Materi / Study Kit</span>
      </Link>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-main">
          {mockStudyKitContent.study_kit_metadata.course_name} —{" "}
          {mockStudyKitContent.study_kit_metadata.topic_title}
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary">
          Jaringan_Komputer_Bab_03.pdf · 2,4 MB · 24 halaman
        </p>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-light text-teal rounded-full text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Dihasilkan AI</span>
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface border border-border text-text-secondary rounded-full text-xs font-semibold">
          <Layers className="w-3.5 h-3.5" />
          <span>12 flashcards</span>
        </span>
      </div>

      {/* Segmented Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-border pb-1">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? "bg-primary text-white shadow-xs"
                  : "text-text-secondary hover:bg-surface hover:text-text-main"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
