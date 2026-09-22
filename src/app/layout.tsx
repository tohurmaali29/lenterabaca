import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";

import { AppShell } from "@/components/shell/AppShell";

import "./globals.css";

// RnD 18.3: dua keluarga font. Sans untuk antarmuka, serif HANYA untuk
// judul karya dan judul edisi lewat class .font-title.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "LenteraBaca",
    template: "%s | LenteraBaca",
  },
  description:
    "Temukan edisi terjemahan Indonesia dari buku yang ingin kamu baca, tanpa harus menggali halaman edisi.",
};

// RnD D-03: locale UI adalah Bahasa Indonesia.
// Judul berbahasa lain diberi atribut lang sendiri di tingkat komponen (21.2).
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${inter.variable} ${sourceSerif.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
