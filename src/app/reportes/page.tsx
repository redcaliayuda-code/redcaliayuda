import Link from "next/link";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui";
import { haceCuanto } from "@/lib/format";
import { FormularioReporte } from "./formulario";

export const dynamic = "force-dynamic";

const TIPO_INFO: Record<string, { icono: string; nombre: string; tono: "ok" | "alerta" | "aviso" | "acento" }> = {
  VIA_BLOQUEADA: { icono: "🚧", nombre: "Via bloqueada", tono: "alerta" },
  VIA_HABILITADA: { icono: "✅", nombre: "Via habilitada", tono: "ok" },
  SIN_LUZ: { icono: "🔌", nombre: "Sin luz", tono: "aviso" },
  SIN_AGUA: { icono: "💧", nombre: "Sin agua", tono: "aviso" },
  EDIFICIO_DANADO: { icono: "🏚️", nombre: "Edificio danado", tono: "alerta" },
  HOSPITAL_OPERATIVO: { icono: "🏥", nombre: "Hospital operativo", tono: "ok" },
  HOSPITAL_COLAPSADO: { icono: "🚑", nombre: "Hospital colapsado", tono: "alerta" },
  ALBERGUE_DISPONIBLE: { icono: "🏕️", nombre: "Albergue disponible", tono: "ok" },
  ZONA_RIESGO: { icono: "⚠️", nombre: "Zona de riesgo", tono: "alerta" },
  OTRO: { icono: "📋", nombre: "Otro", tono: "acento" },
};

export default async function ReportesPage({
  searchParams,
}: {
  searchParams: Promise<{ registrado?: string; ver?: string }>;
}) {
  const params = await searchParams;
  const registrado = params.registrado ?? "";
  const ver = params.ver ?? "feed";

  const reportes = await prisma.zoneReport.findMany({
    where: { activo: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const alertas = reportes.filter((r) =>
    ["VIA_BLOQUEADA", "EDIFICIO_DANADO", "HOSPITAL_COLAPSADO", "ZONA_RIESGO", "SIN_LUZ", "SIN_AGUA"].includes(r.tipo)
  );
  const positivos = reportes.filter((r) =>
    ["VIA_HABILITADA", "HOSPITAL_OPERATIVO", "ALBERGUE_DISPONIBLE"].includes(r.tipo)
  );

  return (
    <main className="min-h-screen safe-bottom">
      <header className="sticky top-0 z-10 border-b border-borde bg-superficie/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-sm font-bold tracking-tight text-acento">
            HumansCol
          </Link>
          <nav className="flex items-center gap-3 text-xs">
            <Link href="/necesidades" className="text-texto-suave hover:text-texto">Necesidades</Link>
            <Link href="/personas" className="text-texto-suave hover:text-texto">Personas</Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-5">
        {registrado && (
          <div className="mb-4 rounded-xl border border-ok/30 bg-ok-suave px-4 py-3 animar-entrada">
            <p className="text-sm font-medium text-ok">
              Reporte registrado ({registrado}). Gracias por informar.
            </p>
          </div>
        )}

        <h1 className="text-2xl font-bold tracking-tight">Estado de la zona</h1>
        <p className="mt-1 text-sm text-texto-suave">
          Reportes de infraestructura en tiempo real desde los ciudadanos.
        </p>

        {/* Tabs */}
        <div className="mt-4 flex gap-2">
          <Link
            href="/reportes?ver=feed"
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              ver === "feed" ? "bg-acento text-superficie" : "bg-fondo text-texto-suave"
            }`}
          >
            Ver reportes ({reportes.length})
          </Link>
          <Link
            href="/reportes?ver=nuevo"
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              ver === "nuevo" ? "bg-acento text-superficie" : "bg-fondo text-texto-suave"
            }`}
          >
            Hacer reporte
          </Link>
        </div>

        {ver === "nuevo" ? (
          <div className="mt-5">
            <FormularioReporte />
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-alerta-suave p-3 text-center">
                <div className="text-2xl font-bold text-alerta">{alertas.length}</div>
                <div className="text-xs text-texto-suave">Alertas activas</div>
              </div>
              <div className="rounded-xl bg-ok-suave p-3 text-center">
                <div className="text-2xl font-bold text-ok">{positivos.length}</div>
                <div className="text-xs text-texto-suave">Recursos disponibles</div>
              </div>
            </div>

            {/* Feed */}
            {reportes.length === 0 ? (
              <div className="mt-10 rounded-xl border border-borde bg-superficie p-8 text-center">
                <div className="text-3xl">📡</div>
                <p className="mt-3 text-sm font-medium">No hay reportes de zona aun</p>
                <p className="mt-1 text-xs text-texto-suave">
                  Se el primero en reportar el estado de tu zona.
                </p>
                <Link
                  href="/reportes?ver=nuevo"
                  className="mt-4 inline-block rounded-lg bg-acento px-4 py-2 text-sm font-semibold text-superficie"
                >
                  Hacer reporte
                </Link>
              </div>
            ) : (
              <div className="mt-4 space-y-3 escalonar">
                {reportes.map((r) => {
                  const info = TIPO_INFO[r.tipo] ?? { icono: "📋", nombre: r.tipo, tono: "acento" as const };
                  return (
                    <article
                      key={r.id}
                      className="rounded-xl border border-borde bg-superficie p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{info.icono}</span>
                            <span className="text-sm font-bold">{info.nombre}</span>
                            <Badge tono={info.tono}>{r.verificado ? "Verificado" : "Sin verificar"}</Badge>
                          </div>
                          <p className="mt-1 text-sm text-texto-suave">{r.descripcion}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-texto-suave">
                        {r.direccion && <span>{r.direccion}</span>}
                        {r.zona && <span>Zona: {r.zona}</span>}
                        <span>{r.ciudad}</span>
                        <span>{haceCuanto(r.createdAt)}</span>
                        {r.lat && r.lng && <span className="text-ok">(GPS)</span>}
                      </div>
                      <div className="mt-1 text-xs text-texto-suave">
                        Reportado por: {r.reportadoPor}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
