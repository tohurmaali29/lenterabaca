"use client";

import { useCallback, useState } from "react";

import { cn } from "@/lib/cn";

/**
 * Ukuran dikunci lewat atribut width dan height supaya tidak menggeser
 * layout saat gambar datang (target CLS di bagian 29). next/image tidak
 * dipakai karena cover berupa SVG, yang tidak dioptimasi next/image dan
 * akan menuntut dangerouslyAllowSVG.
 */
export function BookCover({
  src,
  alt,
  title,
  publisherName,
  size,
  priority = false,
  className,
}: {
  src: string;
  alt: string;
  title: string;
  publisherName: string;
  size: "sm" | "md" | "lg" | "xl";
  priority?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  /**
   * Gambar yang gagal saat halaman masih dirender server akan memicu event
   * error sebelum React sempat memasang listener, sehingga onError saja tidak
   * cukup. Ref callback memeriksa keadaan gambar begitu elemennya terpasang.
   */
  const checkOnMount = useCallback((node: HTMLImageElement | null) => {
    if (node && node.complete && node.naturalWidth === 0) setFailed(true);
  }, []);

  const sizeClass = {
    sm: "cover-sm",
    md: "cover-md",
    lg: "cover-lg",
    xl: "cover-xl",
  }[size];

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        data-notice="X-01"
        className={cn(
          sizeClass,
          "flex shrink-0 flex-col justify-end gap-0.5 rounded-sm bg-surface-sunken p-2",
          className,
        )}
      >
        <span className="line-clamp-3 text-xs font-medium text-ink-700">{title}</span>
        <span className="line-clamp-1 text-xs text-ink-500">{publisherName}</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={400}
      height={600}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      ref={checkOnMount}
      onError={() => setFailed(true)}
      className={cn(sizeClass, "shrink-0 rounded-sm bg-surface-sunken object-cover", className)}
    />
  );
}
