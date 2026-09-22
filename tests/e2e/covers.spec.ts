import { expect, test } from "@playwright/test";

/**
 * RnD D-06: cover adalah SVG placeholder yang digenerate dan diprarender
 * saat build, bukan gambar eksternal.
 */

test("route cover menyajikan SVG", async ({ request }) => {
  const response = await request.get("/covers/ed-lp-1");

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/svg+xml");

  const body = await response.text();
  expect(body).toContain("<svg");
  expect(body).toContain("Bentang Pustaka");
  expect(body).toContain("2005");
});

test("cover edisi yang judulnya berbeda memakai judul edisi itu", async ({ request }) => {
  const body = await (await request.get("/covers/ed-af-2")).text();
  expect(body).toContain("Binatangisme");
  expect(body).toContain("Mizan Pustaka");
});

test("id edisi yang tidak ada menghasilkan 404", async ({ request }) => {
  const response = await request.get("/covers/ed-tidak-ada");
  expect(response.status()).toBe(404);
});
