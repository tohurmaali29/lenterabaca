/** RnD 21.1 / WCAG 2.4.1: elemen fokus pertama di setiap halaman. */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:rounded-md focus:bg-accent-600 focus:px-4 focus:py-2 focus:text-body focus:text-accent-on"
      style={{ zIndex: "var(--z-toast)" }}
    >
      Lewati ke konten utama
    </a>
  );
}
