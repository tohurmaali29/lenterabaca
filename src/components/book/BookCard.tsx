import Link from "next/link";

import { RatingDisplay } from "@/components/book/RatingDisplay";
import { LanguageBadge } from "@/components/edition/LanguageBadge";
import { MatchReason } from "@/components/search/MatchReason";
import { authorsOf, editionsOf, getPublisher } from "@/data/catalog";
import { cn } from "@/lib/cn";
import { editionSummary } from "@/lib/format";
import type { SearchResult } from "@/lib/search/query";

/**
 * Kartu hasil pencarian. RnD 17.1.
 *
 * Urutan informasi dikunci dan tidak boleh diatur ulang tanpa mengubah
 * dokumen: cover, judul, badge bahasa, penulis dan tahun, rating,
 * alasan kecocokan, edisi terpilih, lalu aksi.
 *
 * Dua baris yang paling menentukan adalah alasan kecocokan dan edisi
 * terpilih. Keduanya tidak ada sama sekali di Goodreads (temuan F6 dan F7),
 * dan keduanya yang membuat bahasa terlihat tanpa klik tambahan.
 */
export function BookCard({
  result,
  priority = false,
}: {
  result: SearchResult;
  priority?: boolean;
}) {
  const { work, edition, matchedOn } = result;

  const authors = authorsOf(work);
  const publisher = getPublisher(edition.publisherId);
  const all = editionsOf(work.id);
  const indonesianCount = all.filter((item) => item.language === "id").length;

  // Badge diurutkan supaya Bahasa Indonesia selalu tampil lebih dulu.
  const languages = [...work.availableLanguages].sort((a, b) =>
    a === "id" ? -1 : b === "id" ? 1 : a.localeCompare(b),
  );

  return (
    <article
      className={cn(
        "group flex gap-4 rounded-lg border border-line bg-surface-alt p-4",
        "transition-shadow duration-[var(--dur-micro)] hover:shadow-2",
      )}
    >
      <Link
        href={`/book/${work.slug}?edition=${edition.id}`}
        tabIndex={-1}
        aria-hidden="true"
        className="shrink-0"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={edition.cover.url}
          alt=""
          width={edition.cover.width}
          height={edition.cover.height}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          className="cover-sm rounded-sm bg-surface-sunken object-cover sm:cover-md"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-start gap-x-2 gap-y-1">
          <h3 className="min-w-0 text-h3 text-ink-900">
            <Link
              href={`/book/${work.slug}?edition=${edition.id}`}
              className="font-title hover:underline hover:underline-offset-2"
              lang={edition.language}
            >
              {edition.title}
            </Link>
          </h3>
          <span className="flex shrink-0 gap-1 pt-0.5">
            {languages.map((lang) => (
              <LanguageBadge key={lang} lang={lang} />
            ))}
          </span>
        </div>

        <p className="text-sm text-ink-500">
          {authors.map((author) => author.name).join(", ")} &middot; {work.firstPublishedYear}
        </p>

        <RatingDisplay summary={work.ratingSummary} scope="work" className="mt-0.5" />

        <MatchReason match={matchedOn} />

        <p className="mt-1 text-sm text-ink-700">
          <span className="text-ink-500">Edisi terpilih: </span>
          {editionSummary(edition, publisher?.name ?? "Penerbit tidak diketahui")}
        </p>

        <div className="mt-2 flex flex-wrap gap-2">
          <Link
            href={`/book/${work.slug}?edition=${edition.id}`}
            className={cn(
              "inline-flex tap-target items-center rounded-md bg-accent-600 px-4 text-body font-medium text-accent-on",
              "transition-colors duration-[var(--dur-micro)] hover:bg-accent-700",
            )}
          >
            Lihat buku
          </Link>

          <Link
            href={`/book/${work.slug}/editions`}
            className={cn(
              "inline-flex tap-target items-center rounded-md border border-line-strong px-4 text-body text-ink-700",
              "transition-colors duration-[var(--dur-micro)] hover:bg-surface",
            )}
          >
            {work.hasIndonesianEdition
              ? `Ganti edisi (${all.length})`
              : `Lihat ${all.length} edisi`}
          </Link>
        </div>

        {!work.hasIndonesianEdition && (
          <p className="mt-1 text-sm text-ink-400">Belum ada edisi Bahasa Indonesia di katalog</p>
        )}
        {indonesianCount > 1 && (
          <p className="mt-1 text-sm text-ink-500">
            {indonesianCount} edisi Bahasa Indonesia tersedia
          </p>
        )}
      </div>
    </article>
  );
}
