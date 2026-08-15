"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui";

type Necesidad = {
  id: string;
  codigo: string;
  categoria: string;
  descripcion: string;
  prioridad: string;
  estadoResolucion: string;
  personasAfectadas: number;
  ninos: number;
  adultosMayores: number;
  zona: string;
  ciudad: string;
  direccion: string;
  contactoNombre: string;
  contactoCelular: string;
  lat: number;
  lng: number;
  cantidad: string;
  createdAt: string;
};

const CAT_ICON: Record<string, string> = {
  AGUA: "💧", ALIMENTOS: "🍚", MEDICAMENTOS: "💊", HIGIENE: "🧴",
  PANALES: "👶", REFUGIO: "🏠", COBIJAS: "🛏️", CARPAS: "⛺",
  LINTERNAS: "🔦", HERRAMIENTAS: "🔧", ATENCION_MEDICA: "🏥",
  ATENCION_PSICOLOGICA: "🧠", ATENCION_VETERINARIA: "🐾",
  TRANSPORTE: "🚗", ALOJAMIENTO: "🏡", EVACUACION: "🚨",
  DESAPARECIDOS: "🔍", OTRO: "📋",
};

const CAT_NOMBRE: Record<string, string> = {
  AGUA: "Agua", ALIMENTOS: "Alimentos", MEDICAMENTOS: "Medicamentos",
  HIGIENE: "Higiene", PANALES: "Pañales", REFUGIO: "Refugio",
  COBIJAS: "Cobijas", CARPAS: "Carpas", LINTERNAS: "Linternas",
  HERRAMIENTAS: "Herramientas", ATENCION_MEDICA: "Atención médica",
  ATENCION_PSICOLOGICA: "Psicológica", ATENCION_VETERINARIA: "Veterinaria",
  TRANSPORTE: "Transporte", ALOJAMIENTO: "Alojamiento",
  EVACUACION: "Evacuación", DESAPARECIDOS: "Desaparecidos", OTRO: "Otro",
};

const PRIO_TONO: Record<string, "alerta" | "aviso" | "acento" | "ok"> = {
  P1: "alerta", P2: "aviso", P3: "acento", P4: "ok",
};

const PRIO_LABEL: Record<string, string> = {
  P1: "VIDA", P2: "SUPERVIVENCIA", P3: "RECUPERACIÓN", P4: "APOYO",
};

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDist(metros: number): string {
  if (metros < 1000) return `${Math.round(metros)}m`;
  return `${(metros / 1000).toFixed(1)}km`;
}

function haceCuantoCorto(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.round(ms / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `${min}min`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h}h`;
  return `${Math.round(h / 24)}d`;
}

export function CercaMapa({ necesidades }: { necesidades: Necesidad[] }) {
  const [miLat, setMiLat] = useState<number | null>(null);
  const [miLng, setMiLng] = useState<number | null>(null);
  const [detectando, setDetectando] = useState(false);
  const [error, setError] = useState("");
  const [precision, setPrecision] = useState<number | null>(null);
  const [filtroCat, setFiltroCat] = useState<string>("all");

  const detectar = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización.");
      return;
    }
    setDetectando(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMiLat(pos.coords.latitude);
        setMiLng(pos.coords.longitude);
        setPrecision(Math.round(pos.coords.accuracy));
        setDetectando(false);
      },
      (err) => {
        setDetectando(false);
        if (err.code === err.PERMISSION_DENIED) {
          setError("Permiso de ubicación denegado. Actívalo en configuración.");
        } else {
          setError("No se pudo determinar tu ubicación.");
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }, []);

  const ubicado = miLat != null && miLng != null;

  const filtradas = filtroCat === "all" ? necesidades : necesidades.filter((n) => n.categoria === filtroCat);

  const ordenadas = ubicado
    ? filtradas
        .map((n) => ({ ...n, distancia: haversine(miLat, miLng, n.lat, n.lng) }))
        .sort((a, b) => a.distancia - b.distancia)
    : filtradas.map((n) => ({ ...n, distancia: null as number | null }));

  const categoriasDisponibles = [...new Set(necesidades.map((n) => n.categoria))].sort();

  return (
    <main className="min-h-screen safe-bottom">
      <header className="sticky top-0 z-10 border-b border-borde bg-superficie/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-sm font-bold tracking-tight text-acento">
            Collab x Mindo
          </Link>
          <nav className="flex items-center gap-3 text-xs">
            <Link href="/necesidades" className="text-texto-suave hover:text-texto">Todas</Link>
            <Link href="/quiero-ayudar" className="toque-activo rounded-lg bg-acento px-3 py-1.5 text-xs font-semibold text-superficie">
              Registrarme
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Cerca de ti</h1>
        <p className="mt-1 text-sm text-texto-suave">
          Necesidades ordenadas por distancia desde tu ubicación.
        </p>

        {/* Boton GPS */}
        <button
          type="button"
          onClick={detectar}
          disabled={detectando}
          className={`toque-activo mt-4 flex w-full items-center justify-center gap-3 rounded-xl px-4 py-4 text-sm font-semibold transition ${
            ubicado
              ? "border-2 border-ok bg-ok-suave text-ok"
              : "border-2 border-acento bg-acento-suave text-acento"
          } disabled:opacity-50`}
        >
          {detectando ? (
            <>
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" />
              </svg>
              Detectando tu ubicación...
            </>
          ) : ubicado ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              Ubicación detectada {precision != null && `(±${precision}m)`} — toca para actualizar
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
              </svg>
              Detectar mi ubicación
            </>
          )}
        </button>

        {error && (
          <div className="mt-3 rounded-xl border border-alerta/30 bg-alerta-suave px-4 py-3 text-sm text-alerta">
            {error}
          </div>
        )}

        {/* Filtro por categoria */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFiltroCat("all")}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              filtroCat === "all" ? "bg-acento text-superficie" : "bg-superficie-elevada text-texto-suave hover:text-texto"
            }`}
          >
            Todas ({necesidades.length})
          </button>
          {categoriasDisponibles.map((cat) => {
            const count = necesidades.filter((n) => n.categoria === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setFiltroCat(filtroCat === cat ? "all" : cat)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  filtroCat === cat ? "bg-acento text-superficie" : "bg-superficie-elevada text-texto-suave hover:text-texto"
                }`}
              >
                {CAT_ICON[cat] || "📋"} {CAT_NOMBRE[cat] || cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Mapa si hay ubicacion */}
        {ubicado && (
          <div className="mt-4 overflow-hidden rounded-xl border border-borde">
            <iframe
              title="Tu ubicación"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${miLng - 0.015}%2C${miLat - 0.01}%2C${miLng + 0.015}%2C${miLat + 0.01}&layer=mapnik&marker=${miLat}%2C${miLng}`}
              className="h-48 w-full"
              style={{ border: "none" }}
            />
          </div>
        )}

        {/* Stats */}
        {ubicado && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-alerta-suave p-3 text-center">
              <div className="text-xl font-bold text-alerta">
                {ordenadas.filter((n) => n.distancia != null && n.distancia < 1000).length}
              </div>
              <div className="text-xs text-texto-suave">&lt; 1km</div>
            </div>
            <div className="rounded-xl bg-aviso-suave p-3 text-center">
              <div className="text-xl font-bold text-aviso">
                {ordenadas.filter((n) => n.distancia != null && n.distancia < 5000).length}
              </div>
              <div className="text-xs text-texto-suave">&lt; 5km</div>
            </div>
            <div className="rounded-xl bg-acento-suave p-3 text-center">
              <div className="text-xl font-bold text-acento">{ordenadas.length}</div>
              <div className="text-xs text-texto-suave">{filtroCat !== "all" ? CAT_NOMBRE[filtroCat] : "Total"}</div>
            </div>
          </div>
        )}

        {!ubicado && !detectando && (
          <div className="mt-8 rounded-xl border border-borde bg-superficie p-8 text-center">
            <div className="text-3xl">📍</div>
            <p className="mt-3 text-sm font-medium">Activa tu GPS</p>
            <p className="mt-1 text-xs text-texto-suave">
              Toca el botón de arriba para ver las necesidades más cercanas a ti.
            </p>
          </div>
        )}

        {/* Lista */}
        {(ubicado || necesidades.length > 0) && ubicado && (
          <div className="mt-4 space-y-3 escalonar">
            {ordenadas.map((n) => (
              <article
                key={n.id}
                className="rounded-xl border border-borde bg-superficie p-4 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-lg">{CAT_ICON[n.categoria] ?? "📋"}</span>
                      <span className="text-sm font-bold">{CAT_NOMBRE[n.categoria] ?? n.categoria}</span>
                      <Badge tono={PRIO_TONO[n.prioridad]}>
                        {n.prioridad} {PRIO_LABEL[n.prioridad]}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-texto-suave line-clamp-2">{n.descripcion}</p>
                    {n.cantidad && (
                      <p className="mt-1 text-xs font-medium text-acento">Cantidad: {n.cantidad}</p>
                    )}
                  </div>
                  {n.distancia != null && (
                    <div className="shrink-0 rounded-lg bg-acento-suave px-2.5 py-1.5 text-center">
                      <div className="text-sm font-bold text-acento">{formatDist(n.distancia)}</div>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-texto-suave">
                  {n.direccion && <span>{n.direccion}</span>}
                  {n.zona && <span>Zona: {n.zona}</span>}
                  <span>{n.personasAfectadas} persona{n.personasAfectadas !== 1 ? "s" : ""}</span>
                  {n.ninos > 0 && <span>👶 {n.ninos}</span>}
                  {n.adultosMayores > 0 && <span>👴 {n.adultosMayores}</span>}
                  <span>{haceCuantoCorto(n.createdAt)}</span>
                </div>

                {/* Acciones */}
                <div className="mt-3 flex gap-2">
                  <a
                    href={`https://wa.me/57${n.contactoCelular}?text=${encodeURIComponent(
                      `Hola ${n.contactoNombre}, soy voluntario de Collab x Mindo. Vi tu necesidad de ${(CAT_NOMBRE[n.categoria] ?? n.categoria).toLowerCase()} en ${n.zona || n.ciudad}. ¿Cómo puedo ayudarte?`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="toque-activo flex items-center gap-1.5 rounded-lg bg-ok px-3 py-2 text-xs font-semibold text-superficie"
                  >
                    💬 WhatsApp
                  </a>
                  <a
                    href={`tel:${n.contactoCelular}`}
                    className="toque-activo flex items-center gap-1.5 rounded-lg border border-borde px-3 py-2 text-xs font-medium"
                  >
                    📞 Llamar
                  </a>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${n.lat},${n.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="toque-activo flex items-center gap-1.5 rounded-lg border border-borde px-3 py-2 text-xs font-medium"
                  >
                    🗺️ Ruta
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}

        {ubicado && ordenadas.length === 0 && (
          <div className="mt-8 rounded-xl border border-borde bg-superficie p-8 text-center">
            <div className="text-3xl">✓</div>
            <p className="mt-3 text-sm font-medium">No hay necesidades con GPS activas</p>
            <p className="mt-1 text-xs text-texto-suave">
              Todas las necesidades geolocalizadas han sido atendidas.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
