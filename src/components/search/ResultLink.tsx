"use client";

import Link from "next/link";

import { logEvent } from "@/lib/stores";

/**
 * Posisi klik dipakai untuk menilai apakah alasan kecocokan membantu:
 * kalau user rutin melewati hasil teratas, berarti penjelasannya belum
 * cukup meyakinkan, atau peringkatnya yang keliru.
 */
export function ResultLink({
  href,
  workId,
  position,
  matchedOnField,
  className,
  children,
  lang,
}: {
  href: string;
  workId: string;
  position: number;
  matchedOnField: string;
  className?: string;
  children: React.ReactNode;
  lang?: string;
}) {
  return (
    <Link
      href={href}
      lang={lang}
      className={className}
      onClick={() => logEvent("result_clicked", { workId, position, matchedOnField })}
    >
      {children}
    </Link>
  );
}
