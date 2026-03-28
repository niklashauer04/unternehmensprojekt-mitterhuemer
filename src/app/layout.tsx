import type { Metadata } from "next";
import { IBM_Plex_Mono, Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mitterhuemer Konfigurator",
  description: "Digitaler standbeinbasierter Projektkonfigurator fuer Mitterhuemer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${sora.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
