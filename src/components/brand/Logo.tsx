// src/components/brand/Logo.tsx
import React from "react";
import Image from "next/image";
import Link from "next/link";

export type LogoVariant = "sidebar" | "auth" | "icon";

export interface LogoProps {
  /**
   * Variasi tampilan logo:
   * - "sidebar" (default): Ikon tegas dan lebih besar (h-11 sm:h-12) berdampingan dengan teks "LectuNote AI".
   * - "auth": Logo lengkap terpusat (w-52 h-auto) untuk header form login/register.
   * - "icon": Hanya ikon tanpa teks (h-10 sm:h-11).
   */
  variant?: LogoVariant;
  /**
   * Ukuran khusus (opsional):
   * - "lg" (default untuk sidebar): h-11 sm:h-12 (44px - 48px).
   * - "md": h-9 sm:h-10 (36px - 40px).
   */
  size?: "md" | "lg";
  /**
   * Tautan tujuan saat diklik. Default: "/".
   * Set ke `false` jika tidak ingin membungkus logo dalam tautan.
   */
  href?: string | false;
  /** Handler klik tambahan (misal untuk menutup mobile drawer). */
  onClick?: () => void;
  /** Tambahan kelas CSS pada pembungkus logo. */
  className?: string;
  /**
   * Preload prioritas tinggi untuk elemen LCP / above-the-fold.
   * Default: true.
   */
  priority?: boolean;
}

export function Logo({
  variant = "sidebar",
  size = "lg",
  href = "/",
  onClick,
  className = "",
  priority = true,
}: LogoProps) {
  let content: React.ReactNode;

  if (variant === "auth") {
    content = (
      <div className="flex flex-col items-center justify-center">
        <Image
          src="/images/logo-full.png"
          alt="LectuNote AI"
          width={280}
          height={181}
          priority={priority}
          className="w-52 sm:w-60 h-auto object-contain mx-auto select-none"
        />
      </div>
    );
  } else if (variant === "icon") {
    const iconSizeClass =
      size === "lg" ? "h-11 sm:h-12 w-auto" : "h-9 sm:h-10 w-auto";
    content = (
      <Image
        src="/images/logo-icon.png"
        alt="LectuNote AI"
        width={64}
        height={52}
        priority={priority}
        className={`${iconSizeClass} object-contain shrink-0 select-none`}
      />
    );
  } else {
    // variant === "sidebar" (default)
    const iconClass =
      size === "lg"
        ? "h-11 sm:h-12 w-auto max-w-[58px]"
        : "h-9 sm:h-10 w-auto max-w-[48px]";
    const textClass =
      size === "lg"
        ? "text-xl sm:text-[22px]"
        : "text-lg sm:text-xl";

    content = (
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center shrink-0">
          <Image
            src="/images/logo-icon.png"
            alt="LectuNote AI"
            width={64}
            height={52}
            priority={priority}
            className={`${iconClass} object-contain shrink-0 select-none`}
          />
        </div>
        <span
          className={`${textClass} font-bold leading-tight tracking-tight text-text-main`}
        >
          LectuNote <span className="text-[#4E8B52]">AI</span>
        </span>
      </div>
    );
  }

  const baseWrapperClass =
    "inline-flex items-center text-inherit no-underline select-none";

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`${baseWrapperClass} hover:opacity-90 transition-opacity ${className}`}
        aria-label="LectuNote AI - Beranda"
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`${baseWrapperClass} ${className}`}
    >
      {content}
    </div>
  );
}
