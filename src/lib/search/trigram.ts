/**
 * Dipakai untuk typo dan ejaan yang meleset sedikit, misalnya "laskar pelagi".
 * Dibuat sendiri, bukan memakai library (keputusan D-07), karena ini kecil dan
 * bisa diuji unit.
 */

/** Ambang minimum agar dianggap mirip (RnD 26.6). */
export const TRIGRAM_THRESHOLD = 0.72;

export function trigrams(value: string): Set<string> {
  // Padding membuat awal dan akhir kata ikut diperhitungkan.
  const padded = `  ${value} `;
  const result = new Set<string>();
  for (let index = 0; index < padded.length - 2; index += 1) {
    result.add(padded.slice(index, index + 3));
  }
  return result;
}

/** Koefisien Dice: 2 kali irisan dibagi jumlah ukuran kedua himpunan. */
export function diceCoefficient(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;

  const left = trigrams(a);
  const right = trigrams(b);

  let shared = 0;
  for (const gram of left) {
    if (right.has(gram)) shared += 1;
  }

  return (2 * shared) / (left.size + right.size);
}

/** Versi yang memakai himpunan trigram yang sudah dihitung sebelumnya. */
export function diceFromSets(left: Set<string>, right: Set<string>): number {
  if (left.size === 0 || right.size === 0) return 0;

  let shared = 0;
  for (const gram of left) {
    if (right.has(gram)) shared += 1;
  }

  return (2 * shared) / (left.size + right.size);
}
