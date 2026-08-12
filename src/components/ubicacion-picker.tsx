"use client";

import { useState, useCallback } from "react";
import { Aviso, Campo, claseInput } from "./ui";

type Props = {
  direccion: string;
  zona: string;
  lat: number | null;
  lng: number | null;
  onDireccionChange: (v: string) => void;
  onZonaChange: (v: string) => void;
  onCoordsChange: (lat: number, lng: number, direccion: string, zona: string) => void;
};

export function UbicacionPicker({
  direccion,
  zona,
  lat,
  lng,
  onDireccionChange,
  onZonaChange,
  onCoordsChange,
}: Props) {
  const [detectando, setDetectando] = useState(false);
  const [error, setError] = useState("");
  const [precision, setPrecision] = useState<number | null>(null);

  const detectar = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización.");
      return;
    }

    setDetectando(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setPrecision(Math.round(accuracy));
        let dir = direccion;
        let zon = zona;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&accept-language=es&zoom=18`,
          );
          const data = await res.json();
          const a = data.address ?? {};
          const road = a.road ?? a.pedestrian ?? "";
          const num = a.house_number ?? "";
          dir = [road, num].filter(Boolean).join(" ") || data.display_name?.split(",").slice(0, 2).join(",").trim() || direccion;
          zon = a.suburb ?? a.neighbourhood ?? a.city_district ?? zona;
        } catch {
          // GPS sin geocoding sigue siendo útil
        }

        onCoordsChange(latitude, longitude, dir, zon);
        setDetectando(false);
      },
      (err) => {
        setDetectando(false);
        if (err.code === err.PERMISSION_DENIED) {
          setError("Permiso de ubicación denegado. Actívalo en la configuración de tu navegador.");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setError("No se pudo determinar tu ubicación. Intenta de nuevo.");
        } else {
          setError("La detección de ubicación tardó demasiado.");
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }, [direccion, zona, onCoordsChange]);

  const detectado = lat != null && lng != null;

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={detectar}
        disabled={detectando}
        className={`toque-activo flex w-full items-center justify-center gap-3 rounded-xl px-4 py-4 text-sm font-semibold transition ${
          detectado
            ? "border-2 border-ok bg-ok-suave text-ok"
            : "border-2 border-acento bg-acento-suave text-acento"
        } disabled:opacity-50`}
      >
        {detectando ? (
          <>
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" />
            </svg>
            Detectando ubicación...
          </>
        ) : detectado ? (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            Ubicación detectada — toca para actualizar
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
            </svg>
            Detectar mi ubicación con GPS
          </>
        )}
      </button>

      {error && <Aviso tono="alerta">{error}</Aviso>}

      <div className="overflow-hidden rounded-xl border border-borde">
        <iframe
          title="Mapa de ubicación"
          src={
            detectado
              ? `https://www.openstreetmap.org/export/embed.html?bbox=${lng! - 0.003}%2C${lat! - 0.002}%2C${lng! + 0.003}%2C${lat! + 0.002}&layer=mapnik&marker=${lat}%2C${lng}`
              : `https://www.openstreetmap.org/export/embed.html?bbox=-76.7%2C3.3%2C-75.4%2C5.1&layer=mapnik`
          }
          className="h-48 w-full sm:h-56"
          style={{ border: "none" }}
        />
        {detectado && (
          <div className="flex items-center justify-between bg-superficie-elevada px-3 py-2">
            <div className="flex items-center gap-2 text-xs text-ok">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 shrink-0">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="font-medium">{lat!.toFixed(6)}, {lng!.toFixed(6)}</span>
            </div>
            {precision != null && (
              <span className="text-xs text-texto-suave">
                ±{precision}m
              </span>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Campo etiqueta="Barrio o zona">
          <input
            name="zona"
            className={claseInput}
            placeholder="Siloé, Aguablanca, Centro..."
            value={zona}
            onChange={(e) => onZonaChange(e.target.value)}
            required
          />
        </Campo>
        <Campo etiqueta="Ciudad / Municipio">
          <input
            name="ciudad"
            className={claseInput}
            placeholder="Cali, Buenaventura, Tumaco…"
            defaultValue=""
          />
        </Campo>
      </div>
      <Campo etiqueta="Dirección exacta" ayuda="Entre más precisa, más rápido llega la ayuda. Incluye referencias (cerca de..., frente a...).">
        <input
          name="direccion"
          className={claseInput}
          placeholder="Cra 50 con Calle 1, casa azul frente a la tienda"
          value={direccion}
          onChange={(e) => onDireccionChange(e.target.value)}
          required
        />
      </Campo>
    </div>
  );
}
