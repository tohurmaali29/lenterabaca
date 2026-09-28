import type {
  Author,
  AuthorId,
  Publisher,
  PublisherId,
  Series,
  SeriesId,
  Translator,
  TranslatorId,
} from "@/lib/types";

import { authorPhotos } from "./authorPhotos";

/**
 * Ini adalah curated local fixtures, bukan katalog bibliografi.
 * Nama penulis, judul karya, dan nama penerbit adalah organisasi dan karya
 * nyata, tetapi kombinasi edisi, tahun, jumlah halaman, ISBN, dan rating
 * DIBUAT untuk keperluan pengujian dan demo. Jangan memakai berkas ini
 * sebagai rujukan bibliografi.
 *
 * Nama penerjemah sengaja fiktif (RnD bagian 25), supaya rating dan review
 * buatan tidak melekat pada orang nyata.
 */

const author = (id: string, slug: string, name: string, altNames: string[] = []): Author => ({
  id: id as AuthorId,
  slug,
  name,
  altNames,
  photo: authorPhotos[slug]?.file,
});

const publisher = (
  id: string,
  slug: string,
  name: string,
  country: Publisher["country"],
  altNames: string[] = [],
): Publisher => ({ id: id as PublisherId, slug, name, country, altNames });

const translator = (id: string, name: string): Translator => ({
  id: id as TranslatorId,
  name,
});

const series = (id: string, slug: string, name: string): Series => ({
  id: id as SeriesId,
  slug,
  name,
});

export const authors: Author[] = [
  // EC-8: altNames terisi supaya pencarian menemukan ejaan alternatif.
  author("au-andrea-hirata", "andrea-hirata", "Andrea Hirata"),
  author("au-pramoedya", "pramoedya-ananta-toer", "Pramoedya Ananta Toer", [
    "Pramudya Ananta Tur",
    "Pram",
  ]),
  author("au-eka-kurniawan", "eka-kurniawan", "Eka Kurniawan"),
  author("au-dee-lestari", "dee-lestari", "Dee Lestari", ["Dewi Lestari", "Dee"]),
  author("au-rowling", "j-k-rowling", "J.K. Rowling", ["J. K. Rowling", "Joanne Rowling"]),
  author("au-saint-exupery", "antoine-de-saint-exupery", "Antoine de Saint-Exupéry", [
    "Antoine de Saint Exupery",
    "Saint-Exupery",
  ]),
  author("au-orwell", "george-orwell", "George Orwell", ["Eric Arthur Blair"]),
  author("au-murakami", "haruki-murakami", "Haruki Murakami", ["Murakami Haruki"]),
  author("au-coelho", "paulo-coelho", "Paulo Coelho"),
  author("au-harari", "yuval-noah-harari", "Yuval Noah Harari", ["Yuval Harari"]),
  author("au-tolkien", "j-r-r-tolkien", "J.R.R. Tolkien", [
    "J. R. R. Tolkien",
    "John Ronald Reuel Tolkien",
  ]),
  author("au-hemingway", "ernest-hemingway", "Ernest Hemingway"),
  author("au-min-jin-lee", "min-jin-lee", "Min Jin Lee"),
  author("au-ishiguro", "kazuo-ishiguro", "Kazuo Ishiguro"),
  author("au-soseki", "natsume-soseki", "Natsume Sōseki", ["Natsume Soseki", "Sōseki Natsume"]),
  author("au-austen", "jane-austen", "Jane Austen"),
];

export const publishers: Publisher[] = [
  // Penerbit Indonesia. EC-9: nama panjang plus nama pendek yang dipakai orang.
  publisher("pb-gpu", "gramedia-pustaka-utama", "Gramedia Pustaka Utama", "ID", [
    "Gramedia",
    "GPU",
  ]),
  publisher("pb-bentang", "bentang-pustaka", "Bentang Pustaka", "ID", [
    "Bentang",
    "Bentang Budaya",
  ]),
  publisher("pb-kpg", "kepustakaan-populer-gramedia", "Kepustakaan Populer Gramedia", "ID", [
    "KPG",
  ]),
  publisher("pb-mizan", "mizan-pustaka", "Mizan Pustaka", "ID", ["Mizan"]),
  publisher("pb-noura", "noura-books", "Noura Books", "ID", ["Noura"]),
  publisher("pb-lentera-dipantara", "lentera-dipantara", "Lentera Dipantara", "ID"),
  publisher("pb-hasta-mitra", "hasta-mitra", "Hasta Mitra", "ID"),
  publisher("pb-serambi", "serambi-ilmu-semesta", "Serambi Ilmu Semesta", "ID", ["Serambi"]),

  publisher("pb-bloomsbury", "bloomsbury", "Bloomsbury Publishing", "UK", ["Bloomsbury"]),
  publisher("pb-penguin", "penguin-books", "Penguin Books", "UK", ["Penguin"]),
  publisher("pb-vintage", "vintage-books", "Vintage Books", "US", ["Vintage"]),
  publisher("pb-faber", "faber-and-faber", "Faber and Faber", "UK", ["Faber"]),
  publisher("pb-harper", "harpercollins", "HarperCollins", "US", ["Harper"]),
  publisher("pb-sarah-crichton", "sarah-crichton-books", "Sarah Crichton Books", "US"),
  publisher("pb-new-directions", "new-directions", "New Directions Publishing", "US", [
    "New Directions",
  ]),
  publisher("pb-kodansha", "kodansha", "Kodansha", "JP"),
  publisher("pb-shinchosha", "shinchosha", "Shinchosha", "JP"),
  publisher("pb-gallimard", "gallimard", "Gallimard", "FR"),
];

/** Semua nama penerjemah di bawah ini FIKTIF, sesuai RnD bagian 25. */
export const translators: Translator[] = [
  translator("tr-01", "Rani Prasetyo"),
  translator("tr-02", "Bagas Nurwidodo"),
  translator("tr-03", "Sekar Ayuningtyas"),
  translator("tr-04", "Damar Wicaksana"),
  translator("tr-05", "Lintang Prameswari"),
  translator("tr-06", "Hana Laksmi"),
  translator("tr-07", "Yusuf Ardiansyah"),
  translator("tr-08", "Clara Wijayanti"),
  translator("tr-09", "Marcus Halloway"),
  translator("tr-10", "Eleanor Brightwater"),
  translator("tr-11", "Thomas Ferrand"),
  translator("tr-12", "Aiko Tanabe"),
];

export const seriesList: Series[] = [
  series("se-laskar-pelangi", "tetralogi-laskar-pelangi", "Tetralogi Laskar Pelangi"),
  series("se-buru", "tetralogi-buru", "Tetralogi Buru"),
  series("se-harry-potter", "harry-potter", "Harry Potter"),
];
