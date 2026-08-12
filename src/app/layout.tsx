import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RED CALI — Ayuda Humanitaria Coordinada",
  description:
    "La ayuda correcta, en el lugar correcto. Plataforma de coordinación humanitaria para la zona afectada por el terremoto en Cali y el Pacífico colombiano.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CO">
      <body>{children}</body>
    </html>
  );
}
