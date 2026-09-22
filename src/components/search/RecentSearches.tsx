"use client";

import { X } from "lucide-react";
import Link from "next/link";

import { useHydrated, useStore } from "@/hooks/useStore";
import { forgetSearch, recentSearchStore } from "@/lib/stores";

/**
 * Pencarian terakhir. RnD R-17.
 *
 * Dipakai di halaman discovery sebagai jalan pintas. Setiap entri bisa
 * dihapus satu per satu, karena riwayat pencarian buku bisa jadi hal yang
 * tidak ingin dilihat orang lain di layar yang sama.
 */
export function RecentSearches() {
  const hydrated = useHydrated();
  const searches = useStore(recentSearchStore);

  if (!hydrated || searches.length === 0) return null;

  return (
    <section aria-labelledby="judul-terakhir" className="mt-6">
      <h2 id="judul-terakhir" className="text-sm font-medium text-ink-700">
        Pencarian terakhir
      </h2>

      <ul className="mt-2 flex flex-wrap gap-2">
        {searches.map((query) => (
          <li key={query} className="rounded-pill flex items-center border border-line-strong">
            <Link
              href={`/search?q=${encodeURIComponent(query)}`}
              className="py-2 pl-4 text-sm text-ink-700 hover:text-ink-900"
            >
              {query}
            </Link>
            <button
              type="button"
              onClick={() => forgetSearch(query)}
              className="rounded-pill flex size-9 items-center justify-center text-ink-400 hover:text-ink-900"
            >
              <X aria-hidden="true" className="size-3.5" />
              <span className="sr-only">Hapus pencarian {query}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
