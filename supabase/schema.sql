-- ==============================================================================
-- LectuNote AI - Supabase Database Schema (Single Source of Truth)
-- ==============================================================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Profiles Table (User / Mahasiswa Profile)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL DEFAULT 'Aditya Ramadhan',
  email TEXT,
  role_title TEXT DEFAULT 'Mahasiswa teknik',
  major TEXT DEFAULT 'Teknik Informatika',
  university TEXT DEFAULT 'Politeknik / Universitas',
  program_studi TEXT DEFAULT 'Teknik Informatika',
  semester INTEGER NOT NULL DEFAULT 5,
  weekly_target INTEGER NOT NULL DEFAULT 4,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed Default User Profile for MVP Demo
INSERT INTO profiles (
  id,
  full_name,
  email,
  role_title,
  major,
  university,
  program_studi,
  semester,
  weekly_target
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Aditya Ramadhan',
  'aditya.r@example.com',
  'Mahasiswa teknik',
  'Teknik Informatika',
  'Politeknik / Universitas',
  'Teknik Informatika',
  5,
  4
)
ON CONFLICT (id) DO UPDATE
SET
  full_name = EXCLUDED.full_name,
  university = COALESCE(profiles.university, EXCLUDED.university),
  program_studi = COALESCE(profiles.program_studi, EXCLUDED.program_studi),
  semester = COALESCE(profiles.semester, EXCLUDED.semester),
  weekly_target = COALESCE(profiles.weekly_target, EXCLUDED.weekly_target),
  updated_at = NOW();

-- 3. Study Kits Table (Materi Pembelajaran, Dokumen PDF, Output AI, & Hasil Kuis)
CREATE TABLE IF NOT EXISTS study_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001',
  course_name TEXT NOT NULL,
  topic_title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size_bytes BIGINT,
  storage_path TEXT,
  user_notes TEXT,
  quiz_status TEXT NOT NULL DEFAULT 'not-started' CHECK (quiz_status IN ('not-started', 'unfinished', 'completed')),
  kit_content JSONB,
  last_score INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for study_kits
CREATE INDEX IF NOT EXISTS idx_study_kits_profile_id ON study_kits(profile_id);
CREATE INDEX IF NOT EXISTS idx_study_kits_created_at ON study_kits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_kits_quiz_status ON study_kits(quiz_status);

-- 4. Activity Logs Table (Log Riwayat Aktivitas & Performa Belajar)
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE DEFAULT '00000000-0000-0000-0000-000000000001',
  study_kit_id UUID REFERENCES study_kits(id) ON DELETE CASCADE,
  course_name TEXT,
  activity_type TEXT NOT NULL DEFAULT 'general' CHECK (activity_type IN ('generate_kit', 'complete_quiz', 'general')),
  action_description TEXT NOT NULL,
  score INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for activity_logs
CREATE INDEX IF NOT EXISTS idx_activity_logs_profile_id ON activity_logs(profile_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_study_kit_id ON activity_logs(study_kit_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- 5. Helper Function & Triggers for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_profiles_timestamp ON profiles;
CREATE TRIGGER trigger_update_profiles_timestamp
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS trigger_update_study_kits_timestamp ON study_kits;
CREATE TRIGGER trigger_update_study_kits_timestamp
  BEFORE UPDATE ON study_kits
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();
