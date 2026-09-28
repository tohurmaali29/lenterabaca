import type { Review, ShelfItem } from "@/lib/types";

/**
 * Tanpa ini, orang yang membuka demo melihat rak kosong dan tidak ada review
 * sama sekali, sehingga bagian paling penting dari produk justru tidak
 * terlihat. Jumlahnya sengaja kecil supaya user tetap punya ruang mencoba.
 */

const WHEN = "2026-09-01T09:00:00.000Z";

export const seedShelf = (): ShelfItem[] =>
  [
    {
      workId: "w-laskar-pelangi",
      editionId: "ed-lp-2",
      status: "read",
      addedAt: WHEN,
      updatedAt: WHEN,
      finishedAt: WHEN,
    },
    {
      workId: "w-1984",
      editionId: "ed-84-2",
      status: "currently-reading",
      addedAt: WHEN,
      updatedAt: WHEN,
      startedAt: WHEN,
    },
  ] as ShelfItem[];

export const seedReviews = (): Review[] =>
  [
    {
      id: "seed-review-1",
      workId: "w-laskar-pelangi",
      editionId: "ed-lp-2",
      rating: 5,
      text: "Saya baca yang cetakan cover baru. Terjemahannya tidak ada masalah karena ini memang aslinya Bahasa Indonesia, dan itu justru bikin saya sadar betapa seringnya saya salah ambil edisi untuk buku terjemahan.",
      containsSpoiler: false,
      readLanguage: "id",
      createdAt: WHEN,
      updatedAt: WHEN,
    },
  ] as Review[];
