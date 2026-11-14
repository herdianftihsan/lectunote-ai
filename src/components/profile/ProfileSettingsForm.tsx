"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import type { ProfileRow } from "@/types/database";

interface ProfileSettingsFormProps {
  initialProfile: ProfileRow;
}

export default function ProfileSettingsForm({
  initialProfile,
}: ProfileSettingsFormProps) {
  const router = useRouter();

  // Form Field States
  const [fullName, setFullName] = useState(initialProfile.full_name || "");
  const [email, setEmail] = useState(initialProfile.email || "");
  const [programStudi, setProgramStudi] = useState(
    initialProfile.program_studi || initialProfile.major || "Teknik Informatika",
  );
  const [semester, setSemester] = useState(initialProfile.semester?.toString() || "5");
  const [weeklyTarget, setWeeklyTarget] = useState(
    initialProfile.weekly_target?.toString() || "4",
  );

  // Preference Toggle States
  const [reminderActive, setReminderActive] = useState(true);
  const [emailDigestActive, setEmailDigestActive] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);

  // Submission State
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Initials computation
  const initials = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "AR";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    const semesterNum = parseInt(semester, 10);
    const targetNum = parseInt(weeklyTarget, 10);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setStatusMessage({
        type: "error",
        text: "Nama lengkap wajib diisi minimal 2 karakter.",
      });
      setIsSaving(false);
      return;
    }

    if (isNaN(semesterNum) || semesterNum < 1 || semesterNum > 14) {
      setStatusMessage({
        type: "error",
        text: "Semester harus berupa angka antara 1 sampai 14.",
      });
      setIsSaving(false);
      return;
    }

    if (isNaN(targetNum) || targetNum < 1 || targetNum > 50) {
      setStatusMessage({
        type: "error",
        text: "Target belajar mingguan harus berupa angka antara 1 sampai 50 sesi.",
      });
      setIsSaving(false);
      return;
    }

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim(),
          program_studi: programStudi.trim(),
          semester: semesterNum,
          weekly_target: targetNum,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal menyimpan perubahan profil.");
      }

      setStatusMessage({
        type: "success",
        text: "Perubahan profil berhasil disimpan.",
      });

      // Segarkan Server Components agar Sidebar dan Topbar langsung ter-update
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatusMessage({
        type: "error",
        text: msg,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err: unknown) {
      console.error("Gagal logout:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start w-full">
      {/* Kolom Kiri: Form Profil & Preferensi Belajar */}
      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Card 1: Identitas Profil Mahasiswa */}
        <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-full bg-primary-light text-primary text-xl font-bold flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              {initials}
            </div>
            <div className="flex flex-col">
              <div className="text-lg font-bold text-text-main leading-snug">
                {fullName || "Nama Mahasiswa"}
              </div>
              <div className="text-sm text-text-secondary">
                {programStudi ? `Mahasiswa ${programStudi}` : "Profil contoh mahasiswa"}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="fullName" className="text-sm font-semibold text-text-main leading-5">
              Nama lengkap
            </label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full h-12 px-4 bg-surface border border-border rounded-xl text-sm text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors autofill:bg-white autofill:shadow-[inset_0_0_0px_1000px_rgb(255,255,255)]"
              placeholder="Aditya Ramadhan"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="emailAddr" className="text-sm font-semibold text-text-main leading-5">
              Alamat surel
            </label>
            <input
              type="email"
              id="emailAddr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 bg-surface border border-border rounded-xl text-sm text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors autofill:bg-white autofill:shadow-[inset_0_0_0px_1000px_rgb(255,255,255)]"
              placeholder="aditya.r@example.com"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="majorStudy" className="text-sm font-semibold text-text-main leading-5">
                Program studi
              </label>
              <input
                type="text"
                id="majorStudy"
                value={programStudi}
                onChange={(e) => setProgramStudi(e.target.value)}
                className="w-full h-12 px-4 bg-surface border border-border rounded-xl text-sm text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors autofill:bg-white autofill:shadow-[inset_0_0_0px_1000px_rgb(255,255,255)]"
                placeholder="Contoh: Teknik Informatika"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="semesterNum" className="text-sm font-semibold text-text-main leading-5">
                Semester
              </label>
              <input
                type="number"
                id="semesterNum"
                min={1}
                max={14}
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full h-12 px-4 bg-surface border border-border rounded-xl text-sm text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors autofill:bg-white autofill:shadow-[inset_0_0_0px_1000px_rgb(255,255,255)]"
                placeholder="5"
              />
            </div>
          </div>

          <div className="text-xs text-text-secondary leading-relaxed pt-1">
            Identitas akademik bersifat pribadi. Produk ini tidak mewakili atau berafiliasi resmi dengan kampus.
          </div>
        </div>

        {/* Card 2: Preferensi Belajar */}
        <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <h2 className="text-lg font-semibold text-text-main leading-6">
            Preferensi belajar
          </h2>

          <div className="flex flex-col gap-2">
            <label htmlFor="uiLang" className="text-sm font-semibold text-text-main leading-5">
              Bahasa antarmuka
            </label>
            <input
              type="text"
              id="uiLang"
              value="Bahasa Indonesia"
              readOnly
              className="w-full h-12 px-4 bg-background border border-border rounded-xl text-sm text-text-secondary cursor-not-allowed focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="weeklyTarget" className="text-sm font-semibold text-text-main leading-5">
              Target belajar mingguan (sesi)
            </label>
            <div className="relative">
              <input
                type="number"
                id="weeklyTarget"
                min={1}
                max={50}
                value={weeklyTarget}
                onChange={(e) => setWeeklyTarget(e.target.value)}
                className="w-full h-12 px-4 bg-surface border border-border rounded-xl text-sm text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
                placeholder="4"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-text-muted pointer-events-none">
                sesi / minggu
              </span>
            </div>
          </div>

          {/* Toggle 1: Pengingat Belajar */}
          <div className="flex items-start justify-between gap-4 py-1">
            <div className="flex flex-col gap-1 flex-1">
              <div className="text-sm font-semibold text-text-main leading-5">
                Pengingat belajar
              </div>
              <div className="text-sm text-text-secondary leading-5">
                Tampilkan pengingat sesuai preferensi belajarmu.
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <button
                type="button"
                role="switch"
                aria-checked={reminderActive}
                onClick={() => setReminderActive(!reminderActive)}
                className={`relative inline-flex h-[26px] w-[48px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  reminderActive ? "bg-primary" : "bg-border"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-[20px] w-[20px] transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    reminderActive ? "translate-x-[22px]" : "translate-x-[2px]"
                  }`}
                />
              </button>
              <span
                className={`text-xs font-semibold ${
                  reminderActive ? "text-primary" : "text-text-secondary"
                }`}
              >
                {reminderActive ? "Aktif" : "Nonaktif"}
              </span>
            </div>
          </div>

          {/* Toggle 2: Ringkasan Aktivitas Email */}
          <div className="flex items-start justify-between gap-4 py-1">
            <div className="flex flex-col gap-1 flex-1">
              <div className="text-sm font-semibold text-text-main leading-5">
                Ringkasan aktivitas lewat surel
              </div>
              <div className="text-sm text-text-secondary leading-5">
                Terima ikhtisar perkembangan belajar.
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <button
                type="button"
                role="switch"
                aria-checked={emailDigestActive}
                onClick={() => setEmailDigestActive(!emailDigestActive)}
                className={`relative inline-flex h-[26px] w-[48px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  emailDigestActive ? "bg-primary" : "bg-border"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-[20px] w-[20px] transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    emailDigestActive ? "translate-x-[22px]" : "translate-x-[2px]"
                  }`}
                />
              </button>
              <span
                className={`text-xs font-semibold ${
                  emailDigestActive ? "text-primary" : "text-text-secondary"
                }`}
              >
                {emailDigestActive ? "Aktif" : "Nonaktif"}
              </span>
            </div>
          </div>
        </div>

        {/* Tombol Simpan Perubahan */}
        <div>
          <button
            type="submit"
            disabled={isSaving}
            className="h-12 px-6 bg-primary hover:bg-primary-hover active:scale-[0.99] disabled:opacity-60 text-white text-sm font-semibold rounded-xl inline-flex items-center justify-center transition-all shadow-[0_2px_4px_rgba(21,101,192,0.2)] cursor-pointer"
          >
            {isSaving ? (
              <span className="inline-flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Menyimpan...
              </span>
            ) : (
              "Simpan Perubahan"
            )}
          </button>
        </div>

        {/* Status Notification Banner (1:1 HTML Specimen) */}
        {statusMessage && (
          <div className="flex flex-col gap-2 animate-in fade-in duration-200">
            <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              STATUS PERUBAHAN
            </div>
            {statusMessage.type === "success" ? (
              <div className="p-4 bg-success-light border border-[#BBF7D0] rounded-xl text-success text-sm font-semibold leading-5 flex items-center gap-2.5">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{statusMessage.text}</span>
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold leading-5 flex items-center gap-2.5">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{statusMessage.text}</span>
              </div>
            )}
          </div>
        )}
      </form>

      {/* Kolom Kanan: Tampilan & Aksesibilitas + Kelola Materi */}
      <div className="flex flex-col gap-6">
        {/* Card 1: Tampilan & Aksesibilitas */}
        <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <h2 className="text-lg font-semibold text-text-main leading-6">
            Tampilan & aksesibilitas
          </h2>

          <div className="px-3 py-1 bg-primary-light text-primary font-semibold text-sm rounded-lg inline-flex items-center gap-1.5 w-fit">
            <span>○</span>
            <span>Mode terang</span>
          </div>

          <p className="text-sm text-text-secondary leading-normal">
            Kontras yang jelas dan latar netral untuk membaca materi.
          </p>

          {/* Toggle: Kurangi Gerakan */}
          <div className="flex items-start justify-between gap-4 py-1">
            <div className="flex flex-col gap-1 flex-1">
              <div className="text-sm font-semibold text-text-main leading-5">
                Kurangi gerakan
              </div>
              <div className="text-sm text-text-secondary leading-5">
                Batasi animasi yang tidak diperlukan.
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <button
                type="button"
                role="switch"
                aria-checked={reducedMotion}
                onClick={() => setReducedMotion(!reducedMotion)}
                className={`relative inline-flex h-[26px] w-[48px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  reducedMotion ? "bg-primary" : "bg-border"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-[20px] w-[20px] transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    reducedMotion ? "translate-x-[22px]" : "translate-x-[2px]"
                  }`}
                />
              </button>
              <span
                className={`text-xs font-semibold ${
                  reducedMotion ? "text-primary" : "text-text-secondary"
                }`}
              >
                {reducedMotion ? "Aktif" : "Nonaktif"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="textSize" className="text-sm font-semibold text-text-main leading-5">
              Ukuran teks
            </label>
            <input
              type="text"
              id="textSize"
              value="Standar · 16 px"
              readOnly
              className="w-full h-12 px-4 bg-background border border-border rounded-xl text-sm text-text-secondary cursor-not-allowed focus:outline-none"
            />
          </div>

          <div className="text-xs text-text-secondary leading-relaxed pt-1">
            Ukuran layar dan pembesaran teks tidak boleh memotong isi.
          </div>
        </div>

        {/* Card 2: Kelola Materi dengan Sadar */}
        <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="text-primary w-6 h-6">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M12 18v-6" />
              <path d="m9 15 3 3 3-3" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-text-main leading-6">
            Kelola materi dengan sadar
          </h2>
          <p className="text-sm text-text-secondary leading-normal">
            Unggah hanya materi yang boleh kamu gunakan. Opsi penghapusan materi dan kebijakan retensi perlu ditentukan sebelum peluncuran.
          </p>
          <div className="text-xs text-text-secondary leading-relaxed pt-1">
            Ini usulan pengalaman pengguna, bukan jaminan keamanan atau retensi data.
          </div>
        </div>

        {/* Card 3: Sesi Akun & Logout */}
        <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <h2 className="text-lg font-semibold text-text-main leading-6">
            Sesi &amp; Keamanan Akun
          </h2>
          <p className="text-sm text-text-secondary leading-normal">
            Keluar dari sesi ruang belajar ini untuk mengamankan akun dan data Anda pada perangkat bersama.
          </p>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-fit mt-1 px-4 h-10 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-semibold rounded-xl inline-flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
          >
            <LogOut className="w-4 h-4 text-red-600" />
            <span>{isLoggingOut ? "Keluar..." : "Keluar dari Akun"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
