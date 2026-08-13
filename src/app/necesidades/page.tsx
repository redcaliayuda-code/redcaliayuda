import Link from "next/link";
import { prisma } from "@/lib/db";
import { ListaNecesidades } from "@/components/lista-necesidades";

export const revalidate = 30;

export default async function NecesidadesPublicas() {
  const [necesidades, voluntarios] = await Promise.all([
    prisma.need.findMany({
      where: { estadoResolucion: { in: ["PENDIENTE", "EN_PROCESO"] } },
      orderBy: [{ prioridad: "asc" }, { createdAt: "desc" }],
      take: 50,
    }),
    prisma.volunteer.findMany({
      where: { disponibilidad: { not: "INDEFINIDO" } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const serialized = necesidades.map((n) => ({
    id: n.id,
    codigo: n.codigo,
    categoria: n.categoria,
    prioridad: n.prioridad,
    descripcion: n.descripcion,
    cantidad: n.cantidad,
    personasAfectadas: n.personasAfectadas,
    ninos: n.ninos,
    adultosMayores: n.adultosMayores,
    zona: n.zona,
    ciudad: n.ciudad,
    lat: n.lat,
    lng: n.lng,
    createdAt: n.createdAt.toISOString(),
  }));

  const volSerialized = voluntarios.map((v) => ({
    id: v.id,
    codigo: v.codigo,
    nombre: v.nombre,
    celular: v.celular,
    tipoAyuda: v.tipoAyuda,
    descripcion: v.descripcion,
    vehiculo: v.vehiculo,
    capacidadCarga: v.capacidadCarga,
    disponibilidad: v.disponibilidad,
    zona: v.zona,
    ciudad: v.ciudad,
    lat: v.lat,
    lng: v.lng,
  }));

  return (
    <main className="min-h-screen safe-bottom">
      <header className="sticky top-0 z-10 border-b border-borde bg-superficie/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-sm font-bold tracking-tight text-acento">
            HumansCol
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/quiero-ayudar" className="toque-activo rounded-lg bg-acento px-3 py-1.5 text-xs font-semibold text-superficie">
              Quiero ayudar
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-5">
        <ListaNecesidades necesidades={serialized} voluntarios={volSerialized} />
      </div>
    </main>
  );
}
