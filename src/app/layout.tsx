import type { Metadata } from "next";
import "./globals.css";
import { BotonSOS } from "@/components/boton-sos";

export const metadata: Metadata = {
  title: "HumansCol — Ayuda Humanitaria Coordinada",
  description:
    "La ayuda correcta, en el lugar correcto. Plataforma de coordinación humanitaria para las zonas afectadas por el terremoto en Colombia.",
  metadataBase: new URL("https://redcaliayuda.vercel.app"),
  openGraph: {
    title: "HumansCol — Ayuda Humanitaria Coordinada",
    description:
      "Conectamos personas que necesitan ayuda con personas que pueden darla. Con ubicación GPS precisa. 100% gratuita.",
    siteName: "HumansCol",
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HumansCol — Ayuda Humanitaria Coordinada",
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
