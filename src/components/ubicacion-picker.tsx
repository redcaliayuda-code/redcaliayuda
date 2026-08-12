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

  const detectar = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización.");
      return;
    }

    setDetectando(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let dir = direccion;
        let zon = zona;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&accept-language=es`,
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
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [direccion, zona, onCoordsChange]);

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={detectar}
        disabled={detectando}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-acento bg-acento-suave px-4 py-3 text-sm font-medium text-acento transition hover:opacity-80 disabled:opacity-50 sm:w-auto"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        </svg>
        {detectando ? "Detectando…" : "Detectar mi ubicación"}
      </button>

      {error && <Aviso tono="alerta">{error}</Aviso>}

      <div className="overflow-hidden rounded-lg border border-borde">
        <iframe
          title="Mapa de ubicación"
          src={
            lat != null && lng != null
              ? `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.005}%2C${lat - 0.003}%2C${lng + 0.005}%2C${lat + 0.003}&layer=mapnik&marker=${lat}%2C${lng}`
              : `https://www.openstreetmap.org/export/embed.html?bbox=-76.58%2C3.38%2C-76.49%2C3.48&layer=mapnik`
          }
          className="h-48 w-full sm:h-56"
          style={{ border: "none" }}
        />
        {lat != null && lng != null && (
          <div className="flex items-center gap-2 bg-superficie-elevada px-3 py-1.5 text-xs text-texto-suave">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5 shrink-0 text-acento">
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>Ubicación detectada: {lat.toFixed(5)}, {lng.toFixed(5)}</span>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo etiqueta="Barrio o zona">
          <input
            name="zona"
            className={claseInput}
            placeholder="Chapinero"
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
            defaultValue="Cali"
          />
        </Campo>
      </div>
      <Campo etiqueta="Dirección" ayuda="Incluye piso o apartamento si aplica.">
        <input
          name="direccion"
          className={claseInput}
          placeholder="Calle 63 # 9-40, apto 302"
          value={direccion}
          onChange={(e) => onDireccionChange(e.target.value)}
          required
        />
      </Campo>
    </div>
  );
}
