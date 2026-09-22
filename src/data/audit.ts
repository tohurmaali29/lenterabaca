/**
 * Temuan audit Goodreads. Sumber: RnD v2.1 bagian 3, dan dokumen
 * "Studi Kasus Mencari Edisi Indonesia" beserta 13 tangkapan layarnya.
 *
 * Setiap temuan dipasangkan dengan apa yang dilakukan LenteraBaca, dan
 * dengan requirement yang menguncinya. Tanpa pasangan itu, redesign hanya
 * berupa klaim.
 */

export interface AuditFinding {
  id: string;
  title: string;
  observed: string;
  heuristic: string;
  response: string;
  requirement: string;
  /** Berkas tangkapan layar di public/audit, bila ada. */
  screenshot?: string;
}

export const auditFindings: AuditFinding[] = [
  {
    id: "F1",
    title: "Search bar tidak ada di viewport pertama",
    observed:
      "Sebagai guest, landing page tidak menampilkan navbar maupun kolom pencarian di area atas. User harus scroll ke bawah, dan kolom yang ditemukan berukuran kecil serta bercampur dengan daftar kategori.",
    heuristic: "Visibility, affordance aksi utama",
    response:
      "Kolom pencarian menjadi elemen terbesar di viewport pertama halaman discovery, dan selalu tersedia di header pada halaman lain.",
    requirement: "R-12",
    screenshot: "goodreads-01.webp",
  },
  {
    id: "F2",
    title: "Dua navbar dan dua kolom pencarian setelah mencari",
    observed:
      "Setelah pencarian dijalankan, navbar baru muncul di atas, sehingga halaman memiliki dua kolom pencarian sekaligus. Pada versi login, yang berganda adalah navbarnya.",
    heuristic: "Consistency and standards",
    response:
      "Satu shell tunggal untuk seluruh route. Struktur header tidak pernah berubah, hanya posisi kolom pencarian yang bergeser, dan jumlahnya dikunci oleh test di setiap halaman.",
    requirement: "R-12",
    screenshot: "goodreads-03.webp",
  },
  {
    id: "F3",
    title: "Metadata buku disembunyikan di balik dropdown",
    observed:
      "Informasi buku tidak terlihat saat halaman detail dibuka. User harus membuka dropdown Book details and editions untuk melihat penerbit, tahun, format, dan ISBN.",
    heuristic: "Recognition over recall",
    response:
      "Halaman detail memisahkan blok Karya dan blok Edisi Terpilih, dan keduanya terbuka tanpa perlu diklik.",
    requirement: "R-05",
    screenshot: "goodreads-07.webp",
  },
  {
    id: "F4",
    title: "Show more tanpa show less",
    observed:
      "Deskripsi dan profil penulis bisa dibuka, tetapi tidak bisa ditutup lagi. Halaman memanjang dan user tidak punya jalan kembali ke tampilan awal.",
    heuristic: "User control and freedom",
    response:
      "Setiap bagian yang bisa dibuka selalu punya tombol tutup, dan status terbuka atau tertutup ikut dinyatakan lewat aria-expanded.",
    requirement: "R-11",
    screenshot: "goodreads-09.webp",
  },
  {
    id: "F5",
    title: "Daftar edisi per bahasa berada empat klik di dalam",
    observed:
      "Untuk melihat edisi Bahasa Indonesia, user harus membuka Book details and editions, lalu Show all editions, lalu dropdown Language, lalu mencari Indonesian.",
    heuristic: "Efficiency of use",
    response:
      "Filter bahasa naik ke halaman hasil pencarian, dan pemilih edisi berupa drawer yang bisa dibuka tanpa berpindah halaman.",
    requirement: "R-04, R-07",
    screenshot: "goodreads-11.webp",
  },
  {
    id: "F6",
    title: "Tidak ada sinyal bahasa di hasil pencarian",
    observed:
      "Halaman hasil pencarian tidak menyatakan bahasa apa pun. User baru tahu sebuah buku punya edisi Indonesia setelah empat klik.",
    heuristic: "Visibility of system status",
    response:
      "Setiap kartu hasil menampilkan badge bahasa dan edisi yang sedang dirujuk, ditambah satu baris yang menyebut alasan kecocokan pencarian.",
    requirement: "R-02, R-03",
    screenshot: "goodreads-05.webp",
  },
  {
    id: "F7",
    title: "Rating bersifat work-level, tetapi user memilih edisi",
    observed:
      "Rating dan review ditampilkan untuk karya secara keseluruhan, sementara yang disimpan user adalah edisi tertentu. Tidak ada konfirmasi edisi sebelum menyimpan atau mereview.",
    heuristic: "Error prevention",
    response:
      "Rating karya dan rating edisi ditampilkan terpisah dengan cakupannya masing-masing. Dropdown rak dan form review menyebut edisi yang akan dilekati sebelum aksi dijalankan.",
    requirement: "R-05, R-09, R-13",
    screenshot: "goodreads-08.webp",
  },
];

/** Flow Goodreads yang terdokumentasi, dipakai sebagai baseline. */
export const baselineFlow = {
  guest: [
    "Landing page",
    "Scroll ke bawah mencari kolom pencarian",
    "Ketik nama buku, submit",
    "Klik buku yang dituju",
    "Klik dropdown Book details and editions",
    "Klik Show all editions",
    "Klik dropdown Language",
    "Scroll atau ketik Indonesian",
  ],
  lentera: [
    "Ketik nama buku di kolom pencarian yang sudah terlihat",
    "Lihat badge Bahasa Indonesia langsung di hasil",
    "Buka buku, edisi Indonesia sudah terpilih, atau klik Ganti edisi",
  ],
} as const;
