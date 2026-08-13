"use client";

import { useState, useRef } from "react";

type Punto = {
  id: string;
  codigo: string;
  categoria: string;
  prioridad: string;
  lat: number;
  lng: number;
  zona: string;
  personasAfectadas: number;
  descripcion: string;
};

type VoluntarioCerca = {
  id: string;
  codigo: string;
  nombre: string;
  celular: string;
  tipoAyuda: string;
  descripcion: string;
  vehiculo: string;
  lat: number;
  lng: number;
  zona: string;
};

const PRIORIDAD_COLOR: Record<string, string> = {
  P1: "#ef4444", P2: "#f59e0b", P3: "#14b8a6", P4: "#22c55e",
};

const PRIORIDAD_LABEL: Record<string, string> = {
  P1: "VIDA", P2: "SUPERVIVENCIA", P3: "RECUPERACIÓN", P4: "APOYO",
};

const CAT_LABEL: Record<string, string> = {
  AGUA: "Agua", ALIMENTOS: "Alimentos", MEDICAMENTOS: "Medicamentos",
  HIGIENE: "Higiene", PANALES: "Pañales", REFUGIO: "Refugio",
  COBIJAS: "Cobijas", CARPAS: "Carpas", LINTERNAS: "Linternas",
  HERRAMIENTAS: "Herramientas", ATENCION_MEDICA: "Médica",
  ATENCION_PSICOLOGICA: "Psicológica", ATENCION_VETERINARIA: "Veterinaria",
  TRANSPORTE: "Transporte", ALOJAMIENTO: "Alojamiento",
  EVACUACION: "Evacuación", DESAPARECIDOS: "Desaparecidos", OTRO: "Otro",
};

const TIPO_LABEL: Record<string, string> = {
  VOLUNTARIO: "Voluntario", ESPECIALISTA: "Especialista",
  RECURSOS: "Recursos", LOGISTICA: "Logistica",
};

const TIPO_ICON: Record<string, string> = {
  VOLUNTARIO: "🤝", ESPECIALISTA: "⚕️", RECURSOS: "📦", LOGISTICA: "🚛",
};

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function distLabel(m: number) {
  return m < 1000 ? `${Math.round(m)}m` : `${(m / 1000).toFixed(1)}km`;
}

export function MapaNecesidades({
  puntos,
  voluntarios = [],
}: {
  puntos: Punto[];
  voluntarios?: VoluntarioCerca[];
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const mapaRef = useRef<HTMLDivElement>(null);

  const puntosConGeo = puntos.filter((p) => p.lat && p.lng);
  const selectedPunto = selected ? puntosConGeo.find((p) => p.id === selected) : null;

  const voluntariosCercanos = selectedPunto
    ? voluntarios
        .map((v) => ({
          ...v,
          distancia: haversine(selectedPunto.lat, selectedPunto.lng, v.lat, v.lng),
        }))
        .filter((v) => v.distancia <= 15000)
        .sort((a, b) => a.distancia - b.distancia)
    : [];

  if (puntosConGeo.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-lg border border-borde">
        <iframe
          title="Mapa de Colombia"
          src="https://www.openstreetmap.org/export/embed.html?bbox=-76.7%2C3.3%2C-75.4%2C5.1&layer=mapnik"
          className="h-64 w-full sm:h-80"
          style={{ border: "none" }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <p className="rounded-lg bg-superficie px-4 py-2 text-sm text-texto-suave shadow-lg">
            Las necesidades con GPS apareceran aqui en el mapa
          </p>
        </div>
      </div>
    );
  }

  const allPts = puntosConGeo.map((p) => ({ lat: p.lat, lng: p.lng }));
  const minLat = Math.min(...allPts.map((p) => p.lat)) - 0.005;
  const maxLat = Math.max(...allPts.map((p) => p.lat)) + 0.005;
  const minLng = Math.min(...allPts.map((p) => p.lng)) - 0.008;
  const maxLng = Math.max(...allPts.map((p) => p.lng)) + 0.008;

  const mapSrc = selectedPunto
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${selectedPunto.lng - 0.003}%2C${selectedPunto.lat - 0.003}%2C${selectedPunto.lng + 0.003}%2C${selectedPunto.lat + 0.003}&layer=mapnik&marker=${selectedPunto.lat}%2C${selectedPunto.lng}`
    : `https://www.openstreetmap.org/export/embed.html?bbox=${minLng}%2C${minLat}%2C${maxLng}%2C${maxLat}&layer=mapnik&marker=${puntosConGeo[0].lat}%2C${puntosConGeo[0].lng}`;

  function handleClick(p: Punto) {
    setSelected(p.id);
    mapaRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  return (
    <div className="space-y-3">
      <div ref={mapaRef} className="relative overflow-hidden rounded-lg border-2 border-borde transition-colors duration-300" style={selectedPunto ? { borderColor: "var(--color-acento)" } : {}}>
        <iframe
          key={selected ?? "overview"}
          title={selectedPunto ? `Ubicacion: ${selectedPunto.zona}` : "Mapa de necesidades"}
          src={mapSrc}
          className="h-64 w-full sm:h-80"
          style={{ border: "none" }}
        />
        {selectedPunto && (
          <div className="flex items-center justify-between bg-acento-suave px-3 py-2">
            <div className="flex items-center gap-2 text-xs font-medium text-acento">
              <span>{selectedPunto.codigo}</span>
              <span>{CAT_LABEL[selectedPunto.categoria] ?? selectedPunto.categoria}</span>
              <span>— {selectedPunto.zona}</span>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="rounded-lg bg-acento/10 px-2 py-1 text-xs font-medium text-acento transition hover:bg-acento/20"
            >
              Ver todo
            </button>
          </div>
        )}
        {!selectedPunto && (
          <div className="bg-superficie-elevada px-3 py-1.5 text-xs text-texto-suave">
            Toca una necesidad para ver su ubicacion y voluntarios cercanos
          </div>
        )}
      </div>

      {/* Voluntarios cercanos al punto seleccionado */}
      {selectedPunto && voluntariosCercanos.length > 0 && (
        <div className="rounded-xl border border-ok/30 bg-ok-suave/30 p-4">
          <div className="flex items-center gap-2">
            <span className="text-base">🤝</span>
            <span className="text-xs font-bold text-ok">
              {voluntariosCercanos.length} voluntario{voluntariosCercanos.length !== 1 ? "s" : ""} cerca de {selectedPunto.codigo}
            </span>
          </div>
          <div className="mt-2 space-y-1.5">
            {voluntariosCercanos.map((v) => (
              <a
                key={v.id}
                href={`https://wa.me/57${v.celular}?text=${encodeURIComponent(
                  `Hola ${v.nombre}, hay una necesidad cerca de ti (${selectedPunto.codigo}):\n` +
                  `📋 ${CAT_LABEL[selectedPunto.categoria] ?? selectedPunto.categoria} — ${selectedPunto.descripcion.slice(0, 80)}\n` +
                  `📍 ${selectedPunto.zona}\n` +
                  `⚡ ${selectedPunto.prioridad} ${PRIORIDAD_LABEL[selectedPunto.prioridad]}\n` +
                  `🗺️ https://www.google.com/maps?q=${selectedPunto.lat},${selectedPunto.lng}\n` +
                  `\nPuedes ayudar?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 rounded-lg border border-borde bg-superficie p-2.5 transition hover:border-ok"
              >
                <div className="flex items-center gap-2">
                  <span>{TIPO_ICON[v.tipoAyuda] ?? "🤝"}</span>
                  <div>
                    <span className="text-xs font-medium">{v.nombre}</span>
                    <span className="ml-1.5 text-xs text-texto-suave">
                      {TIPO_LABEL[v.tipoAyuda] ?? v.tipoAyuda}
                      {v.vehiculo !== "NINGUNO" && ` · 🚗 ${v.vehiculo}`}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full bg-acento-suave px-1.5 py-0.5 text-xs font-bold text-acento">
                    {distLabel(v.distancia)}
                  </span>
                  <span className="text-ok">💬</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {selectedPunto && voluntariosCercanos.length === 0 && voluntarios.length > 0 && (
        <div className="rounded-xl border border-borde bg-superficie p-3 text-center text-xs text-texto-suave">
          No hay voluntarios con GPS registrados cerca de esta necesidad.
        </div>
      )}

      {/* Cards de necesidades */}
      <div className="grid gap-2 sm:grid-cols-2">
        {puntosConGeo.map((p) => {
          const isSelected = p.id === selected;
          const nearbyCount = voluntarios.filter(
            (v) => haversine(p.lat, p.lng, v.lat, v.lng) <= 15000
          ).length;

          return (
            <div
              key={p.id}
              onClick={() => handleClick(p)}
              className={`flex items-start gap-3 rounded-lg border border-borde bg-superficie p-3 cursor-pointer transition hover:border-acento hover:shadow-md ${
                isSelected ? "ring-2 ring-acento shadow-md" : ""
              }`}
              style={{ borderLeftColor: PRIORIDAD_COLOR[p.prioridad], borderLeftWidth: 3 }}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: PRIORIDAD_COLOR[p.prioridad] }}>
                {p.prioridad}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{CAT_LABEL[p.categoria] ?? p.categoria}</span>
                  <span className="text-xs text-texto-suave">{p.codigo}</span>
                </div>
                <p className="mt-0.5 text-xs text-texto-suave line-clamp-1">{p.descripcion}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-texto-suave">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3 w-3">
                    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {p.zona}{p.personasAfectadas > 1 ? ` · ${p.personasAfectadas} personas` : ""}
                  {nearbyCount > 0 && (
                    <span className="rounded-full bg-ok-suave px-1.5 py-0.5 text-xs font-bold text-ok">
                      🤝 {nearbyCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
