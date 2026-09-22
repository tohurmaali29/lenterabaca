import { expect, test } from "@playwright/test";

/**
 * Halaman detail dan pemilih edisi. RnD R-05 sampai R-08, R-11.
 * Setiap test di sini memetakan langsung ke temuan F3, F4, atau F7.
 */

const LASKAR = "/book/laskar-pelangi";

test("blok karya dan blok edisi terpisah dan keduanya terbuka (R-05, F3)", async ({ page }) => {
  await page.goto(LASKAR);

  await expect(page.getByText("Karya", { exact: true })).toBeVisible();
  await expect(page.getByText("Edisi terpilih", { exact: true })).toBeVisible();

  // Metadata langsung terlihat, tanpa perlu membuka dropdown apa pun.
  await expect(page.getByText("Bentang Pustaka").first()).toBeVisible();
  await expect(page.getByText("Penerbit", { exact: true })).toBeVisible();
});

test("rating karya dan rating edisi disebut cakupannya masing-masing (R-05, F7)", async ({
  page,
}) => {
  await page.goto(LASKAR);

  await expect(page.getByText(/rating karya/)).toBeVisible();
  await expect(page.getByText(/untuk edisi ini/).first()).toBeVisible();
});

test("edisi awal adalah edisi Bahasa Indonesia terbaru (R-06)", async ({ page }) => {
  await page.goto(LASKAR);

  const panel = page.getByRole("region", { name: /Edisi terpilih|Laskar Pelangi/ }).first();
  await expect(page.getByText("2018")).toBeVisible();
});

test("deep link edisi dihormati, dan id tidak valid jatuh ke edisi utama (R-08)", async ({
  page,
}) => {
  await page.goto(`${LASKAR}?edition=ed-lp-4`);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("The Rainbow Troops");

  await page.goto(`${LASKAR}?edition=ed-tidak-ada`);
  await expect(page.locator("[data-notice='X-06']")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Laskar Pelangi");
});

test("edisi dari karya lain ditolak, bukan ditampilkan", async ({ page }) => {
  await page.goto(`${LASKAR}?edition=ed-84-1`);
  await expect(page.locator("[data-notice='X-06']")).toBeVisible();
});

test("drawer edisi: buka, pilih, terapkan, URL berubah (R-07)", async ({ page }) => {
  await page.goto(LASKAR);

  await page.getByRole("button", { name: /Ganti edisi/ }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("radiogroup", { name: "Pilih edisi" })).toBeVisible();

  await dialog.getByRole("radio").nth(3).click();
  await dialog.getByRole("button", { name: "Gunakan edisi ini" }).click();

  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/\?edition=ed-/);
});

test("drawer menutup dengan Escape dan fokus kembali ke pemicu (21.3)", async ({ page }) => {
  await page.goto(LASKAR);

  const trigger = page.getByRole("button", { name: /Ganti edisi/ });
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("drawer mengunci fokus di dalamnya (21.3)", async ({ page }) => {
  await page.goto(LASKAR);
  await page.getByRole("button", { name: /Ganti edisi/ }).click();

  const dialog = page.getByRole("dialog");
  for (let i = 0; i < 25; i += 1) await page.keyboard.press("Tab");

  const focusedInsideDialog = await dialog.evaluate((node) =>
    node.contains(document.activeElement),
  );
  expect(focusedInsideDialog).toBe(true);
});

test("baris edisi yang sedang dipakai ditandai teks, bukan hanya warna (21.3)", async ({
  page,
}) => {
  await page.goto(LASKAR);
  await page.getByRole("button", { name: /Ganti edisi/ }).click();
  await expect(page.getByRole("dialog").getByText("Sedang dipakai")).toBeVisible();
});

test("filter di dalam drawer menyaring daftar edisi", async ({ page }) => {
  await page.goto("/book/1984");
  await page.getByRole("button", { name: /Ganti edisi/ }).click();

  const dialog = page.getByRole("dialog");
  const before = await dialog.getByRole("radio").count();

  await dialog.getByLabel("Bahasa").selectOption("en");
  const after = await dialog.getByRole("radio").count();

  expect(after).toBeLessThan(before);
});

test("disclosure selalu bisa ditutup lagi (R-11, F4)", async ({ page }) => {
  await page.goto(LASKAR);

  const button = page.getByRole("button", { name: "Tampilkan selengkapnya" }).first();
  await expect(button).toHaveAttribute("aria-expanded", "false");

  await button.click();
  const close = page.getByRole("button", { name: "Tutup" }).first();
  await expect(close).toHaveAttribute("aria-expanded", "true");

  await close.click();
  await expect(page.getByRole("button", { name: "Tampilkan selengkapnya" }).first()).toBeVisible();
});

test("karya tanpa edisi Indonesia menyatakannya di detail (E-06)", async ({ page }) => {
  await page.goto("/book/pachinko");
  await expect(page.locator("[data-empty-state='E-06']")).toBeVisible();
});

test("halaman daftar edisi berfungsi sebagai jalur tanpa JavaScript (D-02)", async ({ page }) => {
  await page.goto("/book/1984/editions");

  await expect(page.getByRole("heading", { level: 1 })).toContainText("Semua edisi");
  await page.getByRole("link", { name: "Bahasa Indonesia" }).click();
  await expect(page).toHaveURL(/lang=id/);

  await page.getByRole("link", { name: "Gunakan edisi ini" }).first().click();
  await expect(page).toHaveURL(/\/book\/1984\?edition=ed-84-/);
});
