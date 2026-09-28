import { expect, test } from "@playwright/test";

async function readEvents(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const raw = window.localStorage.getItem("gr:v1:events");
    return raw ? (JSON.parse(raw) as Array<{ name: string }>) : [];
  });
}

test("edisi yang dipilih diingat saat karya dibuka lagi (R-06)", async ({ page }) => {
  await page.goto("/book/laskar-pelangi");

  // Edisi awal adalah edisi Bahasa Indonesia terbaru, yaitu ebook 2018.
  await expect(page.getByText("2018")).toBeVisible();

  await page.getByRole("button", { name: /Ganti edisi/ }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("radio").nth(2).click();
  await dialog.getByRole("button", { name: "Gunakan edisi ini" }).click();

  // router.push berjalan asinkron, jadi URL ditunggu dulu sebelum dibaca.
  await expect(page).toHaveURL(/edition=ed-/);
  const chosen = new URL(page.url()).searchParams.get("edition");
  expect(chosen).toBeTruthy();

  // Dibuka lagi TANPA parameter edisi: yang diingat dipulihkan.
  await page.goto("/book/laskar-pelangi");
  await expect(page).toHaveURL(new RegExp(`edition=${chosen}`));
});

test("ingatan edisi tidak bocor ke karya lain", async ({ page }) => {
  await page.goto("/book/laskar-pelangi?edition=ed-lp-4");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("The Rainbow Troops");

  await page.goto("/book/1984");
  await expect(page.getByRole("heading", { level: 1 })).not.toContainText("Rainbow");
});

test("pencarian terakhir muncul di beranda dan bisa dihapus (R-17)", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("searchbox").fill("binatangisme");
  await page.getByRole("searchbox").press("Enter");
  await expect(page.getByRole("article").first()).toBeVisible();

  await page.goto("/");
  const chip = page.getByRole("link", { name: "binatangisme", exact: true });
  await expect(chip).toBeVisible();

  await page.getByRole("button", { name: "Hapus pencarian binatangisme" }).click();
  await expect(chip).toBeHidden();
});

test("log aktivitas mencatat alur pencarian sampai simpan (bagian 30)", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.removeItem("gr:v1:events"));

  await page.goto("/search?q=binatangisme");
  await page.getByRole("article").first().getByRole("heading").getByRole("link").click();

  await page.getByRole("button", { name: /Ganti edisi/ }).click();
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: /Ingin Dibaca|Sedang Dibaca|Selesai Dibaca/ }).click();
  await page.getByRole("menuitemradio", { name: "Ingin Dibaca" }).click();

  const names = (await readEvents(page)).map((event) => event.name);
  for (const expected of [
    "search_submitted",
    "result_clicked",
    "edition_selector_opened",
    "shelf_saved",
  ]) {
    expect(names, `event ${expected} tidak tercatat`).toContain(expected);
  }
});

test("pencarian tanpa hasil mencatat empty state yang muncul", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.removeItem("gr:v1:events"));

  await page.goto("/search?q=zzzqqqxxx");
  await expect(page.locator("[data-empty-state]")).toBeVisible();

  const names = (await readEvents(page)).map((event) => event.name);
  expect(names).toContain("search_no_result");
  expect(names).toContain("empty_state_shown");
});

test("log bisa dilihat dan direset dari halaman Tentang project", async ({ page }) => {
  await page.goto("/search?q=laskar");

  // Telemetry ditulis di effect setelah hidrasi. Menunggu hasil tampil saja
  // tidak cukup, karena HTML sudah dirender server sebelum effect berjalan.
  // Yang ditunggu adalah event benar-benar tertulis ke storage.
  await page.waitForFunction(() => {
    const raw = window.localStorage.getItem("gr:v1:events");
    return !!raw && raw.includes("search_submitted");
  });

  await page.goto("/about");

  await expect(page.getByRole("button", { name: /Unduh log/ })).toBeEnabled();
  await expect(page.getByRole("table")).toBeVisible();

  await page.getByRole("button", { name: "Tandai mulai task" }).click();
  await expect(page.getByRole("table")).toContainText("task_marker");

  await page.getByRole("button", { name: "Reset data demo" }).click();
  await page.getByRole("button", { name: "Ya, hapus semua data demo" }).click();

  await expect(page.getByRole("button", { name: /Unduh log \(0\)/ })).toBeVisible();
});
