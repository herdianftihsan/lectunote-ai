import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LectuNote AI - Smart Active-Recall Study Assistant",
  description: "Ubah slide & catatan kuliah jadi ringkasan terstruktur, flashcard interaktif, dan simulasi kuis ujian dalam hitungan detik.",
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
