import type { Metadata } from "next";

export const metadata: Metadata = { title: "Hasil pencarian" };

/**
 * Halaman hasil pencarian.
 *
 * RnD D-01: route terpisah dari discovery supaya query dan filter hidup di URL
 * dan bisa dibagikan. Filter, BookCard, dan match reason masuk di Phase 3.
 *
 * Catatan Next.js 16: searchParams sekarang asinkron dan wajib di-await.
 */
export default async function SearchPage(props: PageProps<"/search">) {
  const { q } = await props.searchParams;
  const query = typeof q === "string" ? q.trim() : "";

  // RnD 15, E-02: ambang panjang query minimum.
  if (query.length < 2) {
    return (
      <section>
        <h1 className="text-h1 text-ink-900">Ketik minimal 2 huruf</h1>
        <p className="mt-2 text-body text-ink-500">
          Gunakan kolom pencarian di atas untuk mencari judul, penulis, atau ISBN.
        </p>
      </section>
    );
  }

  return (
    <section>
      <h1 className="text-h1 text-ink-900">
        Hasil untuk <span className="font-title">{query}</span>
      </h1>
      <p className="mt-2 text-body text-ink-500">
        Pencarian, filter bahasa, dan kartu hasil dibangun di Phase 3, setelah fixtures katalog
        Phase 2 siap.
      </p>
    </section>
  );
}
