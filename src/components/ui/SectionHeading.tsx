import Link from "next/link";

import { cn } from "@/lib/cn";

/** Kapital kecil dengan garis tipis di bawahnya, dan tautan lanjutan opsional di kanan. */
export function SectionHeading({
  id,
  children,
  action,
  aside,
  as: Heading = "h2",
  className,
}: {
  id: string;
  children: React.ReactNode;
  action?: { label: string; href: string };
  aside?: React.ReactNode;
  as?: "h2" | "h3";
  className?: string;
}) {
  return (
    <div
      className={cn("flex items-end justify-between gap-3 border-b border-line pb-2", className)}
    >
      <Heading id={id} className="text-overline text-ink-500 uppercase">
        {children}
      </Heading>
      {aside}
      {action && (
        <Link
          href={action.href}
          className="shrink-0 text-overline text-ink-500 uppercase transition-colors hover:text-accent-600"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
