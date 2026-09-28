import { seedReviews, seedShelf } from "@/data/seed";
import { KEYS, read, subscribeToKey, write, type Guard, type WriteResult } from "@/lib/storage";
import type { AppEvent, Review, ShelfItem, ShelfStatus } from "@/lib/types";

/**
 * Store berbasis useSyncExternalStore.
 *
 * Kenapa pola ini dan bukan useState plus useEffect:
 *  - snapshot server selalu nilai kosong, snapshot client dibaca setelah
 *    hidrasi, jadi tidak ada hydration mismatch tanpa perlu menambal
 *    dengan suppressHydrationWarning
 *  - langganan event storage membuat dua tab tetap sinkron
 *  - komponen tidak pernah menyentuh localStorage sendiri
 */

export interface Store<T> {
  key: string;
  getSnapshot(): T;
  getServerSnapshot(): T;
  subscribe(listener: () => void): () => void;
  set(next: T): WriteResult;
  status(): StoreStatus;
}

/**
 * Status penulisan terakhir, dipantau satu komponen di shell.
 *
 * Tanpa ini, kegagalan menulis karena kuota penuh hanya terlihat sebagai
 * "aksinya seperti tidak terjadi apa-apa", yang jauh lebih membingungkan
 * daripada pesan yang jujur (RnD X-03).
 */
const writeListeners = new Set<() => void>();
let lastWriteResult: WriteResult | null = null;

export const writeStatusStore = {
  getSnapshot: (): WriteResult | null => lastWriteResult,
  getServerSnapshot: (): WriteResult | null => null,
  subscribe(listener: () => void) {
    writeListeners.add(listener);
    return () => writeListeners.delete(listener);
  },
  clear() {
    lastWriteResult = null;
    for (const listener of writeListeners) listener();
  },
};

function reportWrite(result: WriteResult) {
  lastWriteResult = result;
  for (const listener of writeListeners) listener();
}

export interface StoreStatus {
  /** true bila data di storage pernah rusak dan dipulihkan (X-04). */
  recovered: boolean;
  /** Hasil penulisan terakhir, dipakai memunculkan X-02 dan X-03. */
  lastWrite: WriteResult | null;
}

function createStore<T>(key: string, guard: Guard<T>, empty: T, seed: () => T): Store<T> {
  let cache: T | null = null;
  let recovered = false;
  let lastWrite: WriteResult | null = null;
  const listeners = new Set<() => void>();

  function load(): T {
    const outcome = read(key, guard, empty);
    recovered = outcome.recovered;

    // Dua jalur memicu seed:
    //  - kunjungan pertama, supaya demo tidak terbuka dalam keadaan kosong
    //  - data rusak (X-04), yang dipulihkan ke kondisi awal, bukan dibiarkan
    if (outcome.missing || outcome.recovered) {
      const fresh = seed();
      write(key, fresh);
      return fresh;
    }
    return outcome.value;
  }

  function notify() {
    for (const listener of listeners) listener();
  }

  return {
    key,

    getSnapshot() {
      cache ??= load();
      return cache;
    },

    getServerSnapshot() {
      return empty;
    },

    subscribe(listener) {
      listeners.add(listener);
      const stop = subscribeToKey(key, () => {
        cache = null;
        notify();
      });
      return () => {
        listeners.delete(listener);
        stop();
      };
    },

    set(next) {
      cache = next;
      lastWrite = write(key, next);
      reportWrite(lastWrite);
      notify();
      return lastWrite;
    },

    status() {
      return { recovered, lastWrite };
    },
  };
}

const isArray = (value: unknown): value is unknown[] => Array.isArray(value);

const isShelfItem = (value: unknown): value is ShelfItem => {
  if (typeof value !== "object" || value === null) return false;
  const item = value as ShelfItem;
  return (
    typeof item.workId === "string" &&
    typeof item.editionId === "string" &&
    ["want-to-read", "currently-reading", "read"].includes(item.status) &&
    typeof item.addedAt === "string"
  );
};

const isReview = (value: unknown): value is Review => {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Review;
  return (
    typeof item.id === "string" &&
    typeof item.workId === "string" &&
    typeof item.editionId === "string" &&
    typeof item.rating === "number" &&
    item.rating >= 1 &&
    item.rating <= 5 &&
    typeof item.text === "string"
  );
};

const isEvent = (value: unknown): value is AppEvent => {
  if (typeof value !== "object" || value === null) return false;
  const item = value as AppEvent;
  return typeof item.id === "string" && typeof item.name === "string";
};

const guardList =
  <T>(check: (value: unknown) => value is T): Guard<T[]> =>
  (value): value is T[] =>
    isArray(value) && value.every(check);

const isSelectedEditions = (value: unknown): value is Record<string, string> =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  Object.values(value).every((entry) => typeof entry === "string");

const isStringList: Guard<string[]> = (value): value is string[] =>
  isArray(value) && value.every((entry) => typeof entry === "string");

export const shelfStore = createStore<ShelfItem[]>(
  KEYS.shelf,
  guardList(isShelfItem),
  [],
  seedShelf,
);

export const reviewStore = createStore<Review[]>(
  KEYS.reviews,
  guardList(isReview),
  [],
  seedReviews,
);

export const selectedEditionStore = createStore<Record<string, string>>(
  KEYS.selectedEditions,
  isSelectedEditions,
  {},
  () => ({}),
);

export const recentSearchStore = createStore<string[]>(
  KEYS.recentSearches,
  isStringList,
  [],
  () => [],
);

export const eventStore = createStore<AppEvent[]>(KEYS.events, guardList(isEvent), [], () => []);

export const MAX_RECENT_SEARCHES = 8;
export const MAX_EVENTS = 500;

export function setShelfStatus(
  workId: string,
  editionId: string,
  status: ShelfStatus | null,
): WriteResult {
  const now = new Date().toISOString();
  const current = shelfStore.getSnapshot();
  const rest = current.filter((item) => item.workId !== workId);

  if (status === null) return shelfStore.set(rest);

  const existing = current.find((item) => item.workId === workId);
  const next: ShelfItem = {
    workId: workId as ShelfItem["workId"],
    editionId: editionId as ShelfItem["editionId"],
    status,
    addedAt: existing?.addedAt ?? now,
    updatedAt: now,
    startedAt: status === "currently-reading" ? (existing?.startedAt ?? now) : existing?.startedAt,
    finishedAt: status === "read" ? (existing?.finishedAt ?? now) : existing?.finishedAt,
  };

  return shelfStore.set([next, ...rest]);
}

export function saveReview(review: Review): WriteResult {
  const current = reviewStore.getSnapshot();
  const rest = current.filter((item) => item.id !== review.id);
  return reviewStore.set([review, ...rest]);
}

export function removeReview(id: string): WriteResult {
  return reviewStore.set(reviewStore.getSnapshot().filter((item) => item.id !== id));
}

export function rememberEdition(workId: string, editionId: string): WriteResult {
  return selectedEditionStore.set({ ...selectedEditionStore.getSnapshot(), [workId]: editionId });
}

export function rememberSearch(query: string): WriteResult {
  const trimmed = query.trim();
  if (trimmed.length < 2) return "ok";

  const current = recentSearchStore.getSnapshot().filter((item) => item !== trimmed);
  return recentSearchStore.set([trimmed, ...current].slice(0, MAX_RECENT_SEARCHES));
}

export function forgetSearch(query: string): WriteResult {
  return recentSearchStore.set(recentSearchStore.getSnapshot().filter((item) => item !== query));
}

/** Log aktivitas lokal untuk usability test dan case study (RnD bagian 30). */
export function logEvent(name: string, payload: AppEvent["payload"] = {}): WriteResult {
  const event: AppEvent = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    payload,
    at: new Date().toISOString(),
  };
  return eventStore.set([event, ...eventStore.getSnapshot()].slice(0, MAX_EVENTS));
}
