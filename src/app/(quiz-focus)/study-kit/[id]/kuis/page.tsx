import { notFound } from "next/navigation";
import QuizEngine, {
  type QuizEssayItem,
  type QuizMultipleChoiceItem,
} from "@/components/study-kit/QuizEngine";
import { fetchStudyKitContent } from "@/lib/study-kit-content";

interface QuizPageProps {
  params: Promise<{ id: string }>;
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { id } = await params;
  const studyKit = await fetchStudyKitContent(id);

  if (!studyKit.found) {
    notFound();
  }

  const content = studyKit.content;
  const questions = content?.quiz;
  const multipleChoice = questions?.multiple_choice ?? [];
  const essays = questions?.essays ?? [];

  if (!content || multipleChoice.length === 0 || essays.length === 0) {
    return (
      <p
        role="status"
        className="rounded-xl border border-warning-border bg-warning-bg p-4 text-sm text-warning-text"
      >
        Konten AI sedang diproses atau gagal dimuat.
      </p>
    );
  }

  const quizItems: QuizMultipleChoiceItem[] = multipleChoice.map(
    (question) => ({
      question: question.question ?? "Pertanyaan belum tersedia.",
      options: question.options ?? [],
    }),
  );

  const essayItems: QuizEssayItem[] = essays.map((question) => ({
    question: question.prompt ?? "Pertanyaan esai belum tersedia.",
    topic: question.topic,
  }));

  return (
    <QuizEngine
      studyKitId={id}
      multipleChoice={quizItems}
      essay={essayItems}
      courseName={content.study_kit_metadata?.course_name}
      topicTitle={content.study_kit_metadata?.topic_title}
    />
  );
}
