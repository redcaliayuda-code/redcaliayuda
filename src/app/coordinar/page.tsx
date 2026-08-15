"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type Need = {
  id: string;
  codigo: string;
  categoria: string;
  prioridad: string;
  descripcion: string;
  zona: string;
  ciudad: string;
  lat: number | null;
  lng: number | null;
  estadoResolucion: string;
  estadoVerificacion: string;
  contactoNombre: string;
  contactoCelular: string;
  createdAt: string;
};

type Vol = {
  id: string;
  codigo: string;
  nombre: string;
  celular: string;
  tipoAyuda: string;
  descripcion: string;
  vehiculo: string;
  lat: number | null;
  lng: number | null;
  zona: string;
  disponibilidad: string;
};

type Mission = {
  id: string;
  codigo: string;
  estado: string;
  prioridad: string;
  need: { codigo: string; zona: string };
  volunteer: { nombre: string } | null;
};

const CAT: Record<string, string> = {
  AGUA: "Agua", ALIMENTOS: "Alimentos", MEDICAMENTOS: "Medicamentos",
  HIGIENE: "Higiene", REFUGIO: "Refugio", HERRAMIENTAS: "Herramientas",
  ATENCION_MEDICA: "Medica", ATENCION_PSICOLOGICA: "Psicologica",
  EVACUACION: "Evacuacion", TRANSPORTE: "Transporte", OTRO: "Otro",
};

const PRIO: Record<string, { label: string; color: string }> = {
  P1: { label: "VIDA", color: "#ef4444" },
  P2: { label: "SUPERVIVENCIA", color: "#f59e0b" },
  P3: { label: "RECUPERACION", color: "#3b82f6" },
  P4: { label: "APOYO", color: "#22c55e" },
};

const ESTADO_LABEL: Record<string, string> = {
  PENDIENTE: "Pendiente", EN_PROCESO: "En proceso", RESUELTO: "Resuelto", CERRADO: "Cerrado",
};

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function distLabel(m: number) {
  return m < 1000 ? `${Math.round(m)}m` : `${(m / 1000).toFixed(1)}km`;
}

export default function CoordinarPage() {
  const [code, setCode] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [needs, setNeeds] = useState<Need[]>([]);
  const [volunteers, setVolunteers] = useState<Vol[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);

  const [selectedNeed, setSelectedNeed] = useState<string | null>(null);
  const [tab, setTab] = useState<"necesidades" | "voluntarios" | "misiones">("necesidades");
  const [filterPrio, setFilterPrio] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [actionMsg, setActionMsg] = useState("");

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/coordinar", {
      headers: { "x-coord-code": code },
    });
    if (!res.ok) return;
    const data = await res.json();
    setNeeds(data.needs);
    setVolunteers(data.volunteers);
    setMissions(data.missions);
  }, [code]);

  async function handleLogin() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/coordinar", {
      headers: { "x-coord-code": code },
    });
    if (res.ok) {
      setAuthed(true);
      const data = await res.json();
      setNeeds(data.needs);
      setVolunteers(data.volunteers);
      setMissions(data.missions);
    } else {
      setError("Codigo incorrecto");
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!authed) return;
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [authed, fetchData]);

  async function doAction(accion: string, payload: Record<string, string>) {
    setActionMsg("");
    const res = await fetch("/api/coordinar", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-coord-code": code },
      body: JSON.stringify({ accion, ...payload }),
    });
    const data = await res.json();
    if (data.ok) {
      setActionMsg("Listo");
      await fetchData();
      setTimeout(() => setActionMsg(""), 3000);
    } else {
      setActionMsg(`Error: ${data.error}`);
    }
  }

  if (!authed) {
    return (
      <main className="min-h-screen safe-bottom">
        <header className="sticky top-0 z-10 border-b border-borde bg-superficie/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-sm font-bold tracking-tight text-acento">HumansCol</Link>
          </div>
        </header>
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <div className="text-4xl">🎯</div>
          <h1 className="mt-4 text-2xl font-bold">Panel de coordinacion</h1>
          <p className="mt-2 text-sm text-texto-suave">
            Acceso exclusivo para coordinadores de HumansCol.
          </p>
          <div className="mt-6">
            <input
              type="password"
              placeholder="Codigo de acceso"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full rounded-xl border border-borde bg-superficie px-4 py-3 text-center text-lg tracking-widest"
            />
            {error && <p className="mt-2 text-sm text-alerta">{error}</p>}
            <button
              onClick={handleLogin}
              disabled={loading || !code}
              className="mt-3 w-full rounded-xl bg-acento px-4 py-3 font-semibold text-superficie transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Verificando..." : "Entrar"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  const selected = needs.find((n) => n.id === selectedNeed);
  const nearbyVols = selected?.lat && selected?.lng
    ? volunteers
        .filter((v) => v.lat && v.lng)
        .map((v) => ({ ...v, dist: haversine(selected.lat!, selected.lng!, v.lat!, v.lng!) }))
        .filter((v) => v.dist <= 15000)
        .sort((a, b) => a.dist - b.dist)
    : [];

  const filteredNeeds = needs.filter((n) => {
    if (filterPrio !== "all" && n.prioridad !== filterPrio) return false;
    if (search) {
      const s = search.toLowerCase();
      return n.descripcion.toLowerCase().includes(s) || n.zona.toLowerCase().includes(s) || n.codigo.toLowerCase().includes(s);
    }
    return true;
  });

  const p1Count = needs.filter((n) => n.prioridad === "P1").length;
  const pendCount = needs.filter((n) => n.estadoResolucion === "PENDIENTE").length;

  return (
    <main className="min-h-screen safe-bottom">
      <header className="sticky top-0 z-10 border-b border-borde bg-superficie/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-sm font-bold tracking-tight text-acento">HumansCol</Link>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-ok-suave px-2 py-0.5 text-xs font-bold text-ok">Coordinador</span>
            <Link href="/panel" className="text-xs text-texto-suave hover:text-texto">Panel</Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-4">
        {actionMsg && (
          <div className={`mb-3 rounded-lg px-3 py-2 text-sm font-medium ${actionMsg.startsWith("Error") ? "bg-alerta-suave text-alerta" : "bg-ok-suave text-ok"}`}>
            {actionMsg}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="rounded-xl bg-alerta-suave p-3 text-center">
            <div className="text-xl font-bold text-alerta">{p1Count}</div>
            <div className="text-xs text-texto-suave">P1 Vida</div>
          </div>
          <div className="rounded-xl bg-aviso-suave p-3 text-center">
            <div className="text-xl font-bold text-aviso">{pendCount}</div>
            <div className="text-xs text-texto-suave">Pendientes</div>
          </div>
          <div className="rounded-xl bg-acento-suave p-3 text-center">
            <div className="text-xl font-bold text-acento">{volunteers.length}</div>
            <div className="text-xs text-texto-suave">Voluntarios</div>
          </div>
          <div className="rounded-xl bg-ok-suave p-3 text-center">
            <div className="text-xl font-bold text-ok">{missions.length}</div>
            <div className="text-xs text-texto-suave">Misiones</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex gap-1 rounded-xl bg-superficie-elevada p-1">
          {(["necesidades", "voluntarios", "misiones"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                tab === t ? "bg-acento text-superficie" : "text-texto-suave hover:text-texto"
              }`}
            >
              {t === "necesidades" ? `Necesidades (${needs.length})` : t === "voluntarios" ? `Voluntarios (${volunteers.length})` : `Misiones (${missions.length})`}
            </button>
          ))}
        </div>

        {/* Tab: Necesidades */}
        {tab === "necesidades" && (
          <div className="mt-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Buscar zona, codigo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 rounded-lg border border-borde bg-superficie px-3 py-2 text-sm"
              />
              <select
                value={filterPrio}
                onChange={(e) => setFilterPrio(e.target.value)}
                className="rounded-lg border border-borde bg-superficie px-3 py-2 text-sm"
              >
                <option value="all">Todas</option>
                <option value="P1">P1 Vida</option>
                <option value="P2">P2 Supervivencia</option>
                <option value="P3">P3 Recuperacion</option>
              </select>
            </div>

            <div className="mt-3 space-y-2" style={{ maxHeight: "60vh", overflowY: "auto" }}>
              {filteredNeeds.map((n) => {
                const isSelected = n.id === selectedNeed;
                const prio = PRIO[n.prioridad];
                return (
                  <div
                    key={n.id}
                    onClick={() => setSelectedNeed(isSelected ? null : n.id)}
                    className={`rounded-xl border border-borde bg-superficie p-3 cursor-pointer transition hover:border-acento ${isSelected ? "ring-2 ring-acento" : ""}`}
                    style={{ borderLeftWidth: 4, borderLeftColor: prio?.color }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono text-texto-suave">{n.codigo}</span>
                          <span className="rounded-full px-2 py-0.5 text-xs font-bold text-white" style={{ backgroundColor: prio?.color }}>
                            {n.prioridad} {prio?.label}
                          </span>
                          <span className="rounded-full bg-superficie-elevada px-2 py-0.5 text-xs">
                            {CAT[n.categoria] ?? n.categoria}
                          </span>
                          {n.estadoVerificacion === "VERIFICADO" && (
                            <span className="text-xs text-ok">Verificado</span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-texto-suave line-clamp-2">{n.descripcion}</p>
                        <div className="mt-1 text-xs text-texto-suave">
                          {n.zona} · {ESTADO_LABEL[n.estadoResolucion]}
                        </div>
                      </div>
                      {n.contactoCelular && n.contactoCelular !== "0000000000" && (
                        <a
                          href={`https://wa.me/57${n.contactoCelular}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="shrink-0 rounded-lg bg-ok-suave p-2 text-ok transition hover:bg-ok hover:text-superficie"
                          title="WhatsApp contacto"
                        >
                          💬
                        </a>
                      )}
                    </div>

                    {isSelected && (
                      <div className="mt-3 space-y-2 border-t border-borde pt-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); doAction("actualizar-necesidad", { needId: n.id, estado: "EN_PROCESO" }); }}
                            className="rounded-lg bg-aviso-suave px-3 py-1.5 text-xs font-semibold text-aviso transition hover:bg-aviso hover:text-superficie"
                          >
                            Marcar en proceso
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); doAction("actualizar-necesidad", { needId: n.id, estado: "RESUELTO" }); }}
                            className="rounded-lg bg-ok-suave px-3 py-1.5 text-xs font-semibold text-ok transition hover:bg-ok hover:text-superficie"
                          >
                            Marcar resuelta
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); doAction("verificar-necesidad", { needId: n.id }); }}
                            className="rounded-lg bg-acento-suave px-3 py-1.5 text-xs font-semibold text-acento transition hover:bg-acento hover:text-superficie"
                          >
                            Verificar
                          </button>
                          {n.lat && n.lng && (
                            <a
                              href={`https://www.google.com/maps?q=${n.lat},${n.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="rounded-lg bg-superficie-elevada px-3 py-1.5 text-xs font-semibold text-texto-suave transition hover:text-texto"
                            >
                              Ver en mapa
                            </a>
                          )}
                        </div>

                        {nearbyVols.length > 0 && (
                          <div className="rounded-lg border border-ok/30 bg-ok-suave/30 p-3">
                            <div className="text-xs font-bold text-ok">
                              {nearbyVols.length} voluntario{nearbyVols.length !== 1 ? "s" : ""} cerca
                            </div>
                            <div className="mt-2 space-y-1">
                              {nearbyVols.slice(0, 5).map((v) => (
                                <div key={v.id} className="flex items-center justify-between gap-2 rounded-lg bg-superficie p-2">
                                  <div className="min-w-0">
                                    <span className="text-xs font-medium">{v.nombre}</span>
                                    <span className="ml-1 text-xs text-texto-suave">{v.vehiculo !== "NINGUNO" ? `🚗 ${v.vehiculo}` : ""}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-acento">{distLabel(v.dist)}</span>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); doAction("crear-mision", { needId: n.id, volunteerId: v.id }); }}
                                      className="rounded-lg bg-acento px-2 py-1 text-xs font-bold text-superficie"
                                    >
                                      Asignar
                                    </button>
                                    <a
                                      href={`https://wa.me/57${v.celular}?text=${encodeURIComponent(`Hola ${v.nombre}, soy coordinadora de HumansCol. Hay una necesidad cerca de ti (${n.codigo}): ${n.descripcion.slice(0, 80)}. Puedes ayudar? Maps: https://www.google.com/maps?q=${n.lat},${n.lng}`)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-ok"
                                    >
                                      💬
                                    </a>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab: Voluntarios */}
        {tab === "voluntarios" && (
          <div className="mt-4 space-y-2" style={{ maxHeight: "70vh", overflowY: "auto" }}>
            {volunteers.map((v) => (
              <div key={v.id} className="rounded-xl border border-borde bg-superficie p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{v.nombre}</span>
                      <span className="rounded-full bg-acento-suave px-2 py-0.5 text-xs text-acento">{v.tipoAyuda}</span>
                      {v.vehiculo !== "NINGUNO" && (
                        <span className="rounded-full bg-aviso-suave px-2 py-0.5 text-xs text-aviso">🚗 {v.vehiculo}</span>
                      )}
                    </div>
                    {v.descripcion && <p className="mt-0.5 text-xs text-texto-suave">{v.descripcion}</p>}
                    <div className="mt-1 text-xs text-texto-suave">
                      {v.codigo} · {v.zona || "Cali"} · {v.disponibilidad}
                      {v.lat && v.lng && <span className="text-ok"> (GPS)</span>}
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/57${v.celular}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded-lg bg-ok-suave p-2 text-lg text-ok transition hover:bg-ok hover:text-superficie"
                  >
                    💬
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Misiones */}
        {tab === "misiones" && (
          <div className="mt-4">
            {missions.length === 0 ? (
              <div className="rounded-xl border border-borde bg-superficie p-8 text-center text-sm text-texto-suave">
                No hay misiones creadas. Selecciona una necesidad y asigna un voluntario para crear una.
              </div>
            ) : (
              <div className="space-y-2">
                {missions.map((m) => (
                  <div key={m.id} className="rounded-xl border border-borde bg-superficie p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-texto-suave">{m.codigo}</span>
                          <span className="rounded-full px-2 py-0.5 text-xs font-bold text-white" style={{ backgroundColor: PRIO[m.prioridad]?.color }}>
                            {m.prioridad}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            m.estado === "ASIGNADA" ? "bg-acento-suave text-acento" :
                            m.estado === "ENTREGADA" ? "bg-ok-suave text-ok" :
                            "bg-superficie-elevada text-texto-suave"
                          }`}>
                            {m.estado}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-texto-suave">
                          {m.need.codigo} — {m.need.zona}
                          {m.volunteer && <span className="ml-2 text-acento">→ {m.volunteer.nombre}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 text-center text-xs text-texto-suave">
          Datos se actualizan cada 60 segundos.
          <button onClick={fetchData} className="ml-2 text-acento hover:underline">
            Actualizar ahora
          </button>
        </div>
      </div>
    </main>
  );
}
