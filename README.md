# LenteraBaca

Prototype redesign untuk satu pekerjaan spesifik: **menemukan, memilih, dan menyimpan edisi terjemahan Indonesia yang benar.** Studi kasusnya adalah Goodreads.

Di Goodreads hari ini, daftar edisi Bahasa Indonesia butuh **8 langkah** dari landing page sebagai guest (7 langkah setelah login), dan tidak ada satu pun sinyal bahasa di halaman hasil pencarian. Target LenteraBaca: **maksimal 3 langkah**, dengan informasi bahasa terlihat di hasil pencarian tanpa klik tambahan.

Angka 8 langkah itu berasal dari observasi terdokumentasi, bukan perkiraan. Detail buktinya ada di dokumen RnD.

## Dokumen acuan

Spesifikasi lengkap ada di `../RnD_Goodreads_Redesign_v2.pdf` (versi 2.1). Semua keputusan di repo ini merujuk ke nomor bagian dokumen tersebut, misalnya `RnD 27.2` atau `D-08`. Kalau ada pertanyaan "kenapa dibuat begini", jawabannya ada di sana.

Bagian yang paling sering dirujuk saat coding:

| Bagian | Isi                                                           |
| ------ | ------------------------------------------------------------- |
| 10     | Decision log (D-01 sampai D-11)                               |
| 14     | Feature requirement dengan acceptance criteria (R-01 dan dst) |
| 15     | Inventaris state empty, loading, error (E-, L-, X-)           |
| 18     | Design token                                                  |
| 21     | Accessibility spec                                            |
| 24     | Data model                                                    |
| 26     | Search dan ranking spec                                       |
| 27     | Persistence layer                                             |
| 31     | Phase dan pembagian jam                                       |

## Menjalankan

```bash
npm install
npm run dev          # http://localhost:3000
```

Prasyarat: Node.js 20.9 atau lebih baru (Next.js 16 tidak lagi mendukung Node 18). Dikembangkan di Node 24.

## Perintah

| Perintah            | Fungsi                                           |
| ------------------- | ------------------------------------------------ |
| `npm run dev`       | Server pengembangan                              |
| `npm run build`     | Build produksi, sekaligus menjalankan TypeScript |
| `npm run typecheck` | `tsc --noEmit`                                   |
| `npm run lint`      | ESLint                                           |
| `npm run format`    | Prettier, termasuk pengurutan class Tailwind     |
| `npm test`          | Unit test (Vitest)                               |
| `npm run test:e2e`  | E2E dan accessibility test (Playwright dan axe)  |
| `npm run verify`    | Semua pemeriksaan di atas, berurutan             |

E2E test butuh browser Playwright sekali unduh:

```bash
npx playwright install chromium
```

## Stack

Next.js 16 (App Router) - React 19 - TypeScript strict - Tailwind CSS v4 - Radix UI primitives - Vitest - Playwright - axe-core.

Pilihan dan alasannya ada di RnD bagian 23. Dua yang paling menentukan:

- **Radix UI** untuk Dialog dan RadioGroup (D-08). Drawer pemilih edisi adalah komponen paling berisiko secara aksesibilitas, jadi focus trap, Escape, dan aria wiring tidak dibuat sendiri.
- **Curated local fixtures**, bukan API publik (D-09). Data dikurasi supaya selalu punya edisi Indonesia dan metadata lengkap, dan supaya demo tidak rusak saat dipresentasikan. Ini bukan paket `dummyjson`.

## Aturan yang ditegakkan otomatis

Beberapa keputusan dokumen dipasang sebagai guard supaya tidak bisa bocor diam-diam:

- **Token adalah satu sumber kebenaran warna.** Semua nilai ada di `src/app/globals.css`, dipetakan ke utility Tailwind lewat `@theme inline`. Tidak ada warna literal di komponen.
- **Setiap token bertema wajib punya nilai gelap.** Dijaga `tests/unit/tokens.test.ts`, yang membaca `globals.css` dan membandingkan blok terang dengan kedua blok gelap. Menambah token warna tanpa pasangan gelapnya akan membuat test gagal.
- **Web Storage hanya lewat satu pintu.** ESLint menolak `localStorage` dan `sessionStorage` di mana pun kecuali `src/lib/storage.ts` (RnD 27.2). Ini mencegah hydration mismatch dan melewatkan validasi skema.
- **Satu navbar dan satu search bar per dokumen.** Dijaga `tests/e2e/shell.spec.ts` di semua route. Ini regression guard langsung untuk temuan F2, di mana Goodreads menampilkan navbar dan search bar ganda setelah pencarian dijalankan.
- **Nol pelanggaran axe serius dan kritis.** Dijaga `tests/a11y/smoke.spec.ts`. Cakupannya bertambah tiap fase.

## Struktur

```
src/
  app/          route: / /search /book/[slug] /my-books /about
  components/   shell, search, book, edition, shelf, review, ui
  data/         fixtures katalog kurasi (Phase 2)
  hooks/        hook storage, shelf, review, selected edition (Phase 5)
  lib/          types, format, ratings, storage, search/
tests/
  unit/         normalisasi, skoring, rating, migrasi, token
  e2e/          alur pencarian sampai review, deep link edisi, persistensi
  a11y/         axe per halaman dan pada drawer terbuka
```

Rinciannya di RnD bagian 28.

## Status

| Fase                               | Status                                        |
| ---------------------------------- | --------------------------------------------- |
| Phase 1 - Setup                    | Selesai                                       |
| Phase 2 - Fixtures katalog         | Berikutnya                                    |
| Phase 3 - Pencarian dan hasil      | Belum                                         |
| Phase 4 - Detail dan pemilih edisi | Belum                                         |
| Phase 5 - Persistensi              | Belum                                         |
| Phase 6 - Polish, a11y, dark mode  | Belum                                         |
| Phase 7 - Rilis                    | Belum                                         |
| Phase 8 - Usability test           | Setelah demo live, template di RnD Lampiran A |

Halaman `/search`, `/my-books`, dan `/about` saat ini sengaja masih kosong. Ketiganya ada supaya shell dan navigasi bisa diuji utuh sejak Phase 1, bukan supaya terlihat jadi.

Mode gelap sudah punya nilai token lengkap dan mengikuti preferensi sistem. Tombol peralihan tema baru dipasang di Phase 6.

## Keterbatasan yang perlu diketahui

- Katalog adalah fixtures kurasi, bukan katalog nyata.
- Cover buku adalah placeholder yang digenerate, bukan cover asli, untuk menghindari masalah hak cipta (D-06). Keputusan ini sementara.
- Pencocokan judul terjemahan bersandar pada tabel alias kurasi manual, jadi hanya bekerja untuk karya yang sudah didaftarkan (RnD 26.2).
- Data tersimpan di localStorage browser, bukan di server. Membuka demo dari in-app browser aplikasi chat bisa membuat penyimpanan tidak berfungsi. Buka di browser biasa.
