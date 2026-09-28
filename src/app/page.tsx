import Link from "next/link";

import { RankedList } from "@/components/book/RankedList";
import { Shelf } from "@/components/book/Shelf";
import { LanguageBadge } from "@/components/edition/LanguageBadge";
import { RecentSearches } from "@/components/search/RecentSearches";
import { SearchBar } from "@/components/search/SearchBar";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { initialEdition, works } from "@/data/catalog";
import { popularWorks } from "@/lib/search/query";
import type { BookWork } from "@/lib/types";

const EXAMPLES = [
  { label: "binatangisme", note: "judul terjemahan lama" },
  { label: "1984", note: "empat edisi Indonesia" },
  { label: "pachinko", note: "belum diterjemahkan" },
  { label: "laskar pelagi", note: "salah ketik" },
];

function shelfOf(predicate: (work: BookWork) => boolean) {
  return works
    .filter(predicate)
    .sort((a, b) => b.ratingSummary.count - a.ratingSummary.count)
    .map((work) => ({ work, edition: initialEdition(work) }));
}

/**
 * Search bar berada di viewport pertama dan menjadi elemen paling menonjol.
 */
export default function DiscoveryPage() {
  const popular = popularWorks(6);

  return (
    <div className="flex flex-col gap-10 sm:gap-12">
      <div className="relative left-1/2 -mt-6 w-screen -translate-x-1/2 hero-lantern px-4 py-10 sm:-mt-8 sm:px-6 sm:py-20 lg:-mt-10 lg:px-8">
        <section className="mx-auto w-full max-w-2xl text-center">
          <h1 className="text-display text-white sm:text-[2.5rem] sm:leading-[3rem]">
            Mau baca apa hari ini?
          </h1>
          <p className="mt-3 text-body-lg text-white/75">
            Cari buku, langsung lihat edisi Bahasa Indonesianya.
          </p>

          <div className="mt-6 text-left sm:mt-8">
            <SearchBar size="hero" tone="onImage" />
          </div>

          <ul className="mt-5 flex flex-wrap justify-center gap-2" aria-label="Contoh pencarian">
            {EXAMPLES.map((example) => (
              <li key={example.label}>
                <Link
                  href={`/search?q=${encodeURIComponent(example.label)}`}
                  className="inline-flex items-center gap-1.5 rounded-pill border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition-colors hover:border-white/40 hover:text-white"
                >
                  <span className="font-medium text-white">{example.label}</span>
                  <span className="max-sm:sr-only">{example.note}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="text-left">
            <RecentSearches tone="onImage" />
          </div>
        </section>
      </div>

      <section aria-labelledby="judul-populer">
        <SectionHeading
          id="judul-populer"
          aside={
            <p className="ml-auto hidden items-center gap-1.5 text-xs text-ink-500 sm:flex">
              <LanguageBadge lang="id" />
              ada edisi Bahasa Indonesia
            </p>
          }
        >
          Paling banyak dinilai
        </SectionHeading>
        <div className="mt-4">
          <RankedList items={popular} />
        </div>
      </section>

      <Shelf
        id="rak-indonesia"
        title="Tersedia dalam Bahasa Indonesia"
        items={shelfOf((work) => work.hasIndonesianEdition && work.originalLanguage !== "id")}
      />

      <Shelf
        id="rak-penulis-indonesia"
        title="Dari penulis Indonesia"
        items={shelfOf((work) => work.originalLanguage === "id")}
      />

      <Shelf
        id="rak-belum-diterjemahkan"
        title="Belum ada edisi Indonesia"
        items={shelfOf((work) => !work.hasIndonesianEdition)}
      />
    </div>
  );
}
