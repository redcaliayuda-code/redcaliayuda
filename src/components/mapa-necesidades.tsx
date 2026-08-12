"use client";

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

const PRIORIDAD_COLOR: Record<string, string> = {
  P1: "#ef4444",
  P2: "#f59e0b",
  P3: "#14b8a6",
  P4: "#22c55e",
};

const PRIORIDAD_LABEL: Record<string, string> = {
  P1: "VIDA",
  P2: "SUPERVIVENCIA",
  P3: "RECUPERACIÓN",
  P4: "APOYO",
};

const CAT_LABEL: Record<string, string> = {
  AGUA: "Agua",
  ALIMENTOS: "Alimentos",
  MEDICAMENTOS: "Medicamentos",
  HIGIENE: "Higiene",
  PANALES: "Pañales",
  REFUGIO: "Refugio",
  COBIJAS: "Cobijas",
  CARPAS: "Carpas",
  LINTERNAS: "Linternas",
  HERRAMIENTAS: "Herramientas",
  ATENCION_MEDICA: "Médica",
  ATENCION_PSICOLOGICA: "Psicológica",
  ATENCION_VETERINARIA: "Veterinaria",
  TRANSPORTE: "Transporte",
  ALOJAMIENTO: "Alojamiento",
  EVACUACION: "Evacuación",
  DESAPARECIDOS: "Desaparecidos",
  OTRO: "Otro",
};

export function MapaNecesidades({ puntos }: { puntos: Punto[] }) {
  const centerLat = 4.1;
  const centerLng = -76.0;

  const puntosConGeo = puntos.filter((p) => p.lat && p.lng);

  if (puntosConGeo.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-lg border border-borde">
        <iframe
          title="Mapa de Colombia"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=-76.7%2C3.3%2C-75.4%2C5.1&layer=mapnik`}
          className="h-64 w-full sm:h-80"
          style={{ border: "none" }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <p className="rounded-lg bg-superficie px-4 py-2 text-sm text-texto-suave shadow-lg">
            Las necesidades con GPS aparecerán aquí en el mapa
          </p>
        </div>
      </div>
    );
  }

  const minLat = Math.min(...puntosConGeo.map((p) => p.lat)) - 0.005;
  const maxLat = Math.max(...puntosConGeo.map((p) => p.lat)) + 0.005;
  const minLng = Math.min(...puntosConGeo.map((p) => p.lng)) - 0.008;
  const maxLng = Math.max(...puntosConGeo.map((p) => p.lng)) + 0.008;

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-lg border border-borde">
        <iframe
          title="Mapa de necesidades"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${minLng}%2C${minLat}%2C${maxLng}%2C${maxLat}&layer=mapnik&marker=${puntosConGeo[0].lat}%2C${puntosConGeo[0].lng}`}
          className="h-64 w-full sm:h-80"
          style={{ border: "none" }}
        />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {puntosConGeo.map((p) => (
          <div
            key={p.id}
            className="flex items-start gap-3 rounded-lg border border-borde bg-superficie p-3"
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
                {p.zona} · {p.personasAfectadas} persona{p.personasAfectadas !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
