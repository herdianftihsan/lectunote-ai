// src/app/(study-kit)/study-kit/[id]/StudyKitHeader.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, ArrowLeft } from "lucide-react";

interface StudyKitHeaderRecord {
  course_name: string;
  topic_title: string;
  file_name: string;
  file_size_bytes: number | null;
}

interface StudyKitHeaderProps {
  id: string;
  studyKit: StudyKitHeaderRecord;
}

export default function StudyKitHeader({
  id,
  studyKit,
}: StudyKitHeaderProps) {
  const pathname = usePathname();

  const tabs = [
    {
      label: "Ringkasan",
      href: `/study-kit/${id}/ringkasan`,
      isActive: pathname.includes("/ringkasan"),
    },
    {
      label: "Flashcards",
      href: `/study-kit/${id}/flashcard`,
      isActive: pathname.includes("/flashcard"),
    },
    {
      label: "Kuis",
      href: `/study-kit/${id}/kuis`,
      isActive: pathname.includes("/kuis"),
    },
  ];

  const sizeInMegabytes =
    studyKit.file_size_bytes == null
      ? null
      : (studyKit.file_size_bytes / (1024 * 1024))
          .toFixed(1)
          .replace(".", ",");

  return (
    <section className="flex flex-col gap-5 w-full">
      {/* Title & Metadata Group */}
      <div className="flex flex-col gap-2">
        <Link
          href="/pustaka"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Pustaka Materi / Study Kit</span>
        </Link>

        <h1 className="text-3xl sm:text-[32px] font-bold text-text-main leading-tight tracking-tight">
          {studyKit.course_name} — {studyKit.topic_title || "Materi Pembelajaran"}
        </h1>
        <p className="text-sm sm:text-base text-text-secondary leading-normal">
          {studyKit.file_name}
          {sizeInMegabytes && ` · ${sizeInMegabytes} MB`}
          {" · 24 halaman"}
        </p>
      </div>

      {/* Badges Row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-light text-teal rounded-lg text-sm font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Dihasilkan AI</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-background border border-border text-text-secondary rounded-lg text-sm font-semibold">
          <span>○</span>
          <span>12 flashcards</span>
        </div>
      </div>

      {/* Segmented Tabs Navigation */}
      <nav
        aria-label="Navigasi fitur Study Kit"
        className="p-1 bg-surface border border-border rounded-xl flex items-center gap-1 w-full"
      >
        {tabs.map((tab) => {
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 h-12 flex items-center justify-center rounded-lg text-sm font-semibold transition-all ${
                tab.isActive
                  ? "bg-primary-light text-primary shadow-xs"
                  : "text-text-secondary hover:bg-slate-100 hover:text-text-main"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </section>
  );
}
