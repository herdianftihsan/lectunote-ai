// src/app/(study-kit)/study-kit/[id]/loading.tsx
// Loading Skeleton untuk Halaman Study Kit Detail (Ringkasan, Flashcard, Kuis)

export default function StudyKitLoading() {
  return (
    <div className="flex flex-col gap-6 w-full animate-pulse" role="status" aria-label="Memuat Study Kit">
      {/* 1. Top Header & Metadata Skeleton */}
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 flex flex-col gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2">
          <div className="h-4 w-28 bg-slate-200/70 rounded-md" />
          <div className="h-4 w-4 bg-slate-200/70 rounded-full" />
          <div className="h-4 w-36 bg-slate-200/70 rounded-md" />
        </div>

        <div className="h-8 w-80 bg-slate-200/70 rounded-lg" />
        <div className="h-4 w-60 bg-slate-200/70 rounded-md" />

        <div className="flex items-center gap-3 pt-2">
          <div className="h-7 w-28 bg-slate-200/70 rounded-lg" />
          <div className="h-7 w-24 bg-slate-200/70 rounded-lg" />
          <div className="h-7 w-32 bg-slate-200/70 rounded-lg" />
        </div>
      </div>

      {/* 2. Navigation Tabs Skeleton */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <div className="h-10 w-28 bg-slate-200/70 rounded-xl" />
        <div className="h-10 w-28 bg-slate-200/70 rounded-xl" />
        <div className="h-10 w-24 bg-slate-200/70 rounded-xl" />
      </div>

      {/* 3. Main Content Card Skeleton */}
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 flex flex-col gap-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="h-6 w-48 bg-slate-200/70 rounded-md" />
        <div className="space-y-3 pt-2">
          <div className="h-4 w-full bg-slate-200/70 rounded-md" />
          <div className="h-4 w-11/12 bg-slate-200/70 rounded-md" />
          <div className="h-4 w-4/5 bg-slate-200/70 rounded-md" />
        </div>

        <div className="h-px bg-border my-2" />

        <div className="h-6 w-40 bg-slate-200/70 rounded-md" />
        <div className="space-y-3 pt-1">
          <div className="h-4 w-full bg-slate-200/70 rounded-md" />
          <div className="h-4 w-3/4 bg-slate-200/70 rounded-md" />
        </div>
      </div>
    </div>
  );
}
