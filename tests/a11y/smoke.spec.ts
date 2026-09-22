import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * RnD 21.4: nol pelanggaran serius dan kritis.
 * Cakupan bertambah tiap fase. Phase 1 baru menguji shell dan halaman kosong.
 */

const ROUTES = [
  "/",
  "/search?q=laskar",
  "/search?q=orwell&lang=id",
  "/search?q=pachinko&lang=id",
  "/search?q=zzzqqqxxx",
  "/my-books",
  "/about",
];

for (const route of ROUTES) {
  test(`axe bersih di ${route}`, async ({ page }) => {
    await page.goto(route);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const blocking = results.violations.filter(
      (violation) => violation.impact === "serious" || violation.impact === "critical",
    );

    expect(blocking, blocking.map((v) => `${v.id}: ${v.help}`).join("\n")).toEqual([]);
  });
}
