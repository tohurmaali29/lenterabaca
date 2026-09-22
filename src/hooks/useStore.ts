"use client";

import { useSyncExternalStore } from "react";

import type { Store } from "@/lib/stores";

/**
 * Membaca store tanpa menimbulkan hydration mismatch. RnD 27.2.
 *
 * useSyncExternalStore memakai getServerSnapshot saat render server dan saat
 * hidrasi, lalu beralih ke getSnapshot sesudahnya. Jadi localStorage tidak
 * pernah dibaca saat render pertama, dan tidak perlu suppressHydrationWarning.
 */
export function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}

/** true setelah hidrasi selesai. Dipakai merender skeleton lebih dulu. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
