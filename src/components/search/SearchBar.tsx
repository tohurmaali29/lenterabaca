"use client";

import { ArrowUpRight, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useMemo, useState } from "react";

import { BookCover } from "@/components/book/BookCover";
import { authorsOf, getPublisher } from "@/data/catalog";
import { cn } from "@/lib/cn";
import { suggestions } from "@/lib/search/query";
import { rememberSearch } from "@/lib/stores";

type SearchBarProps = {
  /** hero = elemen utama halaman discovery. compact = di dalam header. */
  size?: "hero" | "compact";
  tone?: "default" | "onImage";
  defaultValue?: string;
  className?: string;
};

/**
 * Satu-satunya komponen input pencarian.
 * RnD 14.1 R-12: hanya boleh ada satu instance yang terlihat per dokumen.
 * Penempatannya diatur AppShell (header) dan halaman discovery (hero).
 */
export function SearchBar({
  size = "compact",
  tone = "default",
  defaultValue = "",
  className,
}: SearchBarProps) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);
  const inputId = useId();
  const hintId = useId();
  const panelId = useId();

  const isHero = size === "hero";
  const query = value.trim();
  const suggestionItems = useMemo(() => suggestions(query, isHero ? 5 : 4), [isHero, query]);
  const showSuggestions = isFocused && query.length >= 2 && suggestionItems.length > 0;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // RnD 26.6: panjang query minimum 2 karakter (empty state E-02).
    if (query.length < 2) return;

    rememberSearch(query);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={cn("relative w-full", className)}
      aria-describedby={isHero ? hintId : undefined}
    >
      <label htmlFor={inputId} className="sr-only">
        Cari judul buku, penulis, atau ISBN
      </label>

      {!isHero && (
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-400"
        />
      )}

      <input
        id={inputId}
        type="text"
        role="searchbox"
        name="q"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          window.setTimeout(() => setIsFocused(false), 120);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") setIsFocused(false);
        }}
        placeholder="Cari judul, penulis, atau ISBN"
        autoComplete="off"
        aria-expanded={showSuggestions}
        aria-controls={showSuggestions ? panelId : undefined}
        className={cn(
          "w-full rounded-lg border border-line-strong bg-surface text-ink-900 shadow-1 placeholder:text-ink-400",
          "transition-[border-color,box-shadow,background-color] duration-[var(--dur-dropdown)] ease-[var(--ease-out)]",
          "hover:border-accent-600 focus:border-accent-600 focus:shadow-2",
          isHero ? "h-12 pr-14 pl-4 text-body-lg sm:h-[52px] lg:h-14" : "h-10 pr-9 pl-9 text-body",
        )}
      />

      {value.length > 0 && (
        <button
          type="button"
          onClick={() => setValue("")}
          className={cn(
            "absolute top-3 flex -translate-y-1 items-center justify-center rounded-md",
            "text-ink-400 transition-colors hover:bg-surface-alt hover:text-ink-700",
            isHero ? "right-12" : "right-1",
            isHero ? "size-9" : "size-8",
          )}
        >
          <X aria-hidden="true" className="size-4" />
          <span className="sr-only">Bersihkan pencarian</span>
        </button>
      )}

      {isHero && (
        <button
          type="submit"
          aria-label="Cari buku"
          className={cn(
            "absolute top-3 right-1.5 flex -translate-y-1 items-center justify-center rounded-md",
            "text-ink-500 transition-colors duration-[var(--dur-micro)] hover:text-accent-700",
            isHero ? "size-9" : "size-8",
          )}
        >
          <Search aria-hidden="true" className="size-4.5" />
        </button>
      )}

      {showSuggestions && <SearchSuggestions id={panelId} query={query} items={suggestionItems} />}

      {isHero && (
        <p
          id={hintId}
          className={cn("mt-2 text-sm", tone === "onImage" ? "text-white/80" : "text-ink-500")}
        >
          Bisa pakai judul asli maupun judul terjemahan Indonesia.
        </p>
      )}
    </form>
  );
}

function SearchSuggestions({
  id,
  query,
  items,
}: {
  id: string;
  query: string;
  items: ReturnType<typeof suggestions>;
}) {
  return (
    <div
      id={id}
      className={cn(
        "absolute top-full right-0 left-0 mt-2 overflow-hidden rounded-lg border border-line bg-surface shadow-3",
        "animate-[search-panel-in_var(--dur-dropdown)_var(--ease-out)]",
      )}
    >
      <ul aria-label="Saran karya" className="divide-y divide-line">
        {items.map(({ work, edition }, index) => {
          const authors = authorsOf(work)
            .map((author) => author.name)
            .join(", ");
          const publisher = getPublisher(edition.publisherId);

          return (
            <li key={work.id}>
              <Link
                href={`/book/${work.slug}?edition=${edition.id}`}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5",
                  "transition-[background-color,transform] duration-[var(--dur-micro)] ease-[var(--ease-out)]",
                  "hover:bg-surface-alt focus-visible:bg-surface-alt",
                  index === 0 && "bg-surface-alt/70",
                )}
              >
                <BookCover
                  src={edition.cover.url}
                  alt=""
                  title={edition.title}
                  publisherName={publisher?.name ?? ""}
                  size="sm"
                  className="!h-[58px] !w-[39px] shadow-1 transition-transform duration-[var(--dur-micro)] group-hover:-translate-y-0.5"
                />

                <span className="min-w-0 flex-1">
                  <span className="line-clamp-1 font-title text-h3 text-ink-900">
                    {edition.title}
                  </span>
                  <span className="line-clamp-1 text-sm text-ink-500">by {authors}</span>
                </span>

                <ArrowUpRight
                  aria-hidden="true"
                  className="size-4 shrink-0 text-ink-400 opacity-0 transition-opacity group-hover:opacity-100"
                />
              </Link>
            </li>
          );
        })}
      </ul>

      <Link
        href={`/search?q=${encodeURIComponent(query)}`}
        className="flex items-center justify-center gap-2 border-t border-line bg-surface-alt px-4 py-3 text-sm font-medium text-accent-700 transition-colors hover:bg-accent-100"
      >
        Lihat semua hasil untuk &quot;{query}&quot;
        <ArrowUpRight aria-hidden="true" className="size-4" />
      </Link>
    </div>
  );
}
