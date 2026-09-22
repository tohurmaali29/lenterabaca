import { BookMarked, Library } from "lucide-react";
import Link from "next/link";

import { HeaderSearchSlot } from "@/components/shell/HeaderSearchSlot";
import { SkipLink } from "@/components/shell/SkipLink";

/**
 * Shell tunggal untuk seluruh route.
 *
 * Menjawab temuan F1 dan F2 di RnD bagian 3:
 * - header dan navigasi selalu ada di viewport atas, tidak perlu scroll
 * - strukturnya tidak kondisional, jadi tidak pernah ada dua navbar
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipLink />

      <header
        className="sticky top-0 border-b border-line bg-surface/95 backdrop-blur"
        style={{ zIndex: "var(--z-header)" }}
      >
        <div className="container-page flex h-16 items-center gap-3 sm:gap-4">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 rounded-sm text-ink-900"
            aria-label="LenteraBaca, ke halaman utama"
          >
            <Library aria-hidden="true" className="size-5 text-accent-600" />
            <span className="text-h3 font-semibold">LenteraBaca</span>
          </Link>

          <HeaderSearchSlot />

          <nav aria-label="Navigasi utama" className="ml-auto shrink-0">
            <Link
              href="/my-books"
              className="flex tap-target items-center gap-2 rounded-md px-3 text-body text-ink-700 hover:bg-surface-alt hover:text-ink-900"
            >
              <BookMarked aria-hidden="true" className="size-4" />
              <span className="hidden sm:inline">Rak Saya</span>
              <span className="sr-only sm:hidden">Rak Saya</span>
            </Link>
          </nav>
        </div>
      </header>

      <main id="main" className="container-page flex-1 py-6 sm:py-8 lg:py-10">
        {children}
      </main>

      <footer className="mt-auto border-t border-line bg-surface-alt">
        <div className="container-page flex flex-col gap-1 py-6 text-sm text-ink-500">
          <p>
            LenteraBaca - prototype redesign penemuan edisi terjemahan Indonesia. Data katalog
            adalah fixtures kurasi, bukan katalog nyata.
          </p>
          <p>
            <Link href="/about" className="text-accent-600 underline underline-offset-2">
              Tentang project dan metodenya
            </Link>
          </p>
        </div>
      </footer>
    </>
  );
}
