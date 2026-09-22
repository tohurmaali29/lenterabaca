/**
 * Generator cover placeholder. Sumber: RnD v2.1 keputusan D-06 (sementara).
 *
 * Tidak memakai gambar cover asli untuk menghindari masalah hak cipta pada
 * project yang dipublikasikan. Cover tetap harus membedakan edisi secara
 * visual, karena membandingkan edisi adalah inti produk ini, jadi warna
 * diturunkan secara deterministik dari id edisi: edisi yang sama selalu
 * menghasilkan cover yang sama, edisi berbeda hampir selalu berbeda.
 */

export const COVER_WIDTH = 400;
export const COVER_HEIGHT = 600;

export interface CoverInput {
  editionId: string;
  title: string;
  publisherName: string;
  publishedYear: number;
  language: string;
  editionLabel?: string;
}

/** Palet netral yang berdiri sendiri, tidak memakai token tema aplikasi,
 *  karena SVG ini disajikan sebagai berkas terpisah. */
const PALETTE = [
  { bg: "#24483e", panel: "#2f5d50", ink: "#f2f7f4" },
  { bg: "#2c3c5a", panel: "#3a4f76", ink: "#eff3fa" },
  { bg: "#5a3a2c", panel: "#764c3a", ink: "#faf2ee" },
  { bg: "#41305a", panel: "#553f76", ink: "#f5f0fa" },
  { bg: "#5a2c39", panel: "#763a4b", ink: "#faeef1" },
  { bg: "#3f4a24", panel: "#535f2f", ink: "#f4f7ee" },
  { bg: "#1f3f4a", panel: "#2b535f", ink: "#eef5f7" },
  { bg: "#4a3f1f", panel: "#5f532b", ink: "#f7f4ee" },
] as const;

/** FNV-1a. Dipilih karena pendek, deterministik, dan tidak butuh dependency. */
function hash(input: string): number {
  let value = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    value ^= input.charCodeAt(index);
    value = Math.imul(value, 0x01000193);
  }
  return value >>> 0;
}

function escapeXml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** SVG tidak membungkus teks sendiri, jadi pemenggalan dilakukan di sini. */
function wrap(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }
    if (current) lines.push(current);
    current = word;
    if (lines.length === maxLines) break;
  }

  if (current && lines.length < maxLines) lines.push(current);

  if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) {
    const last = lines[maxLines - 1];
    lines[maxLines - 1] = `${last.slice(0, Math.max(0, maxChars - 1)).trimEnd()}...`;
  }

  return lines;
}

/** Teks alternatif cover. RnD 21.1: menyebut judul, penerbit, dan tahun. */
export function coverAlt(input: Pick<CoverInput, "title" | "publisherName" | "publishedYear">) {
  return `Sampul ${input.title}, edisi ${input.publisherName} ${input.publishedYear}`;
}

export function coverUrl(editionId: string): string {
  return `/covers/${editionId}`;
}

export function renderCoverSvg(input: CoverInput): string {
  const theme = PALETTE[hash(input.editionId) % PALETTE.length];
  const titleLines = wrap(input.title, 18, 5);
  const titleTop = 150;
  const lineHeight = 42;

  const titleMarkup = titleLines
    .map(
      (line, index) =>
        `<text x="40" y="${titleTop + index * lineHeight}" class="t">${escapeXml(line)}</text>`,
    )
    .join("\n    ");

  const label = input.editionLabel
    ? `<text x="40" y="${COVER_HEIGHT - 96}" class="s">${escapeXml(input.editionLabel)}</text>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${COVER_WIDTH} ${COVER_HEIGHT}" width="${COVER_WIDTH}" height="${COVER_HEIGHT}" role="img" aria-label="${escapeXml(coverAlt(input))}">
  <style>
    .t { font: 700 34px Georgia, 'Times New Roman', serif; fill: ${theme.ink}; }
    .s { font: 400 17px system-ui, sans-serif; fill: ${theme.ink}; opacity: .78; }
    .l { font: 600 15px system-ui, sans-serif; fill: ${theme.bg}; letter-spacing: .08em; }
  </style>
  <rect width="${COVER_WIDTH}" height="${COVER_HEIGHT}" fill="${theme.bg}"/>
  <rect x="0" y="0" width="${COVER_WIDTH}" height="96" fill="${theme.panel}"/>
  <rect x="0" y="${COVER_HEIGHT - 8}" width="${COVER_WIDTH}" height="8" fill="${theme.panel}"/>
  <rect x="${COVER_WIDTH - 88}" y="28" width="60" height="28" rx="6" fill="${theme.ink}"/>
  <text x="${COVER_WIDTH - 58}" y="47" class="l" text-anchor="middle">${escapeXml(
    input.language.toUpperCase(),
  )}</text>
  <g>
    ${titleMarkup}
  </g>
  ${label}
  <text x="40" y="${COVER_HEIGHT - 64}" class="s">${escapeXml(input.publisherName)}</text>
  <text x="40" y="${COVER_HEIGHT - 40}" class="s">${input.publishedYear}</text>
</svg>
`;
}
