import "server-only";

import { getServerSupabase } from "@/lib/supabase";
import type {
  EssayQuestion,
  FlashcardItem,
  McqQuestion,
  StudyKitContent,
  SummarySection,
} from "@/types/study-kit";

export type SummarySectionView = Partial<SummarySection>;

export type FlashcardView = Partial<FlashcardItem>;

export type McqQuestionView = Omit<Partial<McqQuestion>, "options"> & {
  options?: string[];
};

export type EssayQuestionView = Partial<EssayQuestion>;

export type StudyKitContentView = Omit<
  Partial<StudyKitContent>,
  "study_kit_metadata" | "summary" | "flashcards" | "quiz"
> & {
  study_kit_metadata?: Partial<StudyKitContent["study_kit_metadata"]>;
  summary?: Omit<Partial<StudyKitContent["summary"]>, "sections"> & {
    sections?: SummarySectionView[];
  };
  flashcards?: FlashcardView[];
  quiz?: Omit<
    Partial<StudyKitContent["quiz"]>,
    "multiple_choice" | "essays"
  > & {
    multiple_choice?: McqQuestionView[];
    essays?: EssayQuestionView[];
  };
};

interface StudyKitContentRow {
  kit_content: unknown;
}

export interface StudyKitContentResult {
  found: boolean;
  content: StudyKitContentView | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function optionalNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function stringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value.filter((item): item is string => typeof item === "string");
}

function records(value: unknown): Record<string, unknown>[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value.filter(isRecord);
}

function parseContent(value: unknown): StudyKitContentView | null {
  let parsed = value;

  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed) as unknown;
    } catch {
      return null;
    }
  }

  if (!isRecord(parsed)) {
    return null;
  }

  const metadata = isRecord(parsed.study_kit_metadata)
    ? parsed.study_kit_metadata
    : undefined;
  const summary = isRecord(parsed.summary) ? parsed.summary : undefined;
  const quiz = isRecord(parsed.quiz) ? parsed.quiz : undefined;

  const sections = records(summary?.sections)?.map((section) => ({
    section_number: optionalString(section.section_number),
    title: optionalString(section.title),
    paragraphs: stringArray(section.paragraphs),
    bullet_points: stringArray(section.bullet_points),
    page_reference: optionalString(section.page_reference),
  }));
  const flashcards = records(parsed.flashcards)?.map((card) => ({
    card_index: optionalNumber(card.card_index),
    question: optionalString(card.question),
    question_hint: optionalString(card.question_hint),
    answer_heading: optionalString(card.answer_heading),
    answer_body: optionalString(card.answer_body),
    page_reference: optionalString(card.page_reference),
  }));
  const multipleChoice = records(quiz?.multiple_choice)?.map((question) => ({
    question_number: optionalNumber(question.question_number),
    question: optionalString(question.question),
    options: stringArray(question.options),
  }));
  const essays = records(quiz?.essays)?.map((question) => ({
    essay_number: optionalNumber(question.essay_number),
    topic: optionalString(question.topic),
    prompt: optionalString(question.prompt),
  }));

  return {
    study_kit_metadata: metadata
      ? {
          course_name: optionalString(metadata.course_name),
          topic_title: optionalString(metadata.topic_title),
          summary_goal: optionalString(metadata.summary_goal),
        }
      : undefined,
    summary: summary
      ? {
          sections,
          core_concepts: stringArray(summary.core_concepts),
        }
      : undefined,
    flashcards,
    quiz: quiz
      ? {
          multiple_choice: multipleChoice,
          essays,
        }
      : undefined,
    last_evaluation: parsed.last_evaluation as StudyKitContent["last_evaluation"],
  };
}

export async function fetchStudyKitContent(
  id: string,
): Promise<StudyKitContentResult> {
  const { data, error } = await getServerSupabase()
    .from("study_kits")
    .select("kit_content")
    .eq("id", id)
    .maybeSingle<StudyKitContentRow>();

  if (error) {
    throw new Error("Gagal memuat konten Study Kit dari database.", {
      cause: error,
    });
  }

  if (!data) {
    return { found: false, content: null };
  }

  return {
    found: true,
    content: data.kit_content == null ? null : parseContent(data.kit_content),
  };
}
