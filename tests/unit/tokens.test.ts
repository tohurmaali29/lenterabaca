// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Kegagalan yang paling mudah terjadi adalah menambah token
 * warna baru di blok terang lalu lupa menambahkannya di kedua blok gelap,
 * sehingga komponen terlihat benar di terang dan rusak di gelap.
 * Test ini menangkap itu sebelum sampai ke review manual.
 */

const css = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");

function tokensIn(selector: string): Set<string> {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`Selector tidak ditemukan di globals.css: ${selector}`);

  const open = css.indexOf("{", start);
  const close = css.indexOf("}", open);
  const body = css.slice(open + 1, close);

  const names = new Set<string>();
  for (const match of body.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gim)) {
    names.add(match[1]);
  }
  return names;
}

/** Token yang nilainya berbeda antar tema. Sisanya (ukuran, durasi, z-index) tidak. */
const THEMED = /^--(surface|line|ink|accent|lang|rating|success|warning|danger|focus|elev)/;

const light = tokensIn(":root {");
const darkBySystem = tokensIn(':root:not([data-theme="light"]) {');
const darkByAttribute = tokensIn(':root[data-theme="dark"] {');

describe("design token", () => {
  it("blok terang mendefinisikan token bertema", () => {
    const themed = [...light].filter((name) => THEMED.test(name));
    expect(themed.length).toBeGreaterThan(20);
  });

  it("setiap token bertema punya nilai gelap mengikuti preferensi sistem", () => {
    const missing = [...light].filter((name) => THEMED.test(name) && !darkBySystem.has(name));
    expect(missing, `token tanpa nilai gelap (media query): ${missing.join(", ")}`).toEqual([]);
  });

  it("setiap token bertema punya nilai gelap saat dipaksa lewat data-theme", () => {
    const missing = [...light].filter((name) => THEMED.test(name) && !darkByAttribute.has(name));
    expect(missing, `token tanpa nilai gelap (data-theme): ${missing.join(", ")}`).toEqual([]);
  });

  it("kedua blok gelap berisi token yang sama", () => {
    expect([...darkBySystem].sort()).toEqual([...darkByAttribute].sort());
  });

  it("tidak ada token bertema yang hanya ada di blok gelap", () => {
    const orphan = [...darkBySystem].filter((name) => !light.has(name));
    expect(orphan, `token gelap tanpa pasangan terang: ${orphan.join(", ")}`).toEqual([]);
  });
});
