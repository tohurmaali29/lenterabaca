"use client";

import { Download, RotateCcw } from "lucide-react";
import { useState } from "react";

import { useHydrated, useStore } from "@/hooks/useStore";
import { formatDate } from "@/lib/format";
import { clearAll } from "@/lib/storage";
import { eventStore, logEvent } from "@/lib/stores";

/**
 * Log ini bukan analytics: tidak ada yang dikirim ke mana pun. Gunanya dua,
 * menjadi data mentah saat usability test, dan menjadi bahan angka di case
 * study.
 */
export function DemoTools() {
  const hydrated = useHydrated();
  const events = useStore(eventStore);
  const [confirming, setConfirming] = useState(false);
  const [marker, setMarker] = useState("T1");

  if (!hydrated) {
    return <div aria-busy="true" className="h-40 animate-pulse rounded-lg bg-surface-sunken" />;
  }

  function download() {
    const blob = new Blob([JSON.stringify(events, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lenterabaca-events-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function reset() {
    clearAll();
    window.location.reload();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={download}
          disabled={events.length === 0}
          className="inline-flex tap-target items-center gap-2 rounded-md border border-line-strong px-4 text-body text-ink-700 hover:bg-surface-alt disabled:opacity-45"
        >
          <Download aria-hidden="true" className="size-4" />
          Unduh log ({events.length})
        </button>

        {confirming ? (
          <span className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={reset}
              className="inline-flex tap-target items-center rounded-md bg-danger-fg px-4 text-body font-medium text-surface"
            >
              Ya, hapus semua data demo
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="inline-flex tap-target items-center rounded-md border border-line-strong px-4 text-body text-ink-700"
            >
              Batal
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="inline-flex tap-target items-center gap-2 rounded-md border border-line-strong px-4 text-body text-ink-700 hover:bg-surface-alt"
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            Reset data demo
          </button>
        )}
      </div>

      {/* RnD 32.1: fasilitator menekan penanda ini di antara task, supaya log
          bisa dipotong per task saat dianalisis. */}
      <div className="flex flex-wrap items-end gap-2 rounded-lg border border-line p-3">
        <label className="flex flex-col gap-1 text-sm text-ink-700">
          <span className="font-medium">Penanda task</span>
          <input
            value={marker}
            onChange={(event) => setMarker(event.target.value)}
            className="h-9 w-24 rounded-md border border-line-strong bg-surface px-2 text-sm text-ink-900"
          />
        </label>
        <button
          type="button"
          onClick={() => logEvent("task_marker", { label: marker })}
          className="inline-flex tap-target items-center rounded-md border border-line-strong px-4 text-body text-ink-700 hover:bg-surface-alt"
        >
          Tandai mulai task
        </button>
        <p className="text-sm text-ink-500">Dipakai fasilitator saat usability test.</p>
      </div>

      {confirming && (
        <p role="status" className="text-sm text-warning-fg">
          Rak, review, dan log aktivitas di browser ini akan dihapus, lalu data awal dipulihkan.
        </p>
      )}

      {events.length > 0 && (
        <div className="max-h-72 overflow-y-auto rounded-lg border border-line">
          <table className="w-full text-sm">
            <caption className="sr-only">Log aktivitas lokal, terbaru lebih dulu</caption>
            <thead className="sticky top-0 bg-surface-alt text-left">
              <tr>
                <th scope="col" className="px-3 py-2 font-medium text-ink-700">
                  Peristiwa
                </th>
                <th scope="col" className="px-3 py-2 font-medium text-ink-700">
                  Rincian
                </th>
                <th scope="col" className="px-3 py-2 font-medium text-ink-700">
                  Waktu
                </th>
              </tr>
            </thead>
            <tbody>
              {events.slice(0, 40).map((event) => (
                <tr key={event.id} className="border-t border-line align-top">
                  <td className="px-3 py-2 text-ink-900">{event.name}</td>
                  <td className="px-3 py-2 text-ink-500">
                    {Object.entries(event.payload)
                      .map(([key, value]) => `${key}: ${String(value)}`)
                      .join(", ") || "-"}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-ink-500">
                    {formatDate(event.at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
