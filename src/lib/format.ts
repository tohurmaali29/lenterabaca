import type { Edition, Format, LangCode } from "@/lib/types";

/**
 * Pemformatan tampilan. Sumber: RnD v2.1 bagian 16.
 *
 * Semua angka dan tanggal lewat Intl dengan locale id-ID, jadi desimal
 * memakai koma dan ribuan memakai titik. Ini bukan detail kosmetik: rating
 * "4.2" terbaca salah oleh pembaca Indonesia.
 */

const LOCALE = "id-ID";

const numberFormatter = new Intl.NumberFormat(LOCALE);
const ratingFormatter = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export const formatCount = (value: number): string => numberFormatter.format(value);
export const formatRating = (value: number): string => ratingFormatter.format(value);
export const formatDate = (iso: string): string => dateFormatter.format(new Date(iso));

/**
 * Nama bahasa dalam bentuk penuh (RnD D-04).
 * Bahasa utama ditulis tangan supaya "id" menjadi "Bahasa Indonesia",
 * bukan "Indonesia", karena itu yang dipakai orang menyebutnya.
 */
const LANGUAGE_NAMES: Record<string, string> = {
  id: "Bahasa Indonesia",
  en: "Inggris",
  ja: "Jepang",
  fr: "Prancis",
  de: "Jerman",
  pt: "Portugis",
};

let displayNames: Intl.DisplayNames | undefined;

export function languageName(code: LangCode): string {
  const known = LANGUAGE_NAMES[code];
  if (known) return known;

  try {
    displayNames ??= new Intl.DisplayNames([LOCALE], { type: "language" });
    return displayNames.of(code) ?? code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
}

/** Kode pendek untuk badge sempit. Selalu disertai teks lengkap di sr-only. */
export const languageCode = (code: LangCode): string => code.toUpperCase();

const FORMAT_NAMES: Record<Format, string> = {
  paperback: "Paperback",
  hardcover: "Hardcover",
  ebook: "Ebook",
  audiobook: "Audiobook",
};

export const formatName = (value: Format): string => FORMAT_NAMES[value];

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} menit`;
  if (rest === 0) return `${hours} jam`;
  return `${hours} jam ${rest} menit`;
}

/** Ukuran edisi: halaman untuk cetak dan ebook, durasi untuk audiobook. */
export function editionExtent(edition: Edition): string | null {
  if (edition.durationMinutes) return formatDuration(edition.durationMinutes);
  if (edition.pageCount) return `${formatCount(edition.pageCount)} halaman`;
  return null;
}

const AVAILABILITY_NAMES: Record<Edition["availability"], string | null> = {
  "in-print": null,
  "out-of-print": "Tidak dicetak lagi",
  unknown: null,
};

export const availabilityName = (value: Edition["availability"]): string | null =>
  AVAILABILITY_NAMES[value];

/** "Bentang Pustaka - 2005 - Paperback - 529 halaman" */
export function editionSummary(edition: Edition, publisherName: string): string {
  return [
    publisherName,
    String(edition.publishedYear),
    formatName(edition.format),
    editionExtent(edition),
  ]
    .filter(Boolean)
    .join(" · ");
}
