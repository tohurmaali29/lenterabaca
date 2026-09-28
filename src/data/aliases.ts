import type { TitleAlias, WorkId } from "@/lib/types";

/**
 * Ini data KURASI MANUAL, bukan hasil algoritma. Untuk pasangan judul yang
 * tidak punya satu kata pun yang sama, misalnya "Animal Farm" dan
 * "Binatangisme", tidak ada cara otomatis menghubungkannya tanpa sumber
 * data eksternal.
 *
 * Judul yang sudah ada di BookWork.titles tidak perlu diulang di sini.
 * Tabel ini hanya untuk sebutan lain yang dipakai orang saat mencari:
 * judul tidak resmi, singkatan, transliterasi, dan judul terjemahan lama.
 */
export const titleAliases: TitleAlias[] = [
  {
    workId: "w-laskar-pelangi" as WorkId,
    aliases: ["rainbow troops", "laskar pelangi 1"],
  },
  {
    workId: "w-bumi-manusia" as WorkId,
    aliases: ["this earth of mankind", "tetralogi buru 1", "minke"],
  },
  {
    workId: "w-cantik-itu-luka" as WorkId,
    aliases: ["beauty is a wound", "dewi ayu"],
  },
  {
    workId: "w-harry-potter-1" as WorkId,
    aliases: [
      "harry potter 1",
      "hp1",
      "harry potter and the sorcerers stone",
      "harry potter batu bertuah",
    ],
  },
  {
    workId: "w-le-petit-prince" as WorkId,
    aliases: ["the little prince", "pangeran cilik", "little prince"],
  },
  {
    // Alias yang paling menjelaskan kenapa tabel ini perlu:
    // tidak ada satu kata pun yang sama antara judul asli dan terjemahannya.
    workId: "w-animal-farm" as WorkId,
    aliases: ["binatangisme", "peternakan hewan", "republik hewan"],
  },
  {
    workId: "w-1984" as WorkId,
    aliases: ["nineteen eighty four", "1984 orwell", "seribu sembilan ratus delapan puluh empat"],
  },
  {
    workId: "w-norwegian-wood" as WorkId,
    aliases: ["noruwei no mori", "hutan norwegia"],
  },
  {
    workId: "w-kafka-on-the-shore" as WorkId,
    aliases: ["umibe no kafuka", "kafka di tepi pantai", "dunia kafka"],
  },
  {
    workId: "w-the-alchemist" as WorkId,
    aliases: ["o alquimista", "sang alkemis", "si alkemis"],
  },
  {
    workId: "w-pride-and-prejudice" as WorkId,
    aliases: ["keangkuhan dan prasangka", "p and p"],
  },
  {
    workId: "w-the-hobbit" as WorkId,
    aliases: ["hobbit atau pergi dan kembali", "there and back again"],
  },
  {
    workId: "w-old-man-and-the-sea" as WorkId,
    aliases: ["lelaki tua dan laut", "orang tua dan laut", "santiago"],
  },
  {
    workId: "w-kokoro" as WorkId,
    aliases: ["kokoro soseki", "sensei"],
  },
  {
    workId: "w-remains-of-the-day" as WorkId,
    aliases: ["les vestiges du jour", "sisa sisa hari", "stevens"],
  },
];
