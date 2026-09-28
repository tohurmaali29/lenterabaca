import { publishers } from "@/data/entities";
import { COVER_HEIGHT, COVER_WIDTH, coverAlt, coverUrl } from "@/lib/cover";
import { summarize } from "@/lib/rating";
import type {
  Availability,
  AuthorId,
  BookWork,
  Edition,
  EditionId,
  Format,
  Histogram,
  LangCode,
  PublisherId,
  SeriesId,
  Title,
  TranslatorId,
  WorkId,
} from "@/lib/types";

/**
 * Tiga hal yang sengaja dihitung di sini, bukan ditulis tangan per edisi:
 *  - cover: url, ukuran, dan alt diturunkan dari judul, penerbit, dan tahun
 *  - ratingSummary: average dan count diturunkan dari histogram (RnD 24.3)
 *  - field turunan pada karya: dihitung di catalog.ts
 *
 * Nama penerbit yang tidak dikenal langsung melempar error saat modul dimuat,
 * sehingga referensi menggantung gagal di build, bukan di layar user.
 */

const publisherById = new Map(publishers.map((entry) => [entry.id as string, entry]));

function publisherName(id: string): string {
  const found = publisherById.get(id);
  if (!found) throw new Error(`publisherId tidak dikenal di fixtures: ${id}`);
  return found.name;
}

const NO_RATING: Histogram = [0, 0, 0, 0, 0];

export interface EditionInput {
  id: string;
  workId: string;
  title: string;
  subtitle?: string;
  language: LangCode;
  isTranslation?: boolean;
  translatorIds?: string[];
  publisherId: string;
  format: Format;
  publishedYear: number;
  printing?: number;
  editionLabel?: string;
  isbn10?: string;
  isbn13?: string;
  pageCount?: number;
  durationMinutes?: number;
  /** Satu-satunya masukan rating. average dan count dihitung dari sini. */
  ratings?: Histogram;
  availability?: Availability;
  notes?: string;
}

export function edition(input: EditionInput): Edition {
  const name = publisherName(input.publisherId);
  const ratingSummary = summarize(input.ratings ?? NO_RATING);

  return {
    id: input.id as EditionId,
    workId: input.workId as WorkId,
    title: input.title,
    subtitle: input.subtitle,
    language: input.language,
    isTranslation: input.isTranslation ?? false,
    translatorIds: (input.translatorIds ?? []) as TranslatorId[],
    publisherId: input.publisherId as PublisherId,
    format: input.format,
    publishedYear: input.publishedYear,
    printing: input.printing,
    editionLabel: input.editionLabel,
    isbn10: input.isbn10,
    isbn13: input.isbn13,
    pageCount: input.pageCount,
    durationMinutes: input.durationMinutes,
    cover: {
      url: coverUrl(input.id),
      width: COVER_WIDTH,
      height: COVER_HEIGHT,
      alt: coverAlt({
        title: input.title,
        publisherName: name,
        publishedYear: input.publishedYear,
      }),
      source: "generated",
    },
    ratingSummary,
    reviewCount: ratingSummary.count,
    availability: input.availability ?? "in-print",
    notes: input.notes,
  };
}

/**
 * Karya tanpa field turunan. catalog.ts yang melengkapinya.
 *
 * ratingSummary dan reviewCount ikut dikeluarkan karena diturunkan dari
 * jumlah histogram seluruh edisi karya itu. Setiap rating selalu melekat
 * pada sebuah edisi, jadi rating karya adalah penjumlahannya, bukan angka
 * terpisah yang bisa bertentangan dengan edisi-edisinya.
 */
export type WorkSeed = Omit<
  BookWork,
  "editionIds" | "availableLanguages" | "hasIndonesianEdition" | "ratingSummary" | "reviewCount"
>;

export interface WorkInput {
  id: string;
  slug: string;
  originalTitle: string;
  originalLanguage: LangCode;
  titles: Title[];
  authorIds: string[];
  seriesId?: string;
  seriesPosition?: number;
  description: string;
  /** Default id. Diisi eksplisit untuk karya berdeskripsi asing (EC-11). */
  descriptionLang?: LangCode;
  subjects: string[];
  firstPublishedYear: number;
  defaultEditionId: string;
}

export function work(input: WorkInput): WorkSeed {
  return {
    id: input.id as WorkId,
    slug: input.slug,
    originalTitle: input.originalTitle,
    originalLanguage: input.originalLanguage,
    titles: input.titles,
    authorIds: input.authorIds as AuthorId[],
    seriesId: input.seriesId as SeriesId | undefined,
    seriesPosition: input.seriesPosition,
    description: input.description,
    descriptionLang: input.descriptionLang ?? "id",
    subjects: input.subjects,
    firstPublishedYear: input.firstPublishedYear,
    defaultEditionId: input.defaultEditionId as EditionId,
  };
}
