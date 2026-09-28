import { LanguageBadge } from "@/components/edition/LanguageBadge";
import { getPublisher, getTranslator } from "@/data/catalog";
import { cn } from "@/lib/cn";
import {
  availabilityName,
  editionExtent,
  formatCount,
  formatName,
  formatRating,
} from "@/lib/format";
import type { Edition } from "@/lib/types";

/**
 * Dipakai di drawer dan di halaman daftar edisi.
 *
 * Baris cetakan dan label edisi ada khusus untuk kasus "cover mirip tetapi
 * terbitannya berbeda" (EC-4), yang tanpa keduanya tidak mungkin dibedakan.
 */
export function EditionRowContent({ edition }: { edition: Edition }) {
  const publisher = getPublisher(edition.publisherId);
  const translators = edition.translatorIds
    .map((id) => getTranslator(id)?.name)
    .filter((name): name is string => !!name);

  const extent = editionExtent(edition);
  const availability = availabilityName(edition.availability);

  const printingParts = [
    edition.editionLabel,
    edition.printing ? `cetakan ${edition.printing}` : null,
  ].filter(Boolean);

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1 text-left">
      <div className="flex flex-wrap items-center gap-2">
        <LanguageBadge lang={edition.language} />
        <span className="font-title text-h3 text-ink-900" lang={edition.language}>
          {edition.title}
        </span>
      </div>

      <p className="text-sm text-ink-700">
        {[publisher?.name, String(edition.publishedYear), formatName(edition.format), extent]
          .filter(Boolean)
          .join(" · ")}
      </p>

      {printingParts.length > 0 && (
        <p className="text-sm text-ink-500">{printingParts.join(" · ")}</p>
      )}

      {translators.length > 0 && (
        <p className="text-sm text-ink-500">Penerjemah: {translators.join(", ")}</p>
      )}

      {edition.isbn13 && <p className="text-sm text-ink-400">ISBN {edition.isbn13}</p>}

      <p className="text-sm">
        {edition.ratingSummary.count > 0 ? (
          <span className="text-rating-text">
            {formatRating(edition.ratingSummary.average)} dari 5 untuk edisi ini (
            {formatCount(edition.ratingSummary.count)} rating)
          </span>
        ) : (
          <span className="text-ink-400">Belum ada rating untuk edisi ini</span>
        )}
      </p>

      {availability && <p className={cn("text-sm font-medium text-warning-fg")}>{availability}</p>}

      {edition.notes && <p className="text-sm text-ink-500">{edition.notes}</p>}
    </div>
  );
}
