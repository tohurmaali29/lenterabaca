import type { Metadata } from "next";
import Link from "next/link";

import { DemoTools } from "@/components/about/DemoTools";
import { Disclosure } from "@/components/ui/Disclosure";
import { auditFindings, baselineFlow } from "@/data/audit";
import { catalogStats } from "@/data/catalog";
import { formatCount } from "@/lib/format";

export const metadata: Metadata = {
  title: "Tentang project",
  description:
    "Case study LenteraBaca: memotong penemuan edisi terjemahan Indonesia dari delapan langkah menjadi tiga.",
};

/**
 * Halaman case study. RnD bagian 35.
 *
 * Susunannya sengaja menempatkan bukti sebelum solusi, dan keterbatasan
 * sebagai bagian isi, bukan catatan kaki.
 */
export default function AboutPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-display text-ink-900">Delapan langkah menjadi tiga</h1>
        <p className="text-body-lg text-ink-700">
          LenteraBaca adalah prototype redesign untuk satu pekerjaan: menemukan, memilih, dan
          menyimpan edisi terjemahan Indonesia yang benar. Studi kasusnya Goodreads.
        </p>
      </header>

      <section aria-labelledby="judul-friction" className="flex flex-col gap-4">
        <h2 id="judul-friction" className="text-h2 text-ink-900">
          Friction yang terukur
        </h2>
        <p className="text-body-lg text-ink-700">
          Di Goodreads hari ini, daftar edisi Bahasa Indonesia berada delapan langkah dari landing
          page bagi pengunjung yang belum login, dan tujuh langkah setelah login. Tidak ada satu pun
          sinyal bahasa di halaman hasil pencarian. Angka ini berasal dari penelusuran yang
          didokumentasikan dengan tiga belas tangkapan layar berurutan, bukan dari perkiraan.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <FlowCard
            title="Goodreads, sebagai guest"
            steps={[...baselineFlow.guest]}
            tone="before"
          />
          <FlowCard title="LenteraBaca" steps={[...baselineFlow.lentera]} tone="after" />
        </div>
      </section>

      <section aria-labelledby="judul-temuan" className="flex flex-col gap-4">
        <h2 id="judul-temuan" className="text-h2 text-ink-900">
          Tujuh temuan, dan apa yang dilakukan terhadapnya
        </h2>

        <ol className="flex flex-col gap-4">
          {auditFindings.map((finding) => (
            <li
              key={finding.id}
              className="flex flex-col gap-3 rounded-lg border border-line bg-surface-alt p-5"
            >
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="rounded-sm bg-surface-sunken px-2 py-0.5 text-xs font-medium text-ink-700">
                  {finding.id}
                </span>
                <h3 className="text-h3 text-ink-900">{finding.title}</h3>
              </div>

              <p className="text-body text-ink-700">
                <span className="text-ink-500">Yang diamati: </span>
                {finding.observed}
              </p>
              <p className="text-body text-ink-700">
                <span className="text-ink-500">Yang dilakukan: </span>
                {finding.response}
              </p>
              <p className="text-sm text-ink-500">
                Heuristik: {finding.heuristic} &middot; dikunci oleh {finding.requirement}
              </p>

              <p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/audit/${finding.screenshot}`}
                  alt={`Tangkapan layar Goodreads untuk temuan ${finding.id}: ${finding.title}`}
                  width={1280}
                  height={610}
                  loading="lazy"
                  className="mt-2 w-full rounded-md border border-line"
                />
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="judul-batas" className="flex flex-col gap-3">
        <h2 id="judul-batas" className="text-h2 text-ink-900">
          Batas klaim
        </h2>
        <p className="text-body-lg text-ink-700">
          Tiga hal di bawah ini terukur: jumlah langkah, jumlah klik, dan kedalaman informasi
          bahasa. Ketiganya punya baseline nyata dari penelusuran yang didokumentasikan.
        </p>
        <p className="text-body-lg text-ink-700">
          Yang belum terukur adalah apakah perubahan ini membuat pembaca lebih cepat dan lebih
          yakin. Itu masih hipotesis sampai usability test dijalankan, dan tidak akan diklaim
          sebelum ada datanya.
        </p>
      </section>

      <section aria-labelledby="judul-keterbatasan" className="flex flex-col gap-3">
        <h2 id="judul-keterbatasan" className="text-h2 text-ink-900">
          Keterbatasan
        </h2>
        <ul className="flex list-disc flex-col gap-2 pl-5 text-body-lg text-ink-700">
          <li>
            Katalog berisi {formatCount(catalogStats.workCount)} karya dan{" "}
            {formatCount(catalogStats.editionCount)} edisi, semuanya fixtures kurasi. Nama penulis
            dan penerbit nyata, tetapi kombinasi edisi, tahun, ISBN, dan rating dibuat untuk
            pengujian. Nama penerjemah fiktif.
          </li>
          <li>
            Pencocokan judul terjemahan bersandar pada tabel alias kurasi manual. Untuk pasangan
            seperti Animal Farm dan Binatangisme, tidak ada cara otomatis menghubungkan keduanya
            tanpa sumber data eksternal.
          </li>
          <li>
            Sampul buku adalah gambar yang digenerate dari judul, penerbit, dan tahun, bukan sampul
            asli. Keputusan ini diambil untuk menghindari masalah hak cipta dan bersifat sementara.
          </li>
          <li>
            Data bersifat statis. Tidak ada server, tidak ada akun, dan tidak ada yang
            dikirim ke mana pun.
          </li>
          <li>Temuan heuristik berasal dari satu orang evaluator.</li>
        </ul>
      </section>

    </div>
  );
}

function FlowCard({
  title,
  steps,
  tone,
}: {
  title: string;
  steps: string[];
  tone: "before" | "after";
}) {
  return (
    <div className="rounded-lg border border-line bg-surface-alt p-5">
      <h3 className="text-h3 text-ink-900">{title}</h3>
      <p className="mt-1 text-sm text-ink-500">
        {steps.length} langkah
        {tone === "after" ? " (target maksimal 3)" : ""}
      </p>
      <ol className="mt-3 flex list-decimal flex-col gap-1.5 pl-5 text-body text-ink-700">
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </div>
  );
}
