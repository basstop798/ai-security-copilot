import type { Metadata, Viewport } from "next";
import { Inter, Oxanium } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const oxanium = Oxanium({ subsets: ["latin"], variable: "--font-oxanium", display: "swap" });

const description =
  "Boutique de jeux vidéo à Blida : PS5, PS4, Xbox Series, Nintendo Switch, manettes, casques et abonnements PS Plus. Vente, achat, échange et réparation. Ouvert tous les jours.";

export const metadata: Metadata = {
  title: "Sony Game Blida · Consoles, jeux et PS Plus",
  description,
  openGraph: {
    title: "Sony Game Blida",
    description,
    locale: "fr_DZ",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#050a18",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${inter.variable} ${oxanium.variable}`}>
      <body className="min-h-dvh font-sans antialiased">{children}</body>
    </html>
  );
}
