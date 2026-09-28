/**
 * Satu-satunya pintu ke Web Storage.
 *
 * ESLint menolak localStorage di berkas mana pun selain ini, karena akses
 * langsung dari komponen menyebabkan dua masalah yang sulit dilacak:
 * hydration mismatch, dan data rusak yang lolos tanpa validasi.
 *
 * Empat keadaan yang ditangani di sini:
 *  1. storage diblokir atau private mode  -> jatuh ke memori, banner X-02
 *  2. kuota penuh                          -> pangkas log, lalu X-03
 *  3. data tidak sesuai skema              -> kembali ke default, X-04
 *  4. skema berubah antar versi            -> migrasi saat boot
 */

export const NS = "gr:v1:";
export const META_KEY = "gr:meta";
export const CURRENT_VERSION = 1;

export type WriteResult = "ok" | "quota" | "unavailable";

export const KEYS = {
  shelf: `${NS}shelf`,
  reviews: `${NS}reviews`,
  selectedEditions: `${NS}selected-editions`,
  recentSearches: `${NS}recent-searches`,
  prefs: `${NS}prefs`,
  events: `${NS}events`,
} as const;

/** Dipakai saat Web Storage tidak tersedia, supaya sesi tetap berjalan. */
const memory = new Map<string, string>();

let available: boolean | null = null;

export function isStorageAvailable(): boolean {
  if (available !== null) return available;
  if (typeof window === "undefined") return false;

  try {
    const probe = `${NS}__probe`;
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    available = true;
  } catch {
    available = false;
  }
  return available;
}

function rawGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  if (!isStorageAvailable()) return memory.get(key) ?? null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return memory.get(key) ?? null;
  }
}

function rawSet(key: string, value: string): WriteResult {
  if (typeof window === "undefined") return "unavailable";

  if (!isStorageAvailable()) {
    memory.set(key, value);
    return "unavailable";
  }

  try {
    window.localStorage.setItem(key, value);
    return "ok";
  } catch {
    // Kuota penuh. Log aktivitas adalah data paling murah untuk dikorbankan.
    try {
      window.localStorage.removeItem(KEYS.events);
      window.localStorage.setItem(key, value);
      return "ok";
    } catch {
      memory.set(key, value);
      return "quota";
    }
  }
}

export type Guard<T> = (value: unknown) => value is T;

export interface ReadOutcome<T> {
  value: T;
  /** true bila key belum pernah ditulis. Dipakai memutuskan seed pertama. */
  missing: boolean;
  /** true bila isi storage ada tetapi tidak sesuai skema (X-04). */
  recovered: boolean;
}

export function read<T>(key: string, guard: Guard<T>, fallback: T): ReadOutcome<T> {
  const raw = rawGet(key);
  if (raw === null) return { value: fallback, missing: true, recovered: false };

  try {
    const parsed: unknown = JSON.parse(raw);
    if (guard(parsed)) return { value: parsed, missing: false, recovered: false };
  } catch {
    // Jatuh ke pemulihan di bawah.
  }

  return { value: fallback, missing: false, recovered: true };
}

export function write<T>(key: string, value: T): WriteResult {
  try {
    return rawSet(key, JSON.stringify(value));
  } catch {
    return "quota";
  }
}

export function remove(key: string): void {
  memory.delete(key);
  if (typeof window === "undefined" || !isStorageAvailable()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Tidak ada yang bisa dilakukan, dan ini bukan kegagalan yang fatal.
  }
}

/** Sinkronisasi antar tab. Dua tab tidak boleh menampilkan rak berbeda. */
export function subscribeToKey(key: string, callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = (event: StorageEvent) => {
    if (event.key === null || event.key === key) callback();
  };

  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

interface Meta {
  schemaVersion: number;
  createdAt: string;
  lastMigratedAt: string;
}

const isMeta = (value: unknown): value is Meta =>
  typeof value === "object" && value !== null && typeof (value as Meta).schemaVersion === "number";

/**
 * Migrasi antar versi skema. Kosong pada versi 1, tetapi kerangkanya ada
 * sejak awal supaya penambahan field nanti tidak menghapus data user.
 */
const migrations: Record<number, (data: unknown) => unknown> = {};

export function runMigrations(): void {
  if (typeof window === "undefined") return;

  const now = new Date().toISOString();
  const meta = read<Meta>(META_KEY, isMeta, {
    schemaVersion: CURRENT_VERSION,
    createdAt: now,
    lastMigratedAt: now,
  });

  let version = meta.value.schemaVersion;
  while (version < CURRENT_VERSION) {
    const step = migrations[version];
    if (step) step(null);
    version += 1;
  }

  write(META_KEY, {
    schemaVersion: CURRENT_VERSION,
    createdAt: meta.value.createdAt,
    lastMigratedAt: now,
  });
}

/** Mengosongkan seluruh data demo. Dipakai tombol reset di halaman /about. */
export function clearAll(): void {
  for (const key of Object.values(KEYS)) remove(key);
  remove(META_KEY);
  memory.clear();
}

/** Hanya untuk test. Mengembalikan modul ke keadaan awal. */
export function __resetForTests(): void {
  available = null;
  memory.clear();
}
