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
  especializacion: string;
  recursosOfrecidos: string;
  capacidadCarga: string;
  verificado: boolean;
  misionesCompletadas: number;
  createdAt: string;
};

type Mission = {
  id: string;
  codigo: string;
  estado: string;
  prioridad: string;
  need: { codigo: string; zona: string };
  volunteer: { nombre: string } | null;
};

type Center = { id: string; nombre: string; direccion: string; zona: string };

type InvItem = {
  id: string;
  centerId: string;
  categoria: string;
  nombre: string;
  cantidad: number;
  unidad: string;
  estado: string;
  notas: string;
  center: { nombre: string };
};

const CAT: Record<string, string> = {
  AGUA: "Agua", ALIMENTOS: "Alimentos", MEDICAMENTOS: "Medicamentos",
  HIGIENE: "Higiene", REFUGIO: "Refugio", HERRAMIENTAS: "Herramientas",
  ATENCION_MEDICA: "Medica", ATENCION_PSICOLOGICA: "Psicologica",
  EVACUACION: "Evacuacion", TRANSPORTE: "Transporte", OTRO: "Otro",
};

const TIPO_VOL: Record<string, { label: string; icon: string; bg: string; text: string; border: string }> = {
  VOLUNTARIO: { label: "Voluntario", icon: "🤝", bg: "bg-acento-suave", text: "text-acento", border: "border-acento/40" },
  ESPECIALISTA: { label: "Especialista", icon: "⚕️", bg: "bg-[#7c3aed]/15", text: "text-[#7c3aed]", border: "border-[#7c3aed]/40" },
  RECURSOS: { label: "Recursos", icon: "📦", bg: "bg-ok-suave", text: "text-ok", border: "border-ok/40" },
  LOGISTICA: { label: "Logística", icon: "🚛", bg: "bg-aviso-suave", text: "text-aviso", border: "border-aviso/40" },
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

const INV_CATS = [
  { key: "AGUA", label: "Agua", icon: "💧" },
  { key: "ALIMENTOS", label: "Alimentos", icon: "🍚" },
  { key: "MEDICAMENTOS", label: "Medicamentos", icon: "💊" },
  { key: "HIGIENE", label: "Higiene", icon: "🧴" },
  { key: "PANALES", label: "Pañales", icon: "👶" },
  { key: "COBIJAS", label: "Cobijas/Colchonetas", icon: "🛏️" },
  { key: "CARPAS", label: "Carpas", icon: "⛺" },
  { key: "LINTERNAS", label: "Linternas", icon: "🔦" },
  { key: "HERRAMIENTAS", label: "Herramientas", icon: "🔧" },
  { key: "ROPA", label: "Ropa", icon: "👕" },
  { key: "COLCHONETAS", label: "Colchonetas", icon: "🛌" },
  { key: "OTRO", label: "Otro", icon: "📦" },
];

const ESTADO_INV: Record<string, { label: string; bg: string; text: string }> = {
  DISPONIBLE: { label: "Disponible", bg: "bg-ok-suave", text: "text-ok" },
  BAJO: { label: "Bajo", bg: "bg-aviso-suave", text: "text-aviso" },
  AGOTADO: { label: "Agotado", bg: "bg-alerta-suave", text: "text-alerta" },
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

export default function CoordinarPage() {
  const [code, setCode] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [needs, setNeeds] = useState<Need[]>([]);
  const [volunteers, setVolunteers] = useState<Vol[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [inventory, setInventory] = useState<InvItem[]>([]);
  const [demanda, setDemanda] = useState<Record<string, number>>({});

  const [selectedNeed, setSelectedNeed] = useState<string | null>(null);
  const [tab, setTab] = useState<"necesidades" | "voluntarios" | "misiones" | "inventario">("necesidades");
  const [invCenter, setInvCenter] = useState<string>("");
  const [invItems, setInvItems] = useState<{ categoria: string; nombre: string; cantidad: number; unidad: string; estado: string }[]>([]);
  const [invSaving, setInvSaving] = useState(false);
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
    setCenters(data.centers || []);
    setInventory(data.inventory || []);
    setDemanda(data.demanda || {});
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
      setCenters(data.centers || []);
      setInventory(data.inventory || []);
      setDemanda(data.demanda || {});
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

  async function doAction(accion: string, payload: Record<string, any>) {
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
            <Link href="/" className="text-sm font-bold tracking-tight text-acento">Collab x Mindo</Link>
          </div>
        </header>
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <div className="text-4xl">🎯</div>
          <h1 className="mt-4 text-2xl font-bold">Panel de coordinacion</h1>
          <p className="mt-2 text-sm text-texto-suave">
            Acceso exclusivo para coordinadores de Collab x Mindo.
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
  const hasGeo = selected?.lat != null && selected?.lng != null;

  const CAT_TO_AYUDA: Record<string, string[]> = {
    AGUA: ["RECURSOS", "LOGISTICA"], ALIMENTOS: ["RECURSOS", "LOGISTICA"],
    MEDICAMENTOS: ["ESPECIALISTA", "RECURSOS"], HIGIENE: ["RECURSOS"],
    REFUGIO: ["LOGISTICA", "VOLUNTARIO"], HERRAMIENTAS: ["RECURSOS", "LOGISTICA"],
    ATENCION_MEDICA: ["ESPECIALISTA"], ATENCION_PSICOLOGICA: ["ESPECIALISTA"],
    EVACUACION: ["LOGISTICA", "VOLUNTARIO"], TRANSPORTE: ["LOGISTICA"],
  };

  const matchingVols = (() => {
    if (!selected) return [];
    if (hasGeo) {
      return volunteers
        .filter((v) => v.lat && v.lng)
        .map((v) => ({ ...v, dist: haversine(selected.lat!, selected.lng!, v.lat!, v.lng!) as number | null }))
        .filter((v) => v.dist! <= 20000)
        .sort((a, b) => a.dist! - b.dist!)
        .slice(0, 5);
    }
    const tipos = CAT_TO_AYUDA[selected.categoria] || [];
    const byZone = volunteers.filter((v) =>
      (v.zona && selected.zona && v.zona.toLowerCase() === selected.zona.toLowerCase()) ||
      (tipos.length > 0 && tipos.includes(v.tipoAyuda))
    );
    return (byZone.length > 0 ? byZone : volunteers)
      .slice(0, 5)
      .map((v) => ({ ...v, dist: null as number | null }));
  })();

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
          <Link href="/" className="text-sm font-bold tracking-tight text-acento">Collab x Mindo</Link>
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
          {(["necesidades", "voluntarios", "misiones", "inventario"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                tab === t ? "bg-acento text-superficie" : "text-texto-suave hover:text-texto"
              }`}
            >
              {t === "necesidades" ? `Necesidades (${needs.length})`
                : t === "voluntarios" ? `Voluntarios (${volunteers.length})`
                : t === "misiones" ? `Misiones (${missions.length})`
                : `Inventario (${inventory.length})`}
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
                        <div className="mt-1.5 flex items-center gap-1 text-xs font-medium text-texto">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5 text-acento shrink-0">
                            <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0Z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          {n.zona || n.ciudad}
                        </div>
                        <div className="mt-1 text-xs text-texto-suave">
                          {ESTADO_LABEL[n.estadoResolucion]} · {formatFecha(n.createdAt)}
                          {n.contactoNombre && <span> · 👤 {n.contactoNombre}</span>}
                        </div>
                        {n.contactoCelular && n.contactoCelular !== "0000000000" && (
                          <a
                            href={`https://wa.me/57${n.contactoCelular}?text=${encodeURIComponent(`Hola ${n.contactoNombre || ""}, somos coordinadores de Collab x Mindo. Vimos tu necesidad ${n.codigo}. ¿Cómo podemos ayudarte?`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-ok-suave px-3 py-1.5 text-xs font-semibold text-ok transition hover:bg-ok hover:text-superficie"
                          >
                            💬 WhatsApp {n.contactoNombre || n.contactoCelular}
                          </a>
                        )}
                      </div>
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

                        {matchingVols.length > 0 && (
                          <div className={`rounded-lg border p-3 ${hasGeo ? "border-ok/30 bg-ok-suave/30" : "border-acento/30 bg-acento-suave/30"}`}>
                            <div className={`text-xs font-bold ${hasGeo ? "text-ok" : "text-acento"}`}>
                              {hasGeo
                                ? `${matchingVols.length} voluntario${matchingVols.length !== 1 ? "s" : ""} cerca`
                                : `${matchingVols.length} voluntario${matchingVols.length !== 1 ? "s" : ""} recomendados`}
                            </div>
                            <div className="mt-2 space-y-1">
                              {matchingVols.map((v) => {
                                const tv = TIPO_VOL[v.tipoAyuda] || TIPO_VOL.VOLUNTARIO;
                                return (
                                  <div key={v.id} className={`flex items-center justify-between gap-2 rounded-lg border ${tv.border} bg-superficie p-2`}>
                                    <div className="min-w-0">
                                      <span className="text-xs font-medium">{v.nombre}</span>
                                      <span className={`ml-1.5 text-xs font-bold ${tv.text}`}>{tv.icon} {tv.label}</span>
                                      {v.especializacion && <span className="ml-1 text-xs text-texto-suave">· {v.especializacion}</span>}
                                      {v.vehiculo !== "NINGUNO" && <span className="ml-1 text-xs text-aviso">· 🚗 {v.vehiculo}</span>}
                                      {!v.especializacion && <span className="ml-1 text-xs text-texto-suave">· {v.zona || ""}</span>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {v.dist != null && <span className="text-xs font-bold text-acento">{distLabel(v.dist)}</span>}
                                      <button
                                        onClick={(e) => { e.stopPropagation(); doAction("crear-mision", { needId: n.id, volunteerId: v.id }); }}
                                        className="rounded-lg bg-acento px-2 py-1 text-xs font-bold text-superficie"
                                      >
                                        Asignar
                                      </button>
                                      <a
                                        href={`https://wa.me/57${v.celular}?text=${encodeURIComponent(`Hola ${v.nombre}, soy coordinador(a) de Collab x Mindo. Hay una necesidad en ${n.zona || n.ciudad} (${n.codigo}): ${n.descripcion.slice(0, 80)}. Puedes ayudar?${n.lat && n.lng ? ` Maps: https://www.google.com/maps?q=${n.lat},${n.lng}` : ""}`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-ok"
                                      >
                                        💬
                                      </a>
                                    </div>
                                  </div>
                                );
                              })}
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
              (() => {
                const tv = TIPO_VOL[v.tipoAyuda] || TIPO_VOL.VOLUNTARIO;
                return (
                  <div key={v.id} className={`rounded-xl border-2 ${tv.border} bg-superficie p-3`} style={{ borderLeftWidth: 4 }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold">{v.nombre}</span>
                          <span className={`rounded-full ${tv.bg} px-2 py-0.5 text-xs font-bold ${tv.text}`}>
                            {tv.icon} {tv.label}
                          </span>
                          {v.verificado && <span className="rounded-full bg-ok-suave px-2 py-0.5 text-xs font-semibold text-ok">Verificado</span>}
                          {v.misionesCompletadas > 0 && (
                            <span className="rounded-full bg-superficie-elevada px-2 py-0.5 text-xs text-texto-suave">{v.misionesCompletadas} mision{v.misionesCompletadas !== 1 ? "es" : ""}</span>
                          )}
                        </div>
                        {v.especializacion && (
                          <div className={`mt-1 text-xs font-medium ${tv.text}`}>
                            {tv.icon} {v.especializacion}
                          </div>
                        )}
                        {v.descripcion && <p className="mt-0.5 text-xs text-texto-suave">{v.descripcion}</p>}
                        {v.recursosOfrecidos && (
                          <div className="mt-1 rounded-lg bg-ok-suave/40 px-2 py-1 text-xs text-ok">
                            Ofrece: {v.recursosOfrecidos}
                          </div>
                        )}
                        <div className="mt-1.5 flex items-center gap-2 flex-wrap text-xs text-texto-suave">
                          <span>{v.zona || "Cali"}</span>
                          <span>· {v.disponibilidad === "AHORA" ? "Disponible ahora" : v.disponibilidad === "HOY" ? "Hoy" : v.disponibilidad === "VARIOS_DIAS" ? "Varios dias" : v.disponibilidad}</span>
                          {v.vehiculo !== "NINGUNO" && (
                            <span className="text-aviso">· 🚗 {v.vehiculo}{v.capacidadCarga ? ` (${v.capacidadCarga})` : ""}</span>
                          )}
                          {v.lat && v.lng && <span className="text-ok">· GPS</span>}
                        </div>
                        <div className="mt-1 text-xs text-texto-suave">
                          {v.codigo} · {v.createdAt ? formatFecha(v.createdAt) : ""}
                        </div>
                      </div>
                      <a
                        href={`https://wa.me/57${v.celular}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 rounded-lg bg-ok-suave px-3 py-2 text-sm font-semibold text-ok transition hover:bg-ok hover:text-superficie"
                      >
                        💬 WhatsApp
                      </a>
                    </div>
                  </div>
                );
              })()
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

        {/* Tab: Inventario */}
        {tab === "inventario" && (
          <div className="mt-4 space-y-4">
            {/* Dashboard de demanda */}
            <div className="rounded-xl border border-borde bg-superficie p-4">
              <h3 className="text-sm font-bold">Lo que mas se pide</h3>
              <p className="text-xs text-texto-suave">Basado en {needs.length} necesidades activas</p>
              <div className="mt-3 space-y-1.5">
                {Object.entries(demanda)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 10)
                  .map(([cat, count]) => {
                    const inv = INV_CATS.find((c) => c.key === cat);
                    const maxCount = Math.max(...Object.values(demanda));
                    const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                    const invTotal = inventory
                      .filter((i) => i.categoria === cat)
                      .reduce((s, i) => s + i.cantidad, 0);
                    return (
                      <div key={cat} className="flex items-center gap-2">
                        <span className="w-5 text-center text-sm">{inv?.icon || "📋"}</span>
                        <span className="w-24 text-xs font-medium truncate">{inv?.label || cat}</span>
                        <div className="flex-1 h-5 rounded-full bg-superficie-elevada overflow-hidden relative">
                          <div
                            className="h-full rounded-full bg-alerta/70 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                            {count} pedidos
                          </span>
                        </div>
                        <div className={`w-20 text-right text-xs font-bold ${invTotal > 0 ? "text-ok" : "text-alerta"}`}>
                          {invTotal > 0 ? `${invTotal} disp.` : "Sin stock"}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Inventario actual */}
            <div className="rounded-xl border border-borde bg-superficie p-4">
              <h3 className="text-sm font-bold">Inventario centros de acopio</h3>
              {inventory.length === 0 ? (
                <p className="mt-2 text-xs text-texto-suave">No hay items registrados. Agrega inventario abajo.</p>
              ) : (
                <div className="mt-3 space-y-1">
                  {inventory.map((item) => {
                    const ei = ESTADO_INV[item.estado] || ESTADO_INV.DISPONIBLE;
                    const inv = INV_CATS.find((c) => c.key === item.categoria);
                    return (
                      <div key={item.id} className="flex items-center gap-2 rounded-lg border border-borde p-2">
                        <span className="text-sm">{inv?.icon || "📦"}</span>
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-medium">{inv?.label || item.categoria}</span>
                          {item.nombre && <span className="ml-1 text-xs text-texto-suave">· {item.nombre}</span>}
                        </div>
                        <span className="text-xs font-bold">{item.cantidad} {item.unidad}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${ei.bg} ${ei.text}`}>{ei.label}</span>
                        <span className="text-xs text-texto-suave">{item.center.nombre}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Formulario para agregar/actualizar inventario */}
            <div className="rounded-xl border-2 border-acento/30 bg-superficie p-4">
              <h3 className="text-sm font-bold">Actualizar inventario</h3>
              {centers.length === 0 ? (
                <p className="mt-2 text-xs text-texto-suave">No hay centros de acopio activos.</p>
              ) : (
                <>
                  <select
                    value={invCenter}
                    onChange={(e) => {
                      setInvCenter(e.target.value);
                      const existing = inventory.filter((i) => i.centerId === e.target.value);
                      if (existing.length > 0) {
                        setInvItems(existing.map((i) => ({
                          categoria: i.categoria, nombre: i.nombre,
                          cantidad: i.cantidad, unidad: i.unidad, estado: i.estado,
                        })));
                      } else {
                        setInvItems([]);
                      }
                    }}
                    className="mt-2 w-full rounded-lg border border-borde bg-fondo px-3 py-2 text-sm"
                  >
                    <option value="">Seleccionar centro de acopio</option>
                    {centers.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre} — {c.direccion}</option>
                    ))}
                  </select>

                  {invCenter && (
                    <>
                      <div className="mt-3 space-y-2">
                        {invItems.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 rounded-lg border border-borde p-2">
                            <select
                              value={item.categoria}
                              onChange={(e) => {
                                const copy = [...invItems];
                                copy[idx].categoria = e.target.value;
                                setInvItems(copy);
                              }}
                              className="rounded-lg border border-borde bg-fondo px-2 py-1 text-xs"
                            >
                              {INV_CATS.map((c) => (
                                <option key={c.key} value={c.key}>{c.icon} {c.label}</option>
                              ))}
                            </select>
                            <input
                              type="text"
                              placeholder="Detalle"
                              value={item.nombre}
                              onChange={(e) => {
                                const copy = [...invItems];
                                copy[idx].nombre = e.target.value;
                                setInvItems(copy);
                              }}
                              className="flex-1 min-w-0 rounded-lg border border-borde bg-fondo px-2 py-1 text-xs"
                            />
                            <input
                              type="number"
                              placeholder="Cant"
                              value={item.cantidad}
                              onChange={(e) => {
                                const copy = [...invItems];
                                copy[idx].cantidad = parseInt(e.target.value) || 0;
                                setInvItems(copy);
                              }}
                              className="w-16 rounded-lg border border-borde bg-fondo px-2 py-1 text-xs text-center"
                            />
                            <select
                              value={item.unidad}
                              onChange={(e) => {
                                const copy = [...invItems];
                                copy[idx].unidad = e.target.value;
                                setInvItems(copy);
                              }}
                              className="rounded-lg border border-borde bg-fondo px-2 py-1 text-xs"
                            >
                              <option value="unidades">uds</option>
                              <option value="litros">lts</option>
                              <option value="kg">kg</option>
                              <option value="paquetes">paq</option>
                              <option value="cajas">cajas</option>
                            </select>
                            <select
                              value={item.estado}
                              onChange={(e) => {
                                const copy = [...invItems];
                                copy[idx].estado = e.target.value;
                                setInvItems(copy);
                              }}
                              className="rounded-lg border border-borde bg-fondo px-2 py-1 text-xs"
                            >
                              <option value="DISPONIBLE">Disponible</option>
                              <option value="BAJO">Bajo</option>
                              <option value="AGOTADO">Agotado</option>
                            </select>
                            <button
                              onClick={() => setInvItems(invItems.filter((_, i) => i !== idx))}
                              className="text-alerta text-xs font-bold px-1"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => setInvItems([...invItems, { categoria: "AGUA", nombre: "", cantidad: 0, unidad: "unidades", estado: "DISPONIBLE" }])}
                          className="rounded-lg border border-borde px-3 py-1.5 text-xs font-semibold text-texto-suave hover:text-texto"
                        >
                          + Agregar item
                        </button>
                        <button
                          disabled={invSaving}
                          onClick={async () => {
                            setInvSaving(true);
                            await doAction("guardar-inventario", { centerId: invCenter, inventario: invItems } as any);
                            setInvSaving(false);
                          }}
                          className="rounded-lg bg-acento px-4 py-1.5 text-xs font-bold text-superficie transition hover:opacity-90 disabled:opacity-50"
                        >
                          {invSaving ? "Guardando..." : "Guardar inventario"}
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
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
