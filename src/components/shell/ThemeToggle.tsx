"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useState } from "react";

import { useHydrated } from "@/hooks/useStore";
import { cn } from "@/lib/cn";

/**
 * Komponen ini hanya mengatur data-theme di elemen html. Tanpa pilihan
 * apa pun, halaman mengikuti preferensi sistem.
 */

type Theme = "system" | "light" | "dark";

const OPTIONS: Array<{ value: Theme; label: string; Icon: typeof Sun }> = [
  { value: "light", label: "Terang", Icon: Sun },
  { value: "dark", label: "Gelap", Icon: Moon },
  { value: "system", label: "Ikut sistem", Icon: Monitor },
];

function currentTheme(): Theme {
  if (typeof document === "undefined") return "system";
  const value = document.documentElement.getAttribute("data-theme");
  return value === "light" || value === "dark" ? value : "system";
}

export function ThemeToggle() {
  const hydrated = useHydrated();
  const [theme, setTheme] = useState<Theme>(currentTheme);

  function apply(next: Theme) {
    setTheme(next);
    // setAttribute, bukan penugasan ke dataset: aturan immutability React
    // Compiler menolak penugasan properti pada nilai yang berasal dari global.
    const root = document.documentElement;
    if (next === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", next);
  }

  if (!hydrated) {
    return <span aria-hidden="true" className="inline-block h-9 w-28" />;
  }

  return (
    <div
      role="group"
      aria-label="Tema tampilan"
      className="flex items-center gap-0.5 rounded-pill border border-line p-0.5"
    >
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => apply(value)}
          aria-pressed={theme === value}
          title={label}
          className={cn(
            "flex size-8 items-center justify-center rounded-pill",
            "transition-colors duration-[var(--dur-micro)]",
            theme === value
              ? "bg-accent-100 text-accent-700"
              : "text-ink-500 hover:bg-surface-alt hover:text-ink-900",
          )}
        >
          <Icon aria-hidden="true" className="size-4" />
          <span className="sr-only">{label}</span>
        </button>
      ))}
    </div>
  );
}
