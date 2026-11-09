// src/types/study-kit.ts
// Kontrak Data Utama LectuNote AI (PRD Section 4 & Section 5.1)

export interface SummarySection {
  section_number: string;   // Contoh: "01", "02", "03", "04", "05"
  title: string;            // Contoh: "Model OSI dan TCP/IP"
  paragraphs: string[];     // Paragraf penjelasan bab
  bullet_points: string[];  // Poin-poin rincian di bawah paragraf
  page_reference: string;   // Contoh: "hlm. 3–7"
}

export interface FlashcardItem {
  card_index: number;         // 1 sampai 12
  question: string;           // Pertanyaan di sisi depan kartu
  question_hint: string;      // Petunjuk di bawah pertanyaan
  answer_heading: string;     // Jawaban inti tegas di sisi belakang (Contoh: "Layer Network (layer 3).")
  answer_body: string;        // Penjelasan uraian jawaban
  page_reference: string;     // Contoh: "hlm. 16–19"
}

export interface McqQuestion {
  question_number: number;  // 1 sampai 5
  question: string;
  options: [string, string, string, string]; // 4 opsi jawaban (A, B, C, D)
  correct_index: number;    // 0, 1, 2, atau 3
  explanation: string;      // Pembahasan yang ditampilkan di halaman hasil.html
}

export interface EssayQuestion {
  essay_number: number;     // 1 sampai 2
  topic: string;            // Contoh: "TCP dan UDP"
  prompt: string;           // Pertanyaan studi kasus esai
  reference_points: string; // Kunci konsep internal untuk acuan penilaian AI
}

export interface StudyKitContent {
  study_kit_metadata: {
    course_name: string;        // Contoh: "Jaringan Komputer"
    topic_title: string;        // Contoh: "Model OSI & TCP/IP"
    summary_goal: string;       // Contoh: "Tujuan: memahami alur komunikasi, memilih protokol transport..."
  };
  summary: {
    sections: SummarySection[];
    core_concepts: string[];    // Contoh: ["MAC → link lokal", "IP → antarjaringan", "Port → layanan/proses"]
  };
  flashcards: FlashcardItem[];
  quiz: {
    multiple_choice: McqQuestion[];
    essays: EssayQuestion[];
  };
  last_evaluation?: QuizEvaluationResult["quiz_result"];
}

// Alias untuk fleksibilitas penamaan
export type StudyKitPayload = StudyKitContent;

export interface QuizSubmissionPayload {
  study_kit_id: string;
  mcq_answers: number[];        // Array berisi 5 angka index pilihan user, misal: [1, 0, 2, 1, 3]
  essay_answers: Array<{
    essay_number: number;
    user_answer: string;
  }>;
}

export interface McqReviewItem {
  question_number: number;
  is_correct: boolean;
  user_selected_index: number;
  correct_index: number;
  explanation: string;
}

export interface EssayReviewItem {
  essay_number: number;
  topic: string;
  user_answer: string;
  ai_feedback: string;      // Umpan balik kualitatif dari Gemini AI
  score?: number;           // Skor 0 - 100
  strengths?: string;       // Kekuatan jawaban
  improvements?: string;    // Poin perbaikan
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
    mcq_reviews: McqReviewItem[];
    essay_reviews: EssayReviewItem[];
    total_score?: number;       // Skor tertimbang total (0 - 100)
    essay_score?: number;       // Skor rata-rata esai (0 - 100)
    evaluated_at?: string;      // ISO timestamp saat evaluasi dilakukan
  };
}

// Alias untuk fleksibilitas penamaan
export type QuizEvaluationResponse = QuizEvaluationResult;

// Re-export Single Source of Truth dari database.ts
export type {
  QuizStatus,
  ActivityType,
  ProfileRow,
  ProfileInsert,
  ProfileUpdate,
  StudyKitRow,
  StudyKitInsert,
  StudyKitUpdate,
  ActivityLogRow,
  ActivityLogInsert,
  ActivityLogUpdate,
  Database,
} from "./database";

// Alias untuk kompatibilitas ke belakang (backward-compatibility)
export type StudyKitRecord = import("./database").StudyKitRow;
export type ProfileRecord = import("./database").ProfileRow;
export type ActivityLogRecord = import("./database").ActivityLogRow;
