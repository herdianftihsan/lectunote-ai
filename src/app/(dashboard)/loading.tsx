// src/app/(dashboard)/loading.tsx
// Loading Skeleton Dashboard Ruang Belajar (1:1 Layout Reference)

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 w-full animate-pulse" role="status" aria-label="Memuat dashboard">
      {/* 1. Header Area Skeleton */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex flex-col gap-2">
          <div className="h-4 w-32 bg-slate-200/70 rounded-md" />
          <div className="h-8 w-64 bg-slate-200/70 rounded-lg" />
          <div className="h-4 w-80 bg-slate-200/70 rounded-md" />
        </div>
        <div className="h-11 w-40 bg-slate-200/70 rounded-xl" />
      </div>

      {/* 2. Top Stats Grid Skeleton (3 Kolom) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 bg-slate-200/70 rounded-md" />
              <div className="w-10 h-10 rounded-xl bg-slate-200/70" />
            </div>
            <div className="h-8 w-20 bg-slate-200/70 rounded-lg" />
            <div className="h-3 w-40 bg-slate-200/70 rounded-md" />
          </div>
        ))}
      </div>

      {/* 3. Featured Continue Learning Banner Skeleton */}
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col gap-3 flex-1">
          <div className="h-5 w-36 bg-slate-200/70 rounded-md" />
          <div className="h-7 w-72 bg-slate-200/70 rounded-lg" />
          <div className="h-4 w-96 bg-slate-200/70 rounded-md" />
        </div>
        <div className="h-12 w-36 bg-slate-200/70 rounded-xl shrink-0" />
      </div>

      {/* 4. Section Header Skeleton */}
      <div className="flex items-center justify-between pt-2">
        <div className="h-6 w-36 bg-slate-200/70 rounded-md" />
        <div className="h-4 w-24 bg-slate-200/70 rounded-md" />
      </div>

      {/* 5. Study Kit Cards Grid Skeleton (3 Kolom) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-slate-200/70 rounded-md" />
              <div className="h-5 w-16 bg-slate-200/70 rounded-md" />
            </div>
            <div className="h-6 w-48 bg-slate-200/70 rounded-md" />
            <div className="h-4 w-full bg-slate-200/70 rounded-md mt-2" />
            <div className="h-4 w-2/3 bg-slate-200/70 rounded-md" />
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
              <div className="h-3 w-28 bg-slate-200/70 rounded-md" />
              <div className="h-4 w-4 bg-slate-200/70 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
