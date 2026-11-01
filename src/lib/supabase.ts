// src/lib/supabase.ts
// Supabase Client Initialization (Browser & Server)

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

// Client untuk penggunaan umum di Frontend / Client Components
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper untuk Server-Side dengan Service Role Key (jika diperlukan untuk bypass RLS)
export function getServiceSupabase() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
  return createClient(supabaseUrl, serviceRoleKey);
}
