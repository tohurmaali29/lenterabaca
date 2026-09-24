import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/** RnD 21.4: nol pelanggaran serius dan kritis. */

const ROUTES = [
  "/",
  "/search?q=laskar",
  "/search?q=orwell&lang=id",
  "/search?q=pachinko&lang=id",
  "/search?q=zzzqqqxxx",
  "/book/laskar-pelangi",
  "/book/pachinko",
  "/book/1984/editions",
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

test("axe bersih saat drawer edisi terbuka", async ({ page }) => {
  await page.goto("/book/laskar-pelangi");
  await page.getByRole("button", { name: /Ganti edisi/ }).click();
  await page.getByRole("dialog").waitFor();

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  const blocking = results.violations.filter(
    (violation) => violation.impact === "serious" || violation.impact === "critical",
  );

  expect(blocking, blocking.map((v) => `${v.id}: ${v.help}`).join(String.fromCharCode(10))).toEqual(
    [],
  );
});

test("urutan heading tidak melompat di halaman utama", async ({ page }) => {
  for (const route of ["/", "/search?q=laskar", "/book/laskar-pelangi", "/my-books"]) {
    await page.goto(route);

    const results = await new AxeBuilder({ page }).withRules(["heading-order"]).analyze();
    expect(
      results.violations.map((v) => v.nodes.map((n) => n.target.join(" "))).flat(),
      `heading melompat di ${route}`,
    ).toEqual([]);
  }
});
