// src/app/(dashboard)/pengaturan/page.tsx
// Halaman Pengaturan & Profil (Server Component + Client Form)
// Mengacu 1:1 pada _html_design_reference/pengaturan&pofile.html

import React, { Suspense } from "react";
import { connection } from "next/server";
import { getActiveProfile } from "@/lib/supabase";
import ProfileSettingsForm from "@/components/profile/ProfileSettingsForm";

export const instant = false;

export default function PengaturanPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[300px] flex items-center justify-center text-sm text-text-secondary" role="status">
          Memuat pengaturan &amp; profil...
        </div>
      }
    >
      <PengaturanContent />
    </Suspense>
  );
}

async function PengaturanContent() {
  await connection();
  const profile = await getActiveProfile();

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Page Header (1:1 Design Reference) */}
      <section className="flex flex-col gap-1.5">
        <div className="text-sm font-semibold text-primary leading-5">
          Akun pribadi
        </div>
        <h1 className="text-2xl sm:text-[32px] font-semibold text-text-main leading-tight tracking-tight">
          Pengaturan &amp; profil
        </h1>
        <p className="text-base text-text-secondary leading-normal">
          Sesuaikan ruang belajar agar nyaman untukmu.
        </p>
      </section>

      {/* Main Interactive Form Component */}
      <ProfileSettingsForm initialProfile={profile} />
    </div>
  );
}
