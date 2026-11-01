// src/app/(dashboard)/layout.tsx
import React from "react";
import Link from "next/link";
import { BookOpen, LayoutDashboard, UploadCloud, Library, Settings, Bell, Menu } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-border bg-surface p-6 sticky top-0 h-screen overflow-y-auto">
        <div className="flex flex-col gap-6">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-sm">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="text-xl font-bold tracking-tight text-text-main">
              LectuNote <span className="text-teal">AI</span>
            </div>
          </Link>

          <div className="text-[11px] font-bold tracking-wider text-text-secondary uppercase">
            Ruang Belajar
          </div>

          {/* Nav Menu */}
          <nav className="flex flex-col gap-1.5">
            <Link
              href="/"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-text-secondary hover:bg-background hover:text-primary transition-all"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/unggah-materi"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-text-secondary hover:bg-background hover:text-primary transition-all"
            >
              <UploadCloud className="w-5 h-5" />
              <span>Unggah Materi</span>
            </Link>
            <Link
              href="/pustaka"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-text-secondary hover:bg-background hover:text-primary transition-all"
            >
              <Library className="w-5 h-5" />
              <span>Pustaka Materi</span>
            </Link>
            <Link
              href="/pengaturan"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-text-secondary hover:bg-background hover:text-primary transition-all"
            >
              <Settings className="w-5 h-5" />
              <span>Pengaturan</span>
            </Link>
          </nav>
        </div>

        {/* Sidebar Footer User Profile */}
        <div className="pt-5 border-t border-border flex flex-col gap-1">
          <div className="text-sm font-semibold text-text-main">Aditya Ramadhan</div>
          <div className="text-xs text-text-secondary">Mahasiswa teknik</div>
          <div className="text-xs text-text-muted mt-1">Ringkas. Pahami. Uji dirimu.</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-18 lg:h-20 bg-surface border-b border-border flex items-center justify-between px-4 sm:px-6 lg:px-10 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-lg border border-border text-text-secondary">
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-sm font-semibold text-text-secondary">
              Ruang belajar / Dashboard
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex text-xs font-medium text-text-secondary">
              Semester ganjil · 2026/2027
            </span>
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-text-secondary hover:bg-background transition-colors">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
