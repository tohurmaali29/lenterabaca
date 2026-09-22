"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Mengumumkan pergantian edisi ke screen reader. RnD 21.3.
 *
 * Tanpa ini, mengganti edisi hanya terlihat sebagai perubahan warna dan teks
 * di tengah halaman. Pengguna screen reader tidak akan tahu aksinya berhasil.
 */
export function EditionAnnouncer({ label }: { label: string }) {
  const [message, setMessage] = useState("");
  const previous = useRef<string | null>(null);

  useEffect(() => {
    if (previous.current !== null && previous.current !== label) {
      setMessage(`Edisi diganti ke ${label}`);
    }
    previous.current = label;
  }, [label]);

  return (
    <p aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </p>
  );
}
