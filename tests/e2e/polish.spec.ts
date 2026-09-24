import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/** RnD bagian 15, 18.2, 20, 21, 22. */

test.describe("mode gelap (D-05)", () => {
  test("mengikuti preferensi sistem tanpa perlu memilih apa pun", async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: "dark" });
    const page = await context.newPage();
    await page.goto("/");

    const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(background).not.toBe("rgb(255, 255, 255)");
    await context.close();
  });

  test("bisa dipaksa terang meski sistem gelap", async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: "dark" });
    const page = await context.newPage();
    await page.goto("/");

    await page.getByRole("button", { name: "Terang" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(background).toBe("rgb(255, 255, 255)");
    await context.close();
  });

  test("axe tetap bersih dalam mode gelap", async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: "dark" });
    const page = await context.newPage();
    await page.goto("/search?q=laskar%20pelangi");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const blocking = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );

    expect(blocking.map((v) => v.id)).toEqual([]);
    await context.close();
  });
});

test.describe("responsive (bagian 20)", () => {
  for (const width of [320, 375, 768, 1024, 1440]) {
    test(`tidak ada scroll horizontal di lebar ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/search?q=laskar%20pelangi");
      await expect(page.getByRole("article").first()).toBeVisible();

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      );
      expect(overflow).toBe(false);
    });
  }

  test("halaman detail tetap terbaca pada zoom 200 persen", async ({ page }) => {
    await page.setViewportSize({ width: 640, height: 720 });
    await page.goto("/book/laskar-pelangi");

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(overflow).toBe(false);
  });
});

test.describe("target sentuh (21.1)", () => {
  test("aksi utama minimal 44px di halaman detail", async ({ page }) => {
    await page.goto("/book/laskar-pelangi");

    for (const name of [/Ganti edisi/, /Ingin Dibaca|Sedang Dibaca|Selesai Dibaca/]) {
      const box = await page.getByRole("button", { name }).first().boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    }
  });

  test("bintang rating minimal 44px", async ({ page }) => {
    await page.goto("/book/pachinko");
    await page.getByRole("button", { name: /review untuk edisi ini/ }).click();

    const box = await page.getByRole("radio", { name: "Beri 3 dari 5 bintang" }).boundingBox();
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  });
});

test.describe("state yang tersisa", () => {
  test("halaman tidak dikenal memberi jalan keluar (X-05)", async ({ page }) => {
    const response = await page.goto("/book/buku-yang-tidak-ada");
    expect(response?.status()).toBe(404);

    await expect(page.locator("[data-empty-state='X-05']")).toBeVisible();
    // R-12 berlaku juga di halaman 404: tetap satu search bar, milik shell.
    await expect(page.getByRole("searchbox")).toHaveCount(1);
  });

  test("cover yang gagal dimuat diganti placeholder teks (X-01)", async ({ page }) => {
    await page.route("**/covers/**", (route) => route.abort());
    await page.goto("/search?q=laskar%20pelangi");

    await expect(page.locator("[data-notice='X-01']").first()).toBeVisible();
    await expect(page.locator("[data-notice='X-01']").first()).toContainText("Laskar Pelangi");
  });
});

test.describe("gerak (bagian 22)", () => {
  test("prefers-reduced-motion mematikan animasi", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/search?q=laskar%20pelangi");

    const longest = await page.evaluate(() => {
      const toMs = (value: string) =>
        value.endsWith("ms") ? parseFloat(value) : parseFloat(value) * 1000;

      return [...document.querySelectorAll("*")]
        .flatMap((node) => getComputedStyle(node).animationDuration.split(","))
        .map((value) => toMs(value.trim()))
        .filter((value) => Number.isFinite(value))
        .reduce((max, value) => Math.max(max, value), 0);
    });

    // Aturan di globals.css memangkas seluruh animasi ke 0,01ms.
    expect(longest).toBeLessThan(1);
    await context.close();
  });
});
