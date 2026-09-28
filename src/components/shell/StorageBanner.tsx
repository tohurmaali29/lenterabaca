"use client";

import { AlertTriangle } from "lucide-react";
import { useState } from "react";

import { useHydrated } from "@/hooks/useStore";
import { isStorageAvailable } from "@/lib/storage";

export function StorageBanner() {
  const hydrated = useHydrated();
  const [dismissed, setDismissed] = useState(false);
  const blocked = hydrated && !isStorageAvailable();

  if (!blocked || dismissed) return null;

  return (
    <div role="status" data-notice="X-02" className="border-b border-line bg-surface-alt">
      <div className="container-page flex items-center gap-3 py-2 text-sm text-warning-fg">
        <AlertTriangle aria-hidden="true" className="size-4 shrink-0" />
        <p className="flex-1">
          Browser ini memblokir penyimpanan lokal, jadi rak dan review tidak akan tersimpan setelah
          tab ditutup. Coba buka di browser biasa, bukan dari dalam aplikasi lain.
        </p>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="tap-target shrink-0 px-2 underline underline-offset-2"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}
