# PRODUCT REQUIREMENTS DOCUMENT (PRD) & SYSTEM ARCHITECTURE BLUEPRINT
## Project: LectuNote AI — Smart Active-Recall Study Assistant

* **Versi Dokumen:** 3.0 (Final Locked Blueprint — Based on 11 HTML UI Specimens)
* **Tema Final Project:** Smart Student Productivity (AI-Based Solutions)
* **Durasi Implementasi:** 2 Minggu (Sprint Minggu 11–12)
* **Tim Pengembang:** 2 Developer (Dev 1: Frontend/UI Engineer, Dev 2: Backend/AI & Database Engineer)
* **Tech Stack Utama:** Next.js (App Router), Tailwind CSS, Supabase (PostgreSQL & Storage), Google Gemini Flash API, Web Speech API
* **AI Coding Assistants:** Antigravity (HTML-to-Next.js/Tailwind Refactoring) & Zed Editor (Full-Stack Logic & Integration)
* **Biaya Operasional:** Rp0 (100% Free-Tier Stack)

---

## 1. Keputusan Arsitektur Kritis (Golden Rules untuk 2 Developer)

Berdasarkan hasil bedah 11 berkas HTML dari Hipster (UI/UX), berikut adalah **6 Keputusan Teknis Wajib** untuk menghindari *bottleneck* pengerjaan dan memastikan proyek selesai dalam 2 minggu:

1. **Integrasi Fitur Suara Tanpa Merusak Desain (`unggah-materi.html`):**
   * Tambahkan 1 tombol aksi kecil **`🎤 Rekam Suara Dosen`** di pojok kanan atas *textarea* `#lectureNotes`.
   * Gunakan **Web Speech API** (`webkitSpeechRecognition` bahasa `id-ID`) di sisi Frontend untuk mengubah suara langsung menjadi teks di dalam *textarea* tersebut. Backend cukup menerima hasil teksnya (tidak perlu memproses berkas audio).
2. **Pemangkasan Scope (Scope Pruning) & Bypass Auth:**
   * **Tanpa Halaman Login/Register:** Gunakan 1 *Default User Session* (`Aditya Ramadhan` - Semester 5 Teknik Informatika) agar saat *Live Demo* penguji langsung masuk ke Dashboard tanpa hambatan autentikasi.
   * **Prioritas Rendah (UI-Only):** Halaman `pengaturan&pofile.html` dan tombol Lonceng Notifikasi cukup diimplementasikan sebagai tampilan statis/lokal (`localStorage`) tanpa perlu logika backend yang rumit.
3. **`pemrosesan-ai.html` Sebagai State Overlay (Bukan Route Terpisah):**
   * Jangan memindahkan halaman secara manual menggunakan `setTimeout`. Jadikan tampilan `pemrosesan-ai.html` sebagai **Conditional Loading View** di dalam rute `/unggah` selama proses `POST /api/study-kit/generate` berlangsung. Begitu respons JSON diterima dan disimpan ke Supabase, otomatis lakukan `router.push('/study-kit/[id]/ringkasan')`.
4. **Penggabungan State Kuis PG & Esai (Anti-Hilang Jawaban):**
   * Desain memisahkan `kuis-soal.html` (5 PG) dan `kuis-essai.html` (2 Esai), sedangkan pengiriman jawaban baru dilakukan di akhir esai.
   * Keduanya wajib berbagi satu *state* yang disinkronkan ke `sessionStorage` (`lectunote_active_quiz_[id]`) agar saat pengguna berpindah antara nomor soal PG dan Esai, jawaban tidak hilang meskipun halaman tidak sengaja di-*refresh*.
   * Dialog konfirmasi pengiriman di bagian bawah `kuis-essai.html` diubah menjadi **Modal Popup Overlay** sesuai spesimen `State E` pada `sattus&pemulihan.html`.
5. **Refactoring Flashcard Menjadi 1 Kartu Interaktif (`flashcard.html`):**
   * Desain HTML menampilkan 2 kartu berdampingan (sebelum & sesudah dibalik) sebagai spesimen visual. Di aplikasi Next.js, komponen ini **wajib dirender sebagai 1 Kartu Tunggal Interaktif** yang berputar/berganti sisi saat tombol `Balik kartu` ditekan.
6. **Penanda Halaman PDF untuk Akurasi Sitasi AI (`hlm. X–Y`):**
   * Karena UI `ringkasan.html` dan `flashcard.html` menampilkan sitasi halaman (`Rujukan contoh · hlm. 3–7`), ekstraktor PDF di Backend wajib menyisipkan penanda `--- [HALAMAN X] ---` pada teks setiap halaman sebelum dikirim ke Gemini API agar AI tidak mengarang nomor halaman.

---

## 2. Struktur Folder Proyek & Batas Area Kerja (Anti-Merge Conflict)

Kedua developer bekerja di dalam satu repositori **Next.js App Router** dengan pemisahan direktori yang tegas:

```text
lectunote-ai/
├── PRD_LectuNote_AI.md                      # Dokumen acuan utama untuk Antigravity & Zed AI
├── .env.local                               # API Keys (GEMINI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY)
├── tailwind.config.ts                       # Konfigurasi token warna dari variabel :root HTML
│
├── src/
│   ├── app/                                 # 🔒 AREA KERJA DEV 1 (FRONTEND) — kecuali folder /api
│   │   ├── (dashboard)/                     # Layout Standar DENGAN Sidebar (256px)
│   │   │   ├── layout.tsx                   # Sidebar + Top Header Sticky + Mobile Drawer
│   │   │   ├── page.tsx                     # Konversi dari: dashboard.html
│   │   │   ├── unggah/page.tsx              # Konversi dari: unggah-materi.html + pemrosesan-ai.html
│   │   │   ├── pustaka/page.tsx             # Konversi dari: pustaka-materi.html
│   │   │   └── pengaturan/page.tsx          # Konversi dari: pengaturan&pofile.html
│   │   │
│   │   ├── (study-kit)/                     # Layout Study Kit (Sidebar + Header + Segmented Tabs)
│   │   │   └── study-kit/[id]/
│   │   │       ├── layout.tsx               # Header Materi + Tab (Ringkasan | Flashcards | Kuis)
│   │   │       ├── ringkasan/page.tsx       # Konversi dari: ringkasan.html
│   │   │       ├── flashcard/page.tsx       # Konversi dari: flashcard.html (1-Card Flip Mode)
│   │   │       └── hasil/page.tsx           # Konversi dari: hasil.html
│   │   │
│   │   ├── (quiz-focus)/                    # Layout Moda Fokus TANPA Sidebar
│   │   │   └── study-kit/[id]/kuis/
│   │   │       ├── layout.tsx               # Top Bar Fokus ("Moda fokus") + Tombol Keluar (X)
│   │   │       └── page.tsx                 # Gabungan state: kuis-soal.html (PG) & kuis-essai.html (Esai)
│   │   │
│   │   └── api/                             # 🔒 AREA KERJA DEV 2 (BACKEND & AI)
│   │       ├── study-kit/
│   │       │   ├── route.ts                 # GET semua daftar Study Kit & POST buat Study Kit baru
│   │       │   └── [id]/route.ts            # GET detail 1 Study Kit (Ringkasan, Flashcards, Kuis)
│   │       └── evaluate-quiz/
│   │           └── route.ts                 # POST penilaian 5 PG + Evaluasi Kualitatif 2 Esai oleh Gemini AI
│   │
│   ├── components/                          # 🔒 AREA KERJA DEV 1 (FRONTEND)
│   │   ├── layout/                          # Sidebar.tsx, TopHeader.tsx, FocusTopBar.tsx
│   │   ├── study-kit/                       # SummarySection.tsx, FlipFlashcard.tsx, RadialScoreDonut.tsx
│   │   ├── quiz/                            # McqQuestionCard.tsx, EssayFormCard.tsx, SubmitConfirmModal.tsx
│   │   └── ui/                              # ErrorStates.tsx (Konversi dari: sattus&pemulihan.html)
│   │
│   ├── lib/                                 # 🔒 AREA KERJA DEV 2 (BACKEND & AI)
│   │   ├── supabase.ts                      # Inisialisasi Supabase Client
│   │   ├── pdf-extractor.ts                 # Ekstraksi PDF per halaman dengan marker [HALAMAN X]
│   │   ├── gemini.ts                        # Konfigurasi Google Gemini API & JSON Schema Validator
│   │
│   └── types/
│       └── study-kit.ts                     # 🤝 KONTRAK BERSAMA (TypeScript Interfaces yang dikunci di Bagian 6)
```

### Matriks Pembagian Tugas (Dev 1 vs Dev 2)

| Kode Tugas | Deskripsi Pekerjaan | PIC | Cabang Git |
| :--- | :--- | :--- | :--- |
| **FE-01** | Konversi Vanilla CSS `:root` ke `tailwind.config.ts` & pembuatan 3 Layout Utama (`dashboard`, `study-kit`, `quiz-focus`). | **Dev 1 (FE)** | `feat/fe-layouts` |
| **FE-02** | Migrasi halaman `dashboard.html`, `unggah-materi.html` (+ tombol Voice-to-Text), `pemrosesan-ai.html`, dan `pustaka-materi.html`. | **Dev 1 (FE)** | `feat/fe-core-pages` |
| **FE-03** | Migrasi halaman `ringkasan.html`, `flashcard.html` (1-card flip), `kuis-soal.html` + `kuis-essai.html`, dan `hasil.html` (SVG Donut Chart). | **Dev 1 (FE)** | `feat/fe-study-quiz` |
| **FE-04** | Perbaikan bug responsivitas layar HP (`375px–390px`) dan implementasi komponen error/empty state dari `sattus&pemulihan.html`. | **Dev 1 (FE)** | `feat/fe-responsive` |
| **BE-01** | Setup project Supabase, pembuatan 3 tabel (`profiles`, `study_kits`, `activity_logs`), & konfigurasi bucket Storage (`study-docs`). | **Dev 2 (BE)** | `feat/be-supabase` |
| **BE-02** | Pembuatan modul ekstraktor PDF per halaman (`pdf-extractor.ts`) + validasi PDF kosong/scan gambar murni (tanpa teks). | **Dev 2 (BE)** | `feat/be-pdf-parser` |
| **BE-03** | Integrasi Gemini API untuk `/api/study-kit` (Generator Ringkasan 5 Bab, 12 Flashcards, 5 PG, 2 Esai) dengan *Strict JSON Schema*. | **Dev 2 (BE)** | `feat/be-gemini-kit` |
| **BE-04** | Integrasi Gemini API untuk `/api/evaluate-quiz` (Kalkulasi skor PG, analisis prioritas belajar, rekomendasi section, & review esai). | **Dev 2 (BE)** | `feat/be-gemini-grader` |

---

## 3. Spesifikasi Design System & Perbaikan Responsif (Panduan Dev 1)

### 3.1. Konfigurasi Warna Tailwind (`tailwind.config.ts`)
Konversikan seluruh variabel `:root` dari berkas HTML Hipster ke dalam `tailwind.config.ts` agar konsisten:

```typescript
// tailwind.config.ts
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#1565C0',
          hover: '#0D47A1',
          light: '#E3F2FD',
        },
        teal: {
          DEFAULT: '#007887',
          light: '#ECFEFF',
        },
        surface: '#FFFFFF',
        background: '#F8FAFC',
        border: '#E2E8F0',
        text: {
          main: '#0F172A',
          secondary: '#64748B',
          muted: '#94A3B8',
        },
        success: {
          DEFAULT: '#15803D',
          light: '#F0FDF4',
        },
        warning: {
          text: '#92400E',
          bg: '#FFFBEB',
          border: '#FDE68A',
        },
        danger: {
          DEFAULT: '#DC2626',
          light: '#FEF2F2',
        }
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
      }
    }
  }
}
```

### 3.2. Daftar Perbaikan Wajib untuk Layar HP (`375px–390px`)
Saat memigrasikan HTML ke Next.js menggunakan **Antigravity**, Developer 1 wajib memperbaiki 5 kerusakan layout berikut:

1. **Top Bar Header Overflow (`dashboard.html` & semua halaman ber-sidebar):**
   * *Masalah:* Badge `"Semester ganjil · 2026/2027"` bertabrakan dengan tombol hamburger dan lonceng di layar `375px`.
   * *Solusi Tailwind:* Sembunyikan atau ringkas badge semester di layar kecil menggunakan `hidden sm:inline-flex` pada pill semester, dan kurangi padding header dari `px-10` menjadi `px-4 lg:px-10`.
2. **Grid Layout Utama (`.main-grid`):**
   * *Masalah:* Kolom kanan (`320px`) membuat layar sempit terpotong.
   * *Solusi Tailwind:* Gunakan `grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6`. Di layar HP dan Tablet, panel kanan otomatis turun ke bawah konten utama.
3. **Flashcards Dual Grid (`flashcard.html`):**
   * *Masalah:* Dua kartu ditampilkan bersebelahan (`.flashcards-dual-grid`) sehingga di layar `375px` lebar kartu menyempit drastis.
   * *Solusi Tailwind:* Hapus dual-grid. Buat 1 container kartu tunggal (`w-full max-w-2xl mx-auto min-h-[320px] p-6 sm:p-8`) dengan *state* boolean `isFlipped`.
4. **Radial Score Donut Chart (`hasil.html`):**
   * *Masalah:* SVG donut `168x168px` mendesak teks rincian skor di sebelahnya pada layar HP.
   * *Solusi Tailwind:* Gunakan `flex flex-col sm:flex-row items-center gap-6` pada `.card-score-summary` agar di layar HP diagram donut berada di tengah atas dan teks rincian berada di bawahnya.
5. **Navigasi Nomor Soal Kuis (`kuis-soal.html` & `kuis-essai.html`):**
   * *Masalah:* Tombol nomor soal `1-5` dan `Esai 1-2` menyusut di bawah `44x44px`.
   * *Solusi Tailwind:* Pastikan setiap tombol nomor soal memiliki class `min-w-[44px] min-h-[44px] flex items-center justify-center`.

---

## 4. Skema Database Supabase (Panduan Dev 2)

Developer 2 wajib menjalankan query SQL berikut pada **Supabase SQL Editor** untuk menyiapkan seluruh tabel dan data awal (*Seed Data* profil Aditya Ramadhan):

```sql
-- 1. Tabel Profil Pengguna
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL DEFAULT 'Aditya Ramadhan',
  email TEXT NOT NULL DEFAULT 'aditya.r@example.com',
  role_title TEXT NOT NULL DEFAULT 'Mahasiswa teknik',
  motto TEXT NOT NULL DEFAULT 'Ringkas. Pahami. Uji dirimu.',
  major TEXT NOT NULL DEFAULT 'Teknik Informatika',
  semester INTEGER NOT NULL DEFAULT 5,
  academic_period TEXT NOT NULL DEFAULT 'Semester ganjil · 2026/2027',
  weekly_target_sessions INTEGER NOT NULL DEFAULT 4,
  completed_sessions_this_week INTEGER NOT NULL DEFAULT 3,
  reminder_enabled BOOLEAN NOT NULL DEFAULT true,
  email_summary_enabled BOOLEAN NOT NULL DEFAULT false,
  reduced_motion BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert Default User untuk MVP Demo
INSERT INTO profiles (id, full_name, email)
VALUES ('00000000-0000-0000-0000-000000000001', 'Aditya Ramadhan', 'aditya.r@example.com');

-- 2. Tabel Study Kits (Menyimpan Materi, Output JSON AI, dan Hasil Kuis)
CREATE TABLE study_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001',
  course_name TEXT NOT NULL,
  topic_title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size_label TEXT NOT NULL,
  page_count INTEGER NOT NULL DEFAULT 1,
  storage_path TEXT,
  user_notes TEXT,
  quiz_status TEXT NOT NULL DEFAULT 'not-started' CHECK (quiz_status IN ('not-started', 'unfinished', 'completed')),
  last_mcq_score INTEGER,
  kit_content JSONB NOT NULL,      -- Menyimpan JSON Output Generator Study Kit (Ringkasan, Flashcards, Soal Kuis)
  quiz_evaluation JSONB,           -- Menyimpan JSON Output Hasil Kuis & Feedback Esai AI
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabel Log Riwayat Aktivitas (Untuk Dashboard & Pustaka Materi)
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_kit_id UUID REFERENCES study_kits(id) ON DELETE CASCADE,
  course_name TEXT NOT NULL,
  action_description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 5. Kontrak API & Skema JSON (Kontrak Kerja Dev 1 & Dev 2)

> **ATURAN KERAS:** Struktur JSON dan tipe data di bawah ini telah disesuaikan 100% dengan setiap elemen UI pada `ringkasan.html`, `flashcard.html`, `kuis-soal.html`, `kuis-essai.html`, dan `hasil.html`. **Dilarang mengubah nama *property* tanpa kesepakatan bersama.**

### 5.1. File Kontrak TypeScript (`src/types/study-kit.ts`)

```typescript
export interface StudyKitContent {
  study_kit_metadata: {
    course_name: string;        // Contoh: "Jaringan Komputer"
    topic_title: string;        // Contoh: "Model OSI & TCP/IP"
    summary_goal: string;       // Contoh: "Tujuan: memahami alur komunikasi, memilih protokol transport..."
  };
  summary: {
    sections: Array<{
      section_number: string;   // Contoh: "01", "02", "03", "04", "05"
      title: string;            // Contoh: "Model OSI dan TCP/IP"
      paragraphs: string[];     // Paragraf penjelasan bab
      bullet_points: string[];  // Poin-poin rincian di bawah paragraf
      page_reference: string;   // Contoh: "hlm. 3–7"
    }>;
    core_concepts: string[];    // Contoh: ["MAC → link lokal", "IP → antarjaringan", "Port → layanan/proses"]
  };
  flashcards: Array<{
    card_index: number;         // 1 sampai 12
    question: string;           // Pertanyaan di sisi depan kartu
    question_hint: string;      // Petunjuk di bawah pertanyaan
    answer_heading: string;     // Jawaban inti tegas di sisi belakang (Contoh: "Layer Network (layer 3).")
    answer_body: string;        // Penjelasan uraian jawaban
    page_reference: string;     // Contoh: "hlm. 16–19"
  }>;
  quiz: {
    multiple_choice: Array<{
      question_number: number;  // 1 sampai 5
      question: string;
      options: [string, string, string, string]; // 4 opsi jawaban (A, B, C, D)
      correct_index: number;    // 0, 1, 2, atau 3
      explanation: string;      // Pembahasan yang ditampilkan di halaman hasil.html
    }>;
    essays: Array<{
      essay_number: number;     // 1 sampai 2
      topic: string;            // Contoh: "TCP dan UDP"
      prompt: string;           // Pertanyaan studi kasus esai
      reference_points: string; // Kunci konsep internal untuk acuan penilaian AI
    }>;
  };
}

export interface QuizSubmissionPayload {
  study_kit_id: string;
  mcq_answers: number[];        // Array berisi 5 angka index pilihan user, misal: [1, 0, 2, 1, 3]
  essay_answers: Array<{
    essay_number: number;
    user_answer: string;
  }>;
}

export interface QuizEvaluationResult {
  quiz_result: {
    mcq_score: number;          // Skor 0 - 100 (Tiap soal PG bernilai 20 poin)
    correct_answers: number;    // Contoh: 4
    wrong_answers: number;      // Contoh: 1
    priority_focus: {
      topic: string;            // Contoh: "subnetting dan pengalamatan IPv4"
      reason: string;           // Penjelasan mengapa topik ini perlu dipelajari ulang
    };
    recommendation: {
      title: string;            // Contoh: "Kuasai 256 alamat vs 254 host."
      description: string;      // Langkah konkret belajar ulang
      target_section_anchor: string; // Contoh: "#section-05"
    };
    mcq_reviews: Array<{
      question_number: number;
      is_correct: boolean;
      user_selected_index: number;
      correct_index: number;
      explanation: string;
    }>;
    essay_reviews: Array<{
      essay_number: number;
      topic: string;
      user_answer: string;
      ai_feedback: string;      // Umpan balik kualitatif dari Gemini AI
    }>;
  };
}
```

---

### 5.2. Spesifikasi Endpoint Backend (Next.js Route Handlers)

#### **Endpoint 1: `POST /api/study-kit`** (Generate Study Kit dari PDF + Catatan)
* **Input (`FormData`):**
  * `file`: Berkas PDF (`application/pdf`, maks. 10MB).
  * `notes`: String catatan kuliah / hasil transkripsi suara dosen (opsional).
* **Alur Proses Backend (Dev 2):**
  1. Validasi ekstensi file. Jika bukan PDF, kembalikan HTTP `400` dengan `error_code: "INVALID_FILE_FORMAT"` (memicu UI `State B Kasus 1` di `sattus&pemulihan.html`).
  2. Ekstrak teks PDF per halaman menggunakan `pdf-parse`. Jika total teks yang berhasil diekstrak `< 50` karakter (PDF hasil *scan* gambar murni tanpa OCR), kembalikan HTTP `422` dengan `error_code: "UNREADABLE_PDF_TEXT"` (memicu UI `State B Kasus 2`).
  3. Format teks dengan menyisipkan header `--- [HALAMAN 1] ---`, `--- [HALAMAN 2] ---`, dst.
  4. Panggil **Google Gemini Flash API** dengan `responseMimeType: "application/json"` untuk menghasilkan objek `StudyKitContent` (5 Section Ringkasan, 12 Flashcards, 5 Soal PG, 2 Soal Esai).
  5. Simpan data ke tabel `study_kits` dan catat di `activity_logs` pada Supabase.
  6. Kembalikan HTTP `200 OK` beserta `{ id: study_kit_id, content: StudyKitContent }`.

#### **Endpoint 2: `POST /api/evaluate-quiz`** (Koreksi Kuis PG & Evaluasi Esai AI)
* **Input (`application/json`):** Objek `QuizSubmissionPayload`.
* **Alur Proses Backend (Dev 2):**
  1. Ambil data `kit_content` dari tabel `study_kits` berdasarkan `study_kit_id`.
  2. Hitung skor Pilihan Ganda secara deterministik di Backend (`jumlah_benar * 20`).
  3. Kirim daftar soal PG yang dijawab salah beserta jawaban 2 Esai pengguna ke **Google Gemini Flash API** untuk menyusun:
     * `priority_focus` (analisis kelemahan konsep mahasiswa),
     * `recommendation` (rekomendasi belajar ulang yang merujuk ke `#section-01` s/d `#section-05`),
     * `essay_reviews` (ulasan kualitatif konstruktif untuk Esai 1 dan Esai 2).
  4. Update kolom `quiz_status = 'completed'`, `last_mcq_score`, dan `quiz_evaluation` di tabel `study_kits`, serta tambahkan entri baru di `activity_logs`.
  5. Kembalikan HTTP `200 OK` beserta objek `QuizEvaluationResult`.

---

## 6. Spesifikasi System Prompt AI (Panduan Dev 2 di `src/lib/gemini.ts`)

### 6.1. Prompt Generator Study Kit (`/api/study-kit`)
```text
Anda adalah Dosen Ahli Perguruan Tinggi dan Pakar Desain Instruksional berbasis metode Active Recall.
Tugas Anda adalah menganalisis teks Slide Kuliah (yang memiliki penanda --- [HALAMAN X] ---) serta Catatan Kuliah mahasiswa, lalu menghasilkan Study Kit komprehensif dalam Bahasa Indonesia yang akademis, lugas, dan mudah dipahami.

INSTRUKSI KETAT:
1. Buat tepat 5 bagian (sections) ringkasan terstruktur ("01" sampai "05"). Cantumkan rujukan halaman yang akurat (contoh: "hlm. 3–7") berdasarkan penanda [HALAMAN X] pada teks sumber.
2. Buat 4 sampai 6 poin "core_concepts" singkat berbentuk pemetaan cepat (contoh: "MAC → link lokal", "/24 → 254 host").
3. Buat tepat 12 Flashcards yang menguji pemahaman konsep inti, dilengkapi petunjuk berpikir (question_hint), judul jawaban tegas (answer_heading), penjelasan singkat (answer_body), dan rujukan halaman (page_reference).
4. Buat tepat 5 Soal Pilihan Ganda (4 opsi jawaban tanpa huruf A/B/C/D di dalam teks opsi) beserta penjelasan pembahasan yang mendalam.
5. Buat tepat 2 Soal Esai penalaran konseptual beserta poin kunci jawaban (reference_points).
6. Keluarkan hasil HANYA dalam format JSON valid yang mematuhi skema StudyKitContent.
```

### 6.2. Prompt Evaluator Kuis & Esai (`/api/evaluate-quiz`)
```text
Anda adalah Asisten Dosen Penguji yang bertugas memberikan umpan balik akademik yang suportif, spesifik, dan membangun kepada mahasiswa.
Berdasarkan data jawaban Pilihan Ganda yang salah dan 2 jawaban Esai mahasiswa berikut:
1. Tentukan "priority_focus" (topik utama yang masih keliru beserta alasan kesalahannya).
2. Berikan "recommendation" yang mengarahkan mahasiswa meninjau kembali salah satu bab ringkasan ("#section-01" s/d "#section-05").
3. Untuk masing-masing dari 2 Esai, berikan "ai_feedback" (3-4 kalimat) yang mengapresiasi bagian jawaban yang sudah tepat, lalu menunjukkan konsep atau istilah teknis apa yang perlu ditambahkan agar jawabannya sempurna.
4. Keluarkan hasil HANYA dalam format JSON valid sesuai skema QuizEvaluationResult.
```

---

## 7. Master Prompts Siap Pakai untuk Antigravity & Zed Editor

### 7.1. Prompt untuk DEVELOPER 1 di ANTIGRAVITY (Migrasi 11 HTML ke Next.js + Tailwind)
> "Saya adalah Frontend Engineer untuk proyek **LectuNote AI**. Di workspace ini terdapat 11 berkas HTML desain asli (`dashboard.html`, `unggah-materi.html`, `pemrosesan-ai.html`, `ringkasan.html`, `flashcard.html`, `kuis-soal.html`, `kuis-essai.html`, `hasil.html`, `pustaka-materi.html`, `pengaturan&pofile.html`, dan `sattus&pemulihan.html`) serta dokumen acuan **`PRD_LectuNote_AI.md`**.
>
> Tolong bantu saya memigrasikan berkas HTML tersebut ke arsitektur **Next.js App Router + Tailwind CSS + TypeScript** sesuai **Bagian 2 dan Bagian 3 `PRD_LectuNote_AI.md`** dengan aturan ketat berikut:
> 1. Pertahankan 100% identitas visual, tata bahasa Indonesia, copywriting, badge, dan hierarki kartu dari HTML asli, namun konversikan seluruh Vanilla CSS ke utility classes **Tailwind CSS** sesuai token warna di Bagian 3.1 PRD.
> 2. Terapkan 5 perbaikan responsivitas layar HP (`375px–390px`) di Bagian 3.2 PRD (terutama mencegah overflow pada Top Header, mengubah Flashcard dari 2 kartu berdampingan menjadi **1 Kartu Flip Interaktif**, dan menjadikan Radial Donut Chart responsif).
> 3. Tambahkan tombol `🎤 Rekam Suara Dosen` berbasis **Web Speech API (`id-ID`)** di atas textarea `#lectureNotes` pada halaman Unggah Materi.
> 4. Gabungkan alur `kuis-soal.html` dan `kuis-essai.html` dalam satu halaman Moda Fokus dengan *state* yang tersimpan di `sessionStorage` dan ubah dialog konfirmasi pengiriman menjadi Modal Overlay."

### 7.2. Prompt untuk DEVELOPER 2 di ZED EDITOR (Pembuatan Backend, PDF Parser & Gemini AI)
> "Saya adalah Backend & AI Engineer untuk proyek **LectuNote AI**. Mengacu secara ketat pada **`PRD_LectuNote_AI.md`** (Bagian 2, Bagian 4, Bagian 5, dan Bagian 6), tolong buatkan:
> 1. File kontrak tipe data `src/types/study-kit.ts`. Konten materi yang ditampilkan harus berasal dari Supabase; jangan mengganti kegagalan AI atau database dengan data contoh.
> 2. Modul `src/lib/supabase.ts` dan `src/lib/pdf-extractor.ts` yang mengekstrak teks PDF per halaman dengan menyisipkan penanda `--- [HALAMAN X] ---` serta memvalidasi PDF kosong/scan gambar (`UNREADABLE_PDF_TEXT`).
> 3. Modul `src/lib/gemini.ts` menggunakan `@google/genai` (`gemini-2.5-flash`) dengan JSON Schema terstruktur.
> 4. Route Handlers Next.js pada `src/app/api/study-kit/route.ts`, `src/app/api/study-kit/[id]/route.ts`, dan `src/app/api/evaluate-quiz/route.ts` yang mengembalikan error eksplisit jika pemrosesan AI gagal; jangan mengembalikan data tiruan.

---

## 8. Timeline Eksekusi 2 Minggu (Sprint Checklist)

### Minggu 11: Core Development & Slicing
* **Hari 1–2:**
  * **Dev 1:** Setup Next.js + Tailwind config, buat 3 Layout Utama (`dashboard`, `study-kit`, `quiz-focus`), konversi `dashboard.html` dan `pustaka-materi.html`.
  * **Dev 2:** Setup project Supabase, jalankan SQL Schema 3 tabel, dan buat `src/types/study-kit.ts`.
* **Hari 3–5:**
  * **Dev 1:** Konversi `unggah-materi.html` (+ Web Speech API) dan state loading `pemrosesan-ai.html`, serta halaman `ringkasan.html` dan `flashcard.html` (1-card flip).
  * **Dev 2:** Buat `pdf-extractor.ts` (dengan penanda halaman) dan endpoint `POST /api/study-kit` terintegrasi Gemini Flash API.
* **Hari 6–7:**
  * **Dev 1:** Konversi halaman Moda Fokus Kuis (`kuis-soal.html` + `kuis-essai.html`) dan halaman `hasil.html` (SVG Donut Chart).
  * **Dev 2:** Buat endpoint `POST /api/evaluate-quiz` untuk penilaian PG dan *AI Essay Review*.

### Minggu 12: Integrasi, Error Handling & Deployment
* **Hari 1–3:** Menyambungkan seluruh halaman Frontend (Dev 1) dengan API Route & Supabase (Dev 2).
* **Hari 4–5:** Implementasi komponen validasi & error dari `sattus&pemulihan.html` (format bukan PDF, PDF scan tanpa teks, gagal jaringan) serta pengujian tampilan di layar HP `375px`.
* **Hari 6–7:** Deployment ke **Vercel**, pengujian *End-to-End* menggunakan file PDF kuliah asli, dan persiapan skenario *Live Demo* Minggu ke-13.
