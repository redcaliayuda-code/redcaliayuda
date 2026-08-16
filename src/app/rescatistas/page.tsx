"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Rescatista = {
  id: string;
  codigo: string;
  nombre: string;
  celular: string;
  zona: string;
  especialidad: string;
  equipo: string;
  herramientasTiene: string;
  herramientasNecesita: string;
  estado: string;
  notas: string;
  createdAt: string;
};

const ESPECIALIDADES = [
  { value: "busqueda_rescate", label: "Busqueda y rescate" },
  { value: "paramedico", label: "Paramedico / Primeros auxilios" },
  { value: "bombero", label: "Bombero" },
  { value: "estructural", label: "Evaluacion estructural" },
  { value: "logistica", label: "Logistica y transporte" },
  { value: "comunicaciones", label: "Comunicaciones" },
  { value: "apoyo_psicologico", label: "Apoyo psicologico" },
  { value: "voluntario_general", label: "Voluntario general" },
];

const HERRAMIENTAS_COMUNES = [
  "Pala", "Pica", "Barreta", "Cuerda", "Linterna", "Casco",
  "Guantes", "Botiquin", "Radio", "Camilla", "Extintor",
  "Sierra", "Escalera", "Generador", "Chaleco reflectivo",
];

const ESTADO_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  ACTIVO: { label: "Activo", bg: "bg-ok-suave", text: "text-ok" },
  DESCANSANDO: { label: "Descansando", bg: "bg-acento-suave", text: "text-acento" },
  INACTIVO: { label: "Inactivo", bg: "bg-superficie-elevada", text: "text-texto-suave" },
};

export default function RescatistasPage() {
  const [vista, setVista] = useState<"board" | "registro">("board");
  const [rescatistas, setRescatistas] = useState<Rescatista[]>([]);
  const [porZona, setPorZona] = useState<Record<string, Rescatista[]>>({});
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");
  const [codigoRegistrado, setCodigoRegistrado] = useState("");

  // Estado de mi codigo (para actualizar estado)
  const [miCodigo, setMiCodigo] = useState("");
  const [buscandoMe, setBuscandoMe] = useState(false);

  async function fetchData() {
    const res = await fetch("/api/rescatistas");
    if (res.ok) {
      const data = await res.json();
      setRescatistas(data.rescatistas);
      setPorZona(data.porZona);
    }
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, []);

  async function handleRegistro(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setMsg("");
    const fd = new FormData(e.currentTarget);

    const herramientasChecked = HERRAMIENTAS_COMUNES.filter((h) => fd.get(`h_${h}`) === "on");
    const herramientasOtra = fd.get("herramientas_otra") as string;
    const tieneTodo = [...herramientasChecked, herramientasOtra].filter(Boolean).join(", ");

    const res = await fetch("/api/rescatistas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accion: "registrar",
        nombre: fd.get("nombre"),
        celular: fd.get("celular"),
        zona: fd.get("zona"),
        especialidad: fd.get("especialidad"),
        equipo: fd.get("equipo"),
        herramientasTiene: tieneTodo,
        herramientasNecesita: fd.get("herramientasNecesita"),
        notas: fd.get("notas"),
      }),
    });

    const data = await res.json();
    setSending(false);

    if (data.ok) {
      setCodigoRegistrado(data.codigo);
      setVista("board");
      await fetchData();
    } else {
      setMsg(`Error: ${data.error}`);
    }
  }

  async function cambiarEstado(codigo: string, estado: string) {
    await fetch("/api/rescatistas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion: "actualizar-estado", codigo, estado }),
    });
    await fetchData();
  }

  async function actualizarNecesidades(codigo: string, herramientasNecesita: string) {
    await fetch("/api/rescatistas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion: "actualizar-necesidades", codigo, herramientasNecesita }),
    });
    await fetchData();
  }

  const activos = rescatistas.filter((r) => r.estado === "ACTIVO").length;
  const descansando = rescatistas.filter((r) => r.estado === "DESCANSANDO").length;
  const zonasCount = Object.keys(porZona).length;
  const conNecesidades = rescatistas.filter((r) => r.herramientasNecesita).length;

  return (
    <main className="min-h-screen safe-bottom">
      <header className="sticky top-0 z-10 border-b border-borde bg-superficie/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-sm font-bold tracking-tight text-acento">Collab x Mindo</Link>
          <nav className="flex items-center gap-3 text-xs">
            <Link href="/cerca" className="text-texto-suave hover:text-texto">Cerca</Link>
            <Link href="/recursos" className="text-texto-suave hover:text-texto">Recursos</Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Rescatistas</h1>
            <p className="mt-1 text-sm text-texto-suave">
              Registro y coordinacion de equipos de rescate en zona.
            </p>
          </div>
          <button
            onClick={() => setVista(vista === "board" ? "registro" : "board")}
            className="shrink-0 rounded-lg bg-acento px-4 py-2 text-sm font-semibold text-superficie transition hover:opacity-90"
          >
            {vista === "board" ? "Registrarme" : "Ver equipo"}
          </button>
        </div>

        {/* Codigo registrado */}
        {codigoRegistrado && (
          <div className="mt-3 rounded-xl border-2 border-ok bg-ok-suave p-4 text-center">
            <div className="text-sm font-bold text-ok">Registrado exitosamente</div>
            <div className="mt-1 text-2xl font-bold text-ok">{codigoRegistrado}</div>
            <p className="mt-1 text-xs text-texto-suave">Guarda este codigo para actualizar tu estado y solicitar herramientas.</p>
            <button onClick={() => setCodigoRegistrado("")} className="mt-2 text-xs text-texto-suave hover:text-texto">Cerrar</button>
          </div>
        )}

        {vista === "board" && (
          <>
            {/* Stats */}
            <div className="mt-4 grid grid-cols-4 gap-2">
              <div className="rounded-xl bg-ok-suave p-3 text-center">
                <div className="text-xl font-bold text-ok">{activos}</div>
                <div className="text-xs text-texto-suave">Activos</div>
              </div>
              <div className="rounded-xl bg-acento-suave p-3 text-center">
                <div className="text-xl font-bold text-acento">{descansando}</div>
                <div className="text-xs text-texto-suave">Descansando</div>
              </div>
              <div className="rounded-xl bg-superficie-elevada p-3 text-center">
                <div className="text-xl font-bold">{zonasCount}</div>
                <div className="text-xs text-texto-suave">Zonas</div>
              </div>
              <div className="rounded-xl bg-aviso-suave p-3 text-center">
                <div className="text-xl font-bold text-aviso">{conNecesidades}</div>
                <div className="text-xs text-texto-suave">Piden algo</div>
              </div>
            </div>

            {/* Actualizar mi estado */}
            <div className="mt-4 rounded-xl border border-borde bg-superficie p-4">
              <h3 className="text-sm font-bold">Actualizar mi estado</h3>
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  placeholder="Mi codigo (ej: RES-0001)"
                  value={miCodigo}
                  onChange={(e) => setMiCodigo(e.target.value.toUpperCase())}
                  className="flex-1 rounded-lg border border-borde bg-fondo px-3 py-2 text-sm"
                />
              </div>
              {miCodigo && miCodigo.startsWith("RES-") && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  <button onClick={() => cambiarEstado(miCodigo, "ACTIVO")}
                    className="rounded-lg bg-ok px-3 py-1.5 text-xs font-bold text-superficie">Estoy activo</button>
                  <button onClick={() => cambiarEstado(miCodigo, "DESCANSANDO")}
                    className="rounded-lg bg-acento px-3 py-1.5 text-xs font-bold text-superficie">Estoy descansando</button>
                  <button onClick={() => {
                    const necesidad = prompt("Que herramientas o recursos necesitas?");
                    if (necesidad != null) actualizarNecesidades(miCodigo, necesidad);
                  }}
                    className="rounded-lg border border-aviso bg-aviso-suave px-3 py-1.5 text-xs font-bold text-aviso">Solicitar herramientas</button>
                </div>
              )}
            </div>

            {/* Solicitudes de herramientas activas */}
            {conNecesidades > 0 && (
              <div className="mt-4 rounded-xl border-2 border-aviso/40 bg-superficie p-4">
                <h3 className="text-sm font-bold text-aviso">Herramientas y recursos solicitados</h3>
                <p className="text-xs text-texto-suave">Rescatistas que necesitan equipamiento</p>
                <div className="mt-3 space-y-2">
                  {rescatistas.filter((r) => r.herramientasNecesita).map((r) => (
                    <div key={r.id} className="flex items-start justify-between gap-2 rounded-lg border border-aviso/30 bg-aviso-suave/20 p-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold">{r.nombre}</span>
                          <span className="text-xs text-texto-suave">{r.zona}</span>
                          {r.especialidad && <span className="text-xs text-acento">· {ESPECIALIDADES.find((e) => e.value === r.especialidad)?.label || r.especialidad}</span>}
                        </div>
                        <p className="mt-1 text-sm font-medium text-aviso">{r.herramientasNecesita}</p>
                      </div>
                      <a
                        href={`https://wa.me/57${r.celular}?text=${encodeURIComponent(`Hola ${r.nombre}, vi que necesitas herramientas en Collab x Mindo (${r.codigo}). Puedo ayudarte con: ${r.herramientasNecesita}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 rounded-lg bg-ok px-3 py-1.5 text-xs font-bold text-superficie"
                      >
                        💬 Ayudar
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rescatistas por zona */}
            {loading ? (
              <div className="mt-8 text-center text-sm text-texto-suave">Cargando...</div>
            ) : rescatistas.length === 0 ? (
              <div className="mt-8 rounded-xl border border-borde bg-superficie p-8 text-center">
                <div className="text-3xl">🦺</div>
                <p className="mt-3 text-sm font-medium">No hay rescatistas registrados aun</p>
                <p className="mt-1 text-xs text-texto-suave">Se el primero en registrarte para coordinar los relevos.</p>
                <button onClick={() => setVista("registro")} className="mt-3 rounded-lg bg-acento px-4 py-2 text-sm font-semibold text-superficie">
                  Registrarme
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {Object.entries(porZona).sort((a, b) => b[1].length - a[1].length).map(([zona, lista]) => (
                  <div key={zona} className="rounded-xl border border-borde bg-superficie">
                    <div className="flex items-center justify-between border-b border-borde px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{zona}</span>
                        <span className="rounded-full bg-superficie-elevada px-2 py-0.5 text-xs font-semibold">{lista.length}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-ok font-semibold">{lista.filter((r) => r.estado === "ACTIVO").length} activos</span>
                        <span className="text-acento">{lista.filter((r) => r.estado === "DESCANSANDO").length} descansando</span>
                      </div>
                    </div>
                    <div className="p-2 space-y-1">
                      {lista.map((r) => {
                        const badge = ESTADO_BADGE[r.estado] || ESTADO_BADGE.ACTIVO;
                        return (
                          <div key={r.id} className="flex items-center justify-between gap-2 rounded-lg p-2 hover:bg-fondo transition">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium">{r.nombre}</span>
                                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${badge.bg} ${badge.text}`}>{badge.label}</span>
                                {r.especialidad && (
                                  <span className="text-xs text-acento">
                                    {ESPECIALIDADES.find((e) => e.value === r.especialidad)?.label || r.especialidad}
                                  </span>
                                )}
                              </div>
                              <div className="mt-0.5 flex items-center gap-2 text-xs text-texto-suave flex-wrap">
                                {r.equipo && <span>{r.equipo}</span>}
                                {r.herramientasTiene && <span>🔧 {r.herramientasTiene}</span>}
                                {r.herramientasNecesita && <span className="font-semibold text-aviso">Necesita: {r.herramientasNecesita}</span>}
                              </div>
                            </div>
                            <a
                              href={`https://wa.me/57${r.celular}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 text-ok text-sm"
                            >
                              💬
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Formulario de registro */}
        {vista === "registro" && (
          <form onSubmit={handleRegistro} className="mt-6 space-y-4">
            <div className="rounded-xl border border-borde bg-superficie p-5">
              <h2 className="text-lg font-bold">Registro de rescatista</h2>
              <p className="mt-1 text-xs text-texto-suave">
                Registrate para que el equipo sepa donde estas, que tienes y que necesitas.
              </p>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-sm font-medium">Nombre completo *</label>
                  <input name="nombre" required placeholder="Tu nombre"
                    className="mt-1 w-full rounded-lg border border-borde bg-fondo px-3 py-2.5 text-sm" />
                </div>

                <div>
                  <label className="text-sm font-medium">Celular *</label>
                  <input name="celular" required type="tel" placeholder="3001234567"
                    className="mt-1 w-full rounded-lg border border-borde bg-fondo px-3 py-2.5 text-sm" />
                </div>

                <div>
                  <label className="text-sm font-medium">Zona donde estas trabajando *</label>
                  <input name="zona" required placeholder="Ej: Marroquin, San Fernando, El Mindo..."
                    className="mt-1 w-full rounded-lg border border-borde bg-fondo px-3 py-2.5 text-sm" />
                </div>

                <div>
                  <label className="text-sm font-medium">Especialidad</label>
                  <select name="especialidad" className="mt-1 w-full rounded-lg border border-borde bg-fondo px-3 py-2.5 text-sm">
                    <option value="">Seleccionar</option>
                    {ESPECIALIDADES.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Equipo / Organizacion</label>
                  <input name="equipo" placeholder="Ej: Bomberos Cali, Cruz Roja, Independiente..."
                    className="mt-1 w-full rounded-lg border border-borde bg-fondo px-3 py-2.5 text-sm" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-borde bg-superficie p-5">
              <h3 className="text-sm font-bold">Herramientas que tienes</h3>
              <p className="mt-1 text-xs text-texto-suave">Marca las que llevas contigo</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {HERRAMIENTAS_COMUNES.map((h) => (
                  <label key={h} className="flex items-center gap-2 rounded-lg border border-borde px-2 py-1.5 text-xs cursor-pointer hover:bg-fondo transition">
                    <input type="checkbox" name={`h_${h}`} className="rounded" />
                    <span>{h}</span>
                  </label>
                ))}
              </div>
              <input name="herramientas_otra" placeholder="Otras herramientas..."
                className="mt-2 w-full rounded-lg border border-borde bg-fondo px-3 py-2 text-sm" />
            </div>

            <div className="rounded-xl border-2 border-aviso/40 bg-superficie p-5">
              <h3 className="text-sm font-bold text-aviso">Que necesitas?</h3>
              <p className="mt-1 text-xs text-texto-suave">Herramientas, equipamiento o recursos que te hacen falta para trabajar</p>
              <textarea name="herramientasNecesita" rows={2} placeholder="Ej: Necesito una barreta, casco y linterna..."
                className="mt-2 w-full rounded-lg border border-borde bg-fondo px-3 py-2 text-sm" />
            </div>

            <div>
              <label className="text-sm font-medium">Notas adicionales</label>
              <textarea name="notas" rows={2} placeholder="Algo mas que el equipo deba saber..."
                className="mt-1 w-full rounded-lg border border-borde bg-fondo px-3 py-2 text-sm" />
            </div>

            {msg && <p className="text-sm text-alerta">{msg}</p>}

            <button
              type="submit"
              disabled={sending}
              className="w-full rounded-xl bg-acento px-4 py-3 text-sm font-bold text-superficie transition hover:opacity-90 disabled:opacity-50"
            >
              {sending ? "Registrando..." : "Registrarme como rescatista"}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-acento hover:underline">← Volver al inicio</Link>
        </div>
      </div>
    </main>
  );
}
