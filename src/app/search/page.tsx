import type { Metadata } from "next";

import { BookCard } from "@/components/book/BookCard";
import { FilterBar } from "@/components/search/FilterBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { editionsOf, getPublisher, works } from "@/data/catalog";
import { formatCount } from "@/lib/format";
import {
  MIN_QUERY_LENGTH,
  search,
  suggestions,
  type SearchFilters,
  type SortKey,
} from "@/lib/search/query";
import type { Format, LangCode, PublisherId } from "@/lib/types";

export const metadata: Metadata = { title: "Hasil pencarian" };

/**
 * Halaman hasil pencarian. RnD R-01 sampai R-04, D-01.
 *
 * Server Component: query dan filter dibaca dari URL, pencarian dijalankan
 * di server, dan hanya FilterBar yang menjadi client island. Hasilnya tombol
 * back bekerja, tautan bisa dibagikan, dan halaman tetap terbaca tanpa
 * JavaScript.
 *
 * Catatan Next.js 16: searchParams asinkron dan wajib di-await.
 */

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SearchPage(props: PageProps<"/search">) {
  const params = await props.searchParams;

  const query = (one(params.q) ?? "").trim();
  const filters: SearchFilters = {
    language: (one(params.lang) as LangCode | "all") ?? "all",
    format: (one(params.format) as Format | "all") ?? "all",
    publisher: (one(params.publisher) as PublisherId | "all") ?? "all",
    sort: (one(params.sort) as SortKey) ?? "relevance",
  };

  // E-02: ambang panjang query.
  if (query.length < MIN_QUERY_LENGTH) {
    return (
      <EmptyState
        code="E-02"
        title="Ketik minimal 2 huruf"
        body="Cari lewat judul asli, judul terjemahan Indonesia, nama penulis, atau ISBN."
        actions={[{ label: "Kembali ke beranda", href: "/" }]}
      />
    );
  }

  const response = search(query, filters);

  // Pilihan filter dihitung dari seluruh katalog supaya daftarnya stabil
  // dan user tidak kehilangan jalan keluar saat hasilnya kosong.
  const languageOptions = collectLanguages();
  const formatOptions = collectFormats();
  const publisherOptions = collectPublishers();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-h1 text-ink-900">
          Hasil untuk <span className="font-title">{query}</span>
        </h1>
        <p className="mt-1 text-body text-ink-500">
          {response.results.length > 0
            ? `${formatCount(response.results.length)} karya ditemukan`
            : "Tidak ada karya yang cocok dengan filter saat ini"}
        </p>
      </header>

      <FilterBar
        languages={languageOptions}
        formats={formatOptions}
        publishers={publisherOptions}
        resultCount={response.results.length}
        query={query}
      />

      {response.results.length > 0 ? (
        <>
          {response.isLowConfidence && (
            <p className="rounded-md border border-line bg-surface-alt px-4 py-3 text-sm text-ink-500">
              Kecocokannya tidak terlalu kuat. Kalau bukan ini yang kamu cari, coba judul aslinya
              atau nama penulisnya.
            </p>
          )}

          <ol className="flex flex-col gap-4">
            {response.results.map((result, index) => (
              <li key={result.work.id}>
                <BookCard result={result} priority={index < 4} headingLevel={2} />
              </li>
            ))}
          </ol>
        </>
      ) : (
        <NoResults query={query} response={response} filters={filters} />
      )}
    </div>
  );
}

function NoResults({
  query,
  response,
  filters,
}: {
  query: string;
  response: ReturnType<typeof search>;
  filters: SearchFilters;
}) {
  const resetHref = `/search?q=${encodeURIComponent(query)}`;

  // E-05: kosong karena filter bahasa, bukan karena querynya.
  if (response.emptyBecauseOfFilters && filters.language && filters.language !== "all") {
    return (
      <EmptyState
        code="E-05"
        title="Belum ada edisi Bahasa Indonesia untuk pencarian ini"
        body={`Ada ${formatCount(response.totalBeforeFilters)} karya yang cocok, tetapi tidak satu pun punya edisi dengan filter yang sedang aktif.`}
        actions={[
          { label: "Lihat semua bahasa", href: resetHref },
          { label: "Cari lagi", href: "/" },
        ]}
      />
    );
  }

  // E-04 varian filter: cocok tetapi tersaring habis oleh format atau penerbit.
  if (response.emptyBecauseOfFilters) {
    return (
      <EmptyState
        code="E-04"
        title="Filter menyaring semua hasil"
        body={`Ada ${formatCount(response.totalBeforeFilters)} karya yang cocok dengan "${query}", tetapi tidak ada yang lolos filter saat ini.`}
        actions={[{ label: "Hapus semua filter", href: resetHref }]}
      />
    );
  }

  // E-03: tidak ada hasil, tetapi ada kandidat yang mendekati.
  const nearby = suggestions(query);
  if (nearby.length > 0) {
    return (
      <div className="flex flex-col gap-4">
        <EmptyState
          code="E-03"
          title="Mungkin yang kamu cari"
          body={`Tidak ada yang persis cocok dengan "${query}". Beberapa karya berikut mendekati.`}
        />
        <ol className="flex flex-col gap-4">
          {nearby.map((result) => (
            <li key={result.work.id}>
              <BookCard result={result} headingLevel={2} />
            </li>
          ))}
        </ol>
      </div>
    );
  }

  // E-04: benar-benar tidak ada apa pun.
  return (
    <EmptyState
      code="E-04"
      title="Belum ada yang cocok"
      body="Coba judul aslinya, judul terjemahannya, nama penulis, atau ISBN."
      actions={[{ label: "Lihat karya populer", href: "/" }]}
    />
  );
}

function collectLanguages() {
  const counts = new Map<LangCode, number>();
  for (const work of works) {
    for (const lang of work.availableLanguages) {
      counts.set(lang, (counts.get(lang) ?? 0) + 1);
    }
  }
  return [...counts]
    .sort((a, b) => (a[0] === "id" ? -1 : b[0] === "id" ? 1 : b[1] - a[1]))
    .map(([value, count]) => ({ value, count }));
}

function collectFormats() {
  const found = new Set<Format>();
  for (const work of works) {
    for (const item of editionsOf(work.id)) found.add(item.format);
  }
  return [...found].sort().map((value) => ({ value, label: value }));
}

function collectPublishers() {
  const found = new Map<string, string>();
  for (const work of works) {
    for (const item of editionsOf(work.id)) {
      const publisher = getPublisher(item.publisherId);
      if (publisher) found.set(publisher.id as string, publisher.name);
    }
  }
  return [...found]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, "id"));
}
