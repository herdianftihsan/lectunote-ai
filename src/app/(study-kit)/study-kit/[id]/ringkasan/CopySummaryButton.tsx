"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface CopySummaryButtonProps {
  text: string;
}

export default function CopySummaryButton({ text }: CopySummaryButtonProps) {
  const [status, setStatus] = useState<"copied" | "error" | null>(null);

  async function handleCopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
      setTimeout(() => setStatus(null), 2500);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-primary transition-all hover:bg-slate-50 shadow-2xs"
      >
        {status === "copied" ? (
          <Check className="h-4 w-4 text-success" aria-hidden="true" />
        ) : (
          <Copy className="h-4 w-4 text-primary" aria-hidden="true" />
        )}
        <span>{status === "copied" ? "Tersalin!" : "Salin"}</span>
      </button>
      {status === "error" && (
        <span aria-live="polite" className="text-xs text-danger">
          Gagal menyalin teks.
        </span>
      )}
    </div>
  );
}
