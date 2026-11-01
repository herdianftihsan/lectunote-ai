// src/app/(quiz-focus)/study-kit/[id]/kuis/layout.tsx
// Layout Moda Fokus TANPA Sidebar (PRD Section 2)
import React, { Suspense } from "react";
import FocusHeader from "./FocusHeader";

export default function QuizFocusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Focus Mode Top Bar */}
      <Suspense fallback={<div className="h-18 bg-surface border-b border-border" />}>
        <FocusHeader />
      </Suspense>

      {/* Main Focus Content Container */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-6xl w-full mx-auto">
        <Suspense fallback={<div className="p-8 text-center text-xs text-text-secondary">Memuat kuis...</div>}>
          {children}
        </Suspense>
      </main>
    </div>
  );
}
