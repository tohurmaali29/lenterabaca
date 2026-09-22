import type { Metadata } from "next";

export const metadata: Metadata = { title: "Tentang project" };

/** Case study, catatan metode, event log, dan reset demo. Dibangun di Phase 7. */
export default function AboutPage() {
  return (
    <section className="max-w-2xl">
      <h1 className="text-h1 text-ink-900">Tentang project ini</h1>
      <p className="mt-3 text-body-lg text-ink-700">
        LenteraBaca adalah prototype redesign yang fokus pada satu pekerjaan: menemukan, memilih,
        dan menyimpan edisi terjemahan Indonesia yang benar.
      </p>
      <p className="mt-3 text-body text-ink-500">
        Case study, catatan metode, log aktivitas lokal, dan tombol reset data demo dibangun di
        Phase 7.
      </p>
    </section>
  );
}
