import { work, type WorkSeed } from "@/data/build";

/**
 * 18 karya. Sumber: RnD v2.1 bagian 25.
 *
 * Ini curated local fixtures, bukan katalog bibliografi. Judul, penulis, dan
 * penerbit adalah karya dan organisasi nyata, tetapi kombinasi edisi, tahun,
 * halaman, ISBN, dan rating dibuat untuk pengujian.
 *
 * Komposisi yang dijaga test tests/unit/fixtures.test.ts:
 *  - 14 karya punya edisi Bahasa Indonesia (syarat minimum 12)
 *  - 4 karya sengaja TIDAK punya edisi Indonesia (EC-1)
 *  - 4 karya berbahasa asal Indonesia dan diterjemahkan keluar (EC-5)
 *
 * Rating karya TIDAK ditulis di sini. Nilainya diturunkan di catalog.ts
 * sebagai penjumlahan histogram seluruh edisi karya itu, karena setiap
 * rating selalu melekat pada sebuah edisi.
 */
export const workSeeds: WorkSeed[] = [
  // ---------------------------------------------------------------- EC-5, EC-12
  work({
    id: "w-laskar-pelangi",
    slug: "laskar-pelangi",
    originalTitle: "Laskar Pelangi",
    originalLanguage: "id",
    titles: [
      { lang: "id", value: "Laskar Pelangi", isOriginal: true },
      { lang: "en", value: "The Rainbow Troops" },
    ],
    authorIds: ["au-andrea-hirata"],
    seriesId: "se-laskar-pelangi",
    seriesPosition: 1,
    description:
      "Kisah sepuluh murid di sebuah sekolah kecil di Belitung yang bertahan meski sekolahnya hampir ditutup. Novel ini bercerita tentang persahabatan, keterbatasan, dan arti pendidikan bagi mereka yang paling sedikit punya pilihan.",
    subjects: ["Fiksi", "Coming of age", "Pendidikan"],
    firstPublishedYear: 2005,
    defaultEditionId: "ed-lp-1",
  }),

  // ---------------------------------------------------------- EC-5, EC-7, EC-12
  work({
    id: "w-bumi-manusia",
    slug: "bumi-manusia",
    originalTitle: "Bumi Manusia",
    originalLanguage: "id",
    titles: [
      { lang: "id", value: "Bumi Manusia", isOriginal: true },
      { lang: "en", value: "This Earth of Mankind" },
    ],
    authorIds: ["au-pramoedya"],
    seriesId: "se-buru",
    seriesPosition: 1,
    description:
      "Minke, seorang pemuda terpelajar di akhir masa kolonial, berhadapan dengan hukum dan tatanan sosial yang tidak pernah dirancang untuk memihaknya. Buku pertama Tetralogi Buru ini menyusun sejarah Hindia Belanda lewat satu kisah pribadi.",
    subjects: ["Fiksi sejarah", "Sastra Indonesia", "Kolonialisme"],
    firstPublishedYear: 1980,
    defaultEditionId: "ed-bm-2",
  }),

  // ------------------------------------------------------------------------ EC-5
  work({
    id: "w-cantik-itu-luka",
    slug: "cantik-itu-luka",
    originalTitle: "Cantik Itu Luka",
    originalLanguage: "id",
    titles: [
      { lang: "id", value: "Cantik Itu Luka", isOriginal: true },
      { lang: "en", value: "Beauty Is a Wound" },
    ],
    authorIds: ["au-eka-kurniawan"],
    description:
      "Dewi Ayu bangkit dari kuburnya setelah dua puluh satu tahun, dan dari situ terbuka riwayat panjang sebuah kota beserta kekerasan yang menyertainya. Novel ini mencampur sejarah, mitos, dan satir dalam satu garis cerita.",
    subjects: ["Fiksi", "Realisme magis", "Sastra Indonesia"],
    firstPublishedYear: 2002,
    defaultEditionId: "ed-ci-1",
  }),

  work({
    id: "w-perahu-kertas",
    slug: "perahu-kertas",
    originalTitle: "Perahu Kertas",
    originalLanguage: "id",
    titles: [{ lang: "id", value: "Perahu Kertas", isOriginal: true }],
    authorIds: ["au-dee-lestari"],
    description:
      "Kugy ingin menjadi penulis dongeng, Keenan ingin menjadi pelukis, dan keduanya menghabiskan bertahun-tahun mengambil jalan yang bukan jalan mereka. Novel tentang memilih pekerjaan, memilih orang, dan menunda keduanya terlalu lama.",
    subjects: ["Fiksi", "Roman", "Coming of age"],
    firstPublishedYear: 2009,
    defaultEditionId: "ed-prk-1",
  }),

  // ------------------------------------------------------------ EC-2, EC-4, EC-12
  work({
    id: "w-harry-potter-1",
    slug: "harry-potter-dan-batu-bertuah",
    originalTitle: "Harry Potter and the Philosopher's Stone",
    originalLanguage: "en",
    titles: [
      { lang: "en", value: "Harry Potter and the Philosopher's Stone", isOriginal: true },
      { lang: "id", value: "Harry Potter dan Batu Bertuah" },
    ],
    authorIds: ["au-rowling"],
    seriesId: "se-harry-potter",
    seriesPosition: 1,
    description:
      "Harry Potter mengetahui pada ulang tahunnya yang kesebelas bahwa ia seorang penyihir, lalu masuk ke sekolah yang tidak pernah ia tahu ada. Buku pertama dari tujuh, dan titik masuk paling umum ke serinya.",
    subjects: ["Fantasi", "Anak dan remaja", "Sekolah sihir"],
    firstPublishedYear: 1997,
    defaultEditionId: "ed-hp-4",
  }),

  work({
    id: "w-le-petit-prince",
    slug: "pangeran-kecil",
    originalTitle: "Le Petit Prince",
    originalLanguage: "fr",
    titles: [
      { lang: "fr", value: "Le Petit Prince", isOriginal: true },
      { lang: "id", value: "Pangeran Kecil" },
      { lang: "en", value: "The Little Prince" },
    ],
    authorIds: ["au-saint-exupery"],
    description:
      "Seorang penerbang yang mendarat paksa di padang gurun bertemu anak lelaki dari planet lain. Cerita pendek yang ditulis untuk anak-anak, tetapi sebagian besar isinya ditujukan kepada orang dewasa.",
    subjects: ["Fiksi", "Klasik", "Anak dan remaja"],
    firstPublishedYear: 1943,
    defaultEditionId: "ed-pgk-4",
  }),

  // ------------------------------------------------------------------------ EC-3
  work({
    id: "w-animal-farm",
    slug: "animal-farm",
    originalTitle: "Animal Farm",
    originalLanguage: "en",
    titles: [
      { lang: "en", value: "Animal Farm", isOriginal: true },
      { lang: "id", value: "Binatangisme" },
      { lang: "id", value: "Animal Farm" },
    ],
    authorIds: ["au-orwell"],
    description:
      "Para hewan mengambil alih peternakan dari pemiliknya dan menyusun aturan mereka sendiri, sampai aturan itu perlahan ditulis ulang. Alegori pendek tentang bagaimana kekuasaan membenarkan dirinya.",
    subjects: ["Fiksi", "Satir politik", "Klasik"],
    firstPublishedYear: 1945,
    defaultEditionId: "ed-af-3",
  }),

  // ------------------------------------------------------------------ EC-2, EC-6
  work({
    id: "w-1984",
    slug: "1984",
    originalTitle: "Nineteen Eighty-Four",
    originalLanguage: "en",
    titles: [
      { lang: "en", value: "Nineteen Eighty-Four", isOriginal: true },
      { lang: "en", value: "1984" },
      { lang: "id", value: "1984" },
    ],
    authorIds: ["au-orwell"],
    description:
      "Winston Smith bekerja memperbaiki catatan masa lalu agar selalu cocok dengan versi resmi hari ini. Novel tentang pengawasan, bahasa yang dipersempit, dan apa yang tersisa dari seseorang setelah keduanya bekerja.",
    subjects: ["Fiksi", "Distopia", "Klasik"],
    firstPublishedYear: 1949,
    defaultEditionId: "ed-84-5",
  }),

  // ----------------------------------------------------------------------- EC-11
  work({
    id: "w-norwegian-wood",
    slug: "norwegian-wood",
    originalTitle: "ノルウェイの森",
    originalLanguage: "ja",
    titles: [
      { lang: "ja", value: "ノルウェイの森", isOriginal: true },
      { lang: "en", value: "Norwegian Wood" },
      { lang: "id", value: "Norwegian Wood" },
    ],
    authorIds: ["au-murakami"],
    description:
      "Toru Watanabe looks back on his student years in Tokyo and the two women who shaped them. A quiet novel about grief that does not resolve and choices that cannot be unmade.",
    descriptionLang: "en",
    subjects: ["Fiksi", "Sastra Jepang", "Roman"],
    firstPublishedYear: 1987,
    defaultEditionId: "ed-nw-3",
  }),

  // ------------------------------------------------------------------------ EC-3
  work({
    id: "w-kafka-on-the-shore",
    slug: "dunia-kafka",
    originalTitle: "海辺のカフカ",
    originalLanguage: "ja",
    titles: [
      { lang: "ja", value: "海辺のカフカ", isOriginal: true },
      { lang: "en", value: "Kafka on the Shore" },
      { lang: "id", value: "Dunia Kafka" },
    ],
    authorIds: ["au-murakami"],
    description:
      "Dua cerita berjalan bergantian: seorang remaja yang kabur dari rumah, dan seorang lelaki tua yang bisa berbicara dengan kucing. Keduanya bergerak menuju satu titik tanpa pernah dijelaskan sebabnya.",
    subjects: ["Fiksi", "Realisme magis", "Sastra Jepang"],
    firstPublishedYear: 2002,
    defaultEditionId: "ed-kt-3",
  }),

  // ------------------------------------------------------------------------ EC-3
  work({
    id: "w-the-alchemist",
    slug: "sang-alkemis",
    originalTitle: "O Alquimista",
    originalLanguage: "pt",
    titles: [
      { lang: "pt", value: "O Alquimista", isOriginal: true },
      { lang: "en", value: "The Alchemist" },
      { lang: "id", value: "Sang Alkemis" },
    ],
    authorIds: ["au-coelho"],
    description:
      "Santiago, seorang gembala, meninggalkan kampungnya untuk mengejar sesuatu yang ia lihat dalam mimpi berulang. Perjalanannya dipakai sebagai alasan untuk membicarakan panggilan hidup dan harga menundanya.",
    subjects: ["Fiksi", "Filosofis", "Perjalanan"],
    firstPublishedYear: 1988,
    defaultEditionId: "ed-al-2",
  }),

  // ---------------------------------------------------------------- EC-10, EC-11
  work({
    id: "w-pride-and-prejudice",
    slug: "pride-and-prejudice",
    originalTitle: "Pride and Prejudice",
    originalLanguage: "en",
    titles: [
      { lang: "en", value: "Pride and Prejudice", isOriginal: true },
      { lang: "id", value: "Pride and Prejudice" },
    ],
    authorIds: ["au-austen"],
    description:
      "Elizabeth Bennet and Mr Darcy spend most of the book being wrong about each other, in a society where marriage is the main instrument of survival. A comedy of manners that is also an argument about money.",
    descriptionLang: "en",
    subjects: ["Fiksi", "Klasik", "Roman"],
    firstPublishedYear: 1813,
    defaultEditionId: "ed-pp-2",
  }),

  work({
    id: "w-the-hobbit",
    slug: "hobbit",
    originalTitle: "The Hobbit",
    originalLanguage: "en",
    titles: [
      { lang: "en", value: "The Hobbit", isOriginal: true },
      { lang: "id", value: "Hobbit" },
    ],
    authorIds: ["au-tolkien"],
    description:
      "Bilbo Baggins dibawa ikut dalam perjalanan merebut kembali harta yang dijaga seekor naga, tanpa pernah benar-benar setuju. Cerita pendahulu yang ditulis lebih dulu dan dengan nada yang lebih ringan.",
    subjects: ["Fantasi", "Klasik", "Petualangan"],
    firstPublishedYear: 1937,
    defaultEditionId: "ed-hb-2",
  }),

  // ------------------------------------------------------------------ EC-3, EC-7
  work({
    id: "w-old-man-and-the-sea",
    slug: "lelaki-tua-dan-laut",
    originalTitle: "The Old Man and the Sea",
    originalLanguage: "en",
    titles: [
      { lang: "en", value: "The Old Man and the Sea", isOriginal: true },
      { lang: "id", value: "Lelaki Tua dan Laut" },
    ],
    authorIds: ["au-hemingway"],
    description:
      "Seorang nelayan tua yang lama tidak mendapat tangkapan berhadapan dengan seekor ikan besar jauh dari pantai. Novel pendek tentang ketekunan yang tidak dijamin berbuah apa pun.",
    subjects: ["Fiksi", "Klasik", "Laut"],
    firstPublishedYear: 1952,
    defaultEditionId: "ed-om-2",
  }),

  // ---------------------------------- EC-1: empat karya berikut tanpa edisi Indonesia
  work({
    id: "w-pachinko",
    slug: "pachinko",
    originalTitle: "Pachinko",
    originalLanguage: "en",
    titles: [{ lang: "en", value: "Pachinko", isOriginal: true }],
    authorIds: ["au-min-jin-lee"],
    description:
      "Empat generasi sebuah keluarga Korea di Jepang, dari masa pendudukan sampai akhir abad kedua puluh. Novel tentang menjadi warga yang selalu diperlakukan sebagai pendatang.",
    subjects: ["Fiksi sejarah", "Diaspora", "Keluarga"],
    firstPublishedYear: 2017,
    defaultEditionId: "ed-pa-1",
  }),

  work({
    id: "w-klara-and-the-sun",
    slug: "klara-and-the-sun",
    originalTitle: "Klara and the Sun",
    originalLanguage: "en",
    titles: [{ lang: "en", value: "Klara and the Sun", isOriginal: true }],
    authorIds: ["au-ishiguro"],
    description:
      "Klara adalah mesin pendamping yang menunggu dibeli, lalu mengamati keluarga yang membelinya dengan perhatian yang sangat cermat. Cerita tentang perhatian tanpa kuasa untuk bertindak.",
    subjects: ["Fiksi", "Fiksi ilmiah"],
    firstPublishedYear: 2021,
    defaultEditionId: "ed-kl-1",
  }),

  work({
    id: "w-kokoro",
    slug: "kokoro",
    originalTitle: "こころ",
    originalLanguage: "ja",
    titles: [
      { lang: "ja", value: "こころ", isOriginal: true },
      { lang: "en", value: "Kokoro" },
    ],
    authorIds: ["au-soseki"],
    description:
      "Seorang mahasiswa berkawan dengan lelaki yang ia sebut Sensei, yang menyimpan satu peristiwa dari masa lalunya. Novel tentang rasa bersalah yang tidak pernah dibicarakan sampai terlambat.",
    subjects: ["Fiksi", "Sastra Jepang", "Klasik"],
    firstPublishedYear: 1914,
    defaultEditionId: "ed-ko-1",
  }),

  work({
    id: "w-remains-of-the-day",
    slug: "the-remains-of-the-day",
    originalTitle: "The Remains of the Day",
    originalLanguage: "en",
    titles: [
      { lang: "en", value: "The Remains of the Day", isOriginal: true },
      { lang: "fr", value: "Les vestiges du jour" },
    ],
    authorIds: ["au-ishiguro"],
    description:
      "Seorang kepala pelayan melakukan perjalanan singkat dan sepanjang jalan menata ulang kenangan tentang pengabdiannya. Novel tentang kesetiaan yang dipakai untuk menghindari kesimpulan.",
    subjects: ["Fiksi", "Klasik"],
    firstPublishedYear: 1989,
    defaultEditionId: "ed-rd-1",
  }),
];
