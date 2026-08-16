"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

type Ingreso = {
  id: string;
  codigo: string;
  monto: number;
  moneda: string;
  fuente: string;
  donante: string;
  concepto: string;
  notas: string;
  fecha: string;
};

type Gasto = {
  id: string;
  codigo: string;
  monto: number;
  moneda: string;
  area: string;
  concepto: string;
  proveedor: string;
  notas: string;
  fecha: string;
};

const FUENTES: Record<string, { label: string; icon: string }> = {
  GOFUNDME: { label: "GoFundMe", icon: "🌐" },
  DONACION_DIRECTA: { label: "Donación directa", icon: "💵" },
  ONG: { label: "ONG", icon: "🏛️" },
  GOBIERNO: { label: "Gobierno", icon: "🏢" },
  EMPRESA: { label: "Empresa", icon: "🏭" },
  OTRO: { label: "Otro", icon: "📦" },
};

const AREAS: Record<string, { label: string; icon: string; color: string }> = {
  VIVIENDA: { label: "Vivienda", icon: "🏠", color: "text-acento" },
  INFRAESTRUCTURA: { label: "Infraestructura", icon: "🏗️", color: "text-aviso" },
  SALUD: { label: "Salud", icon: "🏥", color: "text-alerta" },
  AGUA_SANEAMIENTO: { label: "Agua y saneamiento", icon: "💧", color: "text-acento" },
  EDUCACION: { label: "Educación", icon: "🎓", color: "text-[#7c3aed]" },
  ALIMENTACION: { label: "Alimentación", icon: "🍚", color: "text-aviso" },
  EQUIPOS_RESCATE: { label: "Equipos de rescate", icon: "🦺", color: "text-alerta" },
  LOGISTICA: { label: "Logística", icon: "🚛", color: "text-ok" },
  ADMIN: { label: "Administración", icon: "📋", color: "text-texto-suave" },
  OTRO: { label: "Otro", icon: "📦", color: "text-texto-suave" },
};

const SIMULADOR_AREAS = [
  {
    key: "VIVIENDA",
    label: "Vivienda",
    icon: "🏠",
    desc: "Reparación y reconstrucción de hogares",
    unidad: "hogares reparados",
    costoPorUnidad: 5000,
    pct: 0.30,
  },
  {
    key: "INFRAESTRUCTURA",
    label: "Infraestructura",
    icon: "🏗️",
    desc: "Vías, puentes, redes eléctricas",
    unidad: "km de vía / puentes",
    costoPorUnidad: 25000,
    pct: 0.20,
  },
  {
    key: "SALUD",
    label: "Salud",
    icon: "🏥",
    desc: "Brigadas médicas, medicamentos, equipos",
    unidad: "brigadas médicas",
    costoPorUnidad: 3000,
    pct: 0.15,
  },
  {
    key: "AGUA_SANEAMIENTO",
    label: "Agua y saneamiento",
    icon: "💧",
    desc: "Potabilización, tanques, saneamiento",
    unidad: "sistemas de agua",
    costoPorUnidad: 8000,
    pct: 0.10,
  },
  {
    key: "EDUCACION",
    label: "Educación",
    icon: "🎓",
    desc: "Reparación de escuelas, kits escolares",
    unidad: "escuelas reparadas",
    costoPorUnidad: 15000,
    pct: 0.08,
  },
  {
    key: "ALIMENTACION",
    label: "Alimentación",
    icon: "🍚",
    desc: "Kits alimentarios, comedores comunitarios",
    unidad: "kits alimentarios",
    costoPorUnidad: 50,
    pct: 0.10,
  },
  {
    key: "EQUIPOS_RESCATE",
    label: "Equipos de rescate",
    icon: "🦺",
    desc: "Herramientas, EPP, equipos de comunicación",
    unidad: "kits de equipo",
    costoPorUnidad: 2000,
    pct: 0.05,
  },
  {
    key: "LOGISTICA",
    label: "Logística",
    icon: "🚛",
    desc: "Transporte, combustible, almacenamiento",
    unidad: "operaciones logísticas",
    costoPorUnidad: 1500,
    pct: 0.02,
  },
];

const NIVELES_PRESUPUESTO = [100_000, 200_000, 500_000, 1_000_000];

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
}

export default function FinanzasPage() {
  const [auth, setAuth] = useState(false);
  const [code, setCode] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [totalIngresos, setTotalIngresos] = useState(0);
  const [totalGastos, setTotalGastos] = useState(0);
  const [disponible, setDisponible] = useState(0);
  const [porFuente, setPorFuente] = useState<Record<string, number>>({});
  const [porArea, setPorArea] = useState<Record<string, number>>({});

  const [tab, setTab] = useState<"resumen" | "ingresos" | "gastos" | "simulador">("resumen");
  const [nivelSim, setNivelSim] = useState(100_000);

  const fetchData = useCallback(async (c: string) => {
    const res = await fetch("/api/finanzas", { headers: { "x-fin-code": c } });
    if (!res.ok) throw new Error("Error cargando datos");
    const data = await res.json();
    setIngresos(data.ingresos);
    setGastos(data.gastos);
    setTotalIngresos(data.totalIngresos);
    setTotalGastos(data.totalGastos);
    setDisponible(data.disponible);
    setPorFuente(data.porFuente);
    setPorArea(data.porArea);
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await fetchData(code);
      setAuthCode(code);
      setAuth(true);
    } catch {
      setError("Código incorrecto o error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const doAction = async (accion: string, payload: Record<string, any>) => {
    setLoading(true);
    try {
      const res = await fetch("/api/finanzas", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-fin-code": authCode },
        body: JSON.stringify({ accion, ...payload }),
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error || "Error");
      }
      await fetchData(authCode);
    } catch {
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  if (!auth) {
    return (
      <main className="min-h-screen safe-bottom">
        <header className="sticky top-0 z-10 border-b border-borde bg-superficie/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2">
              <img src="/mindo-logo.svg" alt="Mindo" className="h-6 w-6" />
              <span className="text-sm font-bold tracking-tight text-acento">Collab x Mindo</span>
            </Link>
            <span className="text-xs text-texto-suave">Panel financiero</span>
          </div>
        </header>
        <div className="mx-auto max-w-md px-4 pt-20">
          <div className="rounded-2xl border border-borde bg-superficie p-6 text-center">
            <div className="text-4xl">💰</div>
            <h1 className="mt-3 text-xl font-bold">Panel Financiero</h1>
            <p className="mt-1 text-sm text-texto-suave">Acceso restringido para administradores</p>
            <div className="mt-6">
              <input
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Código de acceso"
                className="w-full rounded-lg border border-borde bg-fondo px-4 py-3 text-center text-sm"
              />
              {error && <p className="mt-2 text-xs text-alerta">{error}</p>}
              <button
                onClick={handleLogin}
                disabled={loading || !code}
                className="mt-3 w-full rounded-lg bg-acento px-4 py-3 text-sm font-bold text-superficie transition hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Verificando..." : "Acceder"}
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const tabs = [
    { key: "resumen", label: "Resumen", icon: "📊" },
    { key: "ingresos", label: "Ingresos", icon: "💵" },
    { key: "gastos", label: "Gastos", icon: "📤" },
    { key: "simulador", label: "Simulador", icon: "🏗️" },
  ] as const;

  return (
    <main className="min-h-screen safe-bottom pb-20">
      <header className="sticky top-0 z-10 border-b border-borde bg-superficie/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <img src="/mindo-logo.svg" alt="Mindo" className="h-6 w-6" />
            <span className="text-sm font-bold tracking-tight text-acento">Collab x Mindo</span>
          </Link>
          <span className="text-xs text-texto-suave">💰 Finanzas</span>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4">
        {/* Tabs */}
        <div className="mt-4 flex gap-1 overflow-x-auto rounded-xl bg-superficie-elevada p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold transition ${tab === t.key ? "bg-acento text-superficie" : "text-texto-suave hover:text-texto"}`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Resumen */}
        {tab === "resumen" && (
          <div className="mt-4 space-y-4">
            {/* Tarjetas principales */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-ok-suave p-4 text-center">
                <div className="text-xs text-texto-suave">Ingresos</div>
                <div className="mt-1 text-lg font-bold text-ok">{fmt(totalIngresos)}</div>
              </div>
              <div className="rounded-xl bg-alerta-suave p-4 text-center">
                <div className="text-xs text-texto-suave">Gastos</div>
                <div className="mt-1 text-lg font-bold text-alerta">{fmt(totalGastos)}</div>
              </div>
              <div className="rounded-xl bg-acento-suave p-4 text-center">
                <div className="text-xs text-texto-suave">Disponible</div>
                <div className={`mt-1 text-lg font-bold ${disponible >= 0 ? "text-acento" : "text-alerta"}`}>{fmt(disponible)}</div>
              </div>
            </div>

            {/* Barra de uso */}
            {totalIngresos > 0 && (
              <div className="rounded-xl border border-borde bg-superficie p-4">
                <div className="flex items-center justify-between text-xs text-texto-suave">
                  <span>Uso del presupuesto</span>
                  <span className="font-bold">{Math.round((totalGastos / totalIngresos) * 100)}%</span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-superficie-elevada">
                  <div
                    className="h-full rounded-full bg-acento transition-all"
                    style={{ width: `${Math.min(100, (totalGastos / totalIngresos) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Ingresos por fuente */}
            {Object.keys(porFuente).length > 0 && (
              <div className="rounded-xl border border-borde bg-superficie p-4">
                <h3 className="text-sm font-bold">Ingresos por fuente</h3>
                <div className="mt-3 space-y-2">
                  {Object.entries(porFuente)
                    .sort((a, b) => b[1] - a[1])
                    .map(([fuente, monto]) => (
                      <div key={fuente} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs">
                          <span>{FUENTES[fuente]?.icon || "📦"}</span>
                          <span>{FUENTES[fuente]?.label || fuente}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 rounded-full bg-ok" style={{ width: `${Math.max(20, (monto / totalIngresos) * 120)}px` }} />
                          <span className="text-xs font-bold">{fmt(monto)}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Gastos por área */}
            {Object.keys(porArea).length > 0 && (
              <div className="rounded-xl border border-borde bg-superficie p-4">
                <h3 className="text-sm font-bold">Gastos por área</h3>
                <div className="mt-3 space-y-2">
                  {Object.entries(porArea)
                    .sort((a, b) => b[1] - a[1])
                    .map(([area, monto]) => (
                      <div key={area} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs">
                          <span>{AREAS[area]?.icon || "📦"}</span>
                          <span>{AREAS[area]?.label || area}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 rounded-full bg-aviso" style={{ width: `${Math.max(20, (monto / totalGastos) * 120)}px` }} />
                          <span className="text-xs font-bold">{fmt(monto)}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Últimos movimientos */}
            <div className="rounded-xl border border-borde bg-superficie p-4">
              <h3 className="text-sm font-bold">Últimos movimientos</h3>
              {ingresos.length === 0 && gastos.length === 0 ? (
                <p className="mt-2 text-xs text-texto-suave">No hay movimientos registrados.</p>
              ) : (
                <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                  {[...ingresos.map((i) => ({ ...i, tipo: "ingreso" as const })), ...gastos.map((g) => ({ ...g, tipo: "gasto" as const, fuente: (g as any).area }))]
                    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                    .slice(0, 15)
                    .map((mov) => (
                      <div key={mov.id} className="flex items-center justify-between rounded-lg bg-fondo px-3 py-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${mov.tipo === "ingreso" ? "text-ok" : "text-alerta"}`}>
                              {mov.tipo === "ingreso" ? "+" : "-"}{fmt(mov.monto)}
                            </span>
                            <span className="rounded-full bg-superficie-elevada px-1.5 py-0.5 text-[10px]">{mov.codigo}</span>
                          </div>
                          <div className="text-[10px] text-texto-suave truncate">
                            {mov.concepto || (mov.tipo === "ingreso" ? FUENTES[mov.fuente]?.label : AREAS[mov.fuente]?.label) || mov.fuente} — {fmtDate(mov.fecha)}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Link GoFundMe */}
            <div className="rounded-xl border-2 border-ok/30 bg-ok-suave p-4 text-center">
              <div className="text-2xl">🌐</div>
              <h3 className="mt-1 text-sm font-bold">GoFundMe</h3>
              <p className="mt-1 text-xs text-texto-suave">Vincula tu campaña de GoFundMe registrando los ingresos manualmente aquí. Próximamente integración automática.</p>
            </div>
          </div>
        )}

        {/* Tab: Ingresos */}
        {tab === "ingresos" && (
          <div className="mt-4 space-y-4">
            {/* Formulario registrar ingreso */}
            <div className="rounded-xl border-2 border-ok/30 bg-superficie p-4">
              <h3 className="text-sm font-bold">Registrar ingreso</h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const fd = new FormData(form);
                  await doAction("registrar-ingreso", {
                    monto: fd.get("monto") as string,
                    moneda: fd.get("moneda") as string,
                    fuente: fd.get("fuente") as string,
                    donante: fd.get("donante") as string,
                    concepto: fd.get("concepto") as string,
                    notas: fd.get("notas") as string,
                    fecha: fd.get("fecha") as string,
                  });
                  form.reset();
                }}
                className="mt-3 space-y-2"
              >
                <div className="flex gap-2">
                  <input name="monto" type="number" step="0.01" required placeholder="Monto" className="flex-1 rounded-lg border border-borde bg-fondo px-2 py-1.5 text-xs" />
                  <select name="moneda" className="w-20 rounded-lg border border-borde bg-fondo px-2 py-1.5 text-xs">
                    <option value="USD">USD</option>
                    <option value="COP">COP</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <select name="fuente" required className="flex-1 rounded-lg border border-borde bg-fondo px-2 py-1.5 text-xs">
                    <option value="">Fuente</option>
                    {Object.entries(FUENTES).map(([k, v]) => (
                      <option key={k} value={k}>{v.icon} {v.label}</option>
                    ))}
                  </select>
                  <input name="fecha" type="date" className="flex-1 rounded-lg border border-borde bg-fondo px-2 py-1.5 text-xs" />
                </div>
                <input name="donante" placeholder="Donante (o anónimo)" className="w-full rounded-lg border border-borde bg-fondo px-2 py-1.5 text-xs" />
                <input name="concepto" placeholder="Concepto" className="w-full rounded-lg border border-borde bg-fondo px-2 py-1.5 text-xs" />
                <input name="notas" placeholder="Notas (opcional)" className="w-full rounded-lg border border-borde bg-fondo px-2 py-1.5 text-xs" />
                <button type="submit" disabled={loading} className="rounded-lg bg-ok px-4 py-1.5 text-xs font-bold text-superficie transition hover:opacity-90 disabled:opacity-50">
                  💵 Registrar ingreso
                </button>
              </form>
            </div>

            {/* Lista de ingresos */}
            <div className="rounded-xl border border-borde bg-superficie p-4">
              <h3 className="text-sm font-bold">Historial de ingresos <span className="text-ok">({ingresos.length})</span></h3>
              {ingresos.length === 0 ? (
                <p className="mt-2 text-xs text-texto-suave">No hay ingresos registrados.</p>
              ) : (
                <div className="mt-3 space-y-2 max-h-96 overflow-y-auto">
                  {ingresos.map((i) => (
                    <div key={i.id} className="rounded-lg bg-fondo px-3 py-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-ok">+{fmt(i.monto)}</span>
                          <span className="rounded-full bg-ok-suave px-1.5 py-0.5 text-[10px] font-bold text-ok">{i.codigo}</span>
                          {i.moneda === "COP" && <span className="text-[10px] text-texto-suave">COP</span>}
                        </div>
                        <button onClick={() => { if (confirm("Eliminar este ingreso?")) doAction("eliminar-ingreso", { id: i.id }); }} className="text-xs text-alerta">✕</button>
                      </div>
                      <div className="mt-1 text-[10px] text-texto-suave">
                        {FUENTES[i.fuente]?.icon} {FUENTES[i.fuente]?.label || i.fuente}
                        {i.donante && ` — ${i.donante}`}
                        {i.concepto && ` — ${i.concepto}`}
                        <span className="ml-2">{fmtDate(i.fecha)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Gastos */}
        {tab === "gastos" && (
          <div className="mt-4 space-y-4">
            {/* Formulario registrar gasto */}
            <div className="rounded-xl border-2 border-aviso/30 bg-superficie p-4">
              <h3 className="text-sm font-bold">Registrar gasto</h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const fd = new FormData(form);
                  await doAction("registrar-gasto", {
                    monto: fd.get("monto") as string,
                    moneda: fd.get("moneda") as string,
                    area: fd.get("area") as string,
                    concepto: fd.get("concepto") as string,
                    proveedor: fd.get("proveedor") as string,
                    notas: fd.get("notas") as string,
                    fecha: fd.get("fecha") as string,
                  });
                  form.reset();
                }}
                className="mt-3 space-y-2"
              >
                <div className="flex gap-2">
                  <input name="monto" type="number" step="0.01" required placeholder="Monto" className="flex-1 rounded-lg border border-borde bg-fondo px-2 py-1.5 text-xs" />
                  <select name="moneda" className="w-20 rounded-lg border border-borde bg-fondo px-2 py-1.5 text-xs">
                    <option value="USD">USD</option>
                    <option value="COP">COP</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <select name="area" required className="flex-1 rounded-lg border border-borde bg-fondo px-2 py-1.5 text-xs">
                    <option value="">Área</option>
                    {Object.entries(AREAS).map(([k, v]) => (
                      <option key={k} value={k}>{v.icon} {v.label}</option>
                    ))}
                  </select>
                  <input name="fecha" type="date" className="flex-1 rounded-lg border border-borde bg-fondo px-2 py-1.5 text-xs" />
                </div>
                <input name="concepto" required placeholder="Concepto / descripción" className="w-full rounded-lg border border-borde bg-fondo px-2 py-1.5 text-xs" />
                <input name="proveedor" placeholder="Proveedor (opcional)" className="w-full rounded-lg border border-borde bg-fondo px-2 py-1.5 text-xs" />
                <input name="notas" placeholder="Notas (opcional)" className="w-full rounded-lg border border-borde bg-fondo px-2 py-1.5 text-xs" />
                <button type="submit" disabled={loading} className="rounded-lg bg-aviso px-4 py-1.5 text-xs font-bold text-superficie transition hover:opacity-90 disabled:opacity-50">
                  📤 Registrar gasto
                </button>
              </form>
            </div>

            {/* Lista de gastos */}
            <div className="rounded-xl border border-borde bg-superficie p-4">
              <h3 className="text-sm font-bold">Historial de gastos <span className="text-alerta">({gastos.length})</span></h3>
              {gastos.length === 0 ? (
                <p className="mt-2 text-xs text-texto-suave">No hay gastos registrados.</p>
              ) : (
                <div className="mt-3 space-y-2 max-h-96 overflow-y-auto">
                  {gastos.map((g) => (
                    <div key={g.id} className="rounded-lg bg-fondo px-3 py-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-alerta">-{fmt(g.monto)}</span>
                          <span className="rounded-full bg-alerta-suave px-1.5 py-0.5 text-[10px] font-bold text-alerta">{g.codigo}</span>
                          {g.moneda === "COP" && <span className="text-[10px] text-texto-suave">COP</span>}
                        </div>
                        <button onClick={() => { if (confirm("Eliminar este gasto?")) doAction("eliminar-gasto", { id: g.id }); }} className="text-xs text-alerta">✕</button>
                      </div>
                      <div className="mt-1 text-[10px] text-texto-suave">
                        {AREAS[g.area]?.icon} {AREAS[g.area]?.label || g.area}
                        {g.concepto && ` — ${g.concepto}`}
                        {g.proveedor && ` (${g.proveedor})`}
                        <span className="ml-2">{fmtDate(g.fecha)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Simulador */}
        {tab === "simulador" && (
          <div className="mt-4 space-y-4">
            <div className="rounded-xl border-2 border-acento/30 bg-acento-suave p-4">
              <h3 className="text-sm font-bold text-acento">Simulador de reconstrucción</h3>
              <p className="mt-1 text-xs text-texto-suave">
                Estimación de lo que se puede lograr con diferentes niveles de presupuesto. Los costos son aproximados y se ajustan según la zona.
              </p>
            </div>

            {/* Selector de nivel */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {NIVELES_PRESUPUESTO.map((nivel) => (
                <button
                  key={nivel}
                  onClick={() => setNivelSim(nivel)}
                  className={`shrink-0 rounded-xl px-4 py-3 text-sm font-bold transition ${nivelSim === nivel ? "bg-acento text-superficie" : "border-2 border-borde bg-superficie text-texto hover:border-acento"}`}
                >
                  {fmt(nivel)}
                </button>
              ))}
            </div>

            {/* Presupuesto personalizado */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-texto-suave">O ingresa un monto:</span>
              <input
                type="number"
                placeholder="Monto USD"
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  if (v > 0) setNivelSim(v);
                }}
                className="w-32 rounded-lg border border-borde bg-fondo px-2 py-1.5 text-xs"
              />
            </div>

            {/* Tabla de impacto */}
            <div className="rounded-xl border border-borde bg-superficie overflow-hidden">
              <div className="bg-acento px-4 py-3">
                <div className="text-sm font-bold text-superficie">Con {fmt(nivelSim)} se podría lograr:</div>
              </div>
              <div className="divide-y divide-borde">
                {SIMULADOR_AREAS.map((area) => {
                  const presupuestoArea = nivelSim * area.pct;
                  const unidades = Math.floor(presupuestoArea / area.costoPorUnidad);
                  return (
                    <div key={area.key} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{area.icon}</span>
                            <span className="text-xs font-bold">{area.label}</span>
                            <span className="rounded-full bg-superficie-elevada px-1.5 py-0.5 text-[10px] text-texto-suave">{Math.round(area.pct * 100)}%</span>
                          </div>
                          <p className="mt-0.5 text-[10px] text-texto-suave">{area.desc}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-sm font-bold text-acento">{fmt(presupuestoArea)}</div>
                          <div className="text-xs font-semibold text-ok">~{unidades.toLocaleString()} {area.unidad}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="bg-superficie-elevada px-4 py-3 flex items-center justify-between">
                <span className="text-xs font-bold">Total asignado</span>
                <span className="text-sm font-bold text-acento">{fmt(nivelSim)}</span>
              </div>
            </div>

            {/* Comparativa rápida */}
            <div className="rounded-xl border border-borde bg-superficie p-4">
              <h3 className="text-sm font-bold">Comparativa de niveles</h3>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-borde">
                      <th className="py-2 text-left text-texto-suave font-medium">Área</th>
                      {NIVELES_PRESUPUESTO.map((n) => (
                        <th key={n} className={`py-2 text-right font-bold ${n === nivelSim ? "text-acento" : "text-texto-suave"}`}>
                          {n >= 1_000_000 ? `$${n / 1_000_000}M` : `$${n / 1000}K`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SIMULADOR_AREAS.map((area) => (
                      <tr key={area.key} className="border-b border-borde/50">
                        <td className="py-2">
                          <span className="mr-1">{area.icon}</span>
                          {area.label}
                        </td>
                        {NIVELES_PRESUPUESTO.map((n) => {
                          const unidades = Math.floor((n * area.pct) / area.costoPorUnidad);
                          return (
                            <td key={n} className={`py-2 text-right font-semibold ${n === nivelSim ? "text-acento" : ""}`}>
                              {unidades.toLocaleString()}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-[10px] text-texto-suave">
                * Unidades estimadas por área. Los costos reales varían según zona, materiales y mano de obra disponible.
              </p>
            </div>

            {/* Si tienen disponible, mostrar qué pueden hacer */}
            {disponible > 0 && (
              <div className="rounded-xl border-2 border-ok/30 bg-ok-suave p-4">
                <h3 className="text-sm font-bold text-ok">Con tu presupuesto actual ({fmt(disponible)})</h3>
                <div className="mt-2 space-y-1">
                  {SIMULADOR_AREAS.slice(0, 5).map((area) => {
                    const presupuestoArea = disponible * area.pct;
                    const unidades = Math.floor(presupuestoArea / area.costoPorUnidad);
                    if (unidades <= 0) return null;
                    return (
                      <div key={area.key} className="flex items-center justify-between text-xs">
                        <span>{area.icon} {area.label}</span>
                        <span className="font-bold text-ok">~{unidades} {area.unidad}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
