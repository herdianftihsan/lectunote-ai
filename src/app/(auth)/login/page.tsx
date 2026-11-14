"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal masuk. Periksa kembali email dan kata sandi Anda.");
      }

      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Terjadi kesalahan saat masuk.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_demo: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal masuk dengan akun demo.");
      }

      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Terjadi kesalahan saat masuk akun demo.");
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold text-text-main tracking-tight">
          Masuk ke Ruang Belajar
        </h1>
        <p className="text-sm text-text-secondary">
          Lanjutkan progres belajar dan akses seluruh Study Kit Anda.
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
          <label htmlFor="email" className="text-sm font-semibold text-text-main">
            Alamat Surel
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="nama@mahasiswa.ac.id"
            className="w-full h-12 px-4 bg-surface border border-border rounded-xl text-sm text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-semibold text-text-main">
            Kata Sandi
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full h-12 px-4 bg-surface border border-border rounded-xl text-sm text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || isDemoLoading}
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
              Memproses...
            </span>
          ) : (
            <>
              <span>Masuk</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center justify-center my-1">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <span className="relative bg-surface px-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
          atau
        </span>
      </div>

      {/* Demo Account Quick Access Button */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={isLoading || isDemoLoading}
          className="w-full h-12 px-4 bg-primary-light hover:bg-[#D0E7FC] text-primary border border-primary/20 text-sm font-semibold rounded-xl inline-flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-60"
        >
          {isDemoLoading ? (
            <span className="inline-flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-primary"
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
              Menyiapkan akun demo...
            </span>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Masuk dengan Akun Demo (Aditya Ramadhan)</span>
            </>
          )}
        </button>
        <p className="text-[11px] text-text-muted text-center">
          Akses instan 1-klik dengan data Study Kit &amp; riwayat kuis lengkap.
        </p>
      </div>

      {/* Registration Redirect */}
      <div className="pt-2 text-center text-sm text-text-secondary border-t border-border">
        Belum memiliki akun?{" "}
        <Link
          href="/register"
          className="text-primary font-semibold hover:underline"
        >
          Daftar sekarang
        </Link>
      </div>
    </div>
  );
}
