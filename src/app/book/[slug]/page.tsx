import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AuthorAvatar } from "@/components/book/AuthorAvatar";
import { WorkHero } from "@/components/book/WorkHero";
import { EditionAnnouncer } from "@/components/edition/EditionAnnouncer";
import { EditionMemory } from "@/components/edition/EditionMemory";
import { SelectedEditionPanel } from "@/components/edition/SelectedEditionPanel";
import { ReviewSection } from "@/components/review/ReviewSection";
import { ShelfButton } from "@/components/shelf/ShelfButton";
import { Disclosure } from "@/components/ui/Disclosure";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
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

/** Edisi terpilih bisa di-deep-link lewat ?edition= (R-08). */

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

      <WorkHero
        work={work}
        edition={edition}
        actions={
          <ShelfButton
            workId={work.id}
            edition={edition}
            publisherName={publisher?.name ?? "penerbit tidak diketahui"}
          />
        }
      />

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

      <EditionMemory
        workId={work.id}
        currentEditionId={edition.id}
        validEditionIds={editions.map((item) => item.id as string)}
      />

      <EditionAnnouncer
        label={`${publisher?.name ?? ""} ${edition.publishedYear}, ${languageName(edition.language)}`}
      />

      <section aria-labelledby="judul-deskripsi">
        <SectionHeading id="judul-deskripsi">Deskripsi</SectionHeading>
        <Disclosure className="mt-3">
          <p lang={work.descriptionLang}>{work.description}</p>
        </Disclosure>
      </section>

      <section aria-labelledby="judul-penulis">
        <SectionHeading id="judul-penulis">Tentang penulis</SectionHeading>
        <ul className="mt-4 flex flex-col gap-4">
          {authors.map((author) => (
            <li key={author.id} className="flex items-center gap-4">
              <AuthorAvatar author={author} />
              <div className="min-w-0">
                <p className="text-body-lg font-semibold text-ink-900">{author.name}</p>
                {author.altNames.length > 0 && (
                  <p className="text-sm text-ink-500">
                    Dikenal juga sebagai {author.altNames.join(", ")}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="judul-review">
        <SectionHeading id="judul-review">Review</SectionHeading>
        <div className="mt-4">
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
