"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  UploadCloud,
  Library,
  Settings,
  Bell,
  Menu,
  X,
  LogOut,
} from "lucide-react";

interface DashboardNavigationProps {
  profile: {
    full_name: string;
    role_title?: string | null;
    program_studi?: string | null;
    semester?: number | null;
  } | null;
  children: React.ReactNode;
}

export default function DashboardNavigation({
  profile,
  children,
}: DashboardNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Gagal logout:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    {
      label: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      isActive: pathname === "/",
    },
    {
      label: "Unggah Materi",
      href: "/unggah-materi",
      icon: UploadCloud,
      isActive: pathname.startsWith("/unggah"),
    },
    {
      label: "Pustaka Materi",
      href: "/pustaka",
      icon: Library,
      isActive: pathname.startsWith("/pustaka"),
    },
    {
      label: "Pengaturan",
      href: "/pengaturan",
      icon: Settings,
      isActive: pathname.startsWith("/pengaturan"),
    },
  ];

  const getBreadcrumb = () => {
    if (pathname.startsWith("/unggah")) return "Ruang belajar / Unggah materi";
    if (pathname.startsWith("/pustaka")) return "Ruang belajar / Pustaka materi";
    if (pathname.startsWith("/pengaturan")) return "Ruang belajar / Pengaturan";
    return "Ruang belajar / Dashboard";
  };

  return (
    <div className="flex min-h-screen w-full bg-background relative">
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Desktop & Mobile Drawer */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-[256px] shrink-0 bg-surface border-r border-border flex flex-col justify-between p-7 px-5 z-50 overflow-y-auto transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col gap-6">
          {/* Brand Logo & Mobile Close */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex items-center gap-3 text-inherit no-underline"
            >
              <div className="w-9 h-10 bg-primary rounded-lg flex items-center justify-center shrink-0 shadow-[0_4px_10px_rgba(21,101,192,0.2)]">
                <svg
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
                  <path d="M4 5.5v15M8 7h7M8 10h5" />
                  <path d="m14 13 5-5 2 2-5 5-3 1z" />
                </svg>
              </div>
              <div className="text-xl font-bold leading-tight text-text-main tracking-tight">
                LectuNote <span className="text-teal">AI</span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 text-text-secondary hover:text-text-main rounded-lg hover:bg-background"
              aria-label="Tutup navigasi"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="text-[11px] font-bold tracking-[0.08em] text-text-secondary uppercase">
            RUANG BELAJAR
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5 list-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                    item.isActive
                      ? "bg-primary-light text-primary"
                      : "text-text-secondary hover:bg-background hover:text-primary"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      item.isActive ? "text-primary" : "text-current"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer User Info & Logout */}
        <div className="pt-4 border-t border-border flex flex-col gap-2.5">
          <div className="flex flex-col gap-0.5">
            <div className="text-sm font-semibold text-text-main leading-snug">
              {profile?.full_name || "Aditya Ramadhan"}
            </div>
            <div className="text-[13px] font-medium text-text-muted truncate">
              {profile?.program_studi
                ? `Mahasiswa ${profile.program_studi}`
                : profile?.role_title || "Mahasiswa teknik"}
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-red-600 transition-colors w-fit pt-0.5 cursor-pointer disabled:opacity-50"
            title="Keluar dari akun"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isLoggingOut ? "Keluar..." : "Keluar Akun"}</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <header className="h-20 bg-surface border-b border-border flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-border text-text-secondary hover:bg-background hover:text-text-main transition-colors"
              aria-label="Buka menu navigasi"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-sm font-semibold text-text-secondary">
              {getBreadcrumb()}
            </div>
          </div>

          <div className="flex items-center gap-5">
            <span className="hidden sm:inline-flex text-xs font-medium text-text-secondary">
              Semester {profile?.semester ?? "ganjil"} · 2026/2027
            </span>
            <button
              type="button"
              className="w-11 h-11 rounded-full flex items-center justify-center text-text-secondary hover:bg-background transition-colors relative"
              aria-label="Notifikasi"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-teal rounded-full ring-2 ring-white" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:pb-15 flex flex-col gap-6">
          {children}
        </main>
      </div>
    </div>
  );
}
