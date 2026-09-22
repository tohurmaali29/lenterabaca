"use client";

import { BookMarked, Check, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

import { useHydrated, useStore } from "@/hooks/useStore";
import { cn } from "@/lib/cn";
import { logEvent, setShelfStatus, shelfStore } from "@/lib/stores";
import type { Edition, ShelfStatus } from "@/lib/types";

/**
 * Tombol simpan ke rak. RnD R-09 dan prinsip confidence before action.
 *
 * Yang membedakannya dari Goodreads: sebelum dan sesudah menyimpan, edisi
 * yang akan disimpan disebut secara eksplisit. Temuan F7 adalah user bisa
 * menyimpan buku tanpa sadar edisi mana yang melekat, dan itu diperbaiki
 * di sini, bukan di halaman lain.
 */

const STATUS_LABELS: Record<ShelfStatus, string> = {
  "want-to-read": "Ingin Dibaca",
  "currently-reading": "Sedang Dibaca",
  read: "Selesai Dibaca",
};

export const SHELF_STATUSES = Object.keys(STATUS_LABELS) as ShelfStatus[];
export const shelfStatusLabel = (status: ShelfStatus) => STATUS_LABELS[status];

export function ShelfButton({
  workId,
  edition,
  publisherName,
}: {
  workId: string;
  edition: Edition;
  publisherName: string;
}) {
  const hydrated = useHydrated();
  const shelf = useStore(shelfStore);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const current = shelf.find((item) => item.workId === workId);
  const editionNote = `edisi ${publisherName} ${edition.publishedYear}`;

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  function choose(status: ShelfStatus | null) {
    setOpen(false);
    setShelfStatus(workId, edition.id, status);

    if (status === null) {
      setToast("Dihapus dari rak");
      logEvent("shelf_removed", { workId });
      return;
    }

    setToast(`Disimpan sebagai ${STATUS_LABELS[status]}, ${editionNote}`);
    logEvent("shelf_saved", {
      workId,
      editionId: edition.id,
      status,
      editionLanguage: edition.language,
    });
  }

  if (!hydrated) {
    return (
      <span
        aria-busy="true"
        className="inline-flex h-11 w-44 animate-pulse rounded-md bg-surface-sunken"
      />
    );
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "inline-flex tap-target items-center gap-2 rounded-md px-4 text-body font-medium",
          "transition-colors duration-[var(--dur-micro)]",
          current
            ? "border border-accent-600 bg-accent-100 text-accent-700"
            : "bg-accent-600 text-accent-on hover:bg-accent-700",
        )}
      >
        <BookMarked aria-hidden="true" className="size-4" />
        {current ? STATUS_LABELS[current.status] : "Ingin Dibaca"}
        <ChevronDown aria-hidden="true" className="size-4" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Status bacaan"
          className="absolute top-full left-0 mt-1 w-72 rounded-lg border border-line bg-surface p-1 shadow-2"
          style={{ zIndex: "var(--z-dropdown)" }}
        >
          {/* Konfirmasi edisi, ditampilkan SEBELUM user memilih status. */}
          <p className="px-3 py-2 text-sm text-ink-500">
            Akan disimpan sebagai{" "}
            <span className="text-ink-900">
              {edition.title}, {editionNote}
            </span>
          </p>

          {SHELF_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              role="menuitemradio"
              aria-checked={current?.status === status}
              onClick={() => choose(status)}
              className="flex tap-target w-full items-center gap-2 rounded-md px-3 text-left text-body text-ink-700 hover:bg-surface-alt"
            >
              <Check
                aria-hidden="true"
                className={cn(
                  "size-4 shrink-0",
                  current?.status === status ? "text-accent-600" : "text-transparent",
                )}
              />
              {STATUS_LABELS[status]}
            </button>
          ))}

          {current && (
            <button
              type="button"
              role="menuitem"
              onClick={() => choose(null)}
              className="mt-1 flex tap-target w-full items-center gap-2 rounded-md border-t border-line px-3 text-left text-body text-danger-fg hover:bg-surface-alt"
            >
              Hapus dari rak
            </button>
          )}
        </div>
      )}

      <p role="status" aria-live="polite" className="sr-only">
        {toast}
      </p>

      {toast && (
        <p className="mt-2 text-sm text-success-fg" aria-hidden="true">
          {toast}
        </p>
      )}
    </div>
  );
}
