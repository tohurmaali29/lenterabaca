import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const STORAGE_MESSAGE =
  "Akses storage hanya lewat src/lib/storage.ts (RnD 27.2, aturan Satu pintu). " +
  "Membaca localStorage langsung di komponen menyebabkan hydration mismatch dan " +
  "melewati validasi skema serta penanganan kuota.";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    rules: {
      // RnD 27.2: satu pintu ke localStorage.
      "no-restricted-globals": [
        "error",
        { name: "localStorage", message: STORAGE_MESSAGE },
        { name: "sessionStorage", message: STORAGE_MESSAGE },
      ],
      // no-restricted-globals tidak menangkap bentuk window.localStorage.
      "no-restricted-properties": [
        "error",
        { object: "window", property: "localStorage", message: STORAGE_MESSAGE },
        { object: "window", property: "sessionStorage", message: STORAGE_MESSAGE },
        { object: "globalThis", property: "localStorage", message: STORAGE_MESSAGE },
      ],
    },
  },

  // Satu-satunya file yang boleh menyentuh Web Storage.
  {
    files: ["src/lib/storage.ts"],
    rules: {
      "no-restricted-globals": "off",
      "no-restricted-properties": "off",
    },
  },

  // Prettier terakhir, supaya aturan format tidak bertabrakan dengan lint.
  prettier,

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
