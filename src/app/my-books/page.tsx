import type { Metadata } from "next";

export const metadata: Metadata = { title: "Rak Saya" };

/** Rak berbasis localStorage. Dibangun di Phase 5. */
export default function MyBooksPage() {
  return (
    <section>
      <h1 className="text-h1 text-ink-900">Rak Saya</h1>
      <p className="mt-2 text-body text-ink-500">
        Tab status, item rak, dan persistensi localStorage dibangun di Phase 5.
      </p>
    </section>
  );
}
