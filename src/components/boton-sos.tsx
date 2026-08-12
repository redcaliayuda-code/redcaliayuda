"use client";

import { useState } from "react";

const CONTACTOS = [
  { nombre: "Emergencias", numero: "123", icono: "🚨" },
  { nombre: "Bomberos", numero: "119", icono: "🚒" },
  { nombre: "Cruz Roja", numero: "132", icono: "🏥" },
  { nombre: "Defensa Civil", numero: "144", icono: "🛡️" },
  { nombre: "Gestion del Riesgo", numero: "112", icono: "📋" },
  { nombre: "Policia", numero: "112", icono: "🚔" },
];

export function BotonSOS() {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      {/* Overlay */}
      {abierto && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setAbierto(false)}
        />
      )}

      {/* Panel */}
      {abierto && (
        <div className="fixed bottom-20 right-4 z-50 w-72 animar-entrada">
          <div className="rounded-2xl border border-borde bg-superficie shadow-xl">
            <div className="border-b border-borde px-4 py-3">
              <div className="text-sm font-bold text-alerta">Numeros de emergencia</div>
              <div className="text-xs text-texto-suave">Toca para llamar directamente</div>
            </div>
            <div className="p-2 space-y-1">
              {CONTACTOS.map((c) => (
                <a
                  key={c.numero + c.nombre}
                  href={`tel:${c.numero}`}
                  className="toque-activo flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-fondo"
                >
                  <span className="text-lg">{c.icono}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{c.nombre}</div>
                  </div>
                  <div className="text-lg font-bold text-acento">{c.numero}</div>
                </a>
              ))}
            </div>
            <div className="border-t border-borde p-3">
              <a
                href="/recursos"
                className="block text-center text-xs text-acento hover:underline"
              >
                Ver todos los recursos de emergencia →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Boton flotante */}
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        className={`fixed bottom-5 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all toque-activo ${
          abierto
            ? "bg-texto text-superficie rotate-45"
            : "bg-alerta text-white pulso"
        }`}
        aria-label="Numeros de emergencia"
      >
        {abierto ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-6 w-6">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <span className="text-lg font-black">SOS</span>
        )}
      </button>
    </>
  );
}
