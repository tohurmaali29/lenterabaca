import { SearchBar } from "@/components/search/SearchBar";

/**
 * Halaman discovery.
 *
 * RnD F1: search bar adalah elemen utama di viewport pertama.
 * Isi halaman (karya populer, pencarian terakhir, baris "punya edisi
 * Bahasa Indonesia") menyusul di Phase 3 setelah fixtures Phase 2 siap.
 */
export default function DiscoveryPage() {
  return (
    <div className="mx-auto max-w-2xl py-8 sm:py-12 lg:py-16">
      <h1 className="text-display text-ink-900">Mau baca apa hari ini?</h1>
      <p className="mt-3 text-body-lg text-ink-500">
        Cari buku, lalu lihat langsung apakah ada edisi Bahasa Indonesianya.
      </p>

      <div className="mt-6">
        <SearchBar size="hero" />
      </div>
    </div>
  );
}
