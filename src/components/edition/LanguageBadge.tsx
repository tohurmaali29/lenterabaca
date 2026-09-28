import { languageCode, languageName } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { LangCode } from "@/lib/types";

/**
 * Kode dua huruf yang terlihat diberi aria-hidden, dan bentuk penuhnya
 * disediakan untuk screen reader. Tanpa itu, "ID" akan dibacakan sebagai
 * huruf lepas, bukan sebagai nama bahasa.
 */
export function LanguageBadge({
  lang,
  size = "sm",
  className,
}: {
  lang: LangCode;
  size?: "sm" | "md";
  className?: string;
}) {
  const isIndonesian = lang === "id";
  const full = languageName(lang);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-sm font-medium",
        size === "sm" ? "h-5 px-1.5 text-xs" : "h-6 px-2 text-xs",
        isIndonesian ? "bg-lang-id-bg text-lang-id-fg" : "bg-lang-other-bg text-lang-other-fg",
        className,
      )}
    >
      <span aria-hidden="true">{languageCode(lang)}</span>
      <span className="sr-only">{isIndonesian ? `Tersedia dalam ${full}` : full}</span>
    </span>
  );
}
