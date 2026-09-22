import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { WorkHero } from "@/components/book/WorkHero";
import { EditionAnnouncer } from "@/components/edition/EditionAnnouncer";
import { SelectedEditionPanel } from "@/components/edition/SelectedEditionPanel";
import { ReviewSection } from "@/components/review/ReviewSection";
import { ShelfButton } from "@/components/shelf/ShelfButton";
import { Disclosure } from "@/components/ui/Disclosure";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  authorsOf,
  editionsOf,
  getEdition,
  getPublisher,
  getWorkBySlug,
  initialEdition,
  works,
} from "@/data/catalog";
import { languageName } from "@/lib/format";
import type { EditionId } from "@/lib/types";

/**
 * Halaman detail buku. RnD R-05 sampai R-08, R-11, dan 17.2.
 *
 * Perubahan inti dibanding Goodreads:
 *  - blok Karya dan blok Edisi Terpilih terpisah dan keduanya terbuka (F3)
 *  - rating karya dan rating edisi ditampilkan terpisah dengan cakupannya (F7)
 *  - setiap disclosure punya pasangan tutup (F4)
 *  - edisi terpilih bisa di-deep-link lewat ?edition= (R-08)
 */

export function generateStaticParams() {
  return works.map((work) => ({ slug: work.slug }));
}

export async function generateMetadata(props: PageProps<"/book/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const work = getWorkBySlug(slug);
  if (!work) return { title: "Buku tidak ditemukan" };

  return {
    title: work.originalTitle,
    description: work.description.slice(0, 160),
  };
}

export default async function BookDetailPage(props: PageProps<"/book/[slug]">) {
  const { slug } = await props.params;
  const params = await props.searchParams;

  const work = getWorkBySlug(slug);
  if (!work) notFound();

  const editions = editionsOf(work.id);
  const requested = Array.isArray(params.edition) ? params.edition[0] : params.edition;

  // R-08: id edisi yang tidak valid jatuh ke edisi utama, disertai penjelasan.
  const requestedEdition = requested ? getEdition(requested as EditionId) : undefined;
  const isRequestValid = !requested || (requestedEdition && requestedEdition.workId === work.id);
  const edition =
    requestedEdition && requestedEdition.workId === work.id
      ? requestedEdition
      : initialEdition(work);

  const publisherOptions = [
    ...new Map(
      editions
        .map((item) => getPublisher(item.publisherId))
        .filter((item): item is NonNullable<typeof item> => !!item)
        .map((item) => [item.id as string, { id: item.id as string, name: item.name }]),
    ).values(),
  ];

  const authors = authorsOf(work);
  const publisher = getPublisher(edition.publisherId);

  return (
    <article className="flex flex-col gap-8">
      <p className="text-sm">
        <Link href="/" className="text-accent-600 hover:underline hover:underline-offset-2">
          &larr; Kembali ke pencarian
        </Link>
      </p>

      {!isRequestValid && (
        <p
          data-notice="X-06"
          role="status"
          className="rounded-md border border-line bg-surface-alt px-4 py-3 text-body text-warning-fg"
        >
          Edisi yang diminta tidak ditemukan. Yang ditampilkan adalah edisi utama karya ini.
        </p>
      )}

      <WorkHero work={work} edition={edition} />

      <div className="flex flex-wrap items-start gap-3">
        <ShelfButton
          workId={work.id}
          edition={edition}
          publisherName={publisher?.name ?? "penerbit tidak diketahui"}
        />
      </div>

      {!work.hasIndonesianEdition && (
        <EmptyState
          code="E-06"
          title="Karya ini belum punya edisi Bahasa Indonesia di katalog"
          body={`Yang tersedia baru edisi berbahasa ${work.availableLanguages
            .map(languageName)
            .join(" dan ")}.`}
          actions={[{ label: "Lihat semua edisi", href: `/book/${work.slug}/editions` }]}
        />
      )}

      <SelectedEditionPanel
        work={work}
        edition={edition}
        editions={editions}
        publishers={publisherOptions}
      />

      <EditionAnnouncer
        label={`${publisher?.name ?? ""} ${edition.publishedYear}, ${languageName(edition.language)}`}
      />

      <section aria-labelledby="judul-deskripsi">
        <h2 id="judul-deskripsi" className="text-h2 text-ink-900">
          Deskripsi
        </h2>
        <Disclosure className="mt-2">
          <p lang={work.descriptionLang}>{work.description}</p>
        </Disclosure>
      </section>

      <section aria-labelledby="judul-penulis">
        <h2 id="judul-penulis" className="text-h2 text-ink-900">
          Tentang penulis
        </h2>
        <Disclosure className="mt-2" collapsedLines={3}>
          <p>
            {authors.map((author) => author.name).join(", ")}
            {authors.some((author) => author.altNames.length > 0) && (
              <>
                {" "}
                &middot; dikenal juga sebagai{" "}
                {authors.flatMap((author) => author.altNames).join(", ")}
              </>
            )}
            . Profil penulis yang lengkap berada di luar cakupan prototype ini, sesuai batas scope
            di dokumen RnD bagian 9.
          </p>
        </Disclosure>
      </section>

      <section aria-labelledby="judul-review">
        <h2 id="judul-review" className="text-h2 text-ink-900">
          Review
        </h2>
        <div className="mt-3">
          <ReviewSection
            workId={work.id}
            edition={edition}
            publisherName={publisher?.name ?? "penerbit tidak diketahui"}
            editionLanguages={editions.map((item) => ({
              id: item.id as string,
              language: item.language,
              label: `${getPublisher(item.publisherId)?.name ?? ""} ${item.publishedYear}`,
            }))}
          />
        </div>
      </section>
    </article>
  );
}
