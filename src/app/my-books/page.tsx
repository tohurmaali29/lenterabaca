import type { Metadata } from "next";

import { ShelfView } from "@/components/shelf/ShelfView";
import { editions, getPublisher, works } from "@/data/catalog";

export const metadata: Metadata = { title: "Rak Saya" };

/**
 * Halaman rak. RnD R-15.
 *
 * Data rak ada di localStorage, jadi isinya dirender di client. Katalog
 * tetap dikirim dari server supaya komponen client tidak perlu memuat
 * ulang seluruh fixtures.
 */
export default function MyBooksPage() {
  const lookup = Object.fromEntries(
    editions.map((edition) => {
      const work = works.find((item) => item.id === edition.workId);
      return [
        edition.id as string,
        {
          workSlug: work?.slug ?? "",
          workTitle: work?.originalTitle ?? "",
          editionTitle: edition.title,
          language: edition.language,
          publisherName: getPublisher(edition.publisherId)?.name ?? "",
          publishedYear: edition.publishedYear,
          coverUrl: edition.cover.url,
          coverAlt: edition.cover.alt,
        },
      ];
    }),
  );

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-h1 text-ink-900">Rak Saya</h1>
        <p className="mt-1 text-body text-ink-500">
          Setiap buku disimpan bersama edisi yang kamu pilih, bukan hanya judulnya.
        </p>
      </header>

      <ShelfView lookup={lookup} />
    </div>
  );
}
