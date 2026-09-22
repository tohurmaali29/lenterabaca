"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";

import { cn } from "@/lib/cn";

type SearchBarProps = {
  /** hero = elemen utama halaman discovery. compact = di dalam header. */
  size?: "hero" | "compact";
  defaultValue?: string;
  className?: string;
};

/**
 * Satu-satunya komponen input pencarian.
 * RnD 14.1 R-12: hanya boleh ada satu instance yang terlihat per dokumen.
 * Penempatannya diatur AppShell (header) dan halaman discovery (hero).
 */
export function SearchBar({ size = "compact", defaultValue = "", className }: SearchBarProps) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const inputId = useId();
  const hintId = useId();

  const isHero = size === "hero";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = value.trim();
    // RnD 26.6: panjang query minimum 2 karakter (empty state E-02).
    if (query.length < 2) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={cn("relative w-full", className)}
      aria-describedby={isHero ? hintId : undefined}
    >
      <label htmlFor={inputId} className="sr-only">
        Cari judul buku, penulis, atau ISBN
      </label>

      <Search
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-400",
          isHero ? "size-5" : "size-4",
        )}
      />

      <input
        id={inputId}
        type="search"
        name="q"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Cari judul, penulis, atau ISBN"
        autoComplete="off"
        className={cn(
          "w-full rounded-md border border-line-strong bg-surface text-ink-900 placeholder:text-ink-400",
          "transition-colors duration-[var(--dur-micro)] hover:border-ink-400",
          isHero ? "h-12 pr-10 pl-10 text-body-lg sm:h-[52px] lg:h-14" : "h-10 pr-9 pl-9 text-body",
        )}
      />

      {value.length > 0 && (
        <button
          type="button"
          onClick={() => setValue("")}
          className={cn(
            "absolute top-1/2 right-1 flex -translate-y-1/2 items-center justify-center rounded-sm",
            "text-ink-400 hover:text-ink-700",
            isHero ? "size-9" : "size-8",
          )}
        >
          <X aria-hidden="true" className="size-4" />
          <span className="sr-only">Bersihkan pencarian</span>
        </button>
      )}

      {isHero && (
        <p id={hintId} className="mt-2 text-sm text-ink-500">
          Bisa pakai judul asli maupun judul terjemahan Indonesia.
        </p>
      )}
    </form>
  );
}
