# LenteraBaca

Prototype redesign untuk satu pekerjaan: **menemukan, memilih, dan menyimpan edisi terjemahan Indonesia yang benar.** Studi kasusnya Goodreads.

Di Goodreads hari ini, daftar edisi Bahasa Indonesia berada **8 langkah** dari landing page bagi pengunjung yang belum login (7 langkah setelah login), dan tidak ada satu pun sinyal bahasa di halaman hasil pencarian. LenteraBaca memotongnya menjadi **3 langkah**, dengan informasi bahasa terlihat di hasil pencarian tanpa klik tambahan.

Angka 8 langkah itu berasal dari penelusuran yang didokumentasikan dengan 13 tangkapan layar berurutan, bukan dari perkiraan. Tangkapan layarnya ada di [`public/audit/`](public/audit) dan ditampilkan di halaman `/about`.

## Menjalankan

```bash
npm install
npx playwright install chromium   # sekali saja, untuk test e2e
npm run dev                       # http://localhost:3000
```

Prasyarat: Node.js 20.9 atau lebih baru. Dikembangkan di Node 24.

## Perintah

| Perintah              | Fungsi                                                                   |
| --------------------- | ------------------------------------------------------------------------ |
| `npm run dev`         | Server pengembangan                                                      |
| `npm run build`       | Build produksi, sekaligus menjalankan TypeScript                         |
| `npm run typecheck`   | `tsc --noEmit`                                                           |
| `npm run lint`        | ESLint                                                                   |
| `npm run format`      | Prettier, termasuk pengurutan class Tailwind                             |
| `npm test`            | 128 unit test (Vitest)                                                   |
| `npm run test:e2e`    | 71 test end-to-end dan aksesibilitas (Playwright dan axe)                |
| `npm run verify`      | Semua pemeriksaan di atas, berurutan. Ini yang dijalankan sebelum commit |
| `npm run walkthrough` | Merekam ulang video walkthrough task T1                                  |

## Apa yang berbeda dari Goodreads

Tujuh temuan audit, masing-masing dengan jawabannya. Rinciannya beserta tangkapan layar ada di halaman `/about`.

| #   | Temuan di Goodreads                                   | Di LenteraBaca                                                              |
| --- | ----------------------------------------------------- | --------------------------------------------------------------------------- |
| F1  | Kolom pencarian tidak ada di viewport pertama (guest) | Kolom pencarian jadi elemen terbesar di halaman discovery                   |
| F2  | Dua navbar dan dua kolom pencarian setelah mencari    | Satu shell tunggal, jumlahnya dikunci test di setiap halaman                |
| F3  | Metadata buku disembunyikan di balik dropdown         | Blok Karya dan blok Edisi Terpilih terpisah, keduanya terbuka               |
| F4  | Show more tanpa show less                             | Setiap disclosure punya pasangan tutup                                      |
| F5  | Daftar edisi per bahasa 4 klik di dalam               | Filter bahasa di halaman hasil, pemilih edisi berupa drawer                 |
| F6  | Tidak ada sinyal bahasa di hasil pencarian            | Badge bahasa, edisi terpilih, dan alasan kecocokan di setiap kartu          |
| F7  | Rating work-level, tetapi user memilih edisi          | Rating karya dan edisi terpisah, konfirmasi edisi sebelum simpan dan review |

### Alasan kecocokan

Fitur yang paling menjawab problem statement bukan algoritma pencariannya, melainkan **penjelasannya**. Setiap hasil menyebut kenapa ia muncul:

> Cocok dengan judul Indonesia: **Laskar Pelangi**
>
> Dikenal juga sebagai: **binatangisme**
>
> Mirip dengan: **Laskar Pelangi** (untuk query yang salah ketik)

Dengan begitu user tahu apakah yang ditemukan benar-benar buku yang ia maksud, tanpa perlu membuka detail.

## Dokumen acuan

Spesifikasi lengkap ada di `../RnD_Goodreads_Redesign_v2.pdf` (versi 2.1). Semua keputusan di repo ini merujuk ke nomor bagiannya, misalnya `RnD 27.2` atau `D-08`.

| Bagian | Isi                                                           |
| ------ | ------------------------------------------------------------- |
| 3      | Tujuh temuan audit                                            |
| 10     | Decision log (D-01 sampai D-11)                               |
| 14     | Feature requirement dengan acceptance criteria (R-01 dan dst) |
| 15     | Inventaris state empty, loading, error (E-, L-, X-)           |
| 18     | Design token                                                  |
| 21     | Accessibility spec                                            |
| 24     | Data model                                                    |
| 26     | Search dan ranking spec                                       |
| 27     | Persistence layer                                             |
| 31     | Phase dan pembagian jam                                       |

## Katalog

Fixtures kurasi, dirakit dan diverifikasi saat modul dimuat:

| Angka                                   | Nilai            |
| --------------------------------------- | ---------------- |
| Karya                                   | 18               |
| Edisi                                   | 59               |
| Edisi Bahasa Indonesia                  | 30               |
| Karya yang punya edisi Bahasa Indonesia | 14 dari 18       |
| Karya berbahasa asal Indonesia          | 4                |
| Bahasa edisi                            | id, en, ja, fr   |
| Penerbit                                | 18 (8 Indonesia) |
| Penulis                                 | 16               |

Empat karya **sengaja** tidak punya edisi Bahasa Indonesia, supaya empty state "belum ada edisi Bahasa Indonesia" bisa diuji dengan data nyata. Dua belas edge case dari RnD bagian 25.1 hadir di data dan diverifikasi satu per satu oleh `tests/unit/fixtures.test.ts`.

### Rating tidak bisa saling bertentangan

Histogram bintang adalah satu-satunya angka yang ditulis tangan. `average` dan `count` edisi dihitung dari histogram, dan rating karya dihitung sebagai penjumlahan histogram seluruh edisinya. Jadi tidak mungkin ada edisi dengan rata-rata 4,2 dari 3 rating.

## Aturan yang ditegakkan otomatis

Keputusan dokumen dipasang sebagai guard supaya tidak bisa bocor diam-diam:

- **Token adalah satu sumber kebenaran warna.** Semua nilai di `src/app/globals.css`, dipetakan ke utility Tailwind lewat `@theme inline`. Tidak ada warna literal di komponen.
- **Setiap token bertema wajib punya nilai gelap.** Dijaga `tests/unit/tokens.test.ts`.
- **Kontras dihitung, bukan diklaim.** `tests/unit/contrast.test.ts` memeriksa setiap token teks terhadap empat permukaan. Tiga token sempat gagal memenuhi standar yang ditetapkan dokumennya sendiri, dan ketahuan di sini.
- **Web Storage hanya lewat satu pintu.** ESLint menolak `localStorage` di mana pun kecuali `src/lib/storage.ts` dan berkas test.
- **Satu navbar dan satu kolom pencarian per dokumen.** Dijaga `tests/e2e/shell.spec.ts` di semua route, termasuk halaman 404. Regression guard langsung untuk temuan F2.
- **Integritas katalog gagal saat build.** `src/data/catalog.ts` melempar error saat modul dimuat kalau ada referensi menggantung.
- **Nol pelanggaran axe serius dan kritis**, plus pemeriksaan `heading-order` terpisah karena dampaknya hanya moderate sehingga lolos dari filter.

## Hasil pemeriksaan

| Pemeriksaan                  | Hasil                                         |
| ---------------------------- | --------------------------------------------- |
| Unit test                    | 128 lolos                                     |
| End-to-end dan aksesibilitas | 77 lolos                                      |
| Lighthouse Accessibility     | 100 di kelima halaman                         |
| Lighthouse Performance       | 95 sampai 100                                 |
| Lighthouse Best Practices    | 100                                           |
| Scroll horizontal            | Tidak ada di 320, 375, 768, 1024, dan 1440 px |

## Struktur

```
src/
  app/          route: / /search /book/[slug] /my-books /about /covers/[editionId]
  components/   shell, search, book, edition, shelf, review, about, ui
  data/         fixtures katalog, alias judul, seed, temuan audit
  hooks/        useStore, useHydrated
  lib/          types, format, rating, cover, storage, stores, search/
tests/
  unit/         normalisasi, skoring, rating, fixtures, token, kontras, storage
  e2e/          shell, pencarian, detail, persistensi, polish, cover
  a11y/         axe per halaman dan pada drawer terbuka
  walkthrough/  rekaman video task T1, di luar suite verifikasi
docs/
  walkthrough-t1.webm   rekaman 21 detik: dari judul Inggris sampai tersimpan
```

## Status

| Fase                               | Status                                        |
| ---------------------------------- | --------------------------------------------- |
| Phase 1 - Setup                    | Selesai                                       |
| Phase 2 - Fixtures katalog         | Selesai                                       |
| Phase 3 - Pencarian dan hasil      | Selesai                                       |
| Phase 4 - Detail dan pemilih edisi | Selesai                                       |
| Phase 5 - Persistensi              | Selesai                                       |
| Phase 6 - Polish, a11y, dark mode  | Selesai                                       |
| Phase 7 - Rilis                    | Siap deploy, menunggu akun Vercel             |
| Phase 8 - Usability test           | Setelah demo live, template di RnD Lampiran A |

## Deploy

Aplikasi ini tidak butuh variabel lingkungan maupun layanan eksternal, jadi deploy-nya standar:

```bash
npx vercel            # preview
npx vercel --prod     # produksi
```

Login Vercel dilakukan sekali lewat browser. Platform lain yang mendukung Next.js 16 juga berjalan.

## Keterbatasan yang perlu diketahui

- Katalog adalah fixtures kurasi, bukan katalog bibliografi. Nama penulis dan penerbit nyata, tetapi kombinasi edisi, tahun, ISBN, dan rating **dibuat** untuk pengujian. Nama penerjemah fiktif.
- Sampul buku adalah SVG yang digenerate dari judul, penerbit, dan tahun, bukan sampul asli, untuk menghindari masalah hak cipta (D-06). Keputusan ini sementara.
- Pencocokan judul terjemahan bersandar pada tabel alias kurasi manual, jadi hanya bekerja untuk karya yang sudah didaftarkan (RnD 26.2).
- Tangkapan layar di `public/audit/` adalah antarmuka Goodreads, dipakai sebagai bahan analisis dan kritik dalam case study.
- Data tersimpan di localStorage browser. Membuka demo dari in-app browser aplikasi chat bisa membuat penyimpanan diblokir; aplikasi menampilkan peringatan dan tetap berjalan, tetapi data hilang saat tab ditutup.
- Klaim "lebih cepat dan lebih yakin" **belum diuji**. Yang terukur baru jumlah langkah, jumlah klik, dan kedalaman informasi bahasa.
