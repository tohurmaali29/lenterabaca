import { editions, getEdition, getPublisher } from "@/data/catalog";
import { renderCoverSvg } from "@/lib/cover";
import type { EditionId } from "@/lib/types";

/**
 * Penyaji cover placeholder (RnD D-06).
 *
 * force-static plus generateStaticParams membuat seluruh 59 cover
 * diprarender saat build, jadi disajikan sebagai aset statis tanpa biaya
 * runtime. Tidak memakai next/image karena next/image tidak mengoptimasi SVG
 * dan akan menuntut dangerouslyAllowSVG. Ketentuan CLS dan lazy loading di
 * RnD bagian 29 tetap dipenuhi lewat width, height, dan loading eksplisit
 * di komponen yang memakainya.
 */

export const dynamic = "force-static";

export function generateStaticParams() {
  return editions.map((item) => ({ editionId: item.id as string }));
}

export async function GET(_request: Request, ctx: RouteContext<"/covers/[editionId]">) {
  const { editionId } = await ctx.params;

  const edition = getEdition(editionId as EditionId);
  if (!edition) {
    return new Response("Edisi tidak ditemukan", { status: 404 });
  }

  const publisher = getPublisher(edition.publisherId);

  const svg = renderCoverSvg({
    editionId: edition.id,
    title: edition.title,
    publisherName: publisher?.name ?? "Penerbit tidak diketahui",
    publishedYear: edition.publishedYear,
    language: edition.language,
    editionLabel: edition.editionLabel,
  });

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
