"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui";

type Necesidad = {
  id: string;
  codigo: string;
  categoria: string;
  prioridad: string;
  descripcion: string;
  cantidad: string | null;
  personasAfectadas: number;
  ninos: number;
  adultosMayores: number;
  zona: string;
  ciudad: string;
  lat: number | null;
  lng: number | null;
  contactoNombre: string | null;
  contactoCelular: string | null;
  createdAt: string;
};

type Voluntario = {
  id: string;
  codigo: string;
  nombre: string;
  celular: string;
  tipoAyuda: string;
  descripcion: string;
  vehiculo: string;
  capacidadCarga: string;
  disponibilidad: string;
  zona: string;
  ciudad: string;
  lat: number | null;
  lng: number | null;
};

const CAT: Record<string, string> = {
  AGUA: "Agua", ALIMENTOS: "Alimentos", MEDICAMENTOS: "Medicamentos",
  HIGIENE: "Higiene", PANALES: "Pañales", REFUGIO: "Refugio",
  COBIJAS: "Cobijas", CARPAS: "Carpas", LINTERNAS: "Linternas",
  HERRAMIENTAS: "Herramientas", ATENCION_MEDICA: "Atención médica",
  ATENCION_PSICOLOGICA: "Atención psicológica", ATENCION_VETERINARIA: "Veterinaria",
  TRANSPORTE: "Transporte", ALOJAMIENTO: "Alojamiento",
  EVACUACION: "Evacuación", DESAPARECIDOS: "Desaparecidos", OTRO: "Otro",
};

const CAT_ICON: Record<string, string> = {
  AGUA: "💧", ALIMENTOS: "🍚", MEDICAMENTOS: "💊", HIGIENE: "🧴",
  PANALES: "👶", REFUGIO: "🏠", COBIJAS: "🛏️", CARPAS: "⛺",
  LINTERNAS: "🔦", HERRAMIENTAS: "🔧", ATENCION_MEDICA: "🏥",
  ATENCION_PSICOLOGICA: "🧠", ATENCION_VETERINARIA: "🐾",
  TRANSPORTE: "🚗", ALOJAMIENTO: "🏡", EVACUACION: "🚨",
  DESAPARECIDOS: "🔍", OTRO: "📋",
};

const PRIO_LABEL: Record<string, string> = {
  P1: "VIDA", P2: "SUPERVIVENCIA", P3: "RECUPERACIÓN", P4: "APOYO",
};

const PRIO_TONO: Record<string, "alerta" | "aviso" | "acento" | "ok"> = {
  P1: "alerta", P2: "aviso", P3: "acento", P4: "ok",
};

const PRIO_BORDER: Record<string, string> = {
  P1: "border-l-alerta", P2: "border-l-aviso", P3: "border-l-acento", P4: "border-l-ok",
};

const TIPO_LABEL: Record<string, string> = {
  VOLUNTARIO: "Voluntario", ESPECIALISTA: "Especialista",
  RECURSOS: "Recursos", LOGISTICA: "Logistica",
};

const TIPO_ICON: Record<string, string> = {
  VOLUNTARIO: "🤝", ESPECIALISTA: "⚕️", RECURSOS: "📦", LOGISTICA: "🚛",
};

const VEHICULO_LABEL: Record<string, string> = {
  NINGUNO: "", MOTO: "Moto", CARRO: "Carro", CAMIONETA: "Camioneta",
  CAMION: "Camion", BICICLETA: "Bicicleta",
};

function formatFecha(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "ahora";
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `hace ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `hace ${diffD}d`;
  return d.toLocaleDateString("es-CO", { day: "numeric", month: "short" });
}

function buildMapSrc(lat: number, lng: number, zoom: "close" | "overview", allPoints?: { lat: number; lng: number }[]) {
  if (zoom === "close") {
    const pad = 0.003;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - pad}%2C${lat - pad}%2C${lng + pad}%2C${lat + pad}&layer=mapnik&marker=${lat}%2C${lng}`;
  }
  if (allPoints && allPoints.length > 0) {
    const minLat = Math.min(...allPoints.map((p) => p.lat)) - 0.005;
    const maxLat = Math.max(...allPoints.map((p) => p.lat)) + 0.005;
    const minLng = Math.min(...allPoints.map((p) => p.lng)) - 0.008;
    const maxLng = Math.max(...allPoints.map((p) => p.lng)) + 0.008;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${minLng}%2C${minLat}%2C${maxLng}%2C${maxLat}&layer=mapnik&marker=${lat}%2C${lng}`;
  }
  return `https://www.openstreetmap.org/export/embed.html?bbox=-76.7%2C3.3%2C-75.4%2C5.1&layer=mapnik`;
}

export function ListaNecesidades({ necesidades, voluntarios = [] }: { necesidades: Necesidad[]; voluntarios?: Voluntario[] }) {
  const [filtro, setFiltro] = useState<string>("todas");
  const [busqueda, setBusqueda] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const mapaRef = useRef<HTMLDivElement>(null);

  const categoriasConConteo = Object.entries(
    necesidades.reduce<Record<string, number>>((acc, n) => {
      acc[n.categoria] = (acc[n.categoria] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  const porBusqueda = busqueda.trim()
    ? necesidades.filter((n) => {
        const q = busqueda.toLowerCase();
        return n.codigo.toLowerCase().includes(q) ||
          n.zona.toLowerCase().includes(q) ||
          n.descripcion.toLowerCase().includes(q) ||
          n.ciudad.toLowerCase().includes(q);
      })
    : null;

  const filtradas = porBusqueda
    ? porBusqueda
    : filtro === "todas"
      ? necesidades
      : necesidades.filter((n) => n.categoria === filtro);

  const conGeo = filtradas.filter((n) => n.lat != null && n.lng != null);
  const allPoints = conGeo.map((n) => ({ lat: n.lat!, lng: n.lng! }));
  const p1Count = filtradas.filter((n) => n.prioridad === "P1").length;

  const selectedNeed = selected ? conGeo.find((n) => n.id === selected) : null;

  const mapSrc = selectedNeed
    ? buildMapSrc(selectedNeed.lat!, selectedNeed.lng!, "close")
    : conGeo.length > 0
      ? buildMapSrc(conGeo[0].lat!, conGeo[0].lng!, "overview", allPoints)
      : null;

  function handleCardClick(n: Necesidad) {
    if (n.lat == null || n.lng == null) return;
    setSelected(n.id);
    mapaRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  const grouped = filtro === "todas"
    ? categoriasConConteo.map(([cat]) => ({
        cat,
        items: necesidades.filter((n) => n.categoria === cat),
      }))
    : [{ cat: filtro, items: filtradas }];

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Necesidades activas</h1>
      <p className="mt-1 text-sm text-texto-suave">
        {necesidades.length} necesidad{necesidades.length !== 1 ? "es" : ""}
        {p1Count > 0 && filtro === "todas" && !porBusqueda && (
          <span className="ml-2 inline-flex items-center gap-1 text-alerta">
            <span className="pulso inline-block h-2 w-2 rounded-full bg-alerta" />
            {necesidades.filter((n) => n.prioridad === "P1").length} urgente{necesidades.filter((n) => n.prioridad === "P1").length !== 1 ? "s" : ""}
          </span>
        )}
      </p>

      {/* Buscador por codigo */}
      <div className="mt-3 relative">
        <input
          type="text"
          placeholder="Buscar por codigo (ej. NEC-8WTN), zona o descripcion..."
          value={busqueda}
          onChange={(e) => { setBusqueda(e.target.value); setSelected(null); }}
          className="w-full rounded-xl border border-borde bg-superficie px-4 py-3 pl-10 text-sm placeholder:text-texto-suave/50 focus:border-acento focus:outline-none"
        />
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="absolute left-3 top-3.5 h-4 w-4 text-texto-suave">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        {busqueda && (
          <button onClick={() => setBusqueda("")} className="absolute right-3 top-3 rounded-full bg-superficie-elevada px-2 py-0.5 text-xs text-texto-suave hover:text-texto">
            Limpiar
          </button>
        )}
      </div>

      {porBusqueda && (
        <div className="mt-2 text-sm text-acento font-medium">
          {porBusqueda.length} resultado{porBusqueda.length !== 1 ? "s" : ""} para &quot;{busqueda}&quot;
        </div>
      )}

      {/* Filtros por categoria */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollbarWidth: "none" }}>
        <button
          onClick={() => { setFiltro("todas"); setSelected(null); }}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            filtro === "todas"
              ? "bg-acento text-superficie"
              : "border border-borde bg-superficie text-texto-suave hover:border-acento"
          }`}
        >
          Todas ({necesidades.length})
        </button>
        {categoriasConConteo.map(([cat, count]) => (
          <button
            key={cat}
            onClick={() => { setFiltro(cat); setSelected(null); }}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              filtro === cat
                ? "bg-acento text-superficie"
                : "border border-borde bg-superficie text-texto-suave hover:border-acento"
            }`}
          >
            {CAT_ICON[cat] ?? "📋"} {CAT[cat] ?? cat} ({count})
          </button>
        ))}
      </div>

      {/* Mapa interactivo */}
      {mapSrc && (
        <div ref={mapaRef} className="mt-4 overflow-hidden rounded-xl border-2 border-borde transition-colors duration-300" style={selectedNeed ? { borderColor: "var(--color-acento)" } : {}}>
          <iframe
            key={selected ?? `overview-${filtro}`}
            title={selectedNeed ? `Ubicación: ${selectedNeed.zona || selectedNeed.ciudad}` : "Mapa de necesidades"}
            src={mapSrc}
            className="h-56 w-full sm:h-72"
            style={{ border: "none" }}
          />
          {selectedNeed && (
            <div className="bg-acento-suave px-4 py-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs font-medium text-acento">
                    {CAT_ICON[selectedNeed.categoria]} {CAT[selectedNeed.categoria] ?? selectedNeed.categoria}
                    <Badge tono={PRIO_TONO[selectedNeed.prioridad]}>
                      {selectedNeed.prioridad} {PRIO_LABEL[selectedNeed.prioridad]}
                    </Badge>
                    <span className="text-texto-suave">{selectedNeed.codigo}</span>
                  </div>
                  <p className="mt-1 text-sm text-texto line-clamp-3">{selectedNeed.descripcion}</p>
                  <div className="mt-2 flex items-center gap-1 text-xs font-medium text-texto">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5 text-acento">
                      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {selectedNeed.zona || selectedNeed.ciudad}
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="shrink-0 rounded-lg bg-acento/10 px-2 py-1 text-xs font-medium text-acento transition hover:bg-acento/20"
                >
                  Cerrar
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedNeed.contactoCelular && selectedNeed.contactoCelular !== "0000000000" && (
                  <a
                    href={`https://wa.me/57${selectedNeed.contactoCelular}?text=${encodeURIComponent(`Hola, vi tu necesidad ${selectedNeed.codigo} en Collab x Mindo. ¿Cómo te podemos ayudar?`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-ok px-3 py-1.5 text-xs font-semibold text-superficie transition hover:opacity-90"
                    onClick={(e) => e.stopPropagation()}
                  >
                    💬 WhatsApp {selectedNeed.contactoNombre || "contacto"}
                  </a>
                )}
                {selectedNeed.lat && selectedNeed.lng && (
                  <a
                    href={`https://www.google.com/maps?q=${selectedNeed.lat},${selectedNeed.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-acento px-3 py-1.5 text-xs font-semibold text-superficie transition hover:opacity-90"
                    onClick={(e) => e.stopPropagation()}
                  >
                    📍 Abrir en Google Maps
                  </a>
                )}
              </div>
            </div>
          )}
          {!selectedNeed && conGeo.length > 0 && (
            <div className="bg-superficie-elevada px-3 py-1.5 text-xs text-texto-suave">
              Toca una necesidad para ver su ubicacion exacta en el mapa
            </div>
          )}
        </div>
      )}

      {/* Necesidades agrupadas por categoria */}
      {filtradas.length === 0 ? (
        <div className="mt-10 rounded-xl border border-borde bg-superficie p-8 text-center">
          <div className="text-3xl">{porBusqueda ? "🔍" : "✓"}</div>
          <p className="mt-3 text-sm font-medium">
            {porBusqueda ? `No se encontro "${busqueda}"` : "No hay necesidades en esta categoria"}
          </p>
          {porBusqueda && (
            <p className="mt-1 text-xs text-texto-suave">Verifica el codigo o intenta con otra palabra</p>
          )}
        </div>
      ) : porBusqueda ? (
        <div className="mt-4 space-y-3">
          {filtradas.map((n) => (
            <NeedCard key={n.id} n={n} selected={selected} onSelect={handleCardClick} />
          ))}
        </div>
      ) : filtro !== "todas" ? (
        <div className="mt-4 space-y-3">
          {filtradas.map((n) => (
            <NeedCard key={n.id} n={n} selected={selected} onSelect={handleCardClick} />
          ))}
        </div>
      ) : (
        <div className="mt-4 space-y-6">
          {grouped.map(({ cat, items }) => (
            <section key={cat}>
              <div className="sticky top-14 z-[5] flex items-center gap-2 bg-fondo/95 backdrop-blur-sm py-2">
                <span className="text-lg">{CAT_ICON[cat] ?? "📋"}</span>
                <h2 className="text-sm font-bold">{CAT[cat] ?? cat}</h2>
                <span className="rounded-full bg-superficie-elevada px-2 py-0.5 text-xs font-bold text-texto-suave">
                  {items.length}
                </span>
              </div>
              <div className="space-y-2">
                {items.slice(0, 5).map((n) => (
                  <NeedCard key={n.id} n={n} selected={selected} onSelect={handleCardClick} compact />
                ))}
                {items.length > 5 && (
                  <button
                    onClick={() => setFiltro(cat)}
                    className="w-full rounded-lg border border-borde bg-superficie px-3 py-2 text-xs font-medium text-acento transition hover:border-acento"
                  >
                    Ver las {items.length} necesidades de {(CAT[cat] ?? cat).toLowerCase()}
                  </button>
                )}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Voluntarios disponibles */}
      {voluntarios.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2">
            <span className="text-lg">🤝</span>
            <h2 className="text-lg font-bold tracking-tight">Ayuda disponible</h2>
            <span className="rounded-full bg-ok-suave px-2 py-0.5 text-xs font-bold text-ok">
              {voluntarios.length}
            </span>
          </div>
          <p className="mt-1 text-xs text-texto-suave">
            Voluntarios registrados listos para ayudar. Toca para contactar por WhatsApp.
          </p>
          <div className="mt-3 space-y-2">
            {voluntarios.map((v) => {
              const icon = TIPO_ICON[v.tipoAyuda] ?? "🤝";
              const tipo = TIPO_LABEL[v.tipoAyuda] ?? v.tipoAyuda;
              const vehiculo = VEHICULO_LABEL[v.vehiculo];
              const hasGeo = v.lat != null && v.lng != null;

              return (
                <a
                  key={v.id}
                  href={`https://wa.me/57${v.celular}?text=${encodeURIComponent(
                    `Hola ${v.nombre}, vi que estas registrado como voluntario en Collab x Mindo. Necesitamos tu ayuda. Puedes coordinar?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="toque-activo flex items-center gap-3 rounded-xl border border-borde bg-superficie p-4 transition hover:border-ok hover:shadow-md"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ok-suave text-lg">
                    {icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold">{v.nombre}</span>
                      <span className="rounded-full bg-acento-suave px-2 py-0.5 text-xs font-medium text-acento">
                        {tipo}
                      </span>
                      {vehiculo && (
                        <span className="rounded-full bg-aviso-suave px-2 py-0.5 text-xs font-medium text-aviso">
                          🚗 {vehiculo}
                        </span>
                      )}
                    </div>
                    {v.descripcion && (
                      <p className="mt-0.5 text-xs text-texto-suave line-clamp-1">{v.descripcion}</p>
                    )}
                    <div className="mt-1 flex items-center gap-2 text-xs text-texto-suave">
                      <span>{v.zona || v.ciudad}</span>
                      {hasGeo && <span className="text-ok">(GPS)</span>}
                      <span>· {v.disponibilidad}</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-ok text-lg">💬</div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Link
          href="/necesito-ayuda"
          className="toque-activo flex items-center justify-center gap-2 rounded-xl border-2 border-alerta bg-alerta-suave px-4 py-3.5 text-sm font-semibold text-alerta transition"
        >
          Reportar una necesidad
        </Link>
        <Link
          href="/quiero-ayudar"
          className="toque-activo flex items-center justify-center gap-2 rounded-xl bg-acento px-4 py-3.5 text-sm font-semibold text-superficie transition"
        >
          Quiero ayudar
        </Link>
      </div>
    </>
  );
}

function NeedCard({
  n,
  selected,
  onSelect,
  compact,
}: {
  n: Necesidad;
  selected: string | null;
  onSelect: (n: Necesidad) => void;
  compact?: boolean;
}) {
  const hasGeo = n.lat != null && n.lng != null;
  const isSelected = n.id === selected;
  return (
    <article
      onClick={() => onSelect(n)}
      className={`rounded-xl border border-borde border-l-4 ${PRIO_BORDER[n.prioridad]} bg-superficie ${compact ? "p-3" : "p-4"} transition ${
        hasGeo ? "cursor-pointer hover:border-acento hover:shadow-md" : ""
      } ${isSelected ? "ring-2 ring-acento shadow-md" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {!compact && <span className="text-lg">{CAT_ICON[n.categoria] ?? "📋"}</span>}
            <span className={`${compact ? "text-xs" : "text-sm"} font-semibold`}>
              {compact ? n.zona || n.ciudad : CAT[n.categoria] ?? n.categoria}
            </span>
            <Badge tono={PRIO_TONO[n.prioridad]}>
              {n.prioridad} {PRIO_LABEL[n.prioridad]}
            </Badge>
          </div>
          <p className={`mt-1 ${compact ? "text-xs" : "text-sm"} text-texto-suave line-clamp-2`}>{n.descripcion}</p>
          {compact && (
            <div className="mt-1 text-xs text-texto-suave">{formatFecha(n.createdAt)}</div>
          )}
          {n.cantidad && !compact && (
            <p className="mt-1 text-xs font-medium text-acento">Cantidad: {n.cantidad}</p>
          )}
        </div>
        {n.contactoCelular && n.contactoCelular !== "0000000000" ? (
          <a
            href={`https://wa.me/57${n.contactoCelular}?text=${encodeURIComponent(`Hola, vi tu necesidad ${n.codigo} en Collab x Mindo. ¿Cómo te podemos ayudar?`)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 rounded-lg bg-ok-suave p-2 text-ok transition hover:bg-ok hover:text-superficie"
            title={`WhatsApp ${n.contactoNombre || "contacto"}`}
          >
            💬
          </a>
        ) : hasGeo ? (
          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition ${
            isSelected ? "bg-acento text-superficie" : "bg-acento-suave text-acento"
          }`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
        ) : null}
      </div>
      {!compact && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-texto-suave">
          <span className="flex items-center gap-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {n.zona || n.ciudad}
            {hasGeo && <span className="text-ok"> (GPS)</span>}
          </span>
          {n.contactoNombre && <span>👤 {n.contactoNombre}</span>}
          {n.personasAfectadas > 1 && <span>{n.personasAfectadas} personas</span>}
          {n.ninos > 0 && <span>👶 {n.ninos} niño{n.ninos !== 1 ? "s" : ""}</span>}
          {n.adultosMayores > 0 && <span>👴 {n.adultosMayores}</span>}
          <span>{formatFecha(n.createdAt)}</span>
        </div>
      )}
    </article>
  );
}
