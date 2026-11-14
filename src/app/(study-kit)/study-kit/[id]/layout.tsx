import type { ReactNode } from "react";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import StudyKitHeader from "./StudyKitHeader";
import StudyKitLayoutShell from "@/components/layout/StudyKitLayoutShell";
import {
  getActiveProfile,
  getActiveProfileId,
  getServerSupabase,
} from "@/lib/supabase";

export const instant = false;

interface StudyKitHeaderRecord {
  course_name: string;
  topic_title: string;
  file_name: string;
  file_size_bytes: number | null;
}

interface StudyKitLayoutProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

export default function StudyKitLayout({
  children,
  params,
}: StudyKitLayoutProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen p-6 text-sm text-text-secondary" role="status">
          Memuat Study Kit...
        </div>
      }
    >
      <StudyKitLayoutContent params={params}>{children}</StudyKitLayoutContent>
    </Suspense>
  );
}

async function StudyKitLayoutContent({
  children,
  params,
}: StudyKitLayoutProps) {
  await connection();
  const { id } = await params;
  const supabase = getServerSupabase();
  const profileId = await getActiveProfileId();
  const [studyKitResult, profileResult] = await Promise.all([
    supabase
      .from("study_kits")
      .select("course_name, topic_title, file_name, file_size_bytes")
      .eq("id", id)
      .eq("profile_id", profileId)
      .maybeSingle<StudyKitHeaderRecord>(),
    getActiveProfile(),
  ]);

  if (studyKitResult.error) {
    console.error("[StudyKitLayout] Gagal memuat data Study Kit:", studyKitResult.error);
    throw new Error("Gagal memuat data Study Kit.", {
      cause: studyKitResult.error,
    });
  }
  if (!studyKitResult.data) {
    notFound();
  }
  const studyKit = studyKitResult.data;
  const profile = profileResult;

  return (
    <StudyKitLayoutShell profile={profile}>
      <div className="flex flex-col gap-6 w-full">
        <StudyKitHeader id={id} studyKit={studyKit} />
        {children}
      </div>
    </StudyKitLayoutShell>
  );
}
