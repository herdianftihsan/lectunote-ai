// src/app/(dashboard)/pengaturan/page.tsx
// Halaman Pengaturan & Profil (Konversi dari pengaturan&pofile.html)
"use client";

import React, { useState } from "react";
import { Check, ShieldCheck } from "lucide-react";
import { mockDefaultProfile } from "@/lib/mock-data";

export default function PengaturanPage() {
  const [profile, setProfile] = useState(mockDefaultProfile);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Title */}
      <section className="flex flex-col gap-1">
        <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
          Akun pribadi
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-main">
          Pengaturan & profil
        </h1>
        <p className="text-sm text-text-secondary">
          Sesuaikan ruang belajar agar nyaman untukmu.
        </p>
      </section>

      {/* 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
        {/* Left Column: Form */}
        <div className="flex flex-col gap-6">
          {/* Profile Card */}
          <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary-light text-primary font-bold text-lg flex items-center justify-center">
                AR
              </div>
              <div>
                <div className="text-base font-bold text-text-main">{profile.full_name}</div>
                <div className="text-xs text-text-secondary">{profile.role_title}</div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-secondary">Nama lengkap</label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="p-3 bg-background border border-border rounded-xl text-sm text-text-main focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-secondary">Alamat surel</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="p-3 bg-background border border-border rounded-xl text-sm text-text-main focus:outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary">Program studi</label>
                <input
                  type="text"
                  value={profile.major}
                  onChange={(e) => setProfile({ ...profile, major: e.target.value })}
                  className="p-3 bg-background border border-border rounded-xl text-sm text-text-main focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary">Semester</label>
                <input
                  type="number"
                  value={profile.semester}
                  onChange={(e) => setProfile({ ...profile, semester: Number(e.target.value) })}
                  className="p-3 bg-background border border-border rounded-xl text-sm text-text-main focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Learning Preferences */}
          <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
            <h2 className="text-base font-bold text-text-main">Preferensi belajar</h2>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-text-secondary">
                Target belajar mingguan
              </label>
              <input
                type="text"
                value={`${profile.weekly_target_sessions} sesi belajar`}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    weekly_target_sessions: parseInt(e.target.value) || 4,
                  })
                }
                className="p-3 bg-background border border-border rounded-xl text-sm text-text-main focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-background border border-border rounded-xl">
              <div>
                <div className="text-sm font-semibold text-text-main">Pengingat belajar</div>
                <div className="text-xs text-text-secondary">
                  Tampilkan pengingat sesuai preferensi belajarmu.
                </div>
              </div>
              <input
                type="checkbox"
                checked={profile.reminder_enabled}
                onChange={(e) => setProfile({ ...profile, reminder_enabled: e.target.checked })}
                className="w-5 h-5 accent-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-background border border-border rounded-xl">
              <div>
                <div className="text-sm font-semibold text-text-main">
                  Ringkasan aktivitas lewat surel
                </div>
                <div className="text-xs text-text-secondary">
                  Terima ikhtisar perkembangan belajar.
                </div>
              </div>
              <input
                type="checkbox"
                checked={profile.email_summary_enabled}
                onChange={(e) =>
                  setProfile({ ...profile, email_summary_enabled: e.target.checked })
                }
                className="w-5 h-5 accent-primary cursor-pointer"
              />
            </div>
          </div>

          {/* Action Button & Success Specimen */}
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="w-fit h-12 px-6 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
            >
              Simpan Perubahan
            </button>

            {isSaved && (
              <div className="flex items-center gap-2 p-3 bg-success-light text-success border border-success/20 rounded-xl text-xs font-semibold">
                <Check className="w-4 h-4" />
                <span>Perubahan profil berhasil disimpan.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Info Column */}
        <div className="flex flex-col gap-6">
          <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-3 shadow-sm">
            <h3 className="text-base font-bold text-text-main">Tampilan & aksesibilitas</h3>
            <div className="text-xs text-teal font-semibold bg-teal-light px-3 py-1 rounded-full w-fit">
              Mode terang aktif
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Kontras yang jelas dan latar netral untuk kenyamanan membaca materi dalam waktu lama.
            </p>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-3 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-primary-light text-primary flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-text-main">Kelola materi dengan sadar</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Unggah hanya materi perkuliahan yang boleh kamu gunakan. Privasi dan perlindungan data akademik mahasiswa diutamakan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
