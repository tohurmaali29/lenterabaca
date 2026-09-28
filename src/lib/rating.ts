import type { Edition, EditionId, Histogram, RatingSummary, Review, WorkId } from "@/lib/types";

/**
 * Kenapa average tidak pernah ditulis tangan: kalau average, count, dan
 * histogram sama-sama diisi manual, ketiganya bisa saling bertentangan
 * (misalnya average 4,2 dengan count 3). Di sini histogram adalah satu-satunya
 * masukan, sisanya dihitung, sehingga tidak mungkin tidak konsisten.
 */

const EMPTY: Histogram = [0, 0, 0, 0, 0];

/** Ambang tampil rating edisi. Di bawah ini, UI jatuh ke rating karya. */
export const EDITION_RATING_MIN_COUNT = 5;

export function summarize(histogram: Histogram): RatingSummary {
  const count = histogram.reduce((total, n) => total + n, 0);
  if (count === 0) return { average: 0, count: 0, histogram };

  const weighted = histogram.reduce((total, n, index) => total + n * (index + 1), 0);
  return {
    average: Math.round((weighted / count) * 10) / 10,
    count,
    histogram,
  };
}

function addReviews(base: Histogram, reviews: readonly Review[]): Histogram {
  const next: [number, number, number, number, number] = [...base];
  for (const review of reviews) {
    next[review.rating - 1] += 1;
  }
  return next;
}

/** Rating karya: seed karya digabung seluruh review lokal untuk karya itu. */
export function workRating(
  seed: RatingSummary,
  workId: WorkId,
  reviews: readonly Review[],
): RatingSummary {
  return summarize(
    addReviews(
      seed.histogram,
      reviews.filter((review) => review.workId === workId),
    ),
  );
}

/** Rating edisi: seed edisi digabung review lokal dengan editionId yang sama. */
export function editionRating(
  seed: RatingSummary,
  editionId: EditionId,
  reviews: readonly Review[],
): RatingSummary {
  return summarize(
    addReviews(
      seed.histogram,
      reviews.filter((review) => review.editionId === editionId),
    ),
  );
}

export type RatingScope = "work" | "edition";

export interface RatingDisplay {
  scope: RatingScope;
  summary: RatingSummary;
  /** true bila rating edisi belum cukup dan UI harus memakai rating karya. */
  fellBackToWork: boolean;
}

/**
 * Menentukan rating mana yang ditampilkan untuk sebuah edisi.
 * RnD 24.3: rating edisi hanya tampil sebagai angka bila count minimal 5.
 * Cakupan selalu dikembalikan, karena RnD melarang angka rating tanpa cakupan.
 */
export function resolveEditionRating(
  edition: Pick<Edition, "id" | "ratingSummary">,
  workSummary: RatingSummary,
  reviews: readonly Review[],
): RatingDisplay {
  const own = editionRating(edition.ratingSummary, edition.id, reviews);

  if (own.count >= EDITION_RATING_MIN_COUNT) {
    return { scope: "edition", summary: own, fellBackToWork: false };
  }

  return { scope: "work", summary: workSummary, fellBackToWork: true };
}

export const emptyRating = (): RatingSummary => summarize(EMPTY);
