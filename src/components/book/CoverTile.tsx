import { Star } from "lucide-react";
import Link from "next/link";

import { BookCover } from "@/components/book/BookCover";
import { LanguageBadge } from "@/components/edition/LanguageBadge";
import { authorsOf, getPublisher } from "@/data/catalog";
import { cn } from "@/lib/cn";
import { formatCount, formatRating } from "@/lib/format";
import type { BookWork, Edition } from "@/lib/types";

/**
 * Rating ringkas untuk tile dan daftar. Angkanya tanpa label di layar, jadi
 * cakupannya (karya) tetap disebut untuk screen reader (RnD 24.3).
 */
export function CompactRating({ work, className }: { work: BookWork; className?: string }) {
  const { average, count } = work.ratingSummary;
  if (count === 0) return null;

  return (
    <span className={cn("inline-flex items-center gap-1 text-sm text-rating-text", className)}>
      <Star aria-hidden="true" className="size-3.5 fill-rating-fill text-rating-fill" />
      <span aria-hidden="true">{formatRating(average)}</span>
      <span className="sr-only">
        Rata-rata karya {formatRating(average)} dari 5, dari {formatCount(count)} rating
      </span>
    </span>
  );
}

export function CoverTile({
  work,
  edition,
  priority = false,
}: {
  work: BookWork;
  edition: Edition;
  priority?: boolean;
}) {
  const authors = authorsOf(work)
    .map((author) => author.name)
    .join(", ");

  return (
    <Link
      href={`/book/${work.slug}?edition=${edition.id}`}
      className="group flex w-32 flex-col gap-2 rounded-sm sm:w-40"
    >
      <BookCover
        src={edition.cover.url}
        alt=""
        title={edition.title}
        publisherName={getPublisher(edition.publisherId)?.name ?? ""}
        size="lg"
        priority={priority}
        className={cn(
          "!h-48 !w-32 shadow-2 ring-1 ring-line transition-[transform,box-shadow] duration-[var(--dur-dropdown)] ease-[var(--ease-out)] sm:!h-60 sm:!w-40",
          "group-hover:-translate-y-1 group-hover:shadow-3 group-hover:ring-accent-600",
        )}
      />

      <span className="flex flex-col gap-0.5">
        <span
          lang={edition.language}
          className="line-clamp-2 font-title text-body font-semibold text-ink-900 group-hover:text-accent-600"
        >
          {edition.title}
        </span>
        <span className="line-clamp-1 text-xs text-ink-500">{authors}</span>
        <span className="mt-1 flex items-center gap-2">
          <CompactRating work={work} />
          {work.hasIndonesianEdition && <LanguageBadge lang="id" />}
        </span>
      </span>
    </Link>
  );
}
