import { prisma } from "@/lib/db";
import { Card, Metrica } from "@/components/ui";
import { MapaNecesidades } from "@/components/mapa-necesidades";
import { fechaHora } from "@/lib/format";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PRIORIDAD_LABEL: Record<string, string> = {
  P1: "P1 — Vida",
  P2: "P2 — Supervivencia",
  P3: "P3 — Recuperación",
  P4: "P4 — Apoyo",
};

const PRIORIDAD_TONO: Record<string, "alerta" | "aviso" | "acento" | "ok"> = {
  P1: "alerta",
  P2: "aviso",
  P3: "acento",
  P4: "ok",
};

const CATEGORIA_LABEL: Record<string, string> = {
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
  ATENCION_MEDICA: "Atención médica",
  ATENCION_PSICOLOGICA: "Atención psicológica",
  ATENCION_VETERINARIA: "Veterinaria",
  TRANSPORTE: "Transporte",
  ALOJAMIENTO: "Alojamiento",
  EVACUACION: "Evacuación",
  DESAPARECIDOS: "Desaparecidos",
  OTRO: "Otro",
};

export default async function PanelPage() {
  const [
    totalNecesidades,
    pendientes,
    resueltas,
    p1,
    totalVoluntarios,
    conVehiculo,
    especialistas,
    ultimas,
  ] = await Promise.all([
    prisma.need.count(),
    prisma.need.count({ where: { estadoResolucion: "PENDIENTE" } }),
    prisma.need.count({ where: { estadoResolucion: "RESUELTO" } }),
    prisma.need.count({ where: { prioridad: "P1" , estadoResolucion: { not: "RESUELTO" } } }),
    prisma.volunteer.count(),
    prisma.volunteer.count({ where: { vehiculo: { not: "NINGUNO" } } }),
    prisma.volunteer.count({ where: { tipoAyuda: "ESPECIALISTA" } }),
    prisma.need.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Centro de operaciones</h1>
      <p className="mt-1 text-sm text-texto-suave">Resumen en tiempo real de HumansCol.</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metrica etiqueta="Necesidades activas" valor={String(pendientes)} tono={pendientes > 0 ? "aviso" : undefined} />
        <Metrica etiqueta="P1 — Vida (sin resolver)" valor={String(p1)} tono={p1 > 0 ? "alerta" : "ok"} />
        <Metrica etiqueta="Resueltas" valor={String(resueltas)} tono="ok" />
        <Metrica etiqueta="Voluntarios" valor={String(totalVoluntarios)} nota={`${conVehiculo} con vehículo · ${especialistas} especialistas`} />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Mapa de necesidades</h2>
        <p className="mt-1 text-sm text-texto-suave">Necesidades con ubicación GPS detectada.</p>
        <div className="mt-3">
          <MapaNecesidades
            puntos={ultimas
              .filter((n) => n.lat != null && n.lng != null)
              .map((n) => ({
                id: n.id,
                codigo: n.codigo,
                categoria: n.categoria,
                prioridad: n.prioridad,
                lat: n.lat!,
                lng: n.lng!,
                zona: n.zona || n.ciudad,
                personasAfectadas: n.personasAfectadas,
                descripcion: n.descripcion,
              }))}
          />
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Últimas necesidades reportadas</h2>
          <Link href="/panel/necesidades" className="text-sm text-acento hover:underline">
            Ver todas
          </Link>
        </div>

        {ultimas.length === 0 ? (
          <Card className="mt-4 p-8 text-center text-sm text-texto-suave">
            Aún no hay necesidades reportadas.
          </Card>
        ) : (
          <div className="mt-4 space-y-3">
            {ultimas.map((n) => {
              const tono = PRIORIDAD_TONO[n.prioridad] ?? "acento";
              const colorBorde = {
                alerta: "border-l-alerta",
                aviso: "border-l-aviso",
                acento: "border-l-acento",
                ok: "border-l-ok",
              }[tono];

              return (
                <Card key={n.id} className={`border-l-4 ${colorBorde} p-4`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-texto-suave">{n.codigo}</span>
                        <span className={`text-xs font-semibold text-${tono}`}>
                          {PRIORIDAD_LABEL[n.prioridad] ?? n.prioridad}
                        </span>
                      </div>
                      <div className="mt-1 text-sm font-medium">
                        {CATEGORIA_LABEL[n.categoria] ?? n.categoria}
                        {n.cantidad ? ` — ${n.cantidad}` : ""}
                      </div>
                      <p className="mt-1 text-sm text-texto-suave line-clamp-2">{n.descripcion}</p>
                    </div>
                    <div className="shrink-0 text-right text-xs text-texto-suave">
                      <div>{n.zona || n.ciudad}</div>
                      <div>{n.personasAfectadas} persona{n.personasAfectadas !== 1 ? "s" : ""}</div>
                      <div>{fechaHora(n.createdAt)}</div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
