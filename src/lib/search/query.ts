import { editionsOf, initialEdition } from "@/data/catalog";
import { searchIndex, type WorkIndexEntry } from "@/lib/search/index";
import {
  compareScored,
  DID_YOU_MEAN_THRESHOLD,
  SCORE_THRESHOLD,
  scoreEntry,
  type MatchInfo,
} from "@/lib/search/score";
import type { BookWork, Edition, Format, LangCode, PublisherId } from "@/lib/types";

export const MIN_QUERY_LENGTH = 2;
export const MAX_RESULTS = 50;

export type SortKey = "relevance" | "rating" | "newest" | "title";

export interface SearchFilters {
  language?: LangCode | "all";
  format?: Format | "all";
  publisher?: PublisherId | "all";
  sort?: SortKey;
}

export interface SearchResult {
  work: BookWork;
  /** Edisi yang ditampilkan di kartu, mengikuti filter bahasa yang aktif. */
  edition: Edition;
  score: number;
  matchedOn: MatchInfo;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  /** true bila skor tertinggi rendah, sehingga UI menampilkan E-03. */
  isLowConfidence: boolean;
  /** true bila hasil kosong hanya karena filter, bukan karena query. */
  emptyBecauseOfFilters: boolean;
  totalBeforeFilters: number;
}

function activeLanguage(filters: SearchFilters): LangCode | undefined {
  return filters.language && filters.language !== "all" ? filters.language : undefined;
}

/** Edisi yang paling mewakili karya ini untuk filter yang sedang aktif. */
export function displayEdition(work: BookWork, filters: SearchFilters): Edition {
  const language = activeLanguage(filters);
  const own = editionsOf(work.id);

  const candidates = own.filter((item) => {
    if (language && item.language !== language) return false;
    if (filters.format && filters.format !== "all" && item.format !== filters.format) return false;
    if (
      filters.publisher &&
      filters.publisher !== "all" &&
      item.publisherId !== filters.publisher
    ) {
      return false;
    }
    return true;
  });

  // editionsOf sudah terurut: Bahasa Indonesia dulu, lalu tahun terbaru.
  return candidates[0] ?? initialEdition(work);
}

function passesFilters(entry: WorkIndexEntry, filters: SearchFilters): boolean {
  const own = editionsOf(entry.work.id);
  const language = activeLanguage(filters);

  return own.some((item) => {
    if (language && item.language !== language) return false;
    if (filters.format && filters.format !== "all" && item.format !== filters.format) return false;
    if (
      filters.publisher &&
      filters.publisher !== "all" &&
      item.publisherId !== filters.publisher
    ) {
      return false;
    }
    return true;
  });
}

function sortResults(results: SearchResult[], sort: SortKey): SearchResult[] {
  if (sort === "relevance") return results;

  const copy = [...results];
  switch (sort) {
    case "rating":
      copy.sort(
        (a, b) =>
          b.work.ratingSummary.average - a.work.ratingSummary.average ||
          b.work.ratingSummary.count - a.work.ratingSummary.count ||
          a.work.slug.localeCompare(b.work.slug),
      );
      break;
    case "newest":
      copy.sort(
        (a, b) =>
          b.edition.publishedYear - a.edition.publishedYear ||
          a.work.slug.localeCompare(b.work.slug),
      );
      break;
    case "title":
      copy.sort((a, b) => a.edition.title.localeCompare(b.edition.title, "id"));
      break;
  }
  return copy;
}

export function search(rawQuery: string, filters: SearchFilters = {}): SearchResponse {
  const query = rawQuery.trim();

  if (query.length < MIN_QUERY_LENGTH) {
    return {
      query,
      results: [],
      isLowConfidence: false,
      emptyBecauseOfFilters: false,
      totalBeforeFilters: 0,
    };
  }

  const language = activeLanguage(filters);

  const scored = searchIndex
    .map((entry) => ({ entry, match: scoreEntry(entry, query, language) }))
    .filter(
      (row): row is { entry: WorkIndexEntry; match: NonNullable<typeof row.match> } =>
        row.match !== null && row.match.score >= SCORE_THRESHOLD,
    )
    .map((row) => ({ entry: row.entry, score: row.match.score, matchedOn: row.match.matchedOn }));

  scored.sort(compareScored);

  const topScore = scored[0]?.score ?? 0;
  const filtered = scored.filter((row) => passesFilters(row.entry, filters));

  const results: SearchResult[] = filtered.slice(0, MAX_RESULTS).map((row) => ({
    work: row.entry.work,
    edition: displayEdition(row.entry.work, filters),
    score: row.score,
    matchedOn: row.matchedOn,
  }));

  return {
    query,
    results: sortResults(results, filters.sort ?? "relevance"),
    isLowConfidence: scored.length > 0 && topScore < DID_YOU_MEAN_THRESHOLD,
    emptyBecauseOfFilters: scored.length > 0 && filtered.length === 0,
    totalBeforeFilters: scored.length,
  };
}

/**
 * Saran untuk empty state E-03. Memakai ambang lebih longgar daripada
 * pencarian biasa, karena di titik ini user sudah tidak menemukan apa pun
 * dan saran yang mendekati lebih berguna daripada layar kosong.
 */
export function suggestions(rawQuery: string, limit = 4): SearchResult[] {
  const query = rawQuery.trim();
  if (query.length < MIN_QUERY_LENGTH) return [];

  return searchIndex
    .map((entry) => ({ entry, match: scoreEntry(entry, query) }))
    .filter((row) => row.match !== null && row.match.score >= 12)
    .map((row) => ({ entry: row.entry, score: row.match!.score, matchedOn: row.match!.matchedOn }))
    .sort(compareScored)
    .slice(0, limit)
    .map((row) => ({
      work: row.entry.work,
      edition: initialEdition(row.entry.work),
      score: row.score,
      matchedOn: row.matchedOn,
    }));
}

export function popularWorks(limit = 6): SearchResult[] {
  return [...searchIndex]
    .sort((a, b) => b.work.ratingSummary.count - a.work.ratingSummary.count)
    .slice(0, limit)
    .map((entry) => ({
      work: entry.work,
      edition: initialEdition(entry.work),
      score: 0,
      matchedOn: { field: "originalTitle", value: entry.work.originalTitle },
    }));
}
