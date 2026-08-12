import Link from "next/link";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui";
import { fechaHora } from "@/lib/format";

export const dynamic = "force-dynamic";

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

export default async function NecesidadesPublicas() {
  const necesidades = await prisma.need.findMany({
    where: { estadoResolucion: { in: ["PENDIENTE", "EN_PROCESO"] } },
    orderBy: [{ prioridad: "asc" }, { createdAt: "desc" }],
    take: 50,
  });

  const conGeo = necesidades.filter((n) => n.lat && n.lng);
  const p1Count = necesidades.filter((n) => n.prioridad === "P1").length;

  return (
    <main className="min-h-screen safe-bottom">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-borde bg-superficie/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-sm font-bold tracking-tight text-acento">
            RED CALI
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/quiero-ayudar" className="toque-activo rounded-lg bg-acento px-3 py-1.5 text-xs font-semibold text-superficie">
              Quiero ayudar
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Necesidades activas</h1>
        <p className="mt-1 text-sm text-texto-suave">
          {necesidades.length} necesidad{necesidades.length !== 1 ? "es" : ""} reportada{necesidades.length !== 1 ? "s" : ""}
          {p1Count > 0 && (
            <span className="ml-2 inline-flex items-center gap-1 text-alerta">
              <span className="pulso inline-block h-2 w-2 rounded-full bg-alerta" />
              {p1Count} urgente{p1Count !== 1 ? "s" : ""}
            </span>
          )}
        </p>

        {/* Map */}
        {conGeo.length > 0 && (
          <div className="mt-4 overflow-hidden rounded-xl border border-borde">
            <iframe
              title="Mapa de necesidades"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                Math.min(...conGeo.map((n) => n.lng!)) - 0.008
              }%2C${
                Math.min(...conGeo.map((n) => n.lat!)) - 0.005
              }%2C${
                Math.max(...conGeo.map((n) => n.lng!)) + 0.008
              }%2C${
                Math.max(...conGeo.map((n) => n.lat!)) + 0.005
              }&layer=mapnik&marker=${conGeo[0].lat}%2C${conGeo[0].lng}`}
              className="h-48 w-full"
              style={{ border: "none" }}
            />
          </div>
        )}

        {/* List */}
        {necesidades.length === 0 ? (
          <div className="mt-10 rounded-xl border border-borde bg-superficie p-8 text-center">
            <div className="text-3xl">✓</div>
            <p className="mt-3 text-sm font-medium">No hay necesidades activas</p>
            <p className="mt-1 text-xs text-texto-suave">Todas las necesidades han sido atendidas.</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3 escalonar">
            {necesidades.map((n) => (
              <article
                key={n.id}
                className={`rounded-xl border border-borde border-l-4 ${PRIO_BORDER[n.prioridad]} bg-superficie p-4 transition`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{CAT_ICON[n.categoria] ?? "📋"}</span>
                      <span className="text-sm font-semibold">{CAT[n.categoria] ?? n.categoria}</span>
                      <Badge tono={PRIO_TONO[n.prioridad]}>
                        {n.prioridad} {PRIO_LABEL[n.prioridad]}
                      </Badge>
                    </div>
                    <p className="mt-1.5 text-sm text-texto-suave line-clamp-2">{n.descripcion}</p>
                    {n.cantidad && (
                      <p className="mt-1 text-xs font-medium text-acento">Cantidad: {n.cantidad}</p>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-texto-suave">
                  <span className="flex items-center gap-1">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
                      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {n.zona || n.ciudad}
                    {n.lat && n.lng && (
                      <span className="text-ok"> (GPS)</span>
                    )}
                  </span>
                  <span>{n.personasAfectadas} persona{n.personasAfectadas !== 1 ? "s" : ""}</span>
                  {n.ninos > 0 && <span>👶 {n.ninos} niño{n.ninos !== 1 ? "s" : ""}</span>}
                  {n.adultosMayores > 0 && <span>👴 {n.adultosMayores}</span>}
                  <span>{fechaHora(n.createdAt)}</span>
                </div>
              </article>
            ))}
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
      </div>
    </main>
  );
}
