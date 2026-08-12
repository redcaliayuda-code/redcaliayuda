import Link from "next/link";
import { prisma } from "@/lib/db";
import { Badge, Card, tonoEstado } from "@/components/ui";
import { fechaHora } from "@/lib/format";

export const dynamic = "force-dynamic";

const CAT: Record<string, string> = {
  AGUA: "💧 Agua", ALIMENTOS: "🍚 Alimentos", MEDICAMENTOS: "💊 Medicamentos",
  HIGIENE: "🧴 Higiene", PANALES: "👶 Pañales", REFUGIO: "🏠 Refugio",
  COBIJAS: "🛏️ Cobijas", LINTERNAS: "🔦 Linternas", HERRAMIENTAS: "🔧 Herramientas",
  ATENCION_MEDICA: "🏥 Médica", ATENCION_PSICOLOGICA: "🧠 Psicológica",
  TRANSPORTE: "🚗 Transporte", ALOJAMIENTO: "🏡 Alojamiento",
  EVACUACION: "🚨 Evacuación", DESAPARECIDOS: "🔍 Desaparecidos", OTRO: "📋 Otro",
};

const PRIO_BORDER: Record<string, string> = {
  P1: "border-l-alerta", P2: "border-l-aviso", P3: "border-l-acento", P4: "border-l-ok",
};

const PRIO_TONO: Record<string, "alerta" | "aviso" | "acento" | "ok"> = {
  P1: "alerta", P2: "aviso", P3: "acento", P4: "ok",
};

export default async function NecesidadesPage() {
  const necesidades = await prisma.need.findMany({
    orderBy: [{ prioridad: "asc" }, { createdAt: "desc" }],
    take: 100,
    include: { _count: { select: { missions: true } } },
  });

  return (
    <>
      <h1 className="text-xl font-bold tracking-tight">Necesidades reportadas</h1>
      <p className="mt-1 text-sm text-texto-suave">
        {necesidades.length} registros — click en una necesidad para ver detalle y asignar voluntarios
      </p>

      {necesidades.length === 0 ? (
        <Card className="mt-4 p-8 text-center text-sm text-texto-suave">
          No hay necesidades reportadas.
        </Card>
      ) : (
        <div className="mt-4 space-y-2">
          {necesidades.map((n) => (
            <Link key={n.id} href={`/panel/necesidades/${n.id}`}>
              <Card className={`border-l-4 ${PRIO_BORDER[n.prioridad]} p-4 transition hover:border-acento cursor-pointer`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-texto-suave">{n.codigo}</span>
                      <Badge tono={PRIO_TONO[n.prioridad]}>{n.prioridad}</Badge>
                      <Badge tono={tonoEstado(n.estadoResolucion)}>{n.estadoResolucion}</Badge>
                      {n._count.missions > 0 && (
                        <Badge tono="acento">{n._count.missions} misión{n._count.missions !== 1 ? "es" : ""}</Badge>
                      )}
                    </div>
                    <div className="mt-1 text-sm font-medium">
                      {CAT[n.categoria] ?? n.categoria}
                      {n.cantidad ? ` — ${n.cantidad}` : ""}
                    </div>
                    <p className="mt-0.5 text-xs text-texto-suave line-clamp-1">{n.descripcion}</p>
                  </div>
                  <div className="shrink-0 text-right text-xs text-texto-suave">
                    <div>{n.zona || n.ciudad}</div>
                    <div>{n.personasAfectadas} pers.</div>
                    <div>{fechaHora(n.createdAt)}</div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
