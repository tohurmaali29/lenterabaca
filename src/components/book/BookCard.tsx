import Link from "next/link";

import { BookCover } from "@/components/book/BookCover";
import { RatingDisplay } from "@/components/book/RatingDisplay";
import { LanguageBadge } from "@/components/edition/LanguageBadge";
import { MatchReason } from "@/components/search/MatchReason";
import { ResultLink } from "@/components/search/ResultLink";
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
  headingLevel = 3,
  position,
}: {
  result: SearchResult;
  priority?: boolean;
  /** Posisi 1-based di daftar hasil, dicatat saat kartu diklik (bagian 30). */
  position?: number;
  /**
   * Tingkat heading judul buku. Wajib menyesuaikan konteks halaman, karena
   * melompati tingkat heading melanggar WCAG 1.3.1 (RnD 21.1). Di halaman
   * hasil, kartu berada langsung di bawah h1 sehingga memakai h2. Di halaman
   * discovery, kartu berada di dalam section ber-h2 sehingga memakai h3.
   */
  headingLevel?: 2 | 3;
}) {
  const { work, edition, matchedOn } = result;
  const Heading = `h${headingLevel}` as "h2" | "h3";

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
        <BookCover
          src={edition.cover.url}
          alt=""
          title={edition.title}
          publisherName={publisher?.name ?? ""}
          size="sm"
          priority={priority}
          className="sm:cover-md"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-start gap-x-2 gap-y-1">
          <Heading className="min-w-0 text-h3 text-ink-900">
            <ResultLink
              href={`/book/${work.slug}?edition=${edition.id}`}
              workId={work.id}
              position={position ?? 0}
              matchedOnField={matchedOn.field}
              lang={edition.language}
              className="font-title hover:underline hover:underline-offset-2"
            >
              {edition.title}
            </ResultLink>
          </Heading>
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
          <ResultLink
            href={`/book/${work.slug}?edition=${edition.id}`}
            workId={work.id}
            position={position ?? 0}
            matchedOnField={matchedOn.field}
            className={cn(
              "inline-flex tap-target items-center rounded-md bg-accent-600 px-4 text-body font-medium text-accent-on",
              "transition-colors duration-[var(--dur-micro)] hover:bg-accent-700",
            )}
          >
            Lihat buku
          </ResultLink>

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
