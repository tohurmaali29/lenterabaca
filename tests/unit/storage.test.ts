import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  CURRENT_VERSION,
  KEYS,
  META_KEY,
  clearAll,
  isStorageAvailable,
  read,
  runMigrations,
  write,
  __resetForTests,
} from "@/lib/storage";

/**
 * Yang diuji: kuota penuh, storage diblokir, dan data yang tidak sesuai skema.
 */

const isStringList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

beforeEach(() => {
  window.localStorage.clear();
  __resetForTests();
  vi.restoreAllMocks();
});

describe("baca dan tulis", () => {
  it("menulis lalu membaca kembali nilai yang sama", () => {
    expect(write(KEYS.recentSearches, ["laskar", "orwell"])).toBe("ok");
    expect(read(KEYS.recentSearches, isStringList, []).value).toEqual(["laskar", "orwell"]);
  });

  it("key yang belum ada mengembalikan nilai default tanpa menandai rusak", () => {
    const outcome = read(KEYS.recentSearches, isStringList, []);
    expect(outcome.value).toEqual([]);
    expect(outcome.recovered).toBe(false);
  });
});

describe("data tidak sesuai skema (X-04)", () => {
  it("JSON rusak dipulihkan ke default dan ditandai", () => {
    window.localStorage.setItem(KEYS.recentSearches, "{ bukan json");
    const outcome = read(KEYS.recentSearches, isStringList, []);

    expect(outcome.value).toEqual([]);
    expect(outcome.recovered).toBe(true);
  });

  it("JSON valid tetapi bentuknya salah juga dipulihkan", () => {
    window.localStorage.setItem(KEYS.recentSearches, JSON.stringify([1, 2, 3]));
    const outcome = read(KEYS.recentSearches, isStringList, []);

    expect(outcome.value).toEqual([]);
    expect(outcome.recovered).toBe(true);
  });

  it("guard menolak bentuk yang hampir benar", () => {
    window.localStorage.setItem(KEYS.recentSearches, JSON.stringify({ 0: "laskar" }));
    expect(read(KEYS.recentSearches, isStringList, []).recovered).toBe(true);
  });
});

describe("kuota penuh (X-03)", () => {
  it("memangkas log aktivitas lebih dulu lalu mencoba menulis lagi", () => {
    window.localStorage.setItem(KEYS.events, JSON.stringify([{ id: "a", name: "b" }]));

    let failOnce = true;
    const original = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (
      this: Storage,
      key: string,
      value: string,
    ) {
      if (failOnce && key === KEYS.shelf) {
        failOnce = false;
        throw new DOMException("penuh", "QuotaExceededError");
      }
      original.call(this, key, value);
    });

    expect(write(KEYS.shelf, [{ workId: "w-1" }])).toBe("ok");
    expect(window.localStorage.getItem(KEYS.events)).toBeNull();
  });

  it("melaporkan quota bila memangkas log pun tidak menolong", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("penuh", "QuotaExceededError");
    });

    __resetForTests();
    expect(write(KEYS.shelf, [{ workId: "w-1" }])).toBe("unavailable");
  });
});

describe("storage diblokir (X-02)", () => {
  it("terdeteksi tidak tersedia dan tulisan jatuh ke memori", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("diblokir", "SecurityError");
    });

    __resetForTests();
    expect(isStorageAvailable()).toBe(false);
    expect(write(KEYS.shelf, ["x"])).toBe("unavailable");

    // Sesi tetap berjalan: nilainya masih bisa dibaca dalam tab yang sama.
    expect(read(KEYS.shelf, isStringList, []).value).toEqual(["x"]);
  });
});

describe("migrasi skema", () => {
  it("menulis meta dengan versi saat ini pada boot pertama", () => {
    runMigrations();
    const meta = JSON.parse(window.localStorage.getItem(META_KEY) ?? "{}");
    expect(meta.schemaVersion).toBe(CURRENT_VERSION);
    expect(typeof meta.createdAt).toBe("string");
  });

  it("mempertahankan createdAt saat migrasi berikutnya dijalankan", () => {
    runMigrations();
    const first = JSON.parse(window.localStorage.getItem(META_KEY) ?? "{}");

    runMigrations();
    const second = JSON.parse(window.localStorage.getItem(META_KEY) ?? "{}");

    expect(second.createdAt).toBe(first.createdAt);
  });

  it("meta yang rusak tidak membuat boot gagal", () => {
    window.localStorage.setItem(META_KEY, "bukan json");
    expect(() => runMigrations()).not.toThrow();
    expect(JSON.parse(window.localStorage.getItem(META_KEY) ?? "{}").schemaVersion).toBe(
      CURRENT_VERSION,
    );
  });
});

describe("reset data demo", () => {
  it("menghapus seluruh key milik aplikasi", () => {
    write(KEYS.shelf, ["a"]);
    write(KEYS.reviews, ["b"]);
    runMigrations();

    clearAll();

    for (const key of Object.values(KEYS)) {
      expect(window.localStorage.getItem(key)).toBeNull();
    }
    expect(window.localStorage.getItem(META_KEY)).toBeNull();
  });

  it("tidak menyentuh key milik aplikasi lain", () => {
    window.localStorage.setItem("aplikasi-lain", "jangan dihapus");
    write(KEYS.shelf, ["a"]);

    clearAll();

    expect(window.localStorage.getItem("aplikasi-lain")).toBe("jangan dihapus");
  });
});
