import type { Metadata } from "next";
import "./globals.css";
import { BotonSOS } from "@/components/boton-sos";

export const metadata: Metadata = {
  title: "HumansCol — Ayuda Humanitaria Coordinada",
  description:
    "La ayuda correcta, en el lugar correcto. Plataforma de coordinación humanitaria para las zonas afectadas por el terremoto en Colombia.",
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
