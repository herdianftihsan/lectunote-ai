"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [university, setUniversity] = useState("");
  const [programStudi, setProgramStudi] = useState("");
  const [semester, setSemester] = useState("1");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const semesterNum = parseInt(semester, 10);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage("Nama lengkap wajib diisi minimal 2 karakter.");
      setIsLoading(false);
      return;
    }

    if (!email.trim()) {
      setErrorMessage("Alamat surel wajib diisi.");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Kata sandi minimal harus 6 karakter.");
      setIsLoading(false);
      return;
    }

    if (!programStudi.trim() || programStudi.trim().length < 2) {
      setErrorMessage("Program studi wajib diisi untuk penyesuaian materi AI.");
      setIsLoading(false);
      return;
    }

    if (isNaN(semesterNum) || semesterNum < 1 || semesterNum > 14) {
      setErrorMessage("Semester harus berupa angka antara 1 sampai 14.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim(),
          password,
          university: university.trim(),
          program_studi: programStudi.trim(),
          semester: semesterNum,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Pendaftaran gagal. Silakan coba lagi.");
      }

      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Terjadi kesalahan saat pendaftaran.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold text-text-main tracking-tight">
          Daftar Akun Baru
        </h1>
        <p className="text-sm text-text-secondary">
          Personalisasi ringkasan dan latihan kuis sesuai jurusan kuliah Anda.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
          <span className="leading-snug">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fullName" className="text-sm font-semibold text-text-main">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            placeholder="Aditya Ramadhan"
            className="w-full h-12 px-4 bg-surface border border-border rounded-xl text-sm text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors autofill:bg-white autofill:shadow-[inset_0_0_0px_1000px_rgb(255,255,255)]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-semibold text-text-main">
            Alamat Surel <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="aditya@mahasiswa.ac.id"
            className="w-full h-12 px-4 bg-surface border border-border rounded-xl text-sm text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors autofill:bg-white autofill:shadow-[inset_0_0_0px_1000px_rgb(255,255,255)]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-semibold text-text-main">
            Kata Sandi <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Minimal 6 karakter"
            className="w-full h-12 px-4 bg-surface border border-border rounded-xl text-sm text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors autofill:bg-white autofill:shadow-[inset_0_0_0px_1000px_rgb(255,255,255)]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="university" className="text-sm font-semibold text-text-main">
            Universitas / Politeknik / Institusi
          </label>
          <input
            type="text"
            id="university"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            placeholder="contoh: Universitas Indonesia, Polban, ITB"
            className="w-full h-12 px-4 bg-surface border border-border rounded-xl text-sm text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors autofill:bg-white autofill:shadow-[inset_0_0_0px_1000px_rgb(255,255,255)]"
          />
        </div>

        {/* Program Studi Bersih & Bebas Diketik */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="programStudi" className="text-sm font-semibold text-text-main">
            Program Studi / Jurusan <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="programStudi"
            value={programStudi}
            onChange={(e) => setProgramStudi(e.target.value)}
            required
            placeholder="Contoh: Teknik Informatika"
            className="w-full h-12 px-4 bg-surface border border-border rounded-xl text-sm text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors autofill:bg-white autofill:shadow-[inset_0_0_0px_1000px_rgb(255,255,255)]"
          />
          <p className="text-xs text-text-secondary leading-relaxed">
            Digunakan oleh AI untuk menyesuaikan kedalaman ringkasan dan konteks soal kuis dengan jurusan Anda.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="semester" className="text-sm font-semibold text-text-main">
            Semester Saat Ini <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="semester"
            min={1}
            max={14}
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            required
            className="w-full h-12 px-4 bg-surface border border-border rounded-xl text-sm text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors autofill:bg-white autofill:shadow-[inset_0_0_0px_1000px_rgb(255,255,255)]"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 mt-2 bg-primary hover:bg-primary-hover active:scale-[0.99] disabled:opacity-60 text-white text-sm font-semibold rounded-xl inline-flex items-center justify-center gap-2 transition-all shadow-[0_2px_4px_rgba(21,101,192,0.2)] cursor-pointer"
        >
          {isLoading ? (
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
              Mendaftarkan akun...
            </span>
          ) : (
            <>
              <span>Daftar &amp; Masuk ke Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Login Redirect */}
      <div className="pt-2 text-center text-sm text-text-secondary border-t border-border">
        Sudah memiliki akun?{" "}
        <Link
          href="/login"
          className="text-primary font-semibold hover:underline"
        >
          Masuk di sini
        </Link>
      </div>
    </div>
  );
}
