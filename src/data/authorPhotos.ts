/**
 * Foto penulis dari Wikimedia Commons, hanya berkas berlisensi bebas.
 * Atribusi ditampilkan di halaman /about sesuai syarat lisensinya.
 * Penulis yang tidak ada di sini memakai inisial.
 */

export interface AuthorPhoto {
  file: string;
  artist: string;
  license: string;
  source: string;
}

export const authorPhotos: Record<string, AuthorPhoto> = {
  "andrea-hirata": {
    file: "/authors/andrea-hirata.jpg",
    artist: "JulianArbi2",
    license: "CC BY-SA 3.0",
    source: "https://commons.wikimedia.org/wiki/File:Andrea_Hirata.jpg",
  },
  "antoine-de-saint-exupery": {
    file: "/authors/antoine-de-saint-exupery.jpg",
    artist: "Tidak diketahui",
    license: "Public domain",
    source: "https://commons.wikimedia.org/wiki/File:Antoine_de_Saint-Euxpery_(1920).jpg",
  },
  "dee-lestari": {
    file: "/authors/dee-lestari.jpg",
    artist: "Neal Harrison",
    license: "CC BY 3.0",
    source: "https://commons.wikimedia.org/wiki/File:Dewi_Lestari.JPG",
  },
  "eka-kurniawan": {
    file: "/authors/eka-kurniawan.jpg",
    artist: "Peter Norrthon",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Eka_Kurniawan,_DSC_0071B.jpg",
  },
  "ernest-hemingway": {
    file: "/authors/ernest-hemingway.jpg",
    artist: "Lloyd Arnold",
    license: "Public domain",
    source: "https://commons.wikimedia.org/wiki/File:ErnestHemingway.jpg",
  },
  "george-orwell": {
    file: "/authors/george-orwell.jpg",
    artist: "Branch of the National Union of Journalists (BNUJ)",
    license: "Public domain",
    source: "https://commons.wikimedia.org/wiki/File:George_Orwell_press_photo.jpg",
  },
  "haruki-murakami": {
    file: "/authors/haruki-murakami.jpg",
    artist: "Ministerio Cultura y Patrimonio from Quito, Ecuador",
    license: "Public domain",
    source:
      "https://commons.wikimedia.org/wiki/File:Conversatorio_Haruki_Murakami_(12_de_12)_(45747009452)_(cropped).jpg",
  },
  "j-k-rowling": {
    file: "/authors/j-k-rowling.jpg",
    artist: "Daniel Ogren",
    license: "CC BY 2.0",
    source: "https://commons.wikimedia.org/wiki/File:J._K._Rowling_2010.jpg",
  },
  "j-r-r-tolkien": {
    file: "/authors/j-r-r-tolkien.jpg",
    artist:
      "Unknown photo studio commissioned by Tolkien's students 1925/6 (private communication from Catherine McIlwaine, Tolkien Archivist, Bodleian Library)",
    license: "Public domain",
    source: "https://commons.wikimedia.org/wiki/File:J._R._R._Tolkien,_ca._1925.jpg",
  },
  "jane-austen": {
    file: "/authors/jane-austen.jpg",
    artist: "Cassandra Austen",
    license: "Public domain",
    source: "https://commons.wikimedia.org/wiki/File:CassandraAusten-JaneAusten(c.1810)_hires.jpg",
  },
  "kazuo-ishiguro": {
    file: "/authors/kazuo-ishiguro.jpg",
    artist: "Martin Kraft",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:MKr377543_Kazuo_Ishiguro_(A_Pale_View_of_Hills,_Cannes_2025).jpg",
  },
  "min-jin-lee": {
    file: "/authors/min-jin-lee.jpg",
    artist: "Fffm&pachinkofan",
    license: "CC BY-SA 4.0",
    source: "https://commons.wikimedia.org/wiki/File:Min_Jin_Lee_Headshot.jpg",
  },
  "natsume-soseki": {
    file: "/authors/natsume-soseki.jpg",
    artist: "Ogawa Kazumasa",
    license: "Public domain",
    source: "https://commons.wikimedia.org/wiki/File:Natsume_Soseki_photo.jpg",
  },
  "paulo-coelho": {
    file: "/authors/paulo-coelho.jpg",
    artist: "Lula Oficial",
    license: "CC BY-SA 2.0",
    source: "https://commons.wikimedia.org/wiki/File:Paulo_Coelho,_June_2024.jpg",
  },
  "pramoedya-ananta-toer": {
    file: "/authors/pramoedya-ananta-toer.jpg",
    artist: "Deppen",
    license: "Public domain",
    source:
      "https://commons.wikimedia.org/wiki/File:Pramoedya_Ananta_Toer_Kesusastraan_Indonesia_Modern_dalam_Kritik_dan_Essai_1_(1962)_p136.jpg",
  },
  "yuval-noah-harari": {
    file: "/authors/yuval-noah-harari.jpg",
    artist: "Martin Kraft",
    license: "CC BY-SA 4.0",
    source:
      "https://commons.wikimedia.org/wiki/File:MKr364751_Yuval_Noah_Harari_(Frankfurter_Buchmesse_2024).jpg",
  },
};
