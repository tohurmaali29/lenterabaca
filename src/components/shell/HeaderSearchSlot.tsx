"use client";

import { usePathname } from "next/navigation";

import { SearchBar } from "@/components/search/SearchBar";

/**
 * Slot search di header.
 *
 * Kenapa client island kecil, bukan logika di dalam AppShell:
 * AppShell tetap Server Component (RnD D-11), dan keputusan
 * "satu search bar saja per dokumen" (R-12) terkumpul di satu tempat
 * yang mudah diaudit.
 *
 * Di halaman discovery, search bar sudah hadir sebagai hero,
 * jadi slot ini tidak merender apa pun. Header, navbar, dan footer
 * tetap sama di semua route - yang bergeser hanya posisi search bar.
 * Ini beda dengan temuan F2 di Goodreads, di mana navbar itu sendiri
 * muncul belakangan sehingga menghasilkan dua navbar dan dua search bar.
 */
export function HeaderSearchSlot() {
  const pathname = usePathname();

  if (pathname === "/") return null;

  return (
    <div className="min-w-0 flex-1 md:max-w-md">
      <SearchBar size="compact" />
    </div>
  );
}
