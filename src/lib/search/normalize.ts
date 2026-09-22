/**
 * Pipeline normalisasi pencarian. Sumber: RnD v2.1 bagian 26.1.
 *
 * Tujuannya membuat "Saint-Exupéry", "saint exupery", dan "Saint Exupery"
 * menjadi satu bentuk yang sama, supaya pencocokan tidak gagal hanya karena
 * diakritik, tanda hubung, atau huruf besar.
 */

/** Artikel di awal judul yang diabaikan saat mencocokkan. */
const LEADING_ARTICLES = new Set([
  // Inggris
  "the",
  "a",
  "an",
  // Indonesia
  "sang",
  "si",
  "para",
  "sebuah",
  "suatu",
  // Lain
  "le",
  "la",
  "les",
  "der",
  "die",
  "das",
  "el",
  "o",
]);

export function normalize(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['‘’]/g, "")
    .replace(/[^a-z0-9　-鿿぀-ヿ]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function stripLeadingArticle(value: string): string {
  const parts = value.split(" ");
  if (parts.length > 1 && LEADING_ARTICLES.has(parts[0])) {
    return parts.slice(1).join(" ");
  }
  return value;
}

/** Bentuk judul yang dipakai membandingkan: ternormalisasi tanpa artikel awal. */
export function titleKey(input: string): string {
  return stripLeadingArticle(normalize(input));
}

export function normalizeIsbn(input: string): string {
  return input.replace(/[^0-9xX]/g, "").toUpperCase();
}

/** Query dianggap ISBN bila setelah dibersihkan panjangnya 10 atau 13. */
export function looksLikeIsbn(input: string): boolean {
  const cleaned = normalizeIsbn(input);
  return (cleaned.length === 10 || cleaned.length === 13) && /^[0-9]+[0-9X]$/.test(cleaned);
}

export function tokenize(input: string): string[] {
  const normalized = normalize(input);
  return normalized.length > 0 ? normalized.split(" ") : [];
}
