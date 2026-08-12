import { prisma } from "@/lib/db";
import { CercaMapa } from "./mapa-cerca";

export const dynamic = "force-dynamic";

export default async function CercaPage() {
  const necesidades = await prisma.need.findMany({
    where: {
      estadoResolucion: { in: ["PENDIENTE", "EN_PROCESO"] },
      lat: { not: null },
      lng: { not: null },
    },
    orderBy: [{ prioridad: "asc" }, { createdAt: "desc" }],
    take: 100,
    select: {
      id: true,
      codigo: true,
      categoria: true,
      descripcion: true,
      prioridad: true,
      estadoResolucion: true,
      personasAfectadas: true,
      ninos: true,
      adultosMayores: true,
      zona: true,
      ciudad: true,
      direccion: true,
      contactoNombre: true,
      contactoCelular: true,
      lat: true,
      lng: true,
      cantidad: true,
      createdAt: true,
    },
  });

  const datos = necesidades.map((n) => ({
    ...n,
    lat: n.lat!,
    lng: n.lng!,
    createdAt: n.createdAt.toISOString(),
  }));

  return <CercaMapa necesidades={datos} />;
}
