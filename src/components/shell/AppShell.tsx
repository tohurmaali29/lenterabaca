import { BookMarked, Library } from "lucide-react";
import Link from "next/link";

import { HeaderSearchSlot } from "@/components/shell/HeaderSearchSlot";
import { SkipLink } from "@/components/shell/SkipLink";
import { StorageBanner } from "@/components/shell/StorageBanner";
import { ThemeToggle } from "@/components/shell/ThemeToggle";
import { WriteNotice } from "@/components/shell/WriteNotice";

/**
 * Shell tunggal untuk seluruh route. Strukturnya tidak kondisional, jadi
 * tidak pernah ada dua navbar (temuan F2).
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipLink />
      <StorageBanner />
      <WriteNotice />

      <header
        className="sticky top-0 border-b border-line bg-surface/90 shadow-1 backdrop-blur-md"
        style={{ zIndex: "var(--z-header)" }}
      >
        <div className="group container-page flex h-16 items-center gap-2 sm:gap-4">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 rounded-md text-ink-900 transition-colors hover:text-accent-700"
            aria-label="LenteraBaca, ke halaman utama"
          >
            <span className="flex size-8 items-center justify-center rounded-md bg-accent-100 text-accent-700">
              <Library aria-hidden="true" className="size-4.5" />
            </span>
            {/* Di mobile, nama disembunyikan saat header memuat search bar supaya kolomnya
                cukup lebar, dan di layar di bawah 360px supaya tombol tema tetap muat. */}
            <span className="text-h3 font-semibold max-[359px]:hidden max-sm:group-has-[[role=search]]:hidden">
              LenteraBaca
            </span>
          </Link>

          <HeaderSearchSlot />

          <div className="ml-auto shrink-0">
            <ThemeToggle />
          </div>

          <nav aria-label="Navigasi utama" className="shrink-0">
            <Link
              href="/my-books"
              className="flex tap-target items-center justify-center gap-2 rounded-md px-2 text-body text-ink-700 transition-[background-color,color,transform] duration-[var(--dur-micro)] hover:-translate-y-0.5 hover:bg-surface-alt hover:text-ink-900 sm:px-3"
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

      <footer className="mt-16 border-t border-line">
        <div className="container-page flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-6 text-sm text-ink-500">
          <p>
            <span className="font-semibold text-ink-700">LenteraBaca</span> &middot; prototype, data
            katalog hasil kurasi
          </p>
          <Link href="/about" className="text-accent-600 underline-offset-2 hover:underline">
            Tentang project
          </Link>
        </div>
      </footer>
    </>
  );
}
