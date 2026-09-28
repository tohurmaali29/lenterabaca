import { CoverTile } from "@/components/book/CoverTile";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { BookWork, Edition } from "@/lib/types";

export function Shelf({
  id,
  title,
  items,
  aside,
}: {
  id: string;
  title: string;
  items: Array<{ work: BookWork; edition: Edition }>;
  aside?: React.ReactNode;
}) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby={id}>
      <SectionHeading id={id} aside={aside}>
        {title}
      </SectionHeading>

      <ol className="shelf-scroll -mx-4 mt-4 flex scroll-px-4 gap-4 px-4 pb-3 sm:mx-0 sm:scroll-px-0 sm:gap-5 sm:px-0">
        {items.map(({ work, edition }) => (
          <li key={work.id} className="shrink-0 snap-start">
            <CoverTile work={work} edition={edition} />
          </li>
        ))}
      </ol>
    </section>
  );
}
