import Link from "next/link";

import { BookCover } from "@/components/book/BookCover";
import { CompactRating } from "@/components/book/CoverTile";
import { LanguageBadge } from "@/components/edition/LanguageBadge";
import { authorsOf, getPublisher } from "@/data/catalog";
import type { SearchResult } from "@/lib/search/query";

export function RankedList({ items }: { items: SearchResult[] }) {
  return (
    <ol className="grid divide-y divide-line overflow-hidden rounded-md border border-line sm:grid-cols-2 sm:gap-x-6 sm:gap-y-3 sm:divide-y-0 sm:overflow-visible sm:rounded-none sm:border-0 lg:grid-cols-3">
      {items.map(({ work, edition }, index) => {
        const authors = authorsOf(work)
          .map((author) => author.name)
          .join(", ");

        return (
          <li key={work.id}>
            <Link
              href={`/book/${work.slug}?edition=${edition.id}`}
              className="group flex items-center gap-3 bg-surface-alt px-3 py-2.5 transition-[border-color,transform] duration-[var(--dur-micro)] sm:rounded-md sm:border sm:border-line sm:py-3 sm:hover:-translate-y-0.5 sm:hover:border-accent-600"
            >
              <span
                aria-hidden="true"
                className="w-8 shrink-0 text-center font-title text-[2.5rem] leading-none font-bold text-ink-400"
              >
                {index + 1}
              </span>
              <span className="sr-only">Peringkat {index + 1}: </span>

              <BookCover
                src={edition.cover.url}
                alt=""
                title={edition.title}
                publisherName={getPublisher(edition.publisherId)?.name ?? ""}
                size="sm"
                priority={index < 3}
                className="!h-[72px] !w-12 shadow-1"
              />

              <span className="flex min-w-0 flex-col gap-0.5">
                <span
                  lang={edition.language}
                  className="line-clamp-1 font-title text-body font-semibold text-ink-900 group-hover:text-accent-600"
                >
                  {edition.title}
                </span>
                <span className="line-clamp-1 text-xs text-ink-500">{authors}</span>
                <span className="mt-0.5 flex items-center gap-2">
                  <CompactRating work={work} />
                  {work.hasIndonesianEdition && <LanguageBadge lang="id" />}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
