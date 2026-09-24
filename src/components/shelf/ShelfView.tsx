"use client";

import Link from "next/link";
import { useState } from "react";

import { BookCover } from "@/components/book/BookCover";
import { LanguageBadge } from "@/components/edition/LanguageBadge";
import { SHELF_STATUSES, shelfStatusLabel } from "@/components/shelf/ShelfButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useHydrated, useStore } from "@/hooks/useStore";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import { shelfStore } from "@/lib/stores";
import type { LangCode, ShelfStatus } from "@/lib/types";

export interface EditionLookup {
  workSlug: string;
  workTitle: string;
  editionTitle: string;
  language: LangCode;
  publisherName: string;
  publishedYear: number;
  coverUrl: string;
  coverAlt: string;
}

/**
 * Isi rak. RnD R-15 dan empty state E-07 serta E-08.
 *
 * Setiap item menyebut edisi yang disimpan, bukan hanya judul karyanya.
 */
export function ShelfView({ lookup }: { lookup: Record<string, EditionLookup> }) {
  const hydrated = useHydrated();
  const shelf = useStore(shelfStore);
  const [tab, setTab] = useState<ShelfStatus>("want-to-read");

  if (!hydrated) {
    return (
      <div aria-busy="true" className="flex flex-col gap-3">
        {[0, 1, 2].map((index) => (
          <div key={index} className="h-28 animate-pulse rounded-lg bg-surface-sunken" />
        ))}
      </div>
    );
  }

  if (shelf.length === 0) {
    return (
      <EmptyState
        code="E-07"
        title="Rak kamu masih kosong"
        body="Cari buku, pilih edisi yang benar, lalu simpan ke rak. Data tersimpan di browser ini."
        actions={[{ label: "Mulai cari buku", href: "/" }]}
      />
    );
  }

  const visible = shelf.filter((item) => item.status === tab);

  return (
    <div className="flex flex-col gap-4">
      <div role="tablist" aria-label="Status bacaan" className="flex flex-wrap gap-2">
        {SHELF_STATUSES.map((status) => {
          const count = shelf.filter((item) => item.status === status).length;
          const active = tab === status;
          return (
            <button
              key={status}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(status)}
              className={cn(
                "rounded-pill tap-target border px-4 text-sm",
                active
                  ? "border-accent-600 bg-accent-100 font-medium text-accent-700"
                  : "border-line-strong text-ink-700 hover:bg-surface-alt",
              )}
            >
              {shelfStatusLabel(status)} ({count})
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          code="E-08"
          title="Belum ada buku di rak ini"
          body={`Kamu belum menandai buku apa pun sebagai ${shelfStatusLabel(tab)}.`}
          actions={[{ label: "Cari buku", href: "/" }]}
        />
      ) : (
        <ol className="flex flex-col gap-3">
          {visible.map((item) => {
            const info = lookup[item.editionId as string];
            if (!info) return null;

            return (
              <li
                key={item.workId}
                className="flex gap-4 rounded-lg border border-line bg-surface-alt p-4"
              >
                <BookCover
                  src={info.coverUrl}
                  alt=""
                  title={info.editionTitle}
                  publisherName={info.publisherName}
                  size="sm"
                />

                <div className="flex min-w-0 flex-col gap-1">
                  <h2 className="text-h3">
                    <Link
                      href={`/book/${info.workSlug}?edition=${item.editionId}`}
                      className="font-title text-ink-900 hover:underline hover:underline-offset-2"
                      lang={info.language}
                    >
                      {info.editionTitle}
                    </Link>
                  </h2>

                  <p className="flex flex-wrap items-center gap-2 text-sm text-ink-700">
                    <LanguageBadge lang={info.language} />
                    {info.publisherName} &middot; {info.publishedYear}
                  </p>

                  <p className="text-sm text-ink-500">
                    Disimpan {formatDate(item.addedAt)}
                    {item.finishedAt ? ` · selesai ${formatDate(item.finishedAt)}` : ""}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
