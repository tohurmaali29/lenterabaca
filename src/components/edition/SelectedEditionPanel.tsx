import { EditionSelector, type PublisherOption } from "@/components/edition/EditionSelector";
import { LanguageBadge } from "@/components/edition/LanguageBadge";
import { getPublisher, getTranslator } from "@/data/catalog";
import {
  availabilityName,
  editionExtent,
  formatCount,
  formatName,
  formatRating,
} from "@/lib/format";
import { EDITION_RATING_MIN_COUNT } from "@/lib/rating";
import type { BookWork, Edition } from "@/lib/types";

/**
 * Selalu terbuka, tidak pernah di balik disclosure. Rating edisi ditampilkan
 * terpisah dari rating karya, dan cakupannya selalu disebut (temuan F7).
 */
export function SelectedEditionPanel({
  work,
  edition,
  editions,
  publishers,
}: {
  work: BookWork;
  edition: Edition;
  editions: Edition[];
  publishers: PublisherOption[];
}) {
  const publisher = getPublisher(edition.publisherId);
  const translators = edition.translatorIds
    .map((id) => getTranslator(id)?.name)
    .filter((name): name is string => !!name);

  const availability = availabilityName(edition.availability);
  const hasOwnRating = edition.ratingSummary.count >= EDITION_RATING_MIN_COUNT;

  const rows: Array<[string, string | null]> = [
    ["Bahasa", null],
    ["Penerbit", publisher?.name ?? null],
    ["Tahun terbit", String(edition.publishedYear)],
    ["Format", formatName(edition.format)],
    [
      "Cetakan",
      [edition.editionLabel, edition.printing ? `cetakan ke-${edition.printing}` : null]
        .filter(Boolean)
        .join(", ") || null,
    ],
    [edition.durationMinutes ? "Durasi" : "Jumlah halaman", editionExtent(edition)],
    ["Penerjemah", translators.length > 0 ? translators.join(", ") : null],
    ["ISBN", edition.isbn13 ?? edition.isbn10 ?? null],
    ["Ketersediaan", availability],
  ];

  return (
    <section
      aria-labelledby="judul-edisi-terpilih"
      className="rounded-lg border border-line bg-surface-alt p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-overline text-ink-500">Edisi terpilih</p>
          <h2 id="judul-edisi-terpilih" className="mt-1 flex flex-wrap items-center gap-2">
            <LanguageBadge lang={edition.language} size="md" />
            <span className="font-title text-h2 text-ink-900" lang={edition.language}>
              {edition.title}
            </span>
          </h2>
        </div>

        <EditionSelector
          workId={work.id}
          editions={editions}
          selectedId={edition.id}
          workTitle={work.originalTitle}
          publishers={publishers}
          triggerLabel={`Ganti edisi (${editions.length})`}
        />
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
        {rows.map(([label, value]) => {
          if (label === "Bahasa") {
            return (
              <div key={label} className="flex gap-2 text-body">
                <dt className="min-w-32 shrink-0 text-ink-500">Bahasa</dt>
                <dd className="text-ink-900">
                  {new Intl.DisplayNames(["id-ID"], { type: "language" }).of(edition.language) ??
                    edition.language}
                  {edition.isTranslation ? " (terjemahan)" : ""}
                </dd>
              </div>
            );
          }
          if (!value) return null;
          return (
            <div key={label} className="flex gap-2 text-body">
              <dt className="min-w-32 shrink-0 text-ink-500">{label}</dt>
              <dd className="min-w-0 text-ink-900">{value}</dd>
            </div>
          );
        })}
      </dl>

      <p className="mt-4 border-t border-line pt-3 text-body">
        {hasOwnRating ? (
          <span className="text-rating-text">
            {formatRating(edition.ratingSummary.average)} dari 5 untuk edisi ini, dari{" "}
            {formatCount(edition.ratingSummary.count)} rating
          </span>
        ) : (
          <span className="text-ink-500">
            Belum cukup rating untuk edisi ini. Yang ditampilkan di atas adalah rata-rata seluruh
            karya, dari {formatCount(work.ratingSummary.count)} rating.
          </span>
        )}
      </p>
    </section>
  );
}
