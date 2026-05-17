import type { Metadata } from "next";
import { IBM_Plex_Mono, Figtree } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mitterhuemer Konfigurator",
  description: "Digitaler Projektkonfigurator für Energie-, Heizungs- und Photovoltaikprojekte von Mitterhuemer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${figtree.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
