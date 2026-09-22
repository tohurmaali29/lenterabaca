"use client";

import { Check } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";
import { formatCount, formatName, languageName } from "@/lib/format";
import type { SortKey } from "@/lib/search/query";
import { logEvent } from "@/lib/stores";
import type { Format, LangCode } from "@/lib/types";

/**
 * Filter hasil pencarian. RnD R-04, 17.1, 20.
 *
 * Seluruh state filter hidup di URL, bukan di state React. Konsekuensinya:
 * hasil yang sudah disaring ke Bahasa Indonesia bisa dibagikan sebagai tautan,
 * dan tombol back mengembalikan filter sebelumnya. Itu justru bentuk paling
 * langsung dari solusi terhadap masalah yang diaudit (RnD D-01).
 *
 * Bahasa sengaja berupa chip yang selalu terlihat, bukan dropdown, karena
 * bahasa adalah atribut kelas satu di produk ini (prinsip language-first).
 */

export interface FilterOption<T extends string> {
  value: T;
  /** Hanya perlu untuk penerbit. Bahasa dan format memakai nama dari lib/format. */
  label?: string;
  count?: number;
}

const SORT_LABELS: Record<SortKey, string> = {
  relevance: "Paling relevan",
  rating: "Rating tertinggi",
  newest: "Terbit terbaru",
  title: "Judul A sampai Z",
};

export function FilterBar({
  languages,
  formats,
  publishers,
  resultCount,
  query,
}: {
  languages: Array<FilterOption<LangCode>>;
  formats: Array<FilterOption<Format>>;
  publishers: Array<FilterOption<string>>;
  resultCount: number;
  query: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const activeLanguage = params.get("lang") ?? "all";
  const activeFormat = params.get("format") ?? "all";
  const activePublisher = params.get("publisher") ?? "all";
  const activeSort = (params.get("sort") as SortKey | null) ?? "relevance";

  function update(key: string, value: string) {
    logEvent("filter_changed", { field: key, value, resultCount });
    const next = new URLSearchParams(params.toString());
    if (value === "all" || value === "relevance") next.delete(key);
    else next.set(key, value);
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  }

  const activeCount = [activeLanguage, activeFormat, activePublisher].filter(
    (value) => value !== "all",
  ).length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span id="filter-bahasa" className="text-sm font-medium text-ink-700">
          Bahasa
        </span>
        <div role="group" aria-labelledby="filter-bahasa" className="flex flex-wrap gap-2">
          <Chip
            active={activeLanguage === "all"}
            onClick={() => update("lang", "all")}
            label="Semua"
          />
          {languages.map((option) => (
            <Chip
              key={option.value}
              active={activeLanguage === option.value}
              onClick={() => update("lang", option.value)}
              label={languageName(option.value)}
              count={option.count}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <Dropdown
          label="Format"
          value={activeFormat}
          onChange={(value) => update("format", value)}
          options={[
            { value: "all", label: "Semua format" },
            ...formats.map((option) => ({
              value: option.value as string,
              label: formatName(option.value),
            })),
          ]}
        />

        <Dropdown
          label="Penerbit"
          value={activePublisher}
          onChange={(value) => update("publisher", value)}
          options={[
            { value: "all", label: "Semua penerbit" },
            ...publishers.map((option) => ({
              value: option.value,
              label: option.label ?? option.value,
            })),
          ]}
        />

        <Dropdown
          label="Urutkan"
          value={activeSort}
          onChange={(value) => update("sort", value)}
          options={(Object.keys(SORT_LABELS) as SortKey[]).map((key) => ({
            value: key,
            label: SORT_LABELS[key],
          }))}
        />

        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => router.push(`${pathname}?q=${encodeURIComponent(query)}`)}
            className="text-sm text-accent-600 underline underline-offset-2"
          >
            Hapus {activeCount} filter
          </button>
        )}
      </div>

      <ResultAnnouncer count={resultCount} query={query} activeLanguage={activeLanguage} />
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-pill inline-flex h-9 items-center gap-1.5 border px-3 text-sm",
        "transition-colors duration-[var(--dur-micro)]",
        active
          ? "border-accent-600 bg-accent-100 font-medium text-accent-700"
          : "border-line-strong text-ink-700 hover:bg-surface-alt",
      )}
    >
      {active && <Check aria-hidden="true" className="size-3.5" />}
      {label}
      {typeof count === "number" && (
        <span className="text-ink-500" aria-hidden="true">
          {count}
        </span>
      )}
    </button>
  );
}

function Dropdown({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-ink-700">
      <span className="font-medium">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "h-9 rounded-md border border-line-strong bg-surface px-2 text-sm text-ink-900",
          "hover:border-ink-400",
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/**
 * Pengumuman jumlah hasil untuk screen reader. RnD 21.3.
 *
 * Di-debounce terpisah dari pencarian supaya tidak membanjiri screen reader
 * saat user mengubah beberapa filter berturut-turut.
 */
function ResultAnnouncer({
  count,
  query,
  activeLanguage,
}: {
  count: number;
  query: string;
  activeLanguage: string;
}) {
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const filterNote =
        activeLanguage === "all" ? "" : `, difilter ${languageName(activeLanguage)}`;
      setMessage(`Menampilkan ${formatCount(count)} karya untuk ${query}${filterNote}`);
    }, 500);

    return () => clearTimeout(timer.current);
  }, [count, query, activeLanguage]);

  return (
    <p aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </p>
  );
}
