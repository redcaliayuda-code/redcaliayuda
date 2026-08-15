import type { Metadata } from "next";
import "./globals.css";
import { BotonSOS } from "@/components/boton-sos";

export const metadata: Metadata = {
  title: "Collab x Mindo — Ayuda Humanitaria Coordinada",
  description:
    "La ayuda correcta, en el lugar correcto. Plataforma de coordinación humanitaria para las zonas afectadas por el terremoto en Colombia.",
  metadataBase: new URL("https://redcaliayuda-psi.vercel.app"),
  openGraph: {
    title: "Collab x Mindo — Ayuda Humanitaria Coordinada",
    description:
      "Conectamos personas que necesitan ayuda con personas que pueden darla. Con ubicación GPS precisa. 100% gratuita.",
    siteName: "Collab x Mindo",
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Collab x Mindo — Ayuda Humanitaria Coordinada",
    description:
      "Conectamos personas que necesitan ayuda con personas que pueden darla. Con ubicación GPS precisa.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CO">
      <body>
        {children}
        <BotonSOS />
      </body>
    </html>
  );
}
