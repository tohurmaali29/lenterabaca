/**
 * Model data LenteraBaca. Sumber: RnD v2.1 bagian 24.
 *
 * Tiga perbaikan penting dari draft awal, semuanya berada tepat di titik
 * masalah yang diaudit:
 *  - setiap judul membawa bahasanya (Title), bukan array string tanpa bahasa
 *  - rating ada di level karya DAN level edisi
 *  - penerbit, penulis, dan penerjemah adalah entitas, bukan string bebas
 */

declare const brandSymbol: unique symbol;

/** Id bertanda, supaya compiler menolak workId yang dipakai di tempat editionId. */
type Branded<T, B extends string> = T & { readonly [brandSymbol]: B };

export type WorkId = Branded<string, "WorkId">;
export type EditionId = Branded<string, "EditionId">;
export type AuthorId = Branded<string, "AuthorId">;
export type PublisherId = Branded<string, "PublisherId">;
export type TranslatorId = Branded<string, "TranslatorId">;
export type SeriesId = Branded<string, "SeriesId">;

/** Kode bahasa ISO 639-1. Union terbuka supaya bahasa baru tidak perlu ubah tipe. */
export type LangCode = "id" | "en" | "ja" | "fr" | "de" | "pt" | (string & {});

export type Format = "paperback" | "hardcover" | "ebook" | "audiobook";

export type Availability = "in-print" | "out-of-print" | "unknown";

export type ShelfStatus = "want-to-read" | "currently-reading" | "read";

/** Judul beserta bahasanya. Tanpa lang, pencarian tidak bisa tahu
 *  apakah yang cocok adalah judul Indonesia atau judul asli. */
export interface Title {
  lang: LangCode;
  value: string;
  isOriginal?: boolean;
}

/** Jumlah rating per bintang 1..5. */
export type Histogram = readonly [number, number, number, number, number];

export interface RatingSummary {
  /** 0..5, satu desimal. Selalu diturunkan dari histogram, tidak ditulis tangan. */
  average: number;
  count: number;
  histogram: Histogram;
}

export interface Author {
  id: AuthorId;
  slug: string;
  name: string;
  /** Ejaan alternatif dan transliterasi, dipakai pencarian (EC-8). */
  altNames: string[];
}

export interface Publisher {
  id: PublisherId;
  slug: string;
  name: string;
  /** Nama pendek dan variannya. Tanpa ini, filter penerbit menampilkan
   *  "Gramedia" dan "Gramedia Pustaka Utama" sebagai dua pilihan (EC-9). */
  altNames: string[];
  country: "ID" | "US" | "UK" | "JP" | "FR" | (string & {});
}

export interface Translator {
  id: TranslatorId;
  name: string;
}

export interface Series {
  id: SeriesId;
  slug: string;
  name: string;
}

export interface Cover {
  url: string;
  width: number;
  height: number;
  /** RnD 21.1: alt deskriptif, menyebut judul, penerbit, dan tahun. */
  alt: string;
  source: "placeholder" | "generated";
}

export interface BookWork {
  id: WorkId;
  slug: string;

  originalTitle: string;
  /** Membedakan karya asli Indonesia dari karya asing yang diterjemahkan.
   *  Arah terjemahan tidak boleh diasumsikan satu arah (EC-5). */
  originalLanguage: LangCode;
  titles: Title[];

  authorIds: AuthorId[];
  seriesId?: SeriesId;
  seriesPosition?: number;

  description: string;
  /** Dipakai untuk atribut lang di UI (RnD 21.2, EC-11). */
  descriptionLang: LangCode;

  subjects: string[];
  firstPublishedYear: number;

  /** Agregat seluruh edisi. */
  ratingSummary: RatingSummary;
  reviewCount: number;

  defaultEditionId: EditionId;

  /** ---- Field turunan, dihitung di data/catalog.ts, bukan ditulis tangan ---- */
  editionIds: EditionId[];
  availableLanguages: LangCode[];
  hasIndonesianEdition: boolean;
}

export interface Edition {
  id: EditionId;
  workId: WorkId;

  /** Judul pada edisi ini. Bisa berbeda jauh dari judul karya (EC-3). */
  title: string;
  subtitle?: string;
  language: LangCode;
  isTranslation: boolean;
  translatorIds: TranslatorId[];

  publisherId: PublisherId;

  format: Format;
  publishedYear: number;

  /** Dua field berikut membedakan kasus "cover mirip tetapi terbitan
   *  berbeda", yang tanpa ini tidak mungkin dibedakan user (EC-4). */
  printing?: number;
  editionLabel?: string;

  isbn10?: string;
  isbn13?: string;

  pageCount?: number;
  /** Untuk audiobook, yang tidak punya pageCount (EC-10). */
  durationMinutes?: number;

  cover: Cover;

  /** Rating khusus edisi ini. */
  ratingSummary: RatingSummary;
  reviewCount: number;

  availability: Availability;
  notes?: string;
}

/** ---- Data milik user, disimpan di localStorage (Phase 5) ---- */

export interface ShelfItem {
  workId: WorkId;
  editionId: EditionId;
  status: ShelfStatus;
  addedAt: string;
  updatedAt: string;
  startedAt?: string;
  finishedAt?: string;
  progress?: { unit: "page" | "percent"; value: number };
}

export interface Review {
  id: string;
  workId: WorkId;
  editionId: EditionId;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  containsSpoiler: boolean;
  /** Bahasa edisi yang dibaca, dipakai filter review per bahasa (R-14). */
  readLanguage: LangCode;
  createdAt: string;
  updatedAt: string;
}

export interface Prefs {
  uiLanguage: "id";
  theme: "light" | "dark" | "system";
  resultView: "grid" | "list";
  defaultLanguageFilter: LangCode | "all";
}

export interface AppEvent {
  id: string;
  name: string;
  payload: Record<string, string | number | boolean | null>;
  at: string;
}

/** Alias judul kurasi manual. Untuk pasangan judul yang tidak punya
 *  satu kata pun yang sama, tidak ada cara otomatis menghubungkannya
 *  tanpa sumber data eksternal (RnD 26.2). */
export interface TitleAlias {
  workId: WorkId;
  aliases: string[];
}
