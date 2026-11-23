import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LectuNote AI — Asisten Belajar & Evaluasi Materi Kuliah",
  description:
    "Ubah slide kuliah, rekaman suara dosen, dan catatan menjadi Study Kit komprehensif: ringkasan terstruktur, flashcard interaktif active recall, serta simulasi kuis ujian otomatis berbasis AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} font-sans`} suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background text-text-main" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
