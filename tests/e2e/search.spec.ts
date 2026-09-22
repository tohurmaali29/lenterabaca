import { expect, test } from "@playwright/test";

/**
 * Alur pencarian. RnD R-01 sampai R-04, dan temuan F6.
 */

test("badge bahasa terlihat di hasil tanpa klik tambahan (R-03, F6)", async ({ page }) => {
  await page.goto("/search?q=laskar%20pelangi");

  const card = page.getByRole("article").first();
  await expect(card).toContainText("Laskar Pelangi");
  await expect(card.getByText("Tersedia dalam Bahasa Indonesia")).toBeAttached();
});

test("alasan kecocokan tampil saat query memakai judul terjemahan (R-02)", async ({ page }) => {
  await page.goto("/search?q=the%20rainbow%20troops");

  const card = page.getByRole("article").first();
  await expect(card).toContainText("Cocok dengan judul Inggris:");
  await expect(card).toContainText("The Rainbow Troops");
});

test("judul terjemahan yang jauh berbeda tetap ketemu (EC-3)", async ({ page }) => {
  await page.goto("/search?q=binatangisme");
  await expect(page.getByRole("article").first()).toContainText("Binatangisme");
});

test("edisi terpilih disebut di setiap kartu (prinsip edition-aware)", async ({ page }) => {
  await page.goto("/search?q=1984");
  await expect(page.getByRole("article").first()).toContainText("Edisi terpilih:");
});

test("filter bahasa tercermin di URL dan tombol back mengembalikannya (R-04)", async ({ page }) => {
  await page.goto("/search?q=orwell");
  const before = await page.getByRole("article").count();

  await page.getByRole("button", { name: "Bahasa Indonesia" }).click();
  await expect(page).toHaveURL(/lang=id/);

  await page.goBack();
  await expect(page).not.toHaveURL(/lang=id/);
  await expect(page.getByRole("article")).toHaveCount(before);
});

test("hasil yang sudah difilter bisa dibuka langsung dari URL", async ({ page }) => {
  await page.goto("/search?q=orwell&lang=id");

  const cards = page.getByRole("article");
  await expect(cards.first()).toBeVisible();
  for (const card of await cards.all()) {
    await expect(card.getByText("Tersedia dalam Bahasa Indonesia")).toBeAttached();
  }
});

test("karya tanpa edisi Indonesia menyatakannya, bukan diam (EC-1, E-06)", async ({ page }) => {
  await page.goto("/search?q=pachinko");
  await expect(page.getByRole("article").first()).toContainText(
    "Belum ada edisi Bahasa Indonesia di katalog",
  );
});

test("filter bahasa yang menghabiskan hasil memberi jalan keluar (E-05)", async ({ page }) => {
  await page.goto("/search?q=pachinko&lang=id");

  const empty = page.locator("[data-empty-state='E-05']");
  await expect(empty).toBeVisible();
  await expect(empty).toContainText("Belum ada edisi Bahasa Indonesia");
  await expect(empty.getByRole("link", { name: "Lihat semua bahasa" })).toBeVisible();
});

test("salah ketik tetap menemukan karyanya", async ({ page }) => {
  await page.goto("/search?q=laskar%20pelagi");
  await expect(page.getByRole("article").first()).toContainText("Laskar Pelangi");
});

test("query terlalu pendek memberi panduan, bukan hasil kosong (E-02)", async ({ page }) => {
  await page.goto("/search?q=a");
  await expect(page.locator("[data-empty-state='E-02']")).toBeVisible();
});

test("query tanpa kecocokan menawarkan yang mendekati (E-03) atau menyatakan kosong (E-04)", async ({
  page,
}) => {
  await page.goto("/search?q=zzzqqqxxx");
  await expect(page.locator("[data-empty-state='E-03'], [data-empty-state='E-04']")).toBeVisible();
});

test("judul berbahasa lain diberi atribut lang (21.2)", async ({ page }) => {
  await page.goto("/search?q=kokoro");
  await expect(page.locator("h3 a[lang='ja']").first()).toBeVisible();
});
