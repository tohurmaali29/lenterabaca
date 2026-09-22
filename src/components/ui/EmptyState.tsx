import Link from "next/link";

import { cn } from "@/lib/cn";

/**
 * Satu komponen untuk seluruh kode empty state di RnD bagian 15.
 *
 * Strukturnya dikunci tiga bagian: apa yang terjadi, kenapa, dan satu aksi
 * lanjutan. Kode state ditulis sebagai data-attribute supaya bisa dicatat
 * event log (RnD bagian 30) dan diperiksa di test.
 */
export function EmptyState({
  code,
  title,
  body,
  actions,
  className,
}: {
  code: string;
  title: string;
  body?: string;
  actions?: Array<{ label: string; href: string }>;
  className?: string;
}) {
  return (
    <div
      data-empty-state={code}
      className={cn(
        "rounded-lg border border-dashed border-line-strong bg-surface-alt px-6 py-10 text-center",
        className,
      )}
    >
      <h2 className="text-h2 text-ink-900">{title}</h2>
      {body && <p className="mx-auto mt-2 max-w-prose text-body text-ink-500">{body}</p>}

      {actions && actions.length > 0 && (
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {actions.map((action, index) => (
            <Link
              key={action.href}
              href={action.href}
              className={cn(
                "inline-flex tap-target items-center rounded-md px-4 text-body font-medium",
                index === 0
                  ? "bg-accent-600 text-accent-on hover:bg-accent-700"
                  : "border border-line-strong text-ink-700 hover:bg-surface",
              )}
            >
              {action.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
