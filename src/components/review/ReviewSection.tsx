"use client";

import { useState } from "react";

import { ReviewForm } from "@/components/review/ReviewForm";
import { LanguageBadge } from "@/components/edition/LanguageBadge";
import { useHydrated, useStore } from "@/hooks/useStore";
import { cn } from "@/lib/cn";
import { formatDate, formatRating, languageName } from "@/lib/format";
import { logEvent, removeReview, reviewStore } from "@/lib/stores";
import type { Edition, LangCode } from "@/lib/types";

/**
 * Daftar review beserta filter bahasa edisi. RnD R-13 dan R-14.
 *
 * Filter bahasa di sini bukan fitur tambahan: kualitas terjemahan berbeda
 * antar penerbit, jadi review dari edisi Bahasa Indonesia tidak selalu
 * relevan bagi pembaca edisi Inggris, dan sebaliknya.
 */
export function ReviewSection({
  workId,
  edition,
  publisherName,
  editionLanguages,
}: {
  workId: string;
  edition: Edition;
  publisherName: string;
  editionLanguages: Array<{ id: string; language: LangCode; label: string }>;
}) {
  const hydrated = useHydrated();
  const reviews = useStore(reviewStore);
  const [language, setLanguage] = useState<string>("all");
  const [writing, setWriting] = useState(false);
  // Konfirmasi disimpan di sini, bukan di dalam form, karena form ikut
  // tertutup setelah submit dan pesannya akan hilang bersama komponennya.
  const [justSaved, setJustSaved] = useState<string | null>(null);

  const mine = reviews.filter((item) => item.workId === workId);
  const visible = language === "all" ? mine : mine.filter((item) => item.readLanguage === language);

  const languages = [...new Set(editionLanguages.map((item) => item.language))];

  if (!hydrated) {
    return <div aria-busy="true" className="h-32 animate-pulse rounded-lg bg-surface-sunken" />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-body text-ink-700">
          {mine.length === 0 ? "Belum ada review dari kamu" : `${mine.length} review dari kamu`}
        </p>

        {mine.length > 0 && (
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <span className="font-medium">Bahasa edisi</span>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="h-9 rounded-md border border-line-strong bg-surface px-2 text-sm text-ink-900"
            >
              <option value="all">Semua bahasa</option>
              {languages.map((code) => (
                <option key={code} value={code}>
                  {languageName(code)}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {writing ? (
        <ReviewForm
          workId={workId}
          edition={edition}
          publisherName={publisherName}
          onDone={() => {
            setWriting(false);
            setJustSaved(`Review tersimpan untuk edisi ${publisherName} ${edition.publishedYear}.`);
          }}
        />
      ) : (
        <button
          type="button"
          onClick={() => {
            setWriting(true);
            logEvent("review_form_opened", { workId, editionId: edition.id });
          }}
          className="inline-flex tap-target w-fit items-center rounded-md border border-line-strong px-4 text-body text-ink-700 hover:bg-surface-alt"
        >
          {mine.some((item) => item.editionId === edition.id)
            ? "Ubah review untuk edisi ini"
            : "Tulis review untuk edisi ini"}
        </button>
      )}

      {justSaved && !writing && (
        <p role="status" className="text-body text-success-fg">
          {justSaved}
        </p>
      )}

      {visible.length === 0 ? (
        <p
          data-empty-state={language === "all" ? "E-09" : "E-10"}
          className="rounded-lg border border-dashed border-line-strong px-4 py-6 text-center text-body text-ink-500"
        >
          {language === "all"
            ? "Belum ada review. Review yang kamu tulis akan tersimpan di browser ini."
            : `Belum ada review untuk edisi berbahasa ${languageName(language)}.`}
        </p>
      ) : (
        <ol className="flex flex-col gap-3">
          {visible.map((review) => {
            const source = editionLanguages.find((item) => item.id === review.editionId);
            return (
              <li key={review.id} className="rounded-lg border border-line bg-surface-alt p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    role="img"
                    aria-label={`Kamu memberi ${formatRating(review.rating)} dari 5 bintang`}
                    className="font-medium text-rating-text"
                  >
                    {"★".repeat(review.rating)}
                    <span className="text-line-strong">{"★".repeat(5 - review.rating)}</span>
                  </span>
                  <LanguageBadge lang={review.readLanguage} />
                  {source && <span className="text-sm text-ink-500">{source.label}</span>}
                </div>

                {review.containsSpoiler && (
                  <p className="mt-2 text-sm font-medium text-warning-fg">Mengandung spoiler</p>
                )}

                <p className={cn("mt-2 text-body-lg text-ink-700")}>{review.text}</p>

                <div className="mt-3 flex items-center gap-4 text-sm text-ink-500">
                  <span>{formatDate(review.createdAt)}</span>
                  <button
                    type="button"
                    onClick={() => removeReview(review.id)}
                    className="text-danger-fg underline underline-offset-2"
                  >
                    Hapus review
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
