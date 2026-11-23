import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import CopySummaryButton from "./CopySummaryButton";
import { fetchStudyKitContent } from "@/lib/study-kit-content";

interface RingkasanPageProps {
  params: Promise<{ id: string }>;
}

export default async function RingkasanPage({
  params,
}: RingkasanPageProps) {
  const { id } = await params;
  const studyKit = await fetchStudyKitContent(id);
  if (!studyKit.found) {
    notFound();
  }

  const content = studyKit.content;
  const sections = content?.summary?.sections ?? [];
  const coreConcepts = content?.summary?.core_concepts ?? [];
  const summaryGoal = content?.study_kit_metadata?.summary_goal;

  const summaryText = [
    [
      content?.study_kit_metadata?.course_name,
      content?.study_kit_metadata?.topic_title,
    ]
      .filter(Boolean)
      .join(" — "),
    summaryGoal ? `Tujuan: ${summaryGoal}` : "",
    ...sections.map((section) =>
      [
        [section.section_number, section.title].filter(Boolean).join(" / "),
        ...(section.paragraphs ?? []),
        ...(section.bullet_points ?? []).map((point) => `• ${point}`),
        section.page_reference
          ? `Rujukan contoh · ${section.page_reference}`
          : "",
      ]
        .filter(Boolean)
        .join("\n"),
    ),
  ].filter(Boolean).join("\n\n");

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Notice Banner */}
      <div className="flex items-center gap-2.5 rounded-xl bg-teal-light p-4 text-sm font-semibold text-teal">
        <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>
          Konten AI dapat kurang akurat. Periksa kembali dengan PDF sumber dan catatan dosen.
        </span>
      </div>

      {!content || sections.length === 0 ? (
        <section
          aria-live="polite"
          className="rounded-2xl border border-warning-border bg-warning-bg p-6 text-sm text-warning-text"
        >
          Konten AI sedang diproses atau gagal dimuat.
        </section>
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_288px]">
          {/* Left Column: Summary Content */}
          <div className="flex min-w-0 flex-col gap-6">
            <section className="flex flex-col gap-6 rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              {/* Summary Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
                <h2 className="text-2xl font-bold text-text-main">
                  Ringkasan materi
                </h2>
                <CopySummaryButton text={summaryText} />
              </div>

              {summaryGoal && (
                <p className="text-base leading-relaxed text-text-secondary">
                  <strong>Tujuan:</strong> {summaryGoal}
                </p>
              )}

              {/* Sections List */}
              <div className="flex flex-col gap-8">
                {sections.map((section, index) => {
                  const sectionNumber = section.section_number || `0${index + 1}`.slice(-2);
                  const sectionId = `section-${sectionNumber}`;
                  const paragraphs = section.paragraphs ?? [];
                  const bulletPoints = section.bullet_points ?? [];

                  return (
                    <article
                      key={sectionId}
                      id={sectionId}
                      aria-labelledby={`heading-${sectionNumber}`}
                      className="flex scroll-mt-24 flex-col gap-3.5 border-t border-border pt-6 first:border-0 first:pt-0"
                    >
                      <h3
                        id={`heading-${sectionNumber}`}
                        className="text-[22px] font-bold text-text-main leading-snug"
                      >
                        {[sectionNumber, section.title]
                          .filter(Boolean)
                          .join(" / ") || "Topik belum tersedia"}
                      </h3>

                      <div className="flex flex-col gap-3 text-base leading-relaxed text-text-main">
                        {paragraphs.map((paragraph, paragraphIndex) => (
                          <p key={`${sectionId}-paragraph-${paragraphIndex}`}>
                            {paragraph}
                          </p>
                        ))}

                        {bulletPoints.length > 0 && (
                          <ul className="flex flex-col gap-2.5 pl-0 list-none mt-1">
                            {bulletPoints.map((point, pointIndex) => (
                              <li
                                key={`${sectionId}-point-${pointIndex}`}
                                className="relative pl-4 text-text-main leading-relaxed before:content-['•'] before:absolute before:left-0 before:text-text-main before:font-bold"
                              >
                                {point}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {section.page_reference && (
                        <div>
                          <a
                            href={`#${sectionId}`}
                            className="text-xs font-semibold text-primary hover:underline inline-block mt-1"
                          >
                            Rujukan contoh · {section.page_reference}
                          </a>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>

            {/* Disclaimer Card */}
            <div className="rounded-2xl border border-border bg-background p-4 text-xs leading-relaxed text-text-secondary">
              Rujukan halaman adalah contoh pemetaan pada materi demo. Cocokkan dengan PDF asli sebelum dipakai untuk belajar atau penilaian.
            </div>

            {/* Bottom CTA Button */}
            <div>
              <Link
                href={`/study-kit/${id}/kuis`}
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-hover"
              >
                <span>Mulai Kuis</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Right Column: Side Cards */}
          <aside className="flex flex-col gap-6">
            {/* Card 1: TOC */}
            <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <h3 className="text-lg font-bold text-text-main">
                Dalam ringkasan ini
              </h3>
              <nav aria-label="Daftar bab ringkasan">
                <ul className="flex flex-col gap-3 list-none">
                  {sections.map((section, index) => {
                    const sectionNumber = section.section_number || `0${index + 1}`.slice(-2);
                    return (
                      <li key={sectionNumber}>
                        <a
                          href={`#section-${sectionNumber}`}
                          className="block text-sm font-semibold text-primary hover:text-primary-dark hover:underline transition-colors"
                        >
                          {sectionNumber} {section.title}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </section>

            {/* Card 2: Core Concepts */}
            {coreConcepts.length > 0 && (
              <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-light text-primary-dark rounded-lg text-xs font-semibold w-fit">
                  <span>○</span>
                  <span>Konsep inti</span>
                </div>
                <h3 className="text-lg font-bold text-text-main">
                  Ingat perbedaannya
                </h3>
                <div className="flex flex-col gap-2 text-sm font-semibold text-text-main">
                  {coreConcepts.map((concept, index) => (
                    <div
                      key={`${concept}-${index}`}
                      className="rounded-lg bg-background p-2.5 border border-border"
                    >
                      {concept}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Card 3: Quiz Prompt */}
            <section className="flex flex-col gap-3.5 rounded-2xl border border-border bg-surface p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <h3 className="text-lg font-bold text-text-main">
                Sudah memahami intinya?
              </h3>
              <p className="text-sm leading-normal text-text-secondary">
                Uji pemahaman lewat 5 pilihan ganda dan 2 esai. Jawaban dibahas setelah pengiriman.
              </p>
              <Link
                href={`/study-kit/${id}/kuis`}
                className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-hover text-center"
              >
                Mulai Kuis
              </Link>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}
