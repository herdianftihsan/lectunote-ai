import Link from "next/link";

export default function StudyKitNotFound() {
  return (
    <main className="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-semibold text-primary">404</p>
      <h1 className="mt-2 text-2xl font-bold text-text-main">
        Study Kit Tidak Ditemukan
      </h1>
      <p className="mt-2 max-w-md text-sm text-text-secondary">
        Materi yang Anda cari tidak tersedia atau sudah dihapus.
      </p>
      <Link
        href="/pustaka"
        className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
      >
        Kembali ke Pustaka Materi
      </Link>
    </main>
  );
}
