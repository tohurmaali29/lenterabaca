import { defineConfig, devices } from "@playwright/test";

const PORT = 3105;
const BASE_URL = `http://127.0.0.1:${PORT}`;

/**
 * Konfigurasi terpisah untuk merekam walkthrough (RnD deliverable 7).
 * Dijalankan manual dengan: npm run walkthrough
 */
export default defineConfig({
  testDir: "./tests/walkthrough",
  testMatch: ["**/*.spec.ts"],
  outputDir: "./walkthrough-output",
  reporter: "list",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: BASE_URL,
    video: { mode: "on", size: { width: 1280, height: 800 } },
    viewport: { width: 1280, height: 800 },
  },
  webServer: {
    command: `npm run build && npm run start -- --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
