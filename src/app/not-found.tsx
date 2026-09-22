import { EmptyState } from "@/components/ui/EmptyState";

/**
 * RnD X-05. Halaman 404 tetap memberi jalan keluar, bukan jalan buntu.
 *
 * Sengaja TIDAK menambahkan search bar sendiri: shell sudah menyediakan satu,
 * dan menambah satu lagi akan melanggar R-12, yaitu persis kesalahan yang
 * diaudit sebagai temuan F2 di Goodreads.
 */
export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 py-8">
      <EmptyState
        code="X-05"
        title="Halaman tidak ditemukan"
        body="Buku yang kamu tuju mungkin sudah berganti alamat, atau memang belum ada di katalog ini. Kolom pencarian di bagian atas halaman tetap bisa dipakai."
        actions={[{ label: "Kembali ke beranda", href: "/" }]}
      />
    </div>
  );
}
