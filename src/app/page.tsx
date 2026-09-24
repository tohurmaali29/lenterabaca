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
 */
export default function DiscoveryPage() {
  const popular = popularWorks(4);

  return (
    <div className="flex flex-col gap-10">
      <div className="relative left-1/2 -mt-6 w-screen -translate-x-1/2 overflow-hidden px-4 py-14 shadow-1 sm:-mt-8 sm:px-6 sm:py-16 lg:-mt-10 lg:px-8 lg:py-20">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{ backgroundImage: "url('/lenterabaca-banner.jpg')" }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-black/62"
        />

        <section className="mx-auto w-full max-w-2xl">
          <p className="mb-3 text-overline text-white/70 uppercase">LenteraBaca Discovery</p>
          <h1 className="text-display text-white drop-shadow-sm">Mau baca apa hari ini?</h1>
          <p className="mt-3 text-body-lg text-white/85">
            Cari buku, lalu lihat langsung apakah ada edisi Bahasa Indonesianya, tanpa perlu
            membuka halaman edisi satu per satu.
          </p>

          <div className="mt-6">
            <SearchBar size="hero" tone="onImage" />
          </div>

          <RecentSearches tone="onImage" />

          <p className="mt-4 text-sm text-white/72">
            {formatCount(catalogStats.workCount)} karya, {formatCount(catalogStats.editionCount)}{" "}
            edisi, {formatCount(catalogStats.worksWithIndonesianEdition)} di antaranya punya edisi
            Bahasa Indonesia.
          </p>
        </section>
      </div>

      <section
        aria-labelledby="judul-contoh"
        className="rounded-xl border border-line bg-surface-alt p-5 shadow-1 sm:p-6"
      >
        <h2 id="judul-contoh" className="text-h2 text-ink-900">
          Coba mulai dari sini
        </h2>
        <p className="mt-1 max-w-3xl text-body text-ink-500">
          Ketiganya menunjukkan kasus yang berbeda: judul terjemahan yang jauh berbeda, banyak edisi
          Indonesia, dan karya yang belum punya edisi Indonesia.
        </p>

        <ul className="mt-4 flex flex-wrap gap-2 ">
          {[
            { label: "binatangisme", note: "judul terjemahan lama" },
            { label: "1984", note: "empat edisi Indonesia" },
            { label: "pachinko", note: "belum ada edisi Indonesia" },
            { label: "laskar pelagi", note: "dengan salah ketik" },
          ].map((example) => (
            <li key={example.label}>
              <Link
                href={`/search?q=${encodeURIComponent(example.label)}`}
                className=" rounded-pill inline-flex tap-target items-center gap-2 border border-line bg-surface px-4 text-sm text-ink-700 shadow-1 transition-[background-color,border-color,box-shadow,transform] duration-[var(--dur-micro)] hover:-translate-y-0.5 hover:border-accent-600 hover:bg-surface hover:text-ink-900 hover:shadow-2"
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
