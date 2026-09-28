import { expect, test } from "@playwright/test";

/**
 * RnD 14.1 R-12: di halaman apa pun, hanya ada satu navbar dan satu search bar.
 */

const ROUTES = ["/", "/search?q=laskar", "/my-books", "/about"];

for (const route of ROUTES) {
  test(`satu navbar dan satu search bar di ${route}`, async ({ page }) => {
    await page.goto(route);

    await expect(page.getByRole("navigation", { name: "Navigasi utama" })).toHaveCount(1);
    await expect(page.getByRole("search")).toHaveCount(1);
    await expect(page.getByRole("searchbox")).toHaveCount(1);
  });
}

test("halaman utama memakai locale Indonesia", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "id");
});

test("skip link adalah elemen fokus pertama", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Lewati ke konten utama" })).toBeFocused();
});

test("pencarian dari hero membawa query ke URL", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("searchbox").fill("laskar pelangi");
  await page.getByRole("searchbox").press("Enter");
  await expect(page).toHaveURL(/\/search\?q=laskar\+pelangi|\/search\?q=laskar%20pelangi/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("laskar pelangi");
});
