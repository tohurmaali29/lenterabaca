import type { MatchInfo } from "@/lib/search/score";
import { languageName } from "@/lib/format";

/**
 * Satu baris yang menjelaskan KENAPA hasil ini muncul. RnD R-02 dan 26.5.
 */
export function MatchReason({ match }: { match: MatchInfo }) {
  const label = describe(match);
  if (!label) return null;

  return (
    <p className="text-sm text-ink-500">
      {label.prefix}{" "}
      <span lang={match.lang} className="text-ink-700">
        {label.value}
      </span>
    </p>
  );
}

function describe(match: MatchInfo): { prefix: string; value: string } | null {
  switch (match.field) {
    case "isbn":
      return { prefix: "Cocok dengan ISBN:", value: match.value };
    case "originalTitle":
      return { prefix: "Cocok dengan judul asli:", value: match.value };
    case "translatedTitle":
      return {
        prefix: `Cocok dengan judul ${languageName(match.lang ?? "id")}:`,
        value: match.value,
      };
    case "editionTitle":
      return { prefix: "Cocok dengan judul edisi:", value: match.value };
    case "alias":
      return { prefix: "Dikenal juga sebagai:", value: match.value };
    case "author":
      return { prefix: "Cocok dengan penulis:", value: match.value };
    case "publisher":
      return { prefix: "Cocok dengan penerbit:", value: match.value };
    case "subject":
      return { prefix: "Cocok dengan kategori:", value: match.value };
    case "fuzzy":
      return { prefix: "Mirip dengan:", value: match.value };
    default:
      return null;
  }
}
