import { expect, test } from "@playwright/test";

/**
 * Persistensi. RnD R-09, R-10, R-13, R-15.
 * T6 di skenario usability test juga diuji di sini.
 */

test("simpan ke rak menyebut edisinya, sebelum dan sesudah (R-09)", async ({ page }) => {
  await page.goto("/book/cantik-itu-luka?edition=ed-ci-1");

  await page.getByRole("button", { name: /Ingin Dibaca/ }).click();

  // Konfirmasi edisi muncul SEBELUM user memilih status.
  await expect(page.getByText(/Akan disimpan sebagai/)).toContainText(
    "Gramedia Pustaka Utama 2004",
  );

  await page.getByRole("menuitemradio", { name: "Ingin Dibaca" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Disimpan sebagai Ingin Dibaca, edisi Gramedia Pustaka Utama 2004",
  );
});

test("data rak bertahan setelah reload (R-10, T6)", async ({ page }) => {
  await page.goto("/book/1984?edition=ed-84-3");

  // Seed awal menandai karya ini Sedang Dibaca dengan edisi Gramedia.
  // Di sini edisinya diganti ke Mizan lewat parameter URL, lalu disimpan ulang.
  await page.getByRole("button", { name: /Sedang Dibaca|Ingin Dibaca/ }).click();
  await page.getByRole("menuitemradio", { name: "Selesai Dibaca" }).click();

  await page.reload();
  await expect(page.getByRole("button", { name: /Selesai Dibaca/ })).toBeVisible();

  await page.goto("/my-books");
  await page.getByRole("tab", { name: /Selesai Dibaca/ }).click();
  await expect(page.getByRole("listitem").filter({ hasText: "Mizan Pustaka" })).toBeVisible();
});

test("tidak ada peringatan hydration di console (R-10)", async ({ page }) => {
  const problems: string[] = [];
  page.on("console", (message) => {
    const text = message.text();
    if (/hydrat|did not match|Text content does not match/i.test(text)) problems.push(text);
  });

  await page.goto("/my-books");
  await page.goto("/book/laskar-pelangi");
  await page.waitForTimeout(500);

  expect(problems).toEqual([]);
});

test("review melekat ke edisi yang dipilih, bukan ke karyanya saja (R-13)", async ({ page }) => {
  await page.goto("/book/animal-farm?edition=ed-af-2");

  await page.getByRole("button", { name: /review untuk edisi ini/ }).click();
  await expect(page.getByText("Review ini akan melekat ke edisi")).toBeVisible();
  await expect(page.getByText("Binatangisme").first()).toBeVisible();

  await page.getByRole("radio", { name: "Beri 4 dari 5 bintang" }).check();
  await page.getByLabel("Review kamu").fill("Terjemahan lama, tapi justru itu yang saya cari.");
  await page.getByRole("button", { name: /Simpan review|Perbarui review/ }).click();

  await expect(page.getByText(/Review tersimpan untuk edisi/)).toBeVisible();

  await page.reload();
  await expect(page.getByText("Terjemahan lama, tapi justru itu yang saya cari.")).toBeVisible();
});

test("rating wajib diisi sebelum review bisa disimpan", async ({ page }) => {
  await page.goto("/book/pachinko");
  await page.getByRole("button", { name: /review untuk edisi ini/ }).click();

  await page.getByLabel("Review kamu").fill("Tanpa rating.");
  await page.getByRole("button", { name: /Simpan review/ }).click();

  await expect(page.getByText("Pilih rating bintang lebih dulu.")).toBeVisible();
});

test("review bisa difilter berdasarkan bahasa edisi (R-14)", async ({ page }) => {
  await page.goto("/book/laskar-pelangi?edition=ed-lp-4");

  await page.getByRole("button", { name: /review untuk edisi ini/ }).click();
  await page.getByRole("radio", { name: "Beri 3 dari 5 bintang" }).check();
  await page.getByLabel("Review kamu").fill("Read the English edition.");
  await page.getByRole("button", { name: /Simpan review|Perbarui review/ }).click();

  await page.getByLabel("Bahasa edisi").selectOption("en");
  await expect(page.getByText("Read the English edition.")).toBeVisible();

  await page.getByLabel("Bahasa edisi").selectOption("id");
  await expect(page.getByText("Read the English edition.")).toBeHidden();
});

test("rak menampilkan data seed pada kunjungan pertama", async ({ page }) => {
  await page.goto("/my-books");

  await page.getByRole("tab", { name: /Selesai Dibaca/ }).click();
  await expect(page.getByRole("listitem").first()).toContainText("Laskar Pelangi");
});

test("rak yang dikosongkan menampilkan jalan keluar (E-07)", async ({ page }) => {
  await page.goto("/my-books");
  await page.evaluate(() => window.localStorage.setItem("gr:v1:shelf", "[]"));
  await page.reload();

  await expect(page.locator("[data-empty-state='E-07']")).toBeVisible();
  await expect(page.getByRole("link", { name: "Mulai cari buku" })).toBeVisible();
});

test("tab rak yang kosong tetap memberi jalan keluar (E-08)", async ({ page }) => {
  await page.goto("/my-books");
  await page.getByRole("tab", { name: /Ingin Dibaca/ }).click();
  await expect(page.locator("[data-empty-state='E-08']")).toBeVisible();
});

test("data rusak di storage dipulihkan, bukan membuat halaman gagal (X-04)", async ({ page }) => {
  await page.goto("/my-books");
  await page.evaluate(() => window.localStorage.setItem("gr:v1:shelf", "{ bukan json"));
  await page.reload();

  await expect(page.getByRole("heading", { level: 1 })).toContainText("Rak Saya");
  await expect(page.getByRole("tablist")).toBeVisible();
});
