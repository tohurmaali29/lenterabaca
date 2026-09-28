"use client";

import { X } from "lucide-react";
import Link from "next/link";

import { useHydrated, useStore } from "@/hooks/useStore";
import { forgetSearch, recentSearchStore } from "@/lib/stores";

/**
 * Dipakai di halaman discovery sebagai jalan pintas. Setiap entri bisa
 * dihapus satu per satu, karena riwayat pencarian buku bisa jadi hal yang
 * tidak ingin dilihat orang lain di layar yang sama.
 */
export function RecentSearches({ tone = "default" }: { tone?: "default" | "onImage" }) {
  const hydrated = useHydrated();
  const searches = useStore(recentSearchStore);

  if (!hydrated || searches.length === 0) return null;

  return (
    <section aria-labelledby="judul-terakhir" className="mt-5">
      <h2
        id="judul-terakhir"
        className={
          tone === "onImage"
            ? "text-xs font-semibold tracking-wide text-white/70 uppercase"
            : "text-xs font-semibold tracking-wide text-ink-500 uppercase"
        }
      >
        Pencarian terakhir
      </h2>

      <ul className="mt-2 flex flex-wrap gap-1.5">
        {searches.map((query) => (
          <li
            key={query}
            className="flex items-center rounded-pill border border-line bg-surface shadow-1 transition-[border-color,background-color,box-shadow] duration-[var(--dur-micro)] hover:border-accent-600 hover:bg-surface-alt hover:shadow-2"
          >
            <Link
              href={`/search?q=${encodeURIComponent(query)}`}
              className="py-1.5 pl-3 text-xs font-medium text-ink-700 hover:text-ink-900"
            >
              {query}
            </Link>
            <button
              type="button"
              onClick={() => forgetSearch(query)}
              className="flex size-7 items-center justify-center rounded-pill text-ink-400 transition-colors hover:bg-surface-sunken hover:text-ink-900"
            >
              <X aria-hidden="true" className="size-3" />
              <span className="sr-only">Hapus pencarian {query}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
