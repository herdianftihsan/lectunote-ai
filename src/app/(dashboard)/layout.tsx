// src/app/(dashboard)/layout.tsx
import React, { Suspense } from "react";
import { DEFAULT_PROFILE_ID, getServerSupabase } from "@/lib/supabase";
import DashboardNavigation from "@/components/layout/DashboardNavigation";

interface DashboardProfile {
  full_name: string;
  role_title: string | null;
  semester: number | null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen p-6 text-sm text-text-secondary" role="status">
          Memuat ruang belajar...
        </div>
      }
    >
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}

async function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: profile, error } = await getServerSupabase()
    .from("profiles")
    .select("full_name, role_title, semester")
    .eq("id", DEFAULT_PROFILE_ID)
    .maybeSingle<DashboardProfile>();

  if (error) {
    throw new Error("Gagal memuat profil ruang belajar.", { cause: error });
  }

  return (
    <DashboardNavigation profile={profile}>
      {children}
    </DashboardNavigation>
  );
}
