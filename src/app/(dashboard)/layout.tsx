// src/app/(dashboard)/layout.tsx
import React, { Suspense } from "react";
import { getActiveProfile } from "@/lib/supabase";
import DashboardNavigation from "@/components/layout/DashboardNavigation";

export const instant = false;

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
  const profile = await getActiveProfile();

  return (
    <DashboardNavigation profile={profile}>
      {children}
    </DashboardNavigation>
  );
}
