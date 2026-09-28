import { BookCover } from "@/components/book/BookCover";
import { RatingDisplay } from "@/components/book/RatingDisplay";
import { authorsOf, getPublisher, getSeries } from "@/data/catalog";
import type { BookWork, Edition } from "@/lib/types";
import { ShelfButton } from "../shelf/ShelfButton";
import type { ReactNode } from "react";

/**
 * Sengaja terpisah secara visual dari blok EDISI TERPILIH, dan keduanya
 * terbuka tanpa disclosure (temuan F3).
 */
export function WorkHero({
  work,
  edition,
  actions,
}: {
  work: BookWork;
  edition: Edition;
  actions?: ReactNode;
}) {
  const authors = authorsOf(work);
  const series = work.seriesId ? getSeries(work.seriesId) : undefined;

  return (
    <section
      aria-labelledby="judul-karya"
      className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-5 sm:gap-x-6 lg:grid-cols-[auto_minmax(0,1fr)_auto]"
    >
      <BookCover
        src={edition.cover.url}
        alt={edition.cover.alt}
        title={edition.title}
        publisherName={getPublisher(edition.publisherId)?.name ?? ""}
        size="md"
        priority
        className="self-start shadow-1 sm:row-span-2 sm:cover-lg lg:row-span-1"
      />

      <div className="flex min-w-0 flex-col gap-2">
        <div className="min-w-0">
          <p className="text-overline text-ink-500">Karya</p>

          <h1
            id="judul-karya"
            className="font-title text-h1 text-ink-900 sm:text-3xl"
            lang={edition.language}
          >
            {edition.title}
          </h1>
        </div>

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

      {actions && (
        <div className="col-span-2 sm:col-span-1 sm:col-start-2 lg:col-start-3 lg:row-start-1 lg:pt-6 max-sm:[&>div]:block max-sm:[&>div>button]:w-full max-sm:[&>div>button]:justify-center max-sm:[&>span]:w-full">
          {actions}
        </div>
      )}
    </section>
  );
}
