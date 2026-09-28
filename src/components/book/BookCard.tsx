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
 * Urutan informasi dikunci dan tidak boleh diatur ulang tanpa mengubah
 * dokumen: cover, judul, badge bahasa, penulis dan tahun, rating,
 * alasan kecocokan, edisi terpilih, lalu aksi.
 *
 * Tautan judul direntangkan menutupi seluruh kartu, jadi kartu bisa diklik
 * di mana saja tanpa tombol terpisah. Tautan ganti edisi diangkat di atasnya.
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
        "group relative flex h-full gap-3 rounded-lg border border-line bg-surface-alt p-3.5 sm:gap-4 sm:p-4",
        "transition-[border-color,transform] duration-[var(--dur-dropdown)] ease-[var(--ease-out)]",
        "hover:-translate-y-0.5 hover:border-accent-600",
      )}
    >
      <BookCover
        src={edition.cover.url}
        alt=""
        title={edition.title}
        publisherName={publisher?.name ?? ""}
        size="sm"
        priority={priority}
        className="shadow-2 ring-1 ring-line sm:cover-md"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-start gap-x-2 gap-y-1">
          <Heading className="min-w-0 font-title text-h3 text-ink-900 sm:text-h2">
            <ResultLink
              href={`/book/${work.slug}?edition=${edition.id}`}
              workId={work.id}
              position={position ?? 0}
              matchedOnField={matchedOn.field}
              lang={edition.language}
              className="group-hover:text-accent-600 after:absolute after:inset-0 after:rounded-lg"
            >
              {edition.title}
            </ResultLink>
          </Heading>
          <span className="flex shrink-0 gap-1 pt-1">
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

        <p className="text-sm text-ink-700">
          <span className="text-ink-500">Edisi terpilih: </span>
          {editionSummary(edition, publisher?.name ?? "Penerbit tidak diketahui")}
        </p>

        <p className="mt-auto flex flex-col items-start gap-x-2 pt-2 text-sm sm:flex-row sm:flex-wrap sm:items-center">
          <Link
            href={`/book/${work.slug}/editions`}
            className="relative z-10 font-medium text-accent-600 underline-offset-2 hover:underline"
          >
            {work.hasIndonesianEdition
              ? `Ganti edisi (${all.length})`
              : `Lihat ${all.length} edisi`}
          </Link>
          {!work.hasIndonesianEdition && (
            <span className="text-ink-500">
              <span className="max-sm:hidden">&middot; </span>Belum ada edisi Bahasa Indonesia di
              katalog
            </span>
          )}
          {indonesianCount > 1 && (
            <span className="text-ink-500">
              <span className="max-sm:hidden">&middot; </span>
              {indonesianCount} edisi Bahasa Indonesia tersedia
            </span>
          )}
        </p>
      </div>
    </article>
  );
}
