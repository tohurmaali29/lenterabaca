"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";

import { cn } from "@/lib/cn";

/**
 * Expand dan collapse yang SELALU bisa dikembalikan. RnD R-11 dan temuan F4.
 *
 * Di Goodreads, "show more" pada deskripsi dan bio penulis tidak punya
 * pasangan "show less", sehingga halaman memanjang dan user tidak bisa
 * kembali ke tampilan awal. Komponen ini memastikan itu tidak terulang:
 * label berubah, aria-expanded ikut berubah, dan teksnya tidak pernah
 * dihapus dari DOM supaya tetap bisa dicari browser.
 */
export function Disclosure({
  children,
  labelOpen = "Tampilkan selengkapnya",
  labelClose = "Tutup",
  collapsedLines = 4,
  className,
}: {
  children: React.ReactNode;
  labelOpen?: string;
  labelClose?: string;
  collapsedLines?: number;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const contentId = useId();

  return (
    <div className={className}>
      <div
        id={contentId}
        className={cn("text-body-lg text-ink-700", !open && "overflow-hidden")}
        style={
          open
            ? undefined
            : {
                display: "-webkit-box",
                WebkitLineClamp: collapsedLines,
                WebkitBoxOrient: "vertical",
              }
        }
      >
        {children}
      </div>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={contentId}
        className="mt-1 inline-flex tap-target items-center gap-1 text-body font-medium text-accent-600 hover:underline hover:underline-offset-2"
      >
        {open ? labelClose : labelOpen}
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "size-4 transition-transform duration-[var(--dur-micro)]",
            open && "rotate-180",
          )}
        />
      </button>
    </div>
  );
}
