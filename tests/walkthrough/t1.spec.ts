import { expect, test } from "@playwright/test";

/**
 * Rekaman walkthrough task T1 (RnD 32.2 dan deliverable 7).
 *
 * "Kamu tahu ada buku berjudul The Rainbow Troops. Cari versi Bahasa
 * Indonesianya dan simpan ke rak."
 *
 * Jeda sengaja dibuat panjang supaya hasilnya bisa diikuti mata, bukan
 * supaya testnya lulus. Berkas ini tidak ikut di suite verifikasi.
 */

const BEAT = 1100;

test("T1: dari judul Inggris sampai tersimpan sebagai edisi Indonesia", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(BEAT);

  // Langkah 1: kolom pencarian sudah terlihat, tanpa perlu scroll.
  const search = page.getByRole("searchbox");
  await search.click();
  await search.pressSequentially("the rainbow troops", { delay: 65 });
  await page.waitForTimeout(BEAT / 2);
  await search.press("Enter");

  // Langkah 2: badge bahasa dan alasan kecocokan terbaca langsung di hasil.
  const card = page.getByRole("article").first();
  await expect(card).toBeVisible();
  await expect(card).toContainText("Cocok dengan judul Inggris:");
  await page.waitForTimeout(BEAT * 2);

  // Langkah 3: buka buku. Edisi Bahasa Indonesia sudah menjadi edisi terpilih.
  await card.getByRole("heading").getByRole("link").click();
  await expect(page.getByText("Edisi terpilih", { exact: true })).toBeVisible();
  await page.waitForTimeout(BEAT * 2);

  // Membandingkan edisi tanpa berpindah halaman.
  await page.getByRole("button", { name: /Ganti edisi/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.waitForTimeout(BEAT * 2);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(BEAT);

  // Menyimpan, dengan konfirmasi edisi sebelum aksi dijalankan.
  await page.getByRole("button", { name: /Ingin Dibaca|Sedang Dibaca|Selesai Dibaca/ }).click();
  await expect(page.getByText(/Akan disimpan sebagai/)).toBeVisible();
  await page.waitForTimeout(BEAT * 2);

  await page.getByRole("menuitemradio", { name: "Ingin Dibaca" }).click();
  await expect(page.getByRole("status").first()).toContainText("Disimpan sebagai Ingin Dibaca");
  await page.waitForTimeout(BEAT * 2);

  // Rak menyebut edisi yang disimpan, bukan hanya judul karyanya.
  await page.getByRole("link", { name: "Rak Saya" }).click();
  await page.getByRole("tab", { name: /Ingin Dibaca/ }).click();
  await expect(page.getByRole("listitem").first()).toBeVisible();
  await page.waitForTimeout(BEAT * 3);
});
