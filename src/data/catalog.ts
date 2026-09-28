import { editions } from "@/data/editions";
import { authors, publishers, seriesList, translators } from "@/data/entities";
import { workSeeds } from "@/data/works";
import { summarize } from "@/lib/rating";
import type {
  Author,
  AuthorId,
  BookWork,
  Edition,
  EditionId,
  Histogram,
  LangCode,
  Publisher,
  PublisherId,
  Series,
  SeriesId,
  Translator,
  TranslatorId,
  WorkId,
} from "@/lib/types";

/**
 * Dijalankan sekali saat modul dimuat. Tugasnya dua:
 *  1. menurunkan field yang tidak boleh ditulis tangan
 *     (editionIds, availableLanguages, hasIndonesianEdition, ratingSummary)
 *  2. menolak fixtures yang tidak konsisten dengan melempar error saat
 *     modul dimuat, sehingga referensi menggantung gagal di build,
 *     bukan muncul sebagai halaman rusak di depan user
 */

function fail(message: string): never {
  throw new Error(`[katalog] ${message}`);
}

/** Urutan edisi dalam satu karya: Bahasa Indonesia lebih dulu, lalu terbaru. */
function compareEditions(a: Edition, b: Edition): number {
  const aIsId = a.language === "id" ? 0 : 1;
  const bIsId = b.language === "id" ? 0 : 1;
  if (aIsId !== bIsId) return aIsId - bIsId;
  if (a.publishedYear !== b.publishedYear) return b.publishedYear - a.publishedYear;
  return a.id.localeCompare(b.id);
}

function sumHistograms(list: readonly Edition[]): Histogram {
  const total: [number, number, number, number, number] = [0, 0, 0, 0, 0];
  for (const item of list) {
    for (let star = 0; star < 5; star += 1) {
      total[star] += item.ratingSummary.histogram[star];
    }
  }
  return total;
}

const editionsByWork = new Map<WorkId, Edition[]>();
for (const item of editions) {
  const list = editionsByWork.get(item.workId);
  if (list) list.push(item);
  else editionsByWork.set(item.workId, [item]);
}
for (const list of editionsByWork.values()) list.sort(compareEditions);

export const works: BookWork[] = workSeeds.map((seed) => {
  const own = editionsByWork.get(seed.id);
  if (!own || own.length === 0) fail(`karya tanpa edisi: ${seed.id}`);

  if (!own.some((item) => item.id === seed.defaultEditionId)) {
    fail(`defaultEditionId ${seed.defaultEditionId} bukan milik karya ${seed.id}`);
  }

  const languages = [...new Set(own.map((item) => item.language))];
  const ratingSummary = summarize(sumHistograms(own));

  return {
    ...seed,
    editionIds: own.map((item) => item.id),
    availableLanguages: languages,
    hasIndonesianEdition: languages.includes("id"),
    ratingSummary,
    reviewCount: ratingSummary.count,
  };
});

const workById = new Map<string, BookWork>(works.map((item) => [item.id, item]));
const workBySlug = new Map<string, BookWork>(works.map((item) => [item.slug, item]));
const editionById = new Map<string, Edition>(editions.map((item) => [item.id, item]));
const authorById = new Map<string, Author>(authors.map((item) => [item.id, item]));
const publisherById = new Map<string, Publisher>(publishers.map((item) => [item.id, item]));
const translatorById = new Map<string, Translator>(translators.map((item) => [item.id, item]));
const seriesById = new Map<string, Series>(seriesList.map((item) => [item.id, item]));

/** Integritas referensi. Dicek sekali saat modul dimuat. */
for (const item of editions) {
  if (!workById.has(item.workId)) fail(`edisi ${item.id} menunjuk workId tidak dikenal`);
  if (!publisherById.has(item.publisherId)) {
    fail(`edisi ${item.id} menunjuk publisherId tidak dikenal`);
  }
  for (const id of item.translatorIds) {
    if (!translatorById.has(id))
      fail(`edisi ${item.id} menunjuk translatorId tidak dikenal: ${id}`);
  }
}
for (const item of works) {
  for (const id of item.authorIds) {
    if (!authorById.has(id)) fail(`karya ${item.id} menunjuk authorId tidak dikenal: ${id}`);
  }
  if (item.seriesId && !seriesById.has(item.seriesId)) {
    fail(`karya ${item.id} menunjuk seriesId tidak dikenal: ${item.seriesId}`);
  }
}

export { editions, authors, publishers, translators, seriesList };

export const getWork = (id: WorkId): BookWork | undefined => workById.get(id);
export const getWorkBySlug = (slug: string): BookWork | undefined => workBySlug.get(slug);
export const getEdition = (id: EditionId): Edition | undefined => editionById.get(id);
export const getAuthor = (id: AuthorId): Author | undefined => authorById.get(id);
export const getPublisher = (id: PublisherId): Publisher | undefined => publisherById.get(id);
export const getTranslator = (id: TranslatorId): Translator | undefined => translatorById.get(id);
export const getSeries = (id: SeriesId): Series | undefined => seriesById.get(id);

/** Edisi sebuah karya, sudah terurut: Bahasa Indonesia dulu, lalu terbaru. */
export function editionsOf(workId: WorkId): Edition[] {
  return editionsByWork.get(workId) ?? [];
}

export function editionsOfLanguage(workId: WorkId, language: LangCode): Edition[] {
  return editionsOf(workId).filter((item) => item.language === language);
}

export function authorsOf(work: BookWork): Author[] {
  return work.authorIds.map((id) => authorById.get(id)).filter((item): item is Author => !!item);
}

export function translatorsOf(edition: Edition): Translator[] {
  return edition.translatorIds
    .map((id) => translatorById.get(id))
    .filter((item): item is Translator => !!item);
}

/**
 * Edisi terpilih awal untuk sebuah karya.
 *
 * RnD R-06, dua sumber teratas (URL dan localStorage) ditangani di client
 * oleh EditionMemory. Fungsi ini melayani dua langkah terakhir:
 * edisi Bahasa Indonesia terbaru, lalu defaultEditionId.
 */
export function initialEdition(work: BookWork): Edition {
  const indonesian = editionsOfLanguage(work.id, "id");
  if (indonesian.length > 0) {
    // editionsOf sudah mengurutkan Bahasa Indonesia dulu, lalu tahun terbaru.
    return indonesian[0];
  }
  const fallback = editionById.get(work.defaultEditionId);
  if (!fallback) fail(`defaultEditionId ${work.defaultEditionId} tidak ada di katalog`);
  return fallback;
}

/** Ringkasan untuk halaman /about dan untuk test komposisi fixtures. */
export const catalogStats = {
  workCount: works.length,
  editionCount: editions.length,
  worksWithIndonesianEdition: works.filter((item) => item.hasIndonesianEdition).length,
  worksOriginallyIndonesian: works.filter((item) => item.originalLanguage === "id").length,
  languages: [...new Set(editions.map((item) => item.language))].sort(),
  publisherCount: publishers.length,
  authorCount: authors.length,
} as const;
