import { describe, expect, it } from "vitest";

import { normalize, normalizeIsbn, stripLeadingArticle, titleKey } from "@/lib/search/normalize";
import { diceCoefficient, trigrams } from "@/lib/search/trigram";
import { search, suggestions, displayEdition } from "@/lib/search/query";
import type { LangCode, PublisherId } from "@/lib/types";

/**
 * Pencarian. Sumber: RnD v2.1 bagian 26 dan acceptance criteria R-01 sampai R-04.
 *
 * Bagian terpenting adalah sepuluh query uji di bawah. Definition of Done
 * Phase 3 menuntut hasil PERTAMA-nya benar, bukan sekadar muncul di daftar,
 * karena user memindai dari atas.
 */

describe("normalisasi (RnD 26.1)", () => {
  it("membuang diakritik dan menyeragamkan huruf", () => {
    expect(normalize("Antoine de Saint-Exupéry")).toBe("antoine de saint exupery");
    expect(normalize("Natsume Sōseki")).toBe("natsume soseki");
  });

  it("membuang apostrof, bukan memecah kata", () => {
    expect(normalize("Philosopher's Stone")).toBe("philosophers stone");
  });

  it("membuang artikel di awal judul", () => {
    expect(stripLeadingArticle("the hobbit")).toBe("hobbit");
    expect(stripLeadingArticle("sang alkemis")).toBe("alkemis");
    expect(stripLeadingArticle("le petit prince")).toBe("petit prince");
  });

  it("tidak membuang kata yang kebetulan mirip artikel tapi berdiri sendiri", () => {
    expect(stripLeadingArticle("the")).toBe("the");
  });

  it("menyamakan judul dengan dan tanpa artikel", () => {
    expect(titleKey("The Hobbit")).toBe(titleKey("Hobbit"));
  });

  it("membersihkan ISBN dari tanda hubung dan spasi", () => {
    expect(normalizeIsbn("978-979-3062-79-2")).toBe("9789793062792");
    expect(normalizeIsbn("0 7475 3269 9")).toBe("0747532699");
  });

  it("mempertahankan aksara non-latin", () => {
    expect(normalize("ノルウェイの森")).toContain("ノルウェイ");
  });
});

describe("trigram (RnD 26.3)", () => {
  it("kata identik bernilai 1", () => {
    expect(diceCoefficient("laskar pelangi", "laskar pelangi")).toBe(1);
  });

  it("salah ketik satu huruf tetap di atas ambang", () => {
    expect(diceCoefficient("laskar pelagi", "laskar pelangi")).toBeGreaterThan(0.72);
  });

  it("kata yang tidak berhubungan bernilai rendah", () => {
    expect(diceCoefficient("pachinko", "laskar pelangi")).toBeLessThan(0.3);
  });

  it("membentuk trigram dengan padding awal dan akhir", () => {
    expect(trigrams("ab").size).toBeGreaterThan(0);
  });
});

/**
 * Sepuluh query uji. Ini kontrak Phase 3: kalau salah satu berubah,
 * bobot skor di score.ts berubah dan harus dibahas, bukan ditambal.
 */
const QUERY_CASES: Array<{ query: string; expectSlug: string; why: string }> = [
  { query: "laskar pelangi", expectSlug: "laskar-pelangi", why: "judul asli Indonesia" },
  { query: "the rainbow troops", expectSlug: "laskar-pelangi", why: "judul terjemahan Inggris" },
  { query: "laskar pelagi", expectSlug: "laskar-pelangi", why: "salah ketik, lewat fuzzy" },
  { query: "binatangisme", expectSlug: "animal-farm", why: "judul Indonesia yang jauh berbeda" },
  { query: "dunia kafka", expectSlug: "dunia-kafka", why: "judul Indonesia berbeda dari asli" },
  { query: "sang alkemis", expectSlug: "sang-alkemis", why: "judul Indonesia dengan artikel" },
  { query: "lelaki tua dan laut", expectSlug: "lelaki-tua-dan-laut", why: "judul terjemahan" },
  { query: "978-979-3062-79-2", expectSlug: "laskar-pelangi", why: "ISBN bertanda hubung" },
  { query: "pramudya ananta tur", expectSlug: "bumi-manusia", why: "ejaan alternatif penulis" },
  {
    query: "harry potter dan batu bertuah",
    expectSlug: "harry-potter-dan-batu-bertuah",
    why: "judul edisi Indonesia",
  },
];

describe("sepuluh query uji (DoD Phase 3)", () => {
  for (const testCase of QUERY_CASES) {
    it(`"${testCase.query}" -> ${testCase.expectSlug} (${testCase.why})`, () => {
      const response = search(testCase.query);
      expect(response.results.length, "tidak ada hasil sama sekali").toBeGreaterThan(0);
      expect(response.results[0].work.slug).toBe(testCase.expectSlug);
    });
  }
});

describe("alasan kecocokan (RnD R-02, 26.5)", () => {
  it("query judul Indonesia dilaporkan sebagai judul terjemahan", () => {
    const [first] = search("the rainbow troops").results;
    expect(first.matchedOn.field).toBe("translatedTitle");
    expect(first.matchedOn.lang).toBe("en");
  });

  it("query alias dilaporkan sebagai alias atau judul edisi", () => {
    const [first] = search("binatangisme").results;
    expect(["alias", "translatedTitle", "editionTitle"]).toContain(first.matchedOn.field);
  });

  it("query ISBN dilaporkan sebagai ISBN", () => {
    const [first] = search("9789793062792").results;
    expect(first.matchedOn.field).toBe("isbn");
  });

  it("query penulis dilaporkan sebagai penulis", () => {
    const [first] = search("eka kurniawan").results;
    expect(first.matchedOn.field).toBe("author");
  });

  it("salah ketik dilaporkan sebagai kemiripan, bukan kecocokan pasti", () => {
    const [first] = search("laskar pelagi").results;
    expect(first.matchedOn.field).toBe("fuzzy");
    expect(first.matchedOn.similarity).toBeGreaterThan(0.72);
  });
});

describe("filter dan urutan (RnD R-04, 26.4)", () => {
  it("filter bahasa Indonesia hanya menyisakan karya yang punya edisi Indonesia", () => {
    const response = search("orwell", { language: "id" as LangCode });
    expect(response.results.length).toBeGreaterThan(0);
    for (const result of response.results) {
      expect(result.work.hasIndonesianEdition).toBe(true);
      expect(result.edition.language).toBe("id");
    }
  });

  it("filter bahasa menandai kosong karena filter, bukan karena query", () => {
    const response = search("pachinko", { language: "id" as LangCode });
    expect(response.results).toEqual([]);
    expect(response.emptyBecauseOfFilters).toBe(true);
    expect(response.totalBeforeFilters).toBeGreaterThan(0);
  });

  it("filter format menyaring karya yang tidak punya format itu", () => {
    const response = search("harry potter", { format: "audiobook" });
    for (const result of response.results) {
      expect(result.edition.format).toBe("audiobook");
    }
  });

  it("filter penerbit memakai id penerbit, bukan nama bebas", () => {
    const response = search("1984", { publisher: "pb-mizan" as PublisherId });
    expect(response.results.length).toBeGreaterThan(0);
    for (const result of response.results) {
      expect(result.edition.publisherId).toBe("pb-mizan");
    }
  });

  it("urutan hasil deterministik untuk query yang sama", () => {
    const first = search("orwell").results.map((item) => item.work.slug);
    const second = search("orwell").results.map((item) => item.work.slug);
    expect(first).toEqual(second);
  });

  it("sort rating mengurutkan menurun", () => {
    const response = search("orwell", { sort: "rating" });
    const averages = response.results.map((item) => item.work.ratingSummary.average);
    expect([...averages].sort((a, b) => b - a)).toEqual(averages);
  });

  it("karya dengan edisi Indonesia menang saat skor seri", () => {
    // Boost bahasa aktif plus tie-break hasIndonesianEdition.
    const response = search("orwell", { language: "id" as LangCode });
    expect(response.results[0].work.hasIndonesianEdition).toBe(true);
  });
});

describe("edisi yang ditampilkan di kartu", () => {
  it("mengikuti filter bahasa yang aktif", () => {
    const work = search("laskar pelangi", { language: "id" as LangCode }).results[0].work;
    expect(displayEdition(work, { language: "id" as LangCode }).language).toBe("id");
  });

  it("tanpa filter, memilih edisi Indonesia terbaru bila ada", () => {
    const work = search("laskar pelangi").results[0].work;
    const chosen = displayEdition(work, {});
    expect(chosen.language).toBe("id");
  });
});

describe("ambang dan saran", () => {
  it("query di bawah 2 huruf tidak mengembalikan apa pun", () => {
    expect(search("a").results).toEqual([]);
  });

  it("query tanpa kecocokan tidak melempar error", () => {
    const response = search("zzzqqqxxx");
    expect(response.results).toEqual([]);
    expect(response.emptyBecauseOfFilters).toBe(false);
  });

  it("saran memakai ambang lebih longgar daripada pencarian biasa", () => {
    const found = suggestions("pelangi laskar");
    expect(found.length).toBeGreaterThan(0);
  });

  it("pencarian 18 karya selesai jauh di bawah 50ms (RnD 29)", () => {
    const start = performance.now();
    for (let index = 0; index < 50; index += 1) search("laskar pelangi");
    const perQuery = (performance.now() - start) / 50;
    expect(perQuery).toBeLessThan(50);
  });
});
