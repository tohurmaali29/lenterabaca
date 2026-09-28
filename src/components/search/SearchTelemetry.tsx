"use client";

import { useEffect, useRef } from "react";

import { logEvent } from "@/lib/stores";

/**
 * Dipasang di halaman hasil, bukan di dalam kolom pencarian, karena jumlah
 * hasil dan skor tertinggi baru diketahui setelah pencarian dijalankan.
 * Semuanya hanya masuk localStorage dan tidak dikirim ke mana pun.
 */
export function SearchTelemetry({
  query,
  resultCount,
  totalBeforeFilters,
  isLowConfidence,
  emptyStateCode,
  filtersActive,
}: {
  query: string;
  resultCount: number;
  totalBeforeFilters: number;
  isLowConfidence: boolean;
  emptyStateCode: string | null;
  filtersActive: number;
}) {
  const signature = `${query}|${resultCount}|${emptyStateCode ?? ""}|${filtersActive}`;
  const previous = useRef<string | null>(null);

  useEffect(() => {
    if (previous.current === signature) return;
    previous.current = signature;

    logEvent("search_submitted", {
      query,
      resultCount,
      totalBeforeFilters,
      isLowConfidence,
      filtersActive,
    });

    if (resultCount === 0) {
      logEvent("search_no_result", { query, hadSuggestions: totalBeforeFilters > 0 });
    }
    if (emptyStateCode) {
      logEvent("empty_state_shown", { code: emptyStateCode, query });
    }
  }, [
    signature,
    query,
    resultCount,
    totalBeforeFilters,
    isLowConfidence,
    emptyStateCode,
    filtersActive,
  ]);

  return null;
}
