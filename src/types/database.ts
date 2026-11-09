// src/types/database.ts
// Single Source of Truth for Supabase Schema (PRD Section 4 & Schema Sync)

import type { StudyKitContent } from "./study-kit";

export type QuizStatus = "not-started" | "unfinished" | "completed";
export type ActivityType = "generate_kit" | "complete_quiz" | "general";

/**
 * 1. Tabel `profiles`
 */
export interface ProfileRow {
  id: string;
  full_name: string;
  email: string | null;
  role_title: string | null;
  major: string | null;
  university: string | null;
  program_studi: string | null;
  semester: number;
  weekly_target: number;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileInsert {
  id?: string;
  full_name: string;
  email?: string | null;
  role_title?: string | null;
  major?: string | null;
  university?: string | null;
  program_studi?: string | null;
  semester?: number;
  weekly_target?: number;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type ProfileUpdate = Partial<ProfileInsert>;

/**
 * 2. Tabel `study_kits`
 */
export interface StudyKitRow {
  id: string;
  profile_id: string;
  course_name: string;
  topic_title: string;
  file_name: string;
  file_size_bytes: number | null;
  storage_path: string | null;
  user_notes: string | null;
  quiz_status: QuizStatus;
  kit_content: StudyKitContent | null;
  last_score: number | null;
  created_at: string;
  updated_at: string;
}

export interface StudyKitInsert {
  id?: string;
  profile_id?: string;
  course_name: string;
  topic_title: string;
  file_name: string;
  file_size_bytes?: number | null;
  storage_path?: string | null;
  user_notes?: string | null;
  quiz_status?: QuizStatus;
  kit_content?: StudyKitContent | null;
  last_score?: number | null;
  created_at?: string;
  updated_at?: string;
}

export type StudyKitUpdate = Partial<StudyKitInsert>;

/**
 * 3. Tabel `activity_logs`
 */
export interface ActivityLogRow {
  id: string;
  profile_id: string | null;
  study_kit_id: string | null;
  course_name: string | null;
  activity_type: ActivityType;
  action_description: string;
  score: number | null;
  created_at: string;
}

export interface ActivityLogInsert {
  id?: string;
  profile_id?: string | null;
  study_kit_id?: string | null;
  course_name?: string | null;
  activity_type?: ActivityType;
  action_description: string;
  score?: number | null;
  created_at?: string;
}

export type ActivityLogUpdate = Partial<ActivityLogInsert>;

/**
 * Supabase Database Schema Definition (untuk type-checking client Supabase)
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      study_kits: {
        Row: StudyKitRow;
        Insert: StudyKitInsert;
        Update: StudyKitUpdate;
      };
      activity_logs: {
        Row: ActivityLogRow;
        Insert: ActivityLogInsert;
        Update: ActivityLogUpdate;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      quiz_status: QuizStatus;
      activity_type: ActivityType;
    };
    CompositeTypes: Record<string, never>;
  };
}
