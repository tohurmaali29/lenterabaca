import { BookCover } from "@/components/book/BookCover";
import { RatingDisplay } from "@/components/book/RatingDisplay";
import { authorsOf, getPublisher, getSeries } from "@/data/catalog";
import type { BookWork, Edition } from "@/lib/types";

/**
 * Blok KARYA di halaman detail. RnD R-05 dan 17.2.
 *
 * Sengaja terpisah secara visual dari blok EDISI TERPILIH, dan keduanya
 * terbuka tanpa disclosure. Ini jawaban langsung untuk temuan F3, di mana
 * metadata buku di Goodreads tersembunyi di balik dropdown.
 */
export function WorkHero({ work, edition }: { work: BookWork; edition: Edition }) {
  const authors = authorsOf(work);
  const series = work.seriesId ? getSeries(work.seriesId) : undefined;

  return (
    <section aria-labelledby="judul-karya" className="flex flex-col gap-5 sm:flex-row sm:gap-6">
      <BookCover
        src={edition.cover.url}
        alt={edition.cover.alt}
        title={edition.title}
        publisherName={getPublisher(edition.publisherId)?.name ?? ""}
        size="md"
        priority
        className="self-start shadow-1 sm:cover-lg"
      />

      <div className="flex min-w-0 flex-col gap-2">
        <p className="text-overline text-ink-500">Karya</p>

        <h1 id="judul-karya" className="font-title text-h1 text-ink-900" lang={edition.language}>
          {edition.title}
        </h1>

        {edition.title !== work.originalTitle && (
          <p className="text-body text-ink-500">
            Judul asli:{" "}
            <span lang={work.originalLanguage} className="text-ink-700">
              {work.originalTitle}
            </span>
          </p>
        )}

        <p className="text-body text-ink-700">{authors.map((author) => author.name).join(", ")}</p>

        <p className="text-sm text-ink-500">
          Terbit pertama {work.firstPublishedYear}
          {series && work.seriesPosition ? ` · ${series.name}, buku ke-${work.seriesPosition}` : ""}
        </p>

        <RatingDisplay summary={work.ratingSummary} scope="work" className="mt-1" />

        <ul className="mt-1 flex flex-wrap gap-2">
          {work.subjects.map((subject) => (
            <li
              key={subject}
              className="rounded-pill bg-surface-sunken px-3 py-1 text-xs text-ink-700"
            >
              {subject}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
