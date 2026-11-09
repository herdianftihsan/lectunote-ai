import { notFound } from "next/navigation";
import FlashcardViewer, {
  type FlashcardViewerItem,
} from "@/components/study-kit/FlashcardViewer";
import { fetchStudyKitContent } from "@/lib/study-kit-content";

export const instant = false;

interface FlashcardPageProps {
  params: Promise<{ id: string }>;
}

export default async function FlashcardPage({ params }: FlashcardPageProps) {
  const { id } = await params;
  const studyKit = await fetchStudyKitContent(id);

  if (!studyKit.found) {
    notFound();
  }

  const content = studyKit.content;
  const cards = content?.flashcards ?? [];
  const warningClass =
    "rounded-xl border border-warning-border bg-warning-bg p-4 text-sm text-warning-text";

  if (!content || cards.length === 0) {
    return (
      <p role="status" className={warningClass}>
        Konten AI sedang diproses atau gagal dimuat.
      </p>
    );
  }

  const flashcards: FlashcardViewerItem[] = cards.map((card) => ({
    question: card.question ?? "Pertanyaan belum tersedia.",
    question_hint: card.question_hint,
    answer_heading: card.answer_heading,
    answer_body: card.answer_body,
    answer: [card.answer_heading, card.answer_body]
      .filter((part): part is string => Boolean(part))
      .join("\n\n") || "Jawaban belum tersedia.",
    page_reference: card.page_reference,
  }));

  return <FlashcardViewer flashcards={flashcards} />;
}
