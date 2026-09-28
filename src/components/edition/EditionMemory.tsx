"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import { logEvent, rememberEdition, selectedEditionStore } from "@/lib/stores";

/**
 * Urutan sumber edisi menurut R-06: parameter URL, lalu localStorage, lalu
 * edisi Bahasa Indonesia terbaru, lalu defaultEditionId. Dua yang terakhir
 * sudah ditangani katalog di server. Komponen ini melengkapi dua yang
 * pertama, yang keduanya hanya diketahui di browser.
 *
 * Kalau URL sudah menyebut edisi, itu yang diingat. Kalau tidak, edisi yang
 * diingat dipulihkan lewat replace supaya tidak menambah riwayat browser.
 */
export function EditionMemory({
  workId,
  currentEditionId,
  validEditionIds,
}: {
  workId: string;
  currentEditionId: string;
  validEditionIds: string[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const applied = useRef(false);

  const explicit = params.get("edition");

  useEffect(() => {
    if (explicit) {
      rememberEdition(workId, currentEditionId);
      return;
    }

    // Hanya sekali per pemasangan, supaya tidak berputar dengan replace.
    if (applied.current) return;
    applied.current = true;

    const remembered = selectedEditionStore.getSnapshot()[workId];
    if (!remembered || remembered === currentEditionId) return;
    if (!validEditionIds.includes(remembered)) return;

    logEvent("edition_restored", { workId, editionId: remembered });
    router.replace(`?edition=${remembered}`, { scroll: false });
  }, [explicit, workId, currentEditionId, validEditionIds, router]);

  return null;
}
