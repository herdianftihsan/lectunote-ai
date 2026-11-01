// src/app/(study-kit)/study-kit/[id]/ringkasan/page.tsx
// Halaman Ringkasan Materi (Konversi dari ringkasan.html)
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Copy, Check, Sparkles, ArrowRight } from "lucide-react";
import { mockStudyKitContent } from "@/lib/mock-data";

export default function RingkasanPage() {
  const params = useParams();
  const id = (params?.id as string) || "demo-jaringan-komputer";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    let text = `${mockStudyKitContent.study_kit_metadata.course_name} — ${mockStudyKitContent.study_kit_metadata.topic_title}\n\n`;
    mockStudyKitContent.summary.sections.forEach((sec) => {
      text += `${sec.section_number} / ${sec.title}\n${sec.paragraphs.join("\n")}\n\n`;
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* AI Notice Banner */}
      <div className="flex items-center gap-2 p-3 bg-teal-light text-teal rounded-xl text-xs font-semibold">
        <Sparkles className="w-4 h-4 shrink-0" />
        <span>Konten AI dapat kurang akurat. Periksa kembali dengan PDF sumber dan catatan dosen.</span>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Left Column: Summary Content */}
        <div className="flex flex-col gap-6">
          <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
            {/* Header Row */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h2 className="text-xl font-bold text-text-main">Ringkasan materi</h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border hover:bg-slate-100 text-xs font-semibold rounded-lg text-text-main transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Tersalin" : "Salin"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => alert("Fitur pembuatan ulang ringkasan akan memanggil Gemini API.")}
                  className="px-3 py-1.5 text-xs font-semibold text-text-secondary hover:text-primary transition-colors"
                >
                  Buat ulang
                </button>
              </div>
            </div>

            <p className="text-xs font-semibold text-text-secondary">
              {mockStudyKitContent.study_kit_metadata.summary_goal}
            </p>

            {/* Sections 01 - 05 */}
            <div className="flex flex-col gap-8">
              {mockStudyKitContent.summary.sections.map((sec) => (
                <article
                  key={sec.section_number}
                  id={`section-${sec.section_number}`}
                  className="flex flex-col gap-3 scroll-mt-24"
                >
                  <h3 className="text-base sm:text-lg font-bold text-text-main">
                    {sec.section_number} / {sec.title}
                  </h3>
                  <div className="flex flex-col gap-2 text-sm leading-relaxed text-text-main/90">
                    {sec.paragraphs.map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))}
                    {sec.bullet_points.length > 0 && (
                      <ul className="list-disc pl-5 flex flex-col gap-1.5 mt-1 text-text-secondary text-xs sm:text-sm">
                        {sec.bullet_points.map((pt, idx) => (
                          <li key={idx}>{pt}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-primary hover:underline cursor-pointer w-fit">
                    Rujukan contoh · {sec.page_reference}
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* CTA Mulai Kuis */}
          <div>
            <Link
              href={`/study-kit/${id}/kuis`}
              className="inline-flex items-center gap-2 h-12 px-6 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
            >
              <span>Mulai Kuis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Right Column: TOC & Core Concepts */}
        <div className="flex flex-col gap-6">
          {/* TOC Card */}
          <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-3 shadow-sm">
            <h3 className="text-sm font-bold text-text-main">Dalam ringkasan ini</h3>
            <ul className="flex flex-col gap-2 text-xs font-medium text-text-secondary">
              {mockStudyKitContent.summary.sections.map((sec) => (
                <li key={sec.section_number}>
                  <a
                    href={`#section-${sec.section_number}`}
                    className="hover:text-primary transition-colors block py-0.5"
                  >
                    {sec.section_number} {sec.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Core Concepts Card */}
          <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-3 shadow-sm">
            <div className="text-xs font-bold text-teal bg-teal-light px-3 py-1 rounded-full w-fit">
              Konsep inti
            </div>
            <h3 className="text-sm font-bold text-text-main">Ingat perbedaannya</h3>
            <div className="flex flex-col gap-1.5 text-xs text-text-secondary">
              {mockStudyKitContent.summary.core_concepts.map((concept, idx) => (
                <div key={idx} className="p-2 bg-background rounded-lg font-medium">
                  {concept}
                </div>
              ))}
            </div>
          </div>

          {/* Start Quiz Card */}
          <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-3 shadow-sm">
            <h3 className="text-sm font-bold text-text-main">Sudah memahami intinya?</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Uji pemahaman lewat 5 pilihan ganda dan 2 esai. Jawaban dibahas setelah pengiriman.
            </p>
            <Link
              href={`/study-kit/${id}/kuis`}
              className="inline-flex items-center justify-center h-10 w-full bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl shadow-xs transition-all"
            >
              Mulai Kuis
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
