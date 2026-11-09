import { ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { DEFAULT_PROFILE_ID, getServerSupabase } from "@/lib/supabase";

interface ProfileSettings {
  full_name: string;
  role_title: string | null;
  major: string | null;
  semester: number | null;
}

export default async function PengaturanPage() {
  const { data: profile, error } = await getServerSupabase()
    .from("profiles")
    .select("full_name, role_title, major, semester")
    .eq("id", DEFAULT_PROFILE_ID)
    .maybeSingle<ProfileSettings>();

  if (error) {
    throw new Error("Gagal memuat profil.", { cause: error });
  }
  if (!profile) {
    notFound();
  }

  const initials = profile.full_name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase("id-ID") ?? "")
    .join("");

  return (
    <div className="flex flex-col gap-6 w-full">
      <section className="flex flex-col gap-1.5">
        <div className="text-sm font-semibold text-primary">
          AKUN PRIBADI
        </div>
        <h1 className="text-3xl sm:text-[32px] font-bold text-text-main leading-tight tracking-tight">
          Pengaturan &amp; profil
        </h1>
        <p className="text-base text-text-secondary leading-normal">
          Informasi profil yang tersimpan di akun Anda.
        </p>
      </section>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Main Profile Info Card */}
        <section className="flex flex-col gap-6 rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-4 border-b border-border pb-6">
            <div
              aria-hidden="true"
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-light text-xl font-bold text-primary shadow-xs"
            >
              {initials}
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-main">
                {profile.full_name}
              </h2>
              {profile.role_title && (
                <p className="text-sm text-text-secondary mt-0.5">
                  {profile.role_title}
                </p>
              )}
            </div>
          </div>

          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1 rounded-xl bg-background p-4 border border-border">
              <dt className="text-xs font-semibold text-text-secondary">
                Nama lengkap
              </dt>
              <dd className="text-sm font-semibold text-text-main">{profile.full_name}</dd>
            </div>
            <div className="flex flex-col gap-1 rounded-xl bg-background p-4 border border-border">
              <dt className="text-xs font-semibold text-text-secondary">
                Program studi
              </dt>
              <dd className="text-sm font-semibold text-text-main">
                {profile.major || "Teknik Informatika"}
              </dd>
            </div>
            <div className="flex flex-col gap-1 rounded-xl bg-background p-4 border border-border">
              <dt className="text-xs font-semibold text-text-secondary">
                Semester
              </dt>
              <dd className="text-sm font-semibold text-text-main">
                {profile.semester == null
                  ? "Semester 5"
                  : `Semester ${profile.semester}`}
              </dd>
            </div>
            <div className="flex flex-col gap-1 rounded-xl bg-background p-4 border border-border">
              <dt className="text-xs font-semibold text-text-secondary">
                Peran
              </dt>
              <dd className="text-sm font-semibold text-text-main">
                {profile.role_title || "Mahasiswa"}
              </dd>
            </div>
          </dl>

          <p className="rounded-xl border border-border bg-background p-4 text-xs leading-relaxed text-text-secondary">
            Informasi profil ditampilkan dari database Supabase. Akun ini disiapkan secara default untuk demo akademik tanpa hambatan login.
          </p>
        </section>

        {/* Sidebar Info */}
        <aside className="flex flex-col gap-6">
          <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <h2 className="text-base font-bold text-text-main">
              Tampilan &amp; aksesibilitas
            </h2>
            <p className="text-xs leading-relaxed text-text-secondary">
              Mode kontras tinggi dan ukuran font disesuaikan otomatis dengan preferensi browser sistem Anda.
            </p>
          </section>

          <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="text-base font-bold text-text-main">
              Kelola materi dengan sadar
            </h2>
            <p className="text-xs leading-relaxed text-text-secondary">
              Unggah hanya materi perkuliahan yang sah untuk Anda pelajari. Perlindungan data akademik dan privasi mahasiswa diutamakan.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
