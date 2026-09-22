"use client";

import { Star } from "lucide-react";
import { useId } from "react";

import { cn } from "@/lib/cn";

/**
 * Input rating bintang. RnD 21.3.
 *
 * Memakai lima radio asli yang disembunyikan secara visual, bukan tombol
 * atau div. Konsekuensinya: panah kiri dan kanan bekerja tanpa kode
 * tambahan, screen reader membacakannya sebagai pilihan, dan nilainya ikut
 * terkirim kalau formnya disubmit tanpa JavaScript.
 */
export function RatingInput({
  value,
  onChange,
  describedBy,
}: {
  value: number;
  onChange: (value: number) => void;
  describedBy?: string;
}) {
  const name = useId();

  return (
    <fieldset className="border-0 p-0" aria-describedby={describedBy}>
      <legend className="text-body font-medium text-ink-900">Beri rating</legend>

      <div className="mt-2 flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <label
            key={star}
            className="relative flex tap-target cursor-pointer items-center justify-center rounded-md focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus-ring"
          >
            {/* Radio menutupi seluruh area label, bukan disembunyikan dengan
                sr-only. Dengan begitu target sentuhnya benar-benar 44px
                (RnD 21.1), dan elemennya tetap radio asli, bukan tombol
                yang menyamar sebagai radio. */}
            <input
              type="radio"
              name={name}
              value={star}
              checked={value === star}
              onChange={() => onChange(star)}
              aria-label={`Beri ${star} dari 5 bintang`}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            <Star
              aria-hidden="true"
              className={cn(
                "size-7 transition-colors duration-[var(--dur-micro)]",
                star <= value ? "fill-rating-fill text-rating-fill" : "text-line-strong",
              )}
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
