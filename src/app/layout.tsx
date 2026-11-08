import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Mouvement } from "@/components/Mouvement";
import "./globals.css";

const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], style: ["normal", "italic"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "La Toque Dorée · Foie gras maison",
  description: "Commandez votre foie gras artisanal : classique ou en croûte de poivre. 10 achetés = 1 offert.",
};

export const viewport: Viewport = { themeColor: "#6b1e2e" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className={`${playfair.variable} ${inter.variable} font-sans antialiased`}>
        <Mouvement>{children}</Mouvement>
      </body>
    </html>
  );
}
