"use client";

import * as Dialog from "@radix-ui/react-dialog";
import * as RadioGroup from "@radix-ui/react-radio-group";
import { X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { EditionRowContent } from "@/components/edition/EditionRow";
import { cn } from "@/lib/cn";
import { formatName, languageName } from "@/lib/format";
import type { Edition, EditionId } from "@/lib/types";

/**
 * Pemilih edisi. RnD R-07, 17.3, 21.3, D-08.
 *
 * Memakai Radix Dialog dan RadioGroup, bukan implementasi sendiri, karena
 * ini komponen paling berisiko secara aksesibilitas di seluruh produk:
 * butuh focus trap, Escape, pengembalian fokus ke tombol pemicu, dan
 * penandaan radio yang benar. Radix sudah menangani semuanya (keputusan D-08).
 *
 * Kenapa drawer, bukan halaman: user sedang MEMBANDINGKAN. Memindahkannya
 * ke halaman lain memutus konteks, dan itu salah satu penyebab flow
 * delapan langkah yang diaudit. Halaman /book/[slug]/editions tetap ada
 * sebagai jalur yang bisa dibagikan dan tetap jalan tanpa JavaScript.
 */

export interface PublisherOption {
  id: string;
  name: string;
}

export function EditionSelector({
  editions,
  selectedId,
  workTitle,
  publishers,
  triggerLabel,
}: {
  editions: Edition[];
  selectedId: EditionId;
  workTitle: string;
  publishers: PublisherOption[];
  triggerLabel: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string>(selectedId);
  const [language, setLanguage] = useState<string>("all");
  const [format, setFormat] = useState<string>("all");
  const [publisher, setPublisher] = useState<string>("all");

  // Saat drawer dibuka ulang, pilihan kembali ke edisi yang sedang dipakai.
  // Dilakukan di handler pembuka, bukan di effect, supaya tidak memicu
  // render berantai (react-hooks/set-state-in-effect).
  function handleOpenChange(next: boolean) {
    if (next) setDraft(selectedId);
    setOpen(next);
  }

  const languages = useMemo(() => [...new Set(editions.map((item) => item.language))], [editions]);
  const formats = useMemo(() => [...new Set(editions.map((item) => item.format))], [editions]);

  const visible = editions.filter((item) => {
    if (language !== "all" && item.language !== language) return false;
    if (format !== "all" && item.format !== format) return false;
    if (publisher !== "all" && (item.publisherId as string) !== publisher) return false;
    return true;
  });

  function apply() {
    setOpen(false);
    if (draft !== selectedId) {
      router.push(`${pathname}?edition=${draft}`, { scroll: false });
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex tap-target items-center rounded-md border border-line-strong px-4 text-body text-ink-700",
            "transition-colors duration-[var(--dur-micro)] hover:bg-surface-alt",
          )}
        >
          {triggerLabel}
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 bg-black/40"
          style={{ zIndex: "var(--z-overlay)" }}
        />

        <Dialog.Content
          aria-describedby={undefined}
          style={{ zIndex: "var(--z-drawer)" }}
          className={cn(
            "fixed right-0 bottom-0 left-0 flex max-h-[92vh] flex-col rounded-t-xl bg-surface shadow-3",
            "sm:top-0 sm:bottom-0 sm:left-auto sm:max-h-none sm:w-[420px] sm:rounded-none lg:w-[480px]",
          )}
        >
          <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
            <div className="min-w-0">
              <Dialog.Title className="text-h2 text-ink-900">Pilih edisi</Dialog.Title>
              <p className="mt-0.5 truncate text-sm text-ink-500">
                {workTitle} &middot; {editions.length} edisi
              </p>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="-mt-2 -mr-2 flex tap-target items-center justify-center rounded-md text-ink-500 hover:bg-surface-alt hover:text-ink-900"
              >
                <X aria-hidden="true" className="size-5" />
                <span className="sr-only">Tutup</span>
              </button>
            </Dialog.Close>
          </header>

          <div className="flex flex-wrap gap-3 border-b border-line px-5 py-3">
            <Select label="Bahasa" value={language} onChange={setLanguage}>
              <option value="all">Semua bahasa</option>
              {languages.map((code) => (
                <option key={code} value={code}>
                  {languageName(code)}
                </option>
              ))}
            </Select>

            <Select label="Format" value={format} onChange={setFormat}>
              <option value="all">Semua format</option>
              {formats.map((value) => (
                <option key={value} value={value}>
                  {formatName(value)}
                </option>
              ))}
            </Select>

            <Select label="Penerbit" value={publisher} onChange={setPublisher}>
              <option value="all">Semua penerbit</option>
              {publishers.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            {visible.length === 0 ? (
              <p
                data-empty-state="E-05"
                className="rounded-md border border-dashed border-line-strong px-4 py-6 text-center text-body text-ink-500"
              >
                Tidak ada edisi yang cocok dengan filter ini.
              </p>
            ) : (
              <RadioGroup.Root
                value={draft}
                onValueChange={setDraft}
                aria-label="Pilih edisi"
                className="flex flex-col gap-2"
              >
                {visible.map((edition) => {
                  const isCurrent = edition.id === selectedId;
                  return (
                    <RadioGroup.Item
                      key={edition.id}
                      value={edition.id}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-lg border p-3 text-left",
                        "transition-colors duration-[var(--dur-micro)]",
                        draft === edition.id
                          ? "border-accent-600 bg-accent-100"
                          : "border-line hover:bg-surface-alt",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "mt-1 flex size-4 shrink-0 items-center justify-center rounded-full border-2",
                          draft === edition.id ? "border-accent-600" : "border-line-strong",
                        )}
                      >
                        {draft === edition.id && (
                          <span className="size-2 rounded-full bg-accent-600" />
                        )}
                      </span>

                      <EditionRowContent edition={edition} />

                      {isCurrent && (
                        <span className="shrink-0 rounded-sm bg-surface-sunken px-2 py-0.5 text-xs font-medium text-ink-700">
                          Sedang dipakai
                        </span>
                      )}
                    </RadioGroup.Item>
                  );
                })}
              </RadioGroup.Root>
            )}
          </div>

          <footer className="flex gap-2 border-t border-line px-5 py-4">
            <button
              type="button"
              onClick={apply}
              disabled={visible.length === 0}
              className={cn(
                "inline-flex tap-target flex-1 items-center justify-center rounded-md bg-accent-600 px-4 text-body font-medium text-accent-on",
                "transition-colors duration-[var(--dur-micro)] hover:bg-accent-700",
                "disabled:cursor-not-allowed disabled:opacity-45",
              )}
            >
              Gunakan edisi ini
            </button>
            <Dialog.Close asChild>
              <button
                type="button"
                className="inline-flex tap-target items-center justify-center rounded-md border border-line-strong px-4 text-body text-ink-700 hover:bg-surface-alt"
              >
                Batal
              </button>
            </Dialog.Close>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1 text-sm text-ink-700">
      <span className="font-medium">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 rounded-md border border-line-strong bg-surface px-2 text-sm text-ink-900 hover:border-ink-400"
      >
        {children}
      </select>
    </label>
  );
}
