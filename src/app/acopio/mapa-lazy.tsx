"use client";

import { useState } from "react";

export function MapaLazy({ nombre, lat, lng }: { nombre: string; lat: number; lng: number }) {
  const [mostrar, setMostrar] = useState(false);

  if (!mostrar) {
    return (
      <button
        type="button"
        onClick={() => setMostrar(true)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-borde bg-superficie-elevada px-4 py-3 text-xs font-medium text-texto-suave transition hover:border-acento hover:text-acento"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
          <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        Ver mapa de {nombre}
      </button>
    );
  }

  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-borde">
      <iframe
        title={`Mapa ${nombre}`}
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.004}%2C${lat - 0.003}%2C${lng + 0.004}%2C${lat + 0.003}&layer=mapnik&marker=${lat}%2C${lng}`}
        className="h-40 w-full"
        style={{ border: "none" }}
      />
    </div>
  );
}
