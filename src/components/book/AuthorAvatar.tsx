import { cn } from "@/lib/cn";
import type { Author } from "@/lib/types";

function initialsOf(name: string): string {
  const words = name.replace(/\./g, " ").split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/** Jatuh ke inisial bila foto belum tersedia. */
export function AuthorAvatar({ author, className }: { author: Author; className?: string }) {
  const base = cn("size-14 shrink-0 rounded-full ring-1 ring-line", className);

  if (author.photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={author.photo}
        alt=""
        width={56}
        height={56}
        loading="lazy"
        className={cn(base, "bg-surface-sunken object-cover object-[50%_25%]")}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        base,
        "flex items-center justify-center bg-accent-100 font-title text-h3 font-semibold text-accent-700",
      )}
    >
      {initialsOf(author.name)}
    </span>
  );
}
