import { Star } from "lucide-react";

import { cn } from "@/lib/cn";
import { formatCount, formatRating } from "@/lib/format";
import type { RatingScope } from "@/lib/rating";
import type { RatingSummary } from "@/lib/types";

/**
 * Tampilan rating. RnD 24.3 dan 21.3.
 *
 * Cakupan WAJIB disebut. Angka rating tanpa keterangan karya atau edisi
 * adalah salah satu sumber kebingungan yang diaudit di temuan F7.
 */
export function RatingDisplay({
  summary,
  scope,
  className,
}: {
  summary: RatingSummary;
  scope: RatingScope;
  className?: string;
}) {
  const scopeLabel = scope === "work" ? "karya" : "edisi ini";

  if (summary.count === 0) {
    return (
      <p className={cn("text-sm text-ink-400", className)}>Belum ada rating untuk {scopeLabel}</p>
    );
  }

  const label =
    scope === "work"
      ? `Rata-rata karya ${formatRating(summary.average)} dari 5, dari ${formatCount(summary.count)} rating`
      : `Rata-rata edisi ini ${formatRating(summary.average)} dari 5, dari ${formatCount(summary.count)} rating`;

  return (
    <p className={cn("flex flex-wrap items-center gap-x-1.5 text-sm", className)}>
      <span role="img" aria-label={label} className="flex items-center gap-1">
        <Star aria-hidden="true" className="size-6 fill-rating-fill text-rating-fill" />
        <span className="text-xl text-rating-text">{formatRating(summary.average)}</span>
      </span>
      <span aria-hidden="true" className="text-ink-500">
        ({formatCount(summary.count)} rating {scopeLabel})
      </span>
    </p>
  );
}
