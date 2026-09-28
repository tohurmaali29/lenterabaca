"use client";

import { AlertTriangle } from "lucide-react";
import { useSyncExternalStore } from "react";

import { writeStatusStore } from "@/lib/stores";

/**
 * Dipasang sekali di shell dan memantau hasil penulisan terakhir dari
 * store mana pun, supaya setiap penulis tidak perlu menangani kasus ini
 * sendiri-sendiri dan tidak ada yang terlewat.
 */
export function WriteNotice() {
  const status = useSyncExternalStore(
    writeStatusStore.subscribe,
    writeStatusStore.getSnapshot,
    writeStatusStore.getServerSnapshot,
  );

  if (status !== "quota") return null;

  return (
    <div role="alert" data-notice="X-03" className="border-b border-line bg-surface-alt">
      <div className="container-page flex items-center gap-3 py-2 text-sm text-warning-fg">
        <AlertTriangle aria-hidden="true" className="size-4 shrink-0" />
        <p className="flex-1">
          Penyimpanan browser penuh, jadi perubahan terakhir belum tersimpan. Log aktivitas sudah
          dibersihkan otomatis. Kalau masih penuh, reset data demo di halaman Tentang project.
        </p>
        <button
          type="button"
          onClick={() => writeStatusStore.clear()}
          className="tap-target shrink-0 px-2 underline underline-offset-2"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}
