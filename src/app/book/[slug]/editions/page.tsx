import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EditionRowContent } from "@/components/edition/EditionRow";
import { editionsOf, getWorkBySlug, works } from "@/data/catalog";
import { languageName } from "@/lib/format";
import type { LangCode } from "@/lib/types";

/**
 * Daftar edisi lengkap. RnD D-02 dan 13.
 *
 * Drawer adalah jalur utama, halaman ini adalah fallback-nya: bisa dibagikan
 * sebagai tautan, bisa dibuka tanpa JavaScript, dan bisa diindeks. Memilih
 * edisi di sini berarti kembali ke halaman detail dengan parameter edition,
 * jadi hasil akhirnya sama dengan memakai drawer.
 */

export function generateStaticParams() {
  return works.map((work) => ({ slug: work.slug }));
}

export async function generateMetadata(
  props: PageProps<"/book/[slug]/editions">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const work = getWorkBySlug(slug);
  return { title: work ? `Edisi ${work.originalTitle}` : "Edisi tidak ditemukan" };
}

export default async function EditionsPage(props: PageProps<"/book/[slug]/editions">) {
  const { slug } = await props.params;
  const params = await props.searchParams;

  const work = getWorkBySlug(slug);
  if (!work) notFound();

  const requestedLanguage = Array.isArray(params.lang) ? params.lang[0] : params.lang;
  const all = editionsOf(work.id);
  const visible = requestedLanguage
    ? all.filter((item) => item.language === requestedLanguage)
    : all;

  const languages = [...new Set(all.map((item) => item.language))] as LangCode[];

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm">
        <Link
          href={`/book/${work.slug}`}
          className="text-accent-600 hover:underline hover:underline-offset-2"
        >
          &larr; Kembali ke {work.originalTitle}
        </Link>
      </p>

      <header>
        <h1 className="text-h1 text-ink-900">Semua edisi</h1>
        <p className="mt-1 text-body text-ink-500">
          <span lang={work.originalLanguage}>{work.originalTitle}</span> &middot; {all.length} edisi
          dalam {languages.length} bahasa
        </p>
      </header>

      <nav aria-label="Filter bahasa" className="flex flex-wrap gap-2">
        <FilterLink href={`/book/${work.slug}/editions`} active={!requestedLanguage}>
          Semua bahasa
        </FilterLink>
        {languages.map((code) => (
          <FilterLink
            key={code}
            href={`/book/${work.slug}/editions?lang=${code}`}
            active={requestedLanguage === code}
          >
            {languageName(code)}
          </FilterLink>
        ))}
      </nav>

      <ol className="flex flex-col gap-3">
        {visible.map((edition) => (
          <li
            key={edition.id}
            className="flex flex-wrap items-start gap-4 rounded-lg border border-line bg-surface-alt p-4"
          >
            <EditionRowContent edition={edition} />
            <Link
              href={`/book/${work.slug}?edition=${edition.id}`}
              className="inline-flex tap-target shrink-0 items-center rounded-md bg-accent-600 px-4 text-body font-medium text-accent-on hover:bg-accent-700"
            >
              Gunakan edisi ini
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={
        active
          ? "rounded-pill border border-accent-600 bg-accent-100 px-4 py-2 text-sm font-medium text-accent-700"
          : "rounded-pill border border-line-strong px-4 py-2 text-sm text-ink-700 hover:bg-surface-alt"
      }
    >
      {children}
    </Link>
  );
}
