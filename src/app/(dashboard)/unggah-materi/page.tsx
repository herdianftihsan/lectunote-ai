// src/app/(dashboard)/unggah-materi/page.tsx
// Halaman Buat Study Kit Baru (Konversi dari unggah-materi.html)
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UploadCloud, FileText, Mic, AlertCircle, Sparkles, Check } from "lucide-react";

export default function UploadPage() {
  const [notes, setNotes] = useState(
    "Fokus pada perbedaan model OSI dan TCP/IP, fungsi tiap layer, serta contoh penggunaan TCP dan UDP. Bahas juga perhitungan host pada subnet /24."
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Web Speech API Voice-to-Text handler (PRD Golden Rule #1)
  const toggleSpeechRecognition = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Browser Anda belum mendukung Web Speech API.");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "id-ID";
    recognition.interimResults = false;

    if (!isRecording) {
      setIsRecording(true);
      recognition.start();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setNotes((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };
    } else {
      setIsRecording(false);
      recognition.stop();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Stepper & Title */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
          <span className="text-primary font-bold">01 Unggah materi</span>
          <span>→</span>
          <span>02 Proses AI</span>
          <span>→</span>
          <span>03 Mulai belajar</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-main">
          Buat Study Kit Baru.
        </h1>
        <p className="text-sm sm:text-base text-text-secondary">
          Satukan slide dan catatan kuliahmu menjadi latihan yang lebih terarah.
        </p>
      </section>

      {/* Main Grid: Form vs Info Column */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* Left Form Area */}
        <div className="flex flex-col gap-6">
          {/* Card: Upload PDF */}
          <section className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
            <h2 className="text-lg font-bold text-text-main">Unggah materi kuliah</h2>
            <p className="text-sm text-text-secondary">
              Gunakan PDF dengan teks yang dapat dibaca. Pastikan kamu berhak menggunakan materi ini.
            </p>

            {/* Dropzone */}
            <div
              onClick={() => document.getElementById("pdfInput")?.click()}
              className="border-2 border-dashed border-border hover:border-primary/50 bg-background rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
            >
              <input
                id="pdfInput"
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
                }}
              />
              <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-text-main">Tarik dan lepas PDF di sini</div>
              <div className="text-xs text-text-secondary mt-1 mb-4">
                atau pilih slide kuliah dari perangkatmu
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 h-10 px-4 bg-surface border border-border hover:bg-background text-primary text-xs font-semibold rounded-xl shadow-xs"
              >
                <FileText className="w-4 h-4" />
                <span>Pilih Berkas</span>
              </button>
            </div>

            {/* File Selected Preview */}
            <div className="flex items-center justify-between p-4 bg-background border border-border rounded-xl">
              <div className="flex items-center gap-3">
                <div className="px-2.5 py-1.5 bg-primary text-white text-xs font-bold rounded-lg">
                  PDF
                </div>
                <div>
                  <div className="text-sm font-semibold text-text-main">
                    {selectedFile ? selectedFile.name : "Jaringan_Komputer_Bab_03.pdf"}
                  </div>
                  <div className="text-xs text-text-secondary">2,4 MB · 24 halaman · Terunggah</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="text-xs font-semibold text-danger hover:underline"
              >
                Hapus
              </button>
            </div>
          </section>

          {/* Card: Notes with Voice to Text Button */}
          <section className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center justify-between">
              <label htmlFor="notesInput" className="text-sm font-bold text-text-main">
                Tambahkan Catatan Kuliah
              </label>
              {/* Voice-to-Text Button (PRD Golden Rule #1) */}
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isRecording
                    ? "bg-danger text-white animate-pulse"
                    : "bg-teal-light text-teal hover:bg-teal/10"
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{isRecording ? "Mendengarkan..." : "🎤 Rekam Suara Dosen"}</span>
              </button>
            </div>

            <textarea
              id="notesInput"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tuliskan catatan atau instruksi tambahan..."
              className="w-full p-4 border border-border rounded-xl text-sm text-text-main focus:outline-none focus:border-primary resize-y"
            />
            <div className="text-xs text-text-secondary">
              Opsional · Tambahkan penekanan dosen atau topik yang ingin kamu pahami.
            </div>

            {/* AI Banner */}
            <div className="flex items-center gap-2 p-3 bg-teal-light text-teal rounded-xl text-xs font-semibold">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>AI menggunakan PDF dan catatan ini sebagai konteks penyusunan materi.</span>
            </div>
          </section>

          {/* Form Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center h-12 px-6 border border-border bg-surface hover:bg-background text-primary text-sm font-semibold rounded-xl"
            >
              Batal
            </Link>
            <Link
              href="/study-kit/demo-jaringan-komputer/ringkasan"
              className="inline-flex items-center justify-center h-12 px-6 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl shadow-sm"
            >
              Buat Study Kit
            </Link>
          </div>
        </div>

        {/* Right Info Column */}
        <div className="flex flex-col gap-6">
          <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs font-bold text-teal bg-teal-light px-3 py-1 rounded-full w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dibantu AI</span>
            </div>
            <h3 className="text-base font-bold text-text-main">
              Satu PDF. Tiga cara belajar.
            </h3>
            <div className="flex flex-col gap-3 text-xs text-text-secondary">
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-text-main block">Ringkasan terstruktur</strong>
                  Poin inti dan rujukan halaman sumber.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-text-main block">12 flashcards</strong>
                  Ulangi istilah dan konsep penting.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-text-main block">5 PG + 2 esai</strong>
                  Skor PG, tinjauan, dan umpan balik esai.
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3 text-amber-900 text-xs leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <span>
              Hindari mengunggah data pribadi atau materi rahasia. Tinjau kebijakan pengelolaan data sebelum menggunakan layanan.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
