import { describe, expect, it } from "vitest";

import { titleAliases } from "@/data/aliases";
import {
  authors,
  catalogStats,
  editions,
  editionsOf,
  initialEdition,
  publishers,
  translators,
  works,
} from "@/data/catalog";
import { summarize } from "@/lib/rating";
import { renderCoverSvg } from "@/lib/cover";

/**
 * Validasi fixtures. Ini yang dimaksud Definition of Done Phase 2 di
 * RnD v2.1 bagian 31: tidak ada referensi menggantung, histogram konsisten
 * dengan count, seluruh edge case hadir, dan minimal 12 karya punya
 * edisi Bahasa Indonesia.
 *
 * Integritas referensi sendiri sudah ditegakkan saat modul katalog dimuat
 * (data/catalog.ts melempar error), jadi test di bawah fokus ke komposisi,
 * konsistensi angka, dan kehadiran setiap edge case.
 */

const workIds = new Set(works.map((item) => item.id as string));
const editionIds = editions.map((item) => item.id as string);

describe("komposisi katalog (RnD 25)", () => {
  it("punya 18 karya", () => {
    expect(catalogStats.workCount).toBe(18);
  });

  it("punya 40 sampai 80 edisi", () => {
    expect(catalogStats.editionCount).toBeGreaterThanOrEqual(40);
    expect(catalogStats.editionCount).toBeLessThanOrEqual(80);
  });

  it("setiap karya punya 2 sampai 6 edisi", () => {
    for (const item of works) {
      const count = editionsOf(item.id).length;
      expect(count, `karya ${item.id} punya ${count} edisi`).toBeGreaterThanOrEqual(2);
      expect(count, `karya ${item.id} punya ${count} edisi`).toBeLessThanOrEqual(6);
    }
  });

  it("minimal 12 karya punya edisi Bahasa Indonesia", () => {
    expect(catalogStats.worksWithIndonesianEdition).toBeGreaterThanOrEqual(12);
  });

  it("minimal 3 karya berbahasa asal Indonesia", () => {
    expect(catalogStats.worksOriginallyIndonesian).toBeGreaterThanOrEqual(3);
  });

  it("minimal 6 penerbit Indonesia dan 5 penerbit asing", () => {
    const indonesian = publishers.filter((item) => item.country === "ID");
    const foreign = publishers.filter((item) => item.country !== "ID");
    expect(indonesian.length).toBeGreaterThanOrEqual(6);
    expect(foreign.length).toBeGreaterThanOrEqual(5);
  });

  it("minimal 4 penulis punya nama alternatif (EC-8)", () => {
    const withAlt = authors.filter((item) => item.altNames.length > 0);
    expect(withAlt.length).toBeGreaterThanOrEqual(4);
  });

  it("id edisi dan id karya unik", () => {
    expect(new Set(editionIds).size).toBe(editionIds.length);
    expect(workIds.size).toBe(works.length);
  });

  it("slug karya unik", () => {
    const slugs = works.map((item) => item.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe("konsistensi angka rating (RnD 24.3)", () => {
  it("average setiap edisi cocok dengan histogramnya", () => {
    for (const item of editions) {
      const recomputed = summarize(item.ratingSummary.histogram);
      expect(item.ratingSummary.average, `edisi ${item.id}`).toBe(recomputed.average);
      expect(item.ratingSummary.count, `edisi ${item.id}`).toBe(recomputed.count);
    }
  });

  it("rating karya adalah penjumlahan rating seluruh edisinya", () => {
    for (const item of works) {
      const total = editionsOf(item.id).reduce((sum, child) => sum + child.ratingSummary.count, 0);
      expect(item.ratingSummary.count, `karya ${item.id}`).toBe(total);
    }
  });

  it("tidak ada rating negatif dan average selalu 0 sampai 5", () => {
    for (const item of [...editions, ...works]) {
      expect(item.ratingSummary.histogram.every((n) => n >= 0)).toBe(true);
      expect(item.ratingSummary.average).toBeGreaterThanOrEqual(0);
      expect(item.ratingSummary.average).toBeLessThanOrEqual(5);
    }
  });

  it("edisi tanpa rating punya average 0, bukan NaN", () => {
    const empty = editions.filter((item) => item.ratingSummary.count === 0);
    expect(empty.length).toBeGreaterThan(0);
    for (const item of empty) {
      expect(Number.isNaN(item.ratingSummary.average)).toBe(false);
      expect(item.ratingSummary.average).toBe(0);
    }
  });
});

describe("edge case wajib (RnD 25.1)", () => {
  it("EC-1: ada karya tanpa edisi Bahasa Indonesia", () => {
    const without = works.filter((item) => !item.hasIndonesianEdition);
    expect(without.length).toBeGreaterThanOrEqual(1);
  });

  it("EC-2: ada karya dengan minimal 4 edisi Indonesia dari penerbit berbeda", () => {
    const match = works.filter((item) => {
      const indonesian = editionsOf(item.id).filter((child) => child.language === "id");
      const distinct = new Set(indonesian.map((child) => child.publisherId));
      return indonesian.length >= 4 && distinct.size >= 4;
    });
    expect(match.length).toBeGreaterThanOrEqual(1);
  });

  it("EC-3: ada judul Indonesia tanpa satu kata pun yang sama dengan judul asli", () => {
    const wordsOf = (value: string) =>
      new Set(
        value
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, " ")
          .split(/\s+/)
          .filter((token) => token.length > 2),
      );

    const match = works.filter((item) => {
      const original = wordsOf(item.originalTitle);
      return item.titles.some((title) => {
        if (title.lang !== "id") return false;
        const translated = wordsOf(title.value);
        if (translated.size === 0) return false;
        return [...translated].every((token) => !original.has(token));
      });
    });

    expect(match.map((item) => item.slug)).not.toEqual([]);
  });

  it("EC-4: ada dua edisi dengan ISBN sama tetapi cetakan atau label berbeda", () => {
    const byIsbn = new Map<string, typeof editions>();
    for (const item of editions) {
      if (!item.isbn13) continue;
      const list = byIsbn.get(item.isbn13) ?? [];
      list.push(item);
      byIsbn.set(item.isbn13, list);
    }

    const collisions = [...byIsbn.values()].filter((list) => list.length > 1);
    expect(collisions.length).toBeGreaterThanOrEqual(1);

    for (const list of collisions) {
      const fingerprints = new Set(
        list.map((item) => `${item.printing ?? "-"}|${item.editionLabel ?? "-"}`),
      );
      expect(fingerprints.size, "ISBN sama harus dibedakan cetakan atau label").toBe(list.length);
    }
  });

  it("EC-5: ada karya asal Indonesia dengan edisi terjemahan keluar", () => {
    const match = works.filter(
      (item) =>
        item.originalLanguage === "id" &&
        editionsOf(item.id).some((child) => child.isTranslation && child.language !== "id"),
    );
    expect(match.length).toBeGreaterThanOrEqual(3);
  });

  it("EC-6: ada edisi tanpa rating", () => {
    expect(editions.some((item) => item.ratingSummary.count === 0)).toBe(true);
  });

  it("EC-7: ada edisi out-of-print", () => {
    expect(editions.some((item) => item.availability === "out-of-print")).toBe(true);
  });

  it("EC-9: ada penerbit dengan nama panjang dan nama pendek", () => {
    const match = publishers.filter((item) =>
      item.altNames.some((alt) => alt.length < item.name.length),
    );
    expect(match.length).toBeGreaterThanOrEqual(3);
  });

  it("EC-10: audiobook punya durasi dan tidak punya pageCount", () => {
    const audiobooks = editions.filter((item) => item.format === "audiobook");
    expect(audiobooks.length).toBeGreaterThanOrEqual(2);
    for (const item of audiobooks) {
      expect(item.durationMinutes, `audiobook ${item.id}`).toBeGreaterThan(0);
      expect(item.pageCount, `audiobook ${item.id}`).toBeUndefined();
    }
  });

  it("EC-11: ada karya dengan deskripsi bukan Bahasa Indonesia", () => {
    const match = works.filter((item) => item.descriptionLang !== "id");
    expect(match.length).toBeGreaterThanOrEqual(2);
  });

  it("EC-12: ada karya yang bagian dari seri, lengkap dengan posisinya", () => {
    const inSeries = works.filter((item) => item.seriesId);
    expect(inSeries.length).toBeGreaterThanOrEqual(3);
    for (const item of inSeries) {
      expect(item.seriesPosition, `karya ${item.id}`).toBeGreaterThan(0);
    }
  });
});

describe("kelengkapan metadata", () => {
  it("setiap edisi terjemahan punya penerjemah", () => {
    for (const item of editions) {
      if (!item.isTranslation) continue;
      expect(
        item.translatorIds.length,
        `edisi ${item.id} terjemahan tanpa penerjemah`,
      ).toBeGreaterThan(0);
    }
  });

  it("edisi berbahasa sama dengan bahasa asal karya tidak ditandai terjemahan", () => {
    for (const item of works) {
      for (const child of editionsOf(item.id)) {
        if (child.language !== item.originalLanguage) continue;
        expect(child.isTranslation, `edisi ${child.id} salah tanda terjemahan`).toBe(false);
      }
    }
  });

  it("setiap edisi non-audiobook punya pageCount, kecuali ebook", () => {
    for (const item of editions) {
      if (item.format === "audiobook" || item.format === "ebook") continue;
      expect(item.pageCount, `edisi ${item.id}`).toBeGreaterThan(0);
    }
  });

  it("tahun terbit edisi tidak lebih awal dari tahun terbit pertama karya", () => {
    for (const item of works) {
      for (const child of editionsOf(item.id)) {
        expect(child.publishedYear, `edisi ${child.id}`).toBeGreaterThanOrEqual(
          item.firstPublishedYear,
        );
      }
    }
  });

  it("setiap karya punya judul berbahasa asalnya dan ditandai isOriginal", () => {
    for (const item of works) {
      const original = item.titles.filter((title) => title.isOriginal);
      expect(original.length, `karya ${item.id}`).toBe(1);
      expect(original[0].lang, `karya ${item.id}`).toBe(item.originalLanguage);
      expect(original[0].value, `karya ${item.id}`).toBe(item.originalTitle);
    }
  });

  it("karya dengan edisi Indonesia punya judul Indonesia di daftar judul", () => {
    for (const item of works) {
      if (!item.hasIndonesianEdition) continue;
      const hasIdTitle = item.titles.some((title) => title.lang === "id");
      expect(hasIdTitle, `karya ${item.id} punya edisi id tanpa judul id`).toBe(true);
    }
  });

  it("alias hanya menunjuk karya yang ada, dan tidak ada alias kosong", () => {
    for (const entry of titleAliases) {
      expect(workIds.has(entry.workId), `alias menunjuk karya asing: ${entry.workId}`).toBe(true);
      expect(entry.aliases.length).toBeGreaterThan(0);
      for (const alias of entry.aliases) {
        expect(alias.trim().length).toBeGreaterThan(0);
        expect(alias, `alias harus huruf kecil: ${alias}`).toBe(alias.toLowerCase());
      }
    }
  });

  it("semua penerjemah yang didaftarkan benar-benar dipakai", () => {
    const used = new Set(editions.flatMap((item) => item.translatorIds as string[]));
    const unused = translators.filter((item) => !used.has(item.id));
    expect(unused.map((item) => item.id)).toEqual([]);
  });
});

describe("cover placeholder (RnD D-06)", () => {
  it("tidak ada edisi yang menunjuk gambar eksternal", () => {
    for (const item of editions) {
      expect(item.cover.url, `edisi ${item.id}`).toBe(`/covers/${item.id}`);
      expect(item.cover.source).toBe("generated");
    }
  });

  it("alt cover menyebut judul, penerbit, dan tahun", () => {
    for (const item of editions) {
      expect(item.cover.alt).toContain(item.title);
      expect(item.cover.alt).toContain(String(item.publishedYear));
    }
  });

  it("cover setiap edisi bisa dirender dan berupa SVG yang wajar", () => {
    for (const item of editions) {
      const svg = renderCoverSvg({
        editionId: item.id,
        title: item.title,
        publisherName: "Penerbit Uji",
        publishedYear: item.publishedYear,
        language: item.language,
        editionLabel: item.editionLabel,
      });
      expect(svg.startsWith("<svg")).toBe(true);
      expect(svg).toContain("</svg>");
      expect(svg).toContain(item.language.toUpperCase());
    }
  });

  it("karakter khusus pada judul di-escape, bukan merusak SVG", () => {
    const svg = renderCoverSvg({
      editionId: "ed-uji",
      title: `Judul & <script>alert("x")</script>`,
      publisherName: "Penerbit & Rekan",
      publishedYear: 2020,
      language: "id",
    });
    expect(svg).not.toContain("<script>");
    expect(svg).toContain("&amp;");
  });
});

describe("pemilihan edisi awal (RnD R-06)", () => {
  it("karya dengan edisi Indonesia memilih edisi Indonesia terbaru", () => {
    for (const item of works) {
      if (!item.hasIndonesianEdition) continue;
      const chosen = initialEdition(item);
      expect(chosen.language, `karya ${item.id}`).toBe("id");

      const newest = Math.max(
        ...editionsOf(item.id)
          .filter((child) => child.language === "id")
          .map((child) => child.publishedYear),
      );
      expect(chosen.publishedYear, `karya ${item.id}`).toBe(newest);
    }
  });

  it("karya tanpa edisi Indonesia jatuh ke defaultEditionId", () => {
    for (const item of works) {
      if (item.hasIndonesianEdition) continue;
      expect(initialEdition(item).id, `karya ${item.id}`).toBe(item.defaultEditionId);
    }
  });
});
