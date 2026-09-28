import { titleAliases } from "@/data/aliases";
import { authorsOf, editionsOf, getPublisher, works } from "@/data/catalog";
import { normalize, normalizeIsbn, titleKey } from "@/lib/search/normalize";
import { trigrams } from "@/lib/search/trigram";
import type { BookWork, LangCode, WorkId } from "@/lib/types";

/**
 * Dibangun sekali saat modul dimuat, bukan setiap ketikan. Dengan 18 karya
 * biayanya tidak terasa, dan strukturnya tetap sama kalau katalog membesar.
 */

export interface IndexedTitle {
  lang: LangCode;
  raw: string;
  key: string;
  isOriginal: boolean;
  grams: Set<string>;
}

export interface WorkIndexEntry {
  work: BookWork;
  titles: IndexedTitle[];
  aliasKeys: string[];
  authorNames: Array<{ raw: string; key: string }>;
  publisherKeys: Array<{ raw: string; key: string }>;
  isbns: string[];
  subjectKeys: Array<{ raw: string; key: string }>;
  /** Dipakai boost popularitas, dinormalisasi terhadap karya terpopuler. */
  popularity: number;
}

const aliasesByWork = new Map<string, string[]>(
  titleAliases.map((entry) => [entry.workId as string, entry.aliases.map(titleKey)]),
);

const maxRatingCount = Math.max(...works.map((item) => item.ratingSummary.count), 1);

function buildEntry(work: BookWork): WorkIndexEntry {
  const own = editionsOf(work.id);

  const titles: IndexedTitle[] = work.titles.map((title) => {
    const key = titleKey(title.value);
    return {
      lang: title.lang,
      raw: title.value,
      key,
      isOriginal: title.isOriginal ?? false,
      grams: trigrams(key),
    };
  });

  // Judul edisi bisa berbeda dari judul karya, misalnya "Binatangisme".
  for (const item of own) {
    const key = titleKey(item.title);
    if (titles.some((title) => title.key === key)) continue;
    titles.push({
      lang: item.language,
      raw: item.title,
      key,
      isOriginal: false,
      grams: trigrams(key),
    });
  }

  const publisherNames = new Map<string, string>();
  for (const item of own) {
    const publisher = getPublisher(item.publisherId);
    if (!publisher) continue;
    for (const name of [publisher.name, ...publisher.altNames]) {
      publisherNames.set(normalize(name), name);
    }
  }

  const authorNames: Array<{ raw: string; key: string }> = [];
  for (const author of authorsOf(work)) {
    for (const name of [author.name, ...author.altNames]) {
      authorNames.push({ raw: author.name, key: normalize(name) });
    }
  }

  return {
    work,
    titles,
    aliasKeys: aliasesByWork.get(work.id as string) ?? [],
    authorNames,
    publisherKeys: [...publisherNames].map(([key, raw]) => ({ key, raw })),
    isbns: own.flatMap((item) =>
      [item.isbn10, item.isbn13].filter((value): value is string => !!value).map(normalizeIsbn),
    ),
    subjectKeys: work.subjects.map((subject) => ({ raw: subject, key: normalize(subject) })),
    popularity: work.ratingSummary.count / maxRatingCount,
  };
}

export const searchIndex: WorkIndexEntry[] = works.map(buildEntry);

export const indexByWorkId = new Map<WorkId, WorkIndexEntry>(
  searchIndex.map((entry) => [entry.work.id, entry]),
);
