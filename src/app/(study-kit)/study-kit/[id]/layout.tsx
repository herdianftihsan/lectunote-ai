// src/app/(study-kit)/study-kit/[id]/layout.tsx
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import StudyKitHeader from "./StudyKitHeader";
import StudyKitLayoutShell from "@/components/layout/StudyKitLayoutShell";
import {
  DEFAULT_PROFILE_ID,
  getActiveProfile,
  getActiveProfileId,
  getServerSupabase,
} from "@/lib/supabase";

interface StudyKitHeaderRecord {
  course_name: string;
  topic_title: string;
  file_name: string;
  file_size_bytes: number | null;
  profile_id: string;
}

interface StudyKitLayoutProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

export default async function StudyKitLayout({
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
      .select("course_name, topic_title, file_name, file_size_bytes, profile_id")
      .eq("id", id)
      .maybeSingle<StudyKitHeaderRecord>(),
    getActiveProfile(),
  ]);

  if (studyKitResult.error) {
    console.error("[StudyKitLayout] Gagal memuat data Study Kit:", studyKitResult.error);
    throw new Error("Gagal memuat data Study Kit.", {
      cause: studyKitResult.error,
    });
  }

  const studyKit = studyKitResult.data;
  if (!studyKit) {
    notFound();
  }

  // Izinkan akses jika milik profil aktif atau akun demo pratinjau
  if (studyKit.profile_id !== profileId && profileId !== DEFAULT_PROFILE_ID) {
    notFound();
  }

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
