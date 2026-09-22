// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Kontras token. Sumber: RnD v2.1 bagian 18.1, 18.2, dan 21.1.
 *
 * Kolom kontras di dokumen RnD semula hanya berupa klaim yang ditulis tangan,
 * dan tiga di antaranya ternyata salah: ink-400 hanya 4,30, line-strong hanya
 * 1,60, dan rating-fill hanya 2,54. Test ini mengubah klaim itu menjadi
 * sesuatu yang dihitung, sehingga tidak bisa meleset lagi tanpa ketahuan.
 *
 * Ambang mengikuti WCAG 2.1 AA:
 *  - teks isi minimal 4,5:1
 *  - komponen UI dan batas yang membawa makna minimal 3:1
 */

const css = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");

function tokensIn(selector: string): Record<string, string> {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`Selector tidak ditemukan: ${selector}`);
  const open = css.indexOf("{", start);
  const body = css.slice(open + 1, css.indexOf("}", open));

  const found: Record<string, string> = {};
  for (const match of body.matchAll(/^\s*(--[a-z0-9-]+)\s*:\s*(#[0-9a-f]{6})\s*;/gim)) {
    found[match[1]] = match[2];
  }
  return found;
}

function channelLuminance(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  const r = channelLuminance(parseInt(clean.slice(0, 2), 16));
  const g = channelLuminance(parseInt(clean.slice(2, 4), 16));
  const b = channelLuminance(parseInt(clean.slice(4, 6), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const first = relativeLuminance(a);
  const second = relativeLuminance(b);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}

const light = tokensIn(":root {");
const dark = tokensIn(':root[data-theme="dark"] {');

/** Token teks: wajib 4,5:1 terhadap kedua permukaan. */
const TEXT_TOKENS = [
  "--ink-900",
  "--ink-700",
  "--ink-500",
  "--ink-400",
  "--accent-600",
  "--accent-700",
  "--rating-text",
  "--success-fg",
  "--warning-fg",
  "--danger-fg",
];

/** Token komponen UI: wajib 3:1. */
const UI_TOKENS = ["--line-strong", "--focus-ring", "--rating-fill"];

function runSuite(themeName: string, theme: Record<string, string>) {
  describe(`tema ${themeName}`, () => {
    const surface = theme["--surface"];
    const surfaceAlt = theme["--surface-alt"];

    it.each(TEXT_TOKENS)("%s minimal 4,5:1 terhadap kedua permukaan", (token) => {
      const value = theme[token];
      expect(value, `${token} tidak ada di tema ${themeName}`).toBeDefined();

      const onSurface = contrast(value, surface);
      const onAlt = contrast(value, surfaceAlt);

      expect(onSurface, `${token} di surface: ${onSurface.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
      expect(onAlt, `${token} di surface-alt: ${onAlt.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
    });

    it.each(UI_TOKENS)("%s minimal 3:1 terhadap kedua permukaan", (token) => {
      const value = theme[token];
      expect(value, `${token} tidak ada di tema ${themeName}`).toBeDefined();

      const onSurface = contrast(value, surface);
      const onAlt = contrast(value, surfaceAlt);

      expect(onSurface, `${token} di surface: ${onSurface.toFixed(2)}`).toBeGreaterThanOrEqual(3);
      expect(onAlt, `${token} di surface-alt: ${onAlt.toFixed(2)}`).toBeGreaterThanOrEqual(3);
    });

    it("teks tombol primer terbaca di atas latar aksen", () => {
      const value = contrast(theme["--accent-on"], theme["--accent-600"]);
      expect(value, `accent-on di accent-600: ${value.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
    });

    it("badge bahasa terbaca di atas latarnya sendiri, bukan latar halaman", () => {
      const indonesian = contrast(theme["--lang-id-fg"], theme["--lang-id-bg"]);
      const other = contrast(theme["--lang-other-fg"], theme["--lang-other-bg"]);

      expect(indonesian, `badge id: ${indonesian.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
      expect(other, `badge lain: ${other.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
    });
  });
}

describe("kontras token (WCAG 2.1 AA)", () => {
  runSuite("terang", light);
  runSuite("gelap", dark);
});
