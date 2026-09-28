import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ReviewForm } from "@/components/review/ReviewForm";
import { getEdition, getPublisher, getWorkBySlug, initialEdition, works } from "@/data/catalog";
import type { EditionId } from "@/lib/types";

/**
 * Jalur utamanya adalah form di dalam halaman detail. Halaman ini ada karena
 * dua alasan: bisa di-deep-link, dan di layar kecil form penuh halaman lebih
 * baik daripada modal, yang hampir selalu tertutup keyboard virtual.
 */

export function generateStaticParams() {
  return works.map((work) => ({ slug: work.slug }));
}

export async function generateMetadata(props: PageProps<"/book/[slug]/review">): Promise<Metadata> {
  const { slug } = await props.params;
  const work = getWorkBySlug(slug);
  return { title: work ? `Review ${work.originalTitle}` : "Buku tidak ditemukan" };
}

export default async function ReviewPage(props: PageProps<"/book/[slug]/review">) {
  const { slug } = await props.params;
  const params = await props.searchParams;

  const work = getWorkBySlug(slug);
  if (!work) notFound();

  const requested = Array.isArray(params.edition) ? params.edition[0] : params.edition;
  const candidate = requested ? getEdition(requested as EditionId) : undefined;
  const edition = candidate && candidate.workId === work.id ? candidate : initialEdition(work);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <p className="text-sm">
        <Link
          href={`/book/${work.slug}?edition=${edition.id}`}
          className="text-accent-600 hover:underline hover:underline-offset-2"
        >
          &larr; Kembali ke {work.originalTitle}
        </Link>
      </p>

      <h1 className="text-h1 text-ink-900">Tulis review</h1>

      <ReviewForm
        workId={work.id}
        edition={edition}
        publisherName={getPublisher(edition.publisherId)?.name ?? "penerbit tidak diketahui"}
      />
    </div>
  );
}
