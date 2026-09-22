/**
 * Skeleton hasil pencarian. RnD L-01.
 *
 * aria-busy dipasang di kontainer dan tidak ada teks palsu di dalamnya,
 * supaya screen reader tidak membacakan isi yang belum ada (RnD 21.3).
 */
export default function SearchLoading() {
  return (
    <div aria-busy="true" className="flex flex-col gap-6">
      <div className="h-8 w-72 animate-pulse rounded-md bg-surface-sunken" />
      <div className="h-20 animate-pulse rounded-md bg-surface-sunken" />

      <div className="flex flex-col gap-4">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="flex gap-4 rounded-lg border border-line bg-surface-alt p-4">
            <div className="cover-sm shrink-0 animate-pulse rounded-sm bg-surface-sunken sm:cover-md" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-5 w-2/3 animate-pulse rounded bg-surface-sunken" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-surface-sunken" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-surface-sunken" />
              <div className="mt-2 h-11 w-64 animate-pulse rounded-md bg-surface-sunken" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
