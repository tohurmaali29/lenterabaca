"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";

import { RatingInput } from "@/components/book/RatingInput";
import { LanguageBadge } from "@/components/edition/LanguageBadge";
import { useHydrated, useStore } from "@/hooks/useStore";
import { cn } from "@/lib/cn";
import { logEvent, reviewStore, saveReview } from "@/lib/stores";
import type { Edition, Review } from "@/lib/types";

/**
 * Form review. RnD R-13 dan prinsip confidence before action.
 *
 * Edisi yang direview ditampilkan sebagai teks di dalam form, bukan
 * diasumsikan dari konteks halaman. Review yang tersimpan membawa
 * workId, editionId, dan readLanguage sekaligus, sehingga bisa difilter
 * per bahasa edisi nanti (R-14).
 */

const MAX_LENGTH = 5000;

export function ReviewForm({
  workId,
  edition,
  publisherName,
  onDone,
}: {
  workId: string;
  edition: Edition;
  publisherName: string;
  onDone?: () => void;
}) {
  const router = useRouter();
  const hydrated = useHydrated();
  const reviews = useStore(reviewStore);

  const existing = reviews.find((item) => item.workId === workId && item.editionId === edition.id);

  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [text, setText] = useState(existing?.text ?? "");
  const [spoiler, setSpoiler] = useState(existing?.containsSpoiler ?? false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const textId = useId();
  const errorId = useId();
  const counterId = useId();

  const tooLong = text.length > MAX_LENGTH;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (rating === 0) {
      setError("Pilih rating bintang lebih dulu.");
      return;
    }
    if (tooLong) {
      setError(`Review terlalu panjang. Maksimal ${MAX_LENGTH} karakter.`);
      return;
    }

    const now = new Date().toISOString();
    const review: Review = {
      id: existing?.id ?? `rv-${Date.now().toString(36)}`,
      workId: workId as Review["workId"],
      editionId: edition.id,
      rating: rating as Review["rating"],
      text: text.trim(),
      containsSpoiler: spoiler,
      readLanguage: edition.language,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    saveReview(review);
    logEvent("review_submitted", {
      workId,
      editionId: edition.id,
      rating,
      readLanguage: edition.language,
      textLength: review.text.length,
    });

    setError(null);
    setSaved(true);
    router.refresh();
    onDone?.();
  }

  if (!hydrated) {
    return <div aria-busy="true" className="h-64 animate-pulse rounded-lg bg-surface-sunken" />;
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      {/* Konfirmasi edisi, bukan asumsi. */}
      <div className="rounded-md border border-line bg-surface-alt p-3">
        <p className="text-sm text-ink-500">Review ini akan melekat ke edisi</p>
        <p className="mt-1 flex flex-wrap items-center gap-2">
          <LanguageBadge lang={edition.language} />
          <span className="font-title text-h3 text-ink-900" lang={edition.language}>
            {edition.title}
          </span>
        </p>
        <p className="mt-0.5 text-sm text-ink-700">
          {publisherName} &middot; {edition.publishedYear}
        </p>
      </div>

      <RatingInput
        value={rating}
        onChange={(value) => {
          setRating(value);
          setError(null);
        }}
        describedBy={error ? errorId : undefined}
      />

      <div className="flex flex-col gap-1">
        <label htmlFor={textId} className="text-body font-medium text-ink-900">
          Review kamu
        </label>
        <textarea
          id={textId}
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={7}
          aria-describedby={counterId}
          className="rounded-md border border-line-strong bg-surface p-3 text-body-lg text-ink-900 hover:border-ink-400"
          placeholder="Apa yang bikin edisi ini cocok atau tidak cocok buat kamu?"
        />
        <p id={counterId} className={cn("text-sm", tooLong ? "text-danger-fg" : "text-ink-500")}>
          {text.length} dari {MAX_LENGTH} karakter
        </p>
      </div>

      <label className="flex items-center gap-2 text-body text-ink-700">
        <input
          type="checkbox"
          checked={spoiler}
          onChange={(event) => setSpoiler(event.target.checked)}
          className="size-4"
        />
        Review ini mengandung spoiler
      </label>

      {error && (
        <p id={errorId} role="alert" className="text-body text-danger-fg">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={tooLong}
          className={cn(
            "inline-flex tap-target items-center rounded-md bg-accent-600 px-5 text-body font-medium text-accent-on",
            "hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-45",
          )}
        >
          {existing ? "Perbarui review" : "Simpan review"}
        </button>

        {saved && (
          <p role="status" className="text-body text-success-fg">
            Review tersimpan untuk edisi {publisherName} {edition.publishedYear}.
          </p>
        )}
      </div>
    </form>
  );
}
