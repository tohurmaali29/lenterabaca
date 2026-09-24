import type { WorkIndexEntry } from "@/lib/search/index";
import { looksLikeIsbn, normalizeIsbn, tokenize, titleKey } from "@/lib/search/normalize";
import { diceFromSets, TRIGRAM_THRESHOLD, trigrams } from "@/lib/search/trigram";
import type { LangCode } from "@/lib/types";

/**
 * Bobot skor dan tie-break. Sumber: RnD v2.1 bagian 26.3, 26.4, 26.5.
 *
 * Fungsi ini tidak hanya mengembalikan angka, tetapi juga ALASAN kecocokan
 * yang dirender komponen MatchReason.
 */

export type MatchField =
  | "isbn"
  | "originalTitle"
  | "translatedTitle"
  | "editionTitle"
  | "alias"
  | "author"
  | "publisher"
  | "subject"
  | "fuzzy";

export interface MatchInfo {
  field: MatchField;
  lang?: LangCode;
  value: string;
  similarity?: number;
}

export interface ScoredMatch {
  score: number;
  matchedOn: MatchInfo;
}

/** RnD 26.3. Nilai mentah sebelum boost. */
const WEIGHT = {
  isbnExact: 100,
  titleExact: 90,
  aliasExact: 88,
  titlePrefix: 75,
  titleAllTokens: 65,
  titleFuzzy: 55,
  authorExact: 60,
  authorPartial: 45,
  publisher: 25,
  subject: 15,
} as const;

/** RnD 26.4. */
export const SCORE_THRESHOLD = 30;
export const DID_YOU_MEAN_THRESHOLD = 45;
const BOOST_LANGUAGE_FILTER = 12;
const BOOST_TRANSLATION_INTENT = 8;
const BOOST_POPULARITY_MAX = 5;

export function scoreEntry(
  entry: WorkIndexEntry,
  rawQuery: string,
  activeLanguage?: LangCode,
): ScoredMatch | null {
  const key = titleKey(rawQuery);
  const queryTokens = tokenize(rawQuery);
  if (queryTokens.length === 0) return null;

  // ISBN memotong seluruh pencarian lain (RnD 26.3).
  if (looksLikeIsbn(rawQuery)) {
    const needle = normalizeIsbn(rawQuery);
    if (entry.isbns.includes(needle)) {
      return { score: WEIGHT.isbnExact, matchedOn: { field: "isbn", value: needle } };
    }
  }

  let best: ScoredMatch | null = null;
  const consider = (candidate: ScoredMatch) => {
    if (!best || candidate.score > best.score) best = candidate;
  };

  const queryGrams = trigrams(key);

  for (const title of entry.titles) {
    const field: MatchField = title.isOriginal
      ? "originalTitle"
      : title.lang === entry.work.originalLanguage
        ? "editionTitle"
        : "translatedTitle";

    const info: MatchInfo = { field, lang: title.lang, value: title.raw };

    if (title.key === key) {
      consider({ score: WEIGHT.titleExact, matchedOn: info });
      continue;
    }
    if (title.key.startsWith(key)) {
      consider({ score: WEIGHT.titlePrefix, matchedOn: info });
      continue;
    }

    const titleTokens = title.key.split(" ");
    if (queryTokens.every((token) => titleTokens.some((part) => part.startsWith(token)))) {
      consider({ score: WEIGHT.titleAllTokens, matchedOn: info });
      continue;
    }

    const similarity = diceFromSets(queryGrams, title.grams);
    if (similarity >= TRIGRAM_THRESHOLD) {
      consider({
        score: WEIGHT.titleFuzzy * similarity,
        matchedOn: { field: "fuzzy", lang: title.lang, value: title.raw, similarity },
      });
    }
  }

  for (const alias of entry.aliasKeys) {
    if (alias === key || alias.startsWith(key)) {
      consider({ score: WEIGHT.aliasExact, matchedOn: { field: "alias", value: alias } });
    }
  }

  for (const author of entry.authorNames) {
    if (author.key === key) {
      consider({ score: WEIGHT.authorExact, matchedOn: { field: "author", value: author.raw } });
      continue;
    }
    const authorTokens = author.key.split(" ");
    const matched = queryTokens.filter(
      (token) => token.length > 3 && authorTokens.some((part) => part.startsWith(token)),
    );
    if (matched.length > 0 && matched.length === queryTokens.length) {
      consider({ score: WEIGHT.authorPartial, matchedOn: { field: "author", value: author.raw } });
    }
  }

  for (const publisher of entry.publisherKeys) {
    if (publisher.key === key || publisher.key.startsWith(key)) {
      consider({
        score: WEIGHT.publisher,
        matchedOn: { field: "publisher", value: publisher.raw },
      });
    }
  }

  for (const subject of entry.subjectKeys) {
    if (subject.key === key) {
      consider({ score: WEIGHT.subject, matchedOn: { field: "subject", value: subject.raw } });
    }
  }

  if (!best) return null;
  const found: ScoredMatch = best;

  let score = found.score;

  // RnD 26.4: user yang sudah menyatakan bahasa, dihormati niatnya.
  if (activeLanguage && entry.work.availableLanguages.includes(activeLanguage)) {
    score += BOOST_LANGUAGE_FILTER;
  }

  // Mengetik judul terjemahan adalah sinyal kuat bahwa yang dicari edisi itu.
  if (found.matchedOn.field === "translatedTitle" || found.matchedOn.field === "alias") {
    score += BOOST_TRANSLATION_INTENT;
  }

  score += BOOST_POPULARITY_MAX * entry.popularity;

  return { score, matchedOn: found.matchedOn };
}

/**
 * Tie-break deterministik (RnD 26.4). Urutan terakhir memakai slug supaya
 * hasil selalu sama dan bisa dipakai snapshot test.
 */
export function compareScored(
  a: { score: number; entry: WorkIndexEntry },
  b: { score: number; entry: WorkIndexEntry },
): number {
  if (b.score !== a.score) return b.score - a.score;

  const aId = a.entry.work.hasIndonesianEdition ? 0 : 1;
  const bId = b.entry.work.hasIndonesianEdition ? 0 : 1;
  if (aId !== bId) return aId - bId;

  const byRating = b.entry.work.ratingSummary.count - a.entry.work.ratingSummary.count;
  if (byRating !== 0) return byRating;

  const byYear = b.entry.work.firstPublishedYear - a.entry.work.firstPublishedYear;
  if (byYear !== 0) return byYear;

  return a.entry.work.slug.localeCompare(b.entry.work.slug);
}
