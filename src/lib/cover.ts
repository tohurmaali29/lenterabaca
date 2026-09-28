/**
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
  { bg: "#1f4a40", deep: "#123029", accent: "#e8b04a", ink: "#f4f1e8" },
  { bg: "#233a63", deep: "#152440", accent: "#f08a5d", ink: "#eef2fa" },
  { bg: "#7a3b24", deep: "#4f2415", accent: "#f2d17a", ink: "#fbf1e8" },
  { bg: "#3f2d63", deep: "#271a40", accent: "#e9a3c9", ink: "#f4effa" },
  { bg: "#8c2f3c", deep: "#5a1a25", accent: "#f5c26b", ink: "#fbeef0" },
  { bg: "#3c4a1f", deep: "#262f12", accent: "#e6d58a", ink: "#f4f6ea" },
  { bg: "#14505c", deep: "#0b323a", accent: "#f2a93b", ink: "#ecf6f7" },
  { bg: "#e3d6bd", deep: "#c7b596", accent: "#9a3b1d", ink: "#2a2118" },
  { bg: "#d9e2de", deep: "#b7c6bf", accent: "#1f4a40", ink: "#1b2420" },
  { bg: "#1c1d22", deep: "#0f1013", accent: "#e8563f", ink: "#f2efe8" },
] as const;

type CoverTheme = (typeof PALETTE)[number];

/** Motif grafis. Dipilih dari hash terpisah supaya warna dan motif tidak selalu berpasangan. */
const MOTIFS: Array<(theme: CoverTheme) => string> = [
  // Lingkaran konsentris di pojok kanan atas.
  (t) =>
    [220, 170, 120, 70]
      .map(
        (r, i) =>
          `<circle cx="340" cy="120" r="${r}" fill="none" stroke="${t.accent}" stroke-width="${i === 3 ? 22 : 3}" opacity="${0.28 + i * 0.14}"/>`,
      )
      .join(""),
  // Pita garis diagonal.
  (t) =>
    `<g opacity=".55">${Array.from(
      { length: 9 },
      (_, i) =>
        `<rect x="${-200 + i * 70}" y="-40" width="18" height="760" fill="${t.accent}" transform="rotate(28 200 300)"/>`,
    ).join("")}</g>`,
  // Kisi titik di separuh atas.
  (t) =>
    `<g fill="${t.accent}" opacity=".6">${Array.from({ length: 6 }, (_, row) =>
      Array.from(
        { length: 8 },
        (_, col) => `<circle cx="${52 + col * 44}" cy="${48 + row * 40}" r="${row % 2 ? 4 : 6}"/>`,
      ).join(""),
    ).join("")}</g>`,
  // Matahari terbenam: setengah lingkaran besar di atas garis cakrawala.
  (t) =>
    `<circle cx="200" cy="280" r="130" fill="${t.accent}" opacity=".85"/><rect x="0" y="280" width="400" height="140" fill="${t.deep}"/>` +
    [300, 322, 344]
      .map((y) => `<rect x="60" y="${y}" width="280" height="6" fill="${t.accent}" opacity=".5"/>`)
      .join(""),
  // Blok warna bertumpuk.
  (t) =>
    `<rect x="0" y="0" width="400" height="200" fill="${t.deep}"/><rect x="40" y="60" width="140" height="140" fill="${t.accent}" opacity=".9"/><rect x="200" y="100" width="160" height="60" fill="${t.ink}" opacity=".18"/>`,
];

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
  const seed = hash(input.editionId);
  const theme = PALETTE[seed % PALETTE.length];
  const motif = MOTIFS[(seed >>> 8) % MOTIFS.length];

  const titleLines = wrap(input.title, 16, 4);
  const lineHeight = 40;
  const ruleY = 520;
  const titleBottom = ruleY - 28;
  const titleTop = titleBottom - (titleLines.length - 1) * lineHeight;

  const titleMarkup = titleLines
    .map(
      (line, index) =>
        `<text x="44" y="${titleTop + index * lineHeight}" class="t">${escapeXml(line)}</text>`,
    )
    .join("\n    ");

  const publisherSize = input.publisherName.length > 22 ? 12 : 15;
  const footer = [input.publishedYear, input.editionLabel].filter(Boolean).join("  ·  ");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${COVER_WIDTH} ${COVER_HEIGHT}" width="${COVER_WIDTH}" height="${COVER_HEIGHT}" role="img" aria-label="${escapeXml(coverAlt(input))}">
  <style>
    .t { font: 700 36px Georgia, 'Times New Roman', serif; fill: ${theme.ink}; letter-spacing: -.01em; }
    .p { font: 600 15px system-ui, sans-serif; fill: ${theme.ink}; letter-spacing: .12em; text-transform: uppercase; }
    .s { font: 400 15px system-ui, sans-serif; fill: ${theme.ink}; opacity: .72; }
    .l { font: 700 13px system-ui, sans-serif; fill: ${theme.deep}; letter-spacing: .1em; }
  </style>
  <defs>
    <clipPath id="art"><rect width="${COVER_WIDTH}" height="${titleTop - 56}"/></clipPath>
    <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".06"/>
      <stop offset="1" stop-color="#000" stop-opacity=".22"/>
    </linearGradient>
    <linearGradient id="spine" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity=".35"/>
      <stop offset=".6" stop-color="#000" stop-opacity=".08"/>
      <stop offset="1" stop-color="#fff" stop-opacity=".12"/>
    </linearGradient>
  </defs>
  <rect width="${COVER_WIDTH}" height="${COVER_HEIGHT}" fill="${theme.bg}"/>
  <g clip-path="url(#art)">${motif(theme)}</g>
  <rect width="${COVER_WIDTH}" height="${COVER_HEIGHT}" fill="url(#shade)"/>
  <rect x="${COVER_WIDTH - 76}" y="28" width="48" height="24" rx="4" fill="${theme.accent}"/>
  <text x="${COVER_WIDTH - 52}" y="45" class="l" text-anchor="middle">${escapeXml(
    input.language.toUpperCase(),
  )}</text>
  <g>
    ${titleMarkup}
  </g>
  <rect x="44" y="${ruleY}" width="48" height="3" fill="${theme.accent}"/>
  <text x="44" y="${ruleY + 34}" class="p" style="font-size:${publisherSize}px">${escapeXml(input.publisherName)}</text>
  <text x="44" y="${ruleY + 58}" class="s">${escapeXml(footer)}</text>
  <rect width="18" height="${COVER_HEIGHT}" fill="url(#spine)"/>
  <rect x="18" width="1.5" height="${COVER_HEIGHT}" fill="#fff" opacity=".14"/>
</svg>
`;
}
