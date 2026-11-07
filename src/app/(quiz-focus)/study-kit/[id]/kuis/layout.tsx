// src/app/(quiz-focus)/study-kit/[id]/kuis/layout.tsx
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
      <Suspense
        fallback={<div className="h-[72px] bg-surface border-b border-border" />}
      >
        <FocusHeader />
      </Suspense>

      {/* Main Focus Content Container */}
      <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:pb-15">
        <Suspense
          fallback={
            <div className="p-8 text-center text-xs text-text-secondary">
              Memuat kuis...
            </div>
          }
        >
          {children}
        </Suspense>
      </main>
    </div>
  );
}
