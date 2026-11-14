// src/app/(dashboard)/unggah-materi/page.tsx
// Halaman Buat Study Kit Baru & State Pemrosesan AI
"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileText,
  Mic,
  AlertCircle,
  Sparkles,
  Check,
  LoaderCircle,
  Clock,
  CheckCircle2,
  Volume2,
  Square,
} from "lucide-react";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_AUDIO_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_COURSE_NAME_LENGTH = 100;
const MAX_NOTES_LENGTH = 20_000;
const REQUEST_TIMEOUT_MS = 190_000;

interface GenerateKitResponse {
  id?: string;
  error?: string;
  error_code?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

function isPdf(file: File): boolean {
  return (
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  );
}

function validateFile(file: File | null): string | null {
  if (!file) return "Pilih berkas PDF materi kuliah terlebih dahulu.";
  if (!isPdf(file))
    return "Format berkas belum didukung. Harap pilih berkas PDF.";
  if (file.size === 0) return "Berkas kosong. Pilih PDF lain.";
  if (file.size >= MAX_FILE_BYTES) {
    return `Ukuran berkas ${formatFileSize(file.size)} melebihi batas 5 MB. Kompres atau pilih PDF lain.`;
  }
  return null;
}

export default function UploadPage() {
  const router = useRouter();
  const [courseName, setCourseName] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const isSubmittingRef = useRef(false);

  // Audio / Voice Note states & refs
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [isAudioRecording, setIsAudioRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Bersihkan ObjectURL & media stream saat unmount atau audio diganti
  useEffect(() => {
    return () => {
      if (audioPreviewUrl) {
        URL.revokeObjectURL(audioPreviewUrl);
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [audioPreviewUrl]);

  const clearAudio = () => {
    if (audioPreviewUrl) {
      URL.revokeObjectURL(audioPreviewUrl);
    }
    setAudioPreviewUrl(null);
    setAudioFile(null);
    if (isAudioRecording) {
      stopRecording();
    }
  };

  const handleAudioFileSelected = (file: File | null) => {
    if (!file) return;
    if (file.size > MAX_AUDIO_BYTES) {
      setErrorMessage(
        `Ukuran berkas audio ${formatFileSize(file.size)} melebihi batas 10 MB.`,
      );
      return;
    }
    const isValidAudioType =
      file.type.startsWith("audio/") ||
      /\.(mp3|wav|m4a|mp4|webm|ogg|aac|flac)$/i.test(file.name);
    if (!isValidAudioType) {
      setErrorMessage(
        "Format berkas audio belum didukung. Harap pilih berkas MP3, M4A, WAV, WebM, atau OGG.",
      );
      return;
    }
    clearAudio();
    const url = URL.createObjectURL(file);
    setAudioPreviewUrl(url);
    setAudioFile(file);
    setErrorMessage(null);
  };

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorMessage("Browser Anda tidak mendukung perekaman mikrofon.");
        return;
      }
      clearAudio();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];

      let mimeType = "";
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        mimeType = "audio/webm;codecs=opus";
      } else if (MediaRecorder.isTypeSupported("audio/webm")) {
        mimeType = "audio/webm";
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4";
      } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
        mimeType = "audio/ogg";
      }

      const mediaRecorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const recordedMime = mediaRecorder.mimeType || "audio/webm";
        const blob = new Blob(audioChunksRef.current, { type: recordedMime });
        const extension = recordedMime.includes("mp4")
          ? "m4a"
          : recordedMime.includes("ogg")
            ? "ogg"
            : "webm";
        const file = new File([blob], `rekaman-suara.${extension}`, {
          type: recordedMime,
        });

        if (file.size > MAX_AUDIO_BYTES) {
          setErrorMessage(
            "Ukuran rekaman audio melebihi batas 10 MB. Coba durasi rekaman yang lebih singkat.",
          );
          return;
        }

        const url = URL.createObjectURL(file);
        setAudioPreviewUrl(url);
        setAudioFile(file);

        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
        }
      };

      mediaRecorder.start(1000);
      setIsAudioRecording(true);
      setRecordingDuration(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Gagal memulai perekaman:", err);
      setErrorMessage(
        "Tidak dapat mengakses mikrofon. Pastikan izin mikrofon telah diberikan di browser.",
      );
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsAudioRecording(false);
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleFileSelected = (file: File | null) => {
    if (!file) return;
    const fileError = validateFile(file);
    if (fileError) {
      setSelectedFile(null);
      setErrorMessage(fileError);
      return;
    }
    setSelectedFile(file);
    setErrorMessage(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmittingRef.current) return;

    const trimmedCourseName = courseName.trim();
    const validationError =
      validateFile(selectedFile) ??
      (!trimmedCourseName ? "Nama mata kuliah wajib diisi." : null) ??
      (trimmedCourseName.length > MAX_COURSE_NAME_LENGTH
        ? `Nama mata kuliah maksimal ${MAX_COURSE_NAME_LENGTH} karakter.`
        : null) ??
      (notes.length > MAX_NOTES_LENGTH
        ? `Catatan maksimal ${MAX_NOTES_LENGTH} karakter.`
        : null);

    if (validationError || !selectedFile) {
      setErrorMessage(validationError);
      return;
    }

    isSubmittingRef.current = true;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("course_name", trimmedCourseName);
      formData.append("notes", notes.trim());
      if (audioFile) {
        formData.append("audio_file", audioFile);
      }

      const response = await fetch("/api/generate-kit", {
        method: "POST",
        body: formData,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      const data: GenerateKitResponse | null = await response
        .json()
        .catch(() => null);

      if (!response.ok || !data?.id) {
        throw new Error(
          data?.error ??
            (response.ok
              ? "Server tidak mengembalikan ID Study Kit. Silakan coba lagi."
              : `Study Kit belum berhasil dibuat (HTTP ${response.status}). Silakan coba lagi.`),
        );
      }

      router.push(`/study-kit/${data.id}/ringkasan`);
    } catch (error: unknown) {
      console.error("Gagal membuat Study Kit:", error);
      const isTimeout =
        error instanceof DOMException && error.name === "TimeoutError";
      setErrorMessage(
        isTimeout
          ? "Proses terlalu lama. Coba lagi atau gunakan PDF yang lebih singkat."
          : error instanceof TypeError
            ? "Tidak dapat terhubung ke server. Periksa koneksi internetmu lalu coba lagi."
            : error instanceof Error
              ? error.message
              : "Terjadi kendala tak terduga. Silakan coba lagi.",
      );
      isSubmittingRef.current = false;
      setIsLoading(false);
    }
  };

  // Web Speech API Voice-to-Text handler (PRD Golden Rule #1)
  const toggleSpeechRecognition = () => {
    if (
      typeof window === "undefined" ||
      (!("webkitSpeechRecognition" in window) &&
        !("SpeechRecognition" in window))
    ) {
      alert("Browser Anda belum mendukung Web Speech API.");
      return;
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    /* eslint-enable @typescript-eslint/no-explicit-any */
    const recognition = new SpeechRecognition();
    recognition.lang = "id-ID";
    recognition.interimResults = false;

    if (!isRecording) {
      setIsRecording(true);
      recognition.start();

      /* eslint-disable @typescript-eslint/no-explicit-any */
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
      /* eslint-enable @typescript-eslint/no-explicit-any */
    } else {
      setIsRecording(false);
      recognition.stop();
    }
  };

  // UI STATE 2: PEMROSESAN AI (Ref: pemrosesan-ai.html)
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 w-full">
        {/* Header Title Area */}
        <div className="flex flex-col gap-2">
          <div className="text-sm font-semibold text-primary">
            {audioFile
              ? "02 Proses AI · Membaca PDF, audio & menyusun materi"
              : "02 Proses AI · Membaca PDF & menyusun materi"}
          </div>
          <h1 className="text-3xl sm:text-[32px] font-bold text-text-main leading-tight tracking-tight">
            Sedang Menyiapkan Study Kit
          </h1>
          <p className="text-base text-text-secondary leading-normal">
            {audioFile
              ? "AI sedang membaca dokumen, menganalisis audio dosen, dan catatanmu. Proses ini membutuhkan waktu sekitar 20–45 detik."
              : "AI sedang membaca dokumen dan catatanmu. Proses ini biasanya membutuhkan waktu sekitar 20–40 detik."}
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
          {/* Left Column: Process Card */}
          <div className="flex flex-col gap-6 min-w-0">
            <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 flex items-center justify-center shrink-0 text-teal mt-1">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-teal-light rounded-lg text-teal text-xs font-semibold w-fit">
                    <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
                    <span>Memproses dengan AI</span>
                  </div>
                  <h2 className="text-2xl font-bold text-text-main leading-snug">
                    AI sedang meracik materi belajarmu
                  </h2>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    Setiap halaman PDF diuraikan secara runtut untuk menghasilkan ringkasan berbobot, flashcards esensial, dan kuis uji pemahaman.
                  </p>
                </div>
              </div>

              {/* Progress Track */}
              <div className="flex flex-col gap-2">
                <div className="w-full h-2 bg-border rounded-full overflow-hidden relative">
                  <div className="h-full bg-teal rounded-full w-2/3 animate-pulse" />
                </div>
                <div className="text-xs font-semibold text-text-secondary">
                  Langkah 2 dari 3 · Menyintesis bab &amp; kartu belajar
                </div>
              </div>

              {/* Steps List */}
              <div className="flex flex-col gap-3">
                {/* Step 1: Ekstraksi */}
                <div className="p-4 rounded-xl bg-background border border-border flex items-start gap-4">
                  <div className="w-5 h-5 flex items-center justify-center shrink-0 text-success mt-0.5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <div className="text-sm font-semibold text-text-main">
                      Ekstraksi teks PDF &amp; penandaan halaman
                    </div>
                    <div className="text-xs text-text-secondary">
                      Teks dan struktur halaman berhasil diekstrak dengan penanda rujukan.
                    </div>
                    <div className="text-[11px] font-medium text-success">
                      Selesai
                    </div>
                  </div>
                </div>

                {/* Step 2: Gemini Synthesis */}
                <div className="p-4 rounded-xl bg-teal-light border border-teal/20 flex items-start gap-4">
                  <div className="w-5 h-5 flex items-center justify-center shrink-0 text-teal mt-0.5">
                    <LoaderCircle className="w-5 h-5 animate-spin" />
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <div className="text-sm font-semibold text-text-main">
                      Sintesis 5 bab ringkasan &amp; 12 flashcards
                    </div>
                    <div className="text-xs text-text-secondary">
                      Mengekstraksi poin utama dan menyusun kartu tanya-jawab active recall.
                    </div>
                    <div className="text-[11px] font-semibold text-teal">
                      Sedang memproses...
                    </div>
                  </div>
                </div>

                {/* Step 3: Quiz generation */}
                <div className="p-4 rounded-xl bg-background border border-border flex items-start gap-4 opacity-75">
                  <div className="w-5 h-5 flex items-center justify-center shrink-0 text-text-muted mt-0.5">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <div className="text-sm font-semibold text-text-main">
                      Penyusunan 5 soal pilihan ganda &amp; 2 esai
                    </div>
                    <div className="text-xs text-text-secondary">
                      Membuat simulasi ujian berbasis skenario materi kuliah.
                    </div>
                    <div className="text-[11px] font-medium text-text-secondary">
                      Menunggu giliran
                    </div>
                  </div>
                </div>
              </div>

              {/* Notice Banner */}
              <div className="p-4 bg-teal-light text-teal rounded-xl text-xs font-semibold flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>
                  Mohon tetap buka halaman ini. Setelah selesai, Anda akan dialihkan otomatis ke Study Kit.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            {/* File Processing Summary */}
            <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-11 bg-red-50 border border-red-100 rounded-lg flex flex-col items-center justify-center text-red-600 font-bold text-[11px] tracking-wider shrink-0">
                  PDF
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-text-main truncate">
                    {selectedFile?.name || "SlideKuliah.pdf"}
                  </div>
                  <div className="text-xs text-text-secondary">
                    {selectedFile ? formatFileSize(selectedFile.size) : "2.4 MB"} · {courseName || "Materi Kuliah"}
                  </div>
                </div>
              </div>
              <div className="text-xs font-semibold text-success flex items-center gap-1.5 pt-2 border-t border-border">
                <span>✓</span> Berkas berhasil diverifikasi
              </div>
            </div>

            {/* Skeleton Shimmer Preview */}
            <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                Pratinjau Struktur
              </div>
              <div className="flex flex-col gap-2.5">
                <div className="h-4 bg-slate-200 rounded-md w-3/4 animate-pulse" />
                <div className="h-3.5 bg-slate-100 rounded-md w-full animate-pulse" />
                <div className="h-3.5 bg-slate-100 rounded-md w-5/6 animate-pulse" />
                <div className="h-3.5 bg-slate-100 rounded-md w-4/5 animate-pulse" />
              </div>
            </div>

            {/* Guide Card */}
            <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <h3 className="text-base font-bold text-text-main">
                Tips saat menunggu
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Study kit yang dihasilkan akan langsung tersimpan di Pustaka Materi Anda sehingga bisa dipelajari ulang kapan saja tanpa perlu generate ulang.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // UI STATE 1: FORM UNGGAH MATERI (Ref: unggah-materi.html)
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Page Header */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary flex-wrap">
          <span>01 Unggah materi</span>
          <span className="text-text-secondary font-normal">→</span>
          <span className="text-text-secondary font-medium">02 Proses AI</span>
          <span className="text-text-secondary font-normal">→</span>
          <span className="text-text-secondary font-medium">03 Mulai belajar</span>
        </div>
        <h1 className="text-3xl sm:text-[32px] font-bold text-text-main leading-tight tracking-tight">
          Buat Study Kit Baru.
        </h1>
        <p className="text-base text-text-secondary leading-normal">
          Satukan slide dan catatan kuliahmu menjadi latihan yang lebih terarah.
        </p>
      </section>

      {/* Main Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
        {/* Left Form Area */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-6 min-w-0"
        >
          {/* Card 1: Upload PDF */}
          <section className="bg-surface border border-border rounded-2xl p-6 sm:p-8 flex flex-col gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div>
              <h2 className="text-xl font-bold text-text-main">
                Unggah materi kuliah
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                Gunakan PDF dengan teks yang dapat dibaca. Pastikan kamu berhak menggunakan materi ini.
              </p>
            </div>

            {/* Dropzone */}
            <div
              onClick={() => {
                if (!isLoading) document.getElementById("pdfInput")?.click();
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (!isLoading) setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (!isLoading)
                  handleFileSelected(e.dataTransfer.files?.[0] ?? null);
              }}
              className={`border-2 border-dashed ${
                isDragging
                  ? "border-primary bg-primary-light"
                  : "border-[#90CAF9] bg-primary-light"
              } hover:border-primary hover:bg-[#DCEEFC] rounded-2xl p-9 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200`}
            >
              <input
                id="pdfInput"
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                disabled={isLoading}
                onChange={(e) => {
                  handleFileSelected(e.target.files?.[0] ?? null);
                  e.target.value = "";
                }}
              />
              <div className="w-[52px] h-[52px] rounded-full bg-white flex items-center justify-center text-primary shadow-[0_4px_12px_rgba(21,101,192,0.12)] mb-3.5">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="text-[17px] font-semibold text-text-main mb-1">
                Tarik dan lepas PDF di sini
              </div>
              <div className="text-[13px] text-text-secondary mb-4">
                atau pilih slide kuliah dari perangkatmu
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 h-10 px-5 bg-white border border-border hover:border-primary hover:bg-slate-50 text-primary text-sm font-semibold rounded-xl shadow-xs transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Pilih Berkas</span>
              </button>
            </div>

            {/* File Selected Preview */}
            {selectedFile && (
              <div className="bg-white border border-border rounded-xl p-4 flex items-center justify-between flex-wrap gap-3.5">
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-11 h-12 bg-red-50 border border-red-100 rounded-lg flex flex-col items-center justify-center text-red-600 font-bold text-[11px] tracking-wider shrink-0">
                    PDF
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-text-main truncate">
                      {selectedFile.name}
                    </div>
                    <div className="text-xs text-text-secondary mt-0.5 flex items-center gap-2">
                      <span>{formatFileSize(selectedFile.size)}</span>
                      <span>·</span>
                      <span className="text-success font-semibold">✓ Siap diproses</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-xs font-semibold text-danger hover:underline px-2 py-1"
                >
                  Hapus
                </button>
              </div>
            )}
          </section>

          {/* Card 2: Nama Mata Kuliah */}
          <section className="bg-surface border border-border rounded-2xl p-6 sm:p-8 flex flex-col gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <label
              htmlFor="courseNameInput"
              className="text-sm font-bold text-text-main"
            >
              Nama Mata Kuliah
            </label>
            <input
              id="courseNameInput"
              type="text"
              value={courseName}
              maxLength={MAX_COURSE_NAME_LENGTH}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="Contoh: Jaringan Komputer"
              className="w-full h-12 px-4 border border-border rounded-xl text-sm text-text-main focus:outline-none focus:border-primary transition-colors autofill:bg-white autofill:shadow-[inset_0_0_0px_1000px_rgb(255,255,255)]"
            />
            <div className="text-xs text-text-secondary">
              Nama ini akan dijadikan judul utama pada kartu belajar dan pustaka.
            </div>
          </section>

          {/* Card 3: Audio / Voice Note Materi (Opsional) */}
          <section className="bg-surface border border-border rounded-2xl p-6 sm:p-8 flex flex-col gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-xl font-bold text-text-main">
                  Audio / Voice Note Materi
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                  Opsional · Unggah rekaman suara penjelasan dosen atau rekam langsung dari mikrofon sebagai konteks belajar multimodal.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-text-secondary rounded-lg">
                Maks. 10 MB
              </span>
            </div>

            <input
              id="audioFileInput"
              type="file"
              accept="audio/mp3,audio/mpeg,audio/wav,audio/x-m4a,audio/mp4,audio/webm,audio/ogg"
              className="hidden"
              disabled={isLoading || isAudioRecording}
              onChange={(e) => {
                handleAudioFileSelected(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
            />

            {/* State: Sedang Merekam */}
            {isAudioRecording ? (
              <div className="p-5 rounded-xl border border-red-200 bg-red-50 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-red-900">
                      Sedang merekam suara dosen...
                    </span>
                    <span className="text-xs font-semibold text-red-700 font-mono">
                      Durasi: {formatDuration(recordingDuration)}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={stopRecording}
                  className="inline-flex items-center gap-2 h-10 px-5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>Selesai Rekam</span>
                </button>
              </div>
            ) : audioFile ? (
              /* State: Audio Terpilih / Terunggah */
              <div className="bg-white border border-border rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 bg-teal-light rounded-lg flex items-center justify-center text-teal shrink-0">
                      <Volume2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-text-main truncate">
                        {audioFile.name}
                      </div>
                      <div className="text-xs text-text-secondary mt-0.5 flex items-center gap-2">
                        <span>{formatFileSize(audioFile.size)}</span>
                        <span>·</span>
                        <span className="text-teal font-semibold">✓ Audio siap dianalisis</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearAudio}
                    className="text-xs font-semibold text-danger hover:underline px-2 py-1"
                  >
                    Hapus Audio
                  </button>
                </div>

                {audioPreviewUrl && (
                  <audio
                    controls
                    src={audioPreviewUrl}
                    className="w-full h-10 mt-1 rounded-lg"
                    preload="metadata"
                  />
                )}
              </div>
            ) : (
              /* State: Belum Ada Audio */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => document.getElementById("audioFileInput")?.click()}
                  className="flex items-center justify-center gap-2.5 h-12 px-4 bg-white border border-border hover:border-primary hover:bg-slate-50 text-text-main text-sm font-semibold rounded-xl shadow-2xs transition-colors"
                >
                  <UploadCloud className="w-4 h-4 text-primary" />
                  <span>Unggah Berkas Audio</span>
                </button>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={startRecording}
                  className="flex items-center justify-center gap-2.5 h-12 px-4 bg-white border border-border hover:border-teal hover:bg-teal-light text-text-main text-sm font-semibold rounded-xl shadow-2xs transition-colors"
                >
                  <Mic className="w-4 h-4 text-teal" />
                  <span>Mulai Rekam Suara</span>
                </button>
              </div>
            )}
          </section>

          {/* Card 4: Notes with Voice to Text Button */}
          <section className="bg-surface border border-border rounded-2xl p-6 sm:p-8 flex flex-col gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label
                htmlFor="notesInput"
                className="text-sm font-bold text-text-main"
              >
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
                <span>
                  {isRecording ? "Mendengarkan ucapan..." : "Dikte Suara ke Catatan"}
                </span>
              </button>
            </div>

            <textarea
              id="notesInput"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tuliskan catatan penjelasan dosen, kisi-kisi ujian, atau instruksi tambahan..."
              className="w-full p-4 border border-border rounded-xl text-sm text-text-main focus:outline-none focus:border-primary resize-y transition-colors leading-relaxed"
            />
            <div className="text-xs text-text-secondary">
              Opsional · Tambahkan penekanan dosen atau topik yang ingin kamu pahami lebih mendalam.
            </div>

            {/* AI Callout Banner */}
            <div className="flex items-center gap-2.5 p-3.5 bg-teal-light text-teal rounded-xl text-xs font-semibold">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>
                AI menggunakan PDF dan catatan ini sebagai konteks terpadu untuk menyusun materi belajar.
              </span>
            </div>
          </section>

          {/* Form Actions */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center h-12 px-6 border border-border bg-surface hover:bg-background text-primary text-sm font-semibold rounded-xl transition-all"
              >
                Batal
              </Link>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 h-12 px-7 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
              >
                <span>Buat Study Kit</span>
              </button>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="flex items-start gap-2.5 p-4 rounded-xl bg-red-50 border border-red-200 text-sm font-medium text-red-700"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        </form>

        {/* Right Info Column */}
        <div className="flex flex-col gap-6">
          <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-teal bg-teal-light px-3 py-1 rounded-full w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dibantu AI</span>
            </div>
            <h3 className="text-base font-bold text-text-main">
              Satu PDF. Tiga cara belajar.
            </h3>
            <div className="flex flex-col gap-3.5 text-xs text-text-secondary">
              <div className="flex items-start gap-3">
                <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-text-main block font-semibold">
                    Ringkasan terstruktur
                  </strong>
                  Poin inti dan rujukan halaman sumber yang akurat.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-text-main block font-semibold">
                    12 flashcards
                  </strong>
                  Ulangi istilah dan konsep penting dengan metode active recall.
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-text-main block font-semibold">
                    5 PG + 2 esai
                  </strong>
                  Skor PG instan, pembahasan soal, dan umpan balik esai AI.
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3 text-amber-900 text-xs leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <span>
              Hindari mengunggah data pribadi atau materi rahasia. Tinjau kebijakan pengelolaan data akademik sebelum menggunakan layanan.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
