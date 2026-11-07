import type { ReactNode } from "react";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import StudyKitHeader from "./StudyKitHeader";
import StudyKitLayoutShell from "@/components/layout/StudyKitLayoutShell";
import { DEFAULT_PROFILE_ID, getSupabase } from "@/lib/supabase";

interface StudyKitHeaderRecord {
  course_name: string;
  topic_title: string;
  file_name: string;
  file_size_bytes: number | null;
}

interface StudyKitProfile {
  full_name: string;
  role_title: string | null;
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
  const { id } = await params;
  const supabase = getSupabase();
  const [studyKitResult, profileResult] = await Promise.all([
    supabase
      .from("study_kits")
      .select("course_name, topic_title, file_name, file_size_bytes")
      .eq("id", id)
      .eq("profile_id", DEFAULT_PROFILE_ID)
      .maybeSingle<StudyKitHeaderRecord>(),
    supabase
      .from("profiles")
      .select("full_name, role_title")
      .eq("id", DEFAULT_PROFILE_ID)
      .maybeSingle<StudyKitProfile>(),
  ]);

  if (studyKitResult.error) {
    throw new Error("Gagal memuat data Study Kit.", {
      cause: studyKitResult.error,
    });
  }
  if (profileResult.error) {
    throw new Error("Gagal memuat profil Study Kit.", {
      cause: profileResult.error,
    });
  }

  if (!studyKitResult.data) {
    notFound();
  }
  const studyKit = studyKitResult.data;
  const profile = profileResult.data;

  return (
    <StudyKitLayoutShell profile={profile}>
      <div className="flex flex-col gap-6 w-full">
        <StudyKitHeader id={id} studyKit={studyKit} />
        {children}
      </div>
    </StudyKitLayoutShell>
  );
}
