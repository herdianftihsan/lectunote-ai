// src/app/(dashboard)/layout.tsx
import React from "react";
import { connection } from "next/server";
import { getActiveProfile } from "@/lib/supabase";
import DashboardNavigation from "@/components/layout/DashboardNavigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const profile = await getActiveProfile();

  return (
    <DashboardNavigation profile={profile}>
      {children}
    </DashboardNavigation>
  );
}
