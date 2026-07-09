import type { Metadata } from "next";
import { Anton, Barlow_Semi_Condensed } from "next/font/google";
import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const barlow = Barlow_Semi_Condensed({
  weight: ["500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Torneo Máster Santa Cruz",
  description: "Sabana, tradición y comunidad. Equipos de Santa Cruz compitiendo jornada a jornada.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${anton.variable} ${barlow.variable}`}>
      <body>{children}</body>
    </html>
  );
}
