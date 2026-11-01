# LectuNote AI — Smart Active-Recall Study Assistant

Web aplikasi pengubah slide PDF & rekaman/catatan kuliah menjadi ringkasan terstruktur, flashcards interaktif, dan simulasi kuis ujian otomatis berbasis metode **Active Recall**.

* **Tech Stack**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Supabase (PostgreSQL & Storage), Google Gemini Flash API, Web Speech API.
* **Biaya**: 100% Free-Tier Stack.
* **Blueprint Arsitektur Lengkap**: Lihat [`PRD_LectuNote_AI.md`](./PRD_LectuNote_AI.md).
* **Acuan Desain UI Asli**: Tersimpan di folder [`_html_design_reference/`](./_html_design_reference/).

---

## 🚀 Panduan Memulai (Quick Start)

### 1. Clone Repositori & Masuk ke Folder Proyek
```bash
git clone <URL_REPO_ANDA>
cd "LectuNote AI"
```

### 2. Instal Seluruh Dependensi
```bash
npm install
```

### 3. Setup Environment Variables
Duplikat berkas `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
Lalu isi variabel berikut di `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
GEMINI_API_KEY=your-gemini-api-key
```
> *Catatan:* API Key Gemini dapat diperoleh secara gratis di [Google AI Studio](https://aistudio.google.com/).

### 4. Jalankan Server Pengembangan
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

## 👥 Pembagian Folder Kerja Tim (Anti-Merge Conflict)

Untuk mencegah *merge conflict*, area pengerjaan telah dipisahkan secara tegas:

| Area Kerja | PIC / Developer | Direktori & Berkas yang Dikerjakan |
| :--- | :--- | :--- |
| **Frontend & UI Slicing** | **Developer 1 (FE)** | 🔒 `src/app/(dashboard)/`<br>🔒 `src/app/(study-kit)/`<br>🔒 `src/app/(quiz-focus)/`<br>🔒 `src/components/`<br>🔒 `tailwind.config.ts` |
| **Backend, AI & Database** | **Developer 2 (BE)** | 🔒 `src/app/api/`<br>🔒 `src/lib/` (`supabase.ts`, `gemini.ts`, `pdf-extractor.ts`)<br>🔒 Skema Database Supabase |
| **Kontrak Tipe Bersama** | **Bersama (Locked)** | 🤝 `src/types/study-kit.ts` *(Dilarang mengubah field tanpa diskusi)* |

---

## 🗂️ Struktur Navigasi Rute Aplikasi

* `/` — Dashboard Utama (Ringkasan statistik, materi aktif, dan materi terbaru)
* `/unggah-materi` — Workspace upload PDF kuliah & catatan suara dosen (Web Speech API)
* `/pustaka` — Koleksi seluruh Study Kit & riwayat aktivitas
* `/pengaturan` — Pengaturan profil mahasiswa & preferensi belajar
* `/study-kit/[id]/ringkasan` — Tab 1: Ringkasan terstruktur 5 bab dengan rujukan halaman PDF
* `/study-kit/[id]/flashcard` — Tab 2: 12 Flashcards interaktif (1-Card Flip Mode)
* `/study-kit/[id]/kuis` — **Moda Fokus**: Sesi kuis interaktif (5 Pilihan Ganda + 2 Esai)
* `/study-kit/[id]/hasil` — Evaluasi skor PG (Diagram Donut), pembahasan soal, dan umpan balik AI untuk esai

---

## 🧪 Validasi Kompilasi

Jalankan perintah berikut sebelum membuat *Pull Request*:
```bash
npm run build
```
Pastikan seluruh rute terkompilasi dengan kode status sukses tanpa error TypeScript maupun ESLint.
