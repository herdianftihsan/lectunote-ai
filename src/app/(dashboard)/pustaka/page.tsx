// src/app/(dashboard)/pustaka/page.tsx
// Server Component for Pustaka Materi (1:1 _html_design_reference/pustaka-materi.html)

import { DEFAULT_PROFILE_ID, getServiceSupabase } from "@/lib/supabase";
import LibraryClient, {
  type LibraryStudyKit,
  type ActivityLogItem,
} from "@/components/dashboard/LibraryClient";
import type { StudyKitContent } from "@/types/study-kit";

export const instant = false;

interface RawStudyKitRow {
  id: string;
  course_name: string;
  topic_title: string;
  file_name: string;
  file_size_bytes: number | null;
  quiz_status: string;
  kit_content: StudyKitContent | string | null;
  created_at: string;
}

export default async function PustakaPage() {
  const supabase = getServiceSupabase();

  // 1. Fetch study_kits dan activity_logs secara paralel
  const [kitsResult, logsResult] = await Promise.all([
    supabase
      .from("study_kits")
      .select(
        "id, course_name, topic_title, file_name, file_size_bytes, quiz_status, kit_content, created_at",
      )
      .eq("profile_id", DEFAULT_PROFILE_ID)
      .order("created_at", { ascending: false })
      .returns<RawStudyKitRow[]>(),
    supabase
      .from("activity_logs")
      .select("id, study_kit_id, action_description, created_at")
      .order("created_at", { ascending: false })
      .limit(10)
      .returns<Omit<ActivityLogItem, "course_name">[]>(),
  ]);

  // Ungkap detail error Supabase jika terjadi (anti-console `{}`)
  let databaseError: string | null = null;

  if (kitsResult.error) {
    console.error("[PustakaPage] Error fetch study_kits:", {
      message: kitsResult.error.message,
      code: kitsResult.error.code,
      details: kitsResult.error.details,
      hint: kitsResult.error.hint,
    });
    databaseError = kitsResult.error.message || "Gagal memuat daftar materi.";
  }

  if (logsResult.error) {
    console.warn("[PustakaPage] Error fetch activity_logs:", {
      message: logsResult.error.message,
      code: logsResult.error.code,
      details: logsResult.error.details,
      hint: logsResult.error.hint,
    });
  }

  const rawKits = kitsResult.data ?? [];
  const rawLogs = logsResult.data ?? [];
  const courseNamesMap = new Map(rawKits.map((k) => [k.id, k.course_name] as const));

  const activities: ActivityLogItem[] = rawLogs.map((log) => ({
    id: log.id,
    study_kit_id: log.study_kit_id,
    course_name: courseNamesMap.get(log.study_kit_id) || "Study Kit",
    action_description: log.action_description,
    created_at: log.created_at,
  }));

  // 2. Format kit rows untuk konsumsi instan di Client Component
  const initialKits: LibraryStudyKit[] = rawKits.map((kit) => {
    let content: StudyKitContent | null = null;
    if (typeof kit.kit_content === "string") {
      try {
        content = JSON.parse(kit.kit_content) as StudyKitContent;
      } catch {
        content = null;
      }
    } else if (kit.kit_content && typeof kit.kit_content === "object") {
      content = kit.kit_content;
    }

    const evaluation = content?.last_evaluation;
    const hasEvaluation = Boolean(evaluation);
    const lastScore =
      evaluation?.mcq_score ??
      (evaluation as unknown as { quiz_result?: { mcq_score?: number } })
        ?.quiz_result?.mcq_score ??
      null;

    return {
      id: kit.id,
      course_name: kit.course_name,
      topic_title: kit.topic_title || kit.file_name,
      file_name: kit.file_name,
      file_size_bytes: kit.file_size_bytes,
      quiz_status: kit.quiz_status || "not-started",
      created_at: kit.created_at,
      flashcard_count: content?.flashcards?.length ?? 12,
      mcq_count: content?.quiz?.multiple_choice?.length ?? 5,
      essay_count: content?.quiz?.essays?.length ?? 2,
      has_evaluation: hasEvaluation,
      last_score: typeof lastScore === "number" ? lastScore : null,
    };
  });

  return (
    <LibraryClient
      initialKits={initialKits}
      activities={activities}
      databaseError={databaseError}
    />
  );
}
