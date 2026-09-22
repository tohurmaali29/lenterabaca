import Link from "next/link";

import { BookCard } from "@/components/book/BookCard";
import { LanguageBadge } from "@/components/edition/LanguageBadge";
import { RecentSearches } from "@/components/search/RecentSearches";
import { SearchBar } from "@/components/search/SearchBar";
import { catalogStats } from "@/data/catalog";
import { popularWorks } from "@/lib/search/query";
import { formatCount } from "@/lib/format";

/**
 * Halaman discovery. RnD F1.
 *
 * Search bar berada di viewport pertama dan menjadi elemen paling menonjol.
 * Ini jawaban langsung untuk temuan F1: di Goodreads, guest harus scroll
 * untuk menemukan kolom pencarian, dan kolom itu kecil serta bercampur
 * dengan daftar kategori.
 */
export default function DiscoveryPage() {
  const popular = popularWorks(4);

  return (
    <div className="flex flex-col gap-10">
      <section className="mx-auto w-full max-w-2xl pt-6 sm:pt-10">
        <h1 className="text-display text-ink-900">Mau baca apa hari ini?</h1>
        <p className="mt-3 text-body-lg text-ink-500">
          Cari buku, lalu lihat langsung apakah ada edisi Bahasa Indonesianya, tanpa perlu membuka
          halaman edisi satu per satu.
        </p>

        <div className="mt-6">
          <SearchBar size="hero" />
        </div>

        <RecentSearches />

        <p className="mt-4 text-sm text-ink-400">
          {formatCount(catalogStats.workCount)} karya, {formatCount(catalogStats.editionCount)}{" "}
          edisi, {formatCount(catalogStats.worksWithIndonesianEdition)} di antaranya punya edisi
          Bahasa Indonesia.
        </p>
      </section>

      <section aria-labelledby="judul-contoh">
        <h2 id="judul-contoh" className="text-h2 text-ink-900">
          Coba mulai dari sini
        </h2>
        <p className="mt-1 text-body text-ink-500">
          Ketiganya menunjukkan kasus yang berbeda: judul terjemahan yang jauh berbeda, banyak edisi
          Indonesia, dan karya yang belum punya edisi Indonesia.
        </p>

        <ul className="mt-4 flex flex-wrap gap-2">
          {[
            { label: "binatangisme", note: "judul terjemahan lama" },
            { label: "1984", note: "empat edisi Indonesia" },
            { label: "pachinko", note: "belum ada edisi Indonesia" },
            { label: "laskar pelagi", note: "dengan salah ketik" },
          ].map((example) => (
            <li key={example.label}>
              <Link
                href={`/search?q=${encodeURIComponent(example.label)}`}
                className="rounded-pill inline-flex tap-target items-center gap-2 border border-line-strong px-4 text-sm text-ink-700 hover:bg-surface-alt"
              >
                <span className="font-medium text-ink-900">{example.label}</span>
                <span className="text-ink-500">{example.note}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="judul-populer">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="judul-populer" className="text-h2 text-ink-900">
            Paling banyak dinilai
          </h2>
          <p className="flex items-center gap-1.5 text-sm text-ink-500">
            <LanguageBadge lang="id" />
            menandai karya yang punya edisi Bahasa Indonesia
          </p>
        </div>

        <ol className="mt-4 flex flex-col gap-4">
          {popular.map((result, index) => (
            <li key={result.work.id}>
              <BookCard result={result} priority={index < 2} />
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
