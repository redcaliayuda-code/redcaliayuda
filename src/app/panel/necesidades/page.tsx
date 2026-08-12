import { prisma } from "@/lib/db";
import { Badge, Card, tonoEstado, Tabla, Th, Td, Vacio } from "@/components/ui";
import { fechaHora } from "@/lib/format";

export const dynamic = "force-dynamic";

const CAT: Record<string, string> = {
  AGUA: "Agua", ALIMENTOS: "Alimentos", MEDICAMENTOS: "Medicamentos",
  HIGIENE: "Higiene", PANALES: "Pañales", REFUGIO: "Refugio",
  COBIJAS: "Cobijas", LINTERNAS: "Linternas", HERRAMIENTAS: "Herramientas",
  ATENCION_MEDICA: "Médica", ATENCION_PSICOLOGICA: "Psicológica",
  TRANSPORTE: "Transporte", ALOJAMIENTO: "Alojamiento",
  EVACUACION: "Evacuación", DESAPARECIDOS: "Desaparecidos", OTRO: "Otro",
};

const PRIO: Record<string, string> = { P1: "P1", P2: "P2", P3: "P3", P4: "P4" };

export default async function NecesidadesPage() {
  const necesidades = await prisma.need.findMany({
    orderBy: [{ prioridad: "asc" }, { createdAt: "desc" }],
    take: 100,
  });

  return (
    <>
      <h1 className="text-xl font-semibold tracking-tight">Necesidades reportadas</h1>
      <p className="mt-1 text-sm text-texto-suave">{necesidades.length} registros</p>

      <Card className="mt-4">
        {necesidades.length === 0 ? (
          <Vacio>No hay necesidades reportadas.</Vacio>
        ) : (
          <Tabla>
            <thead>
              <tr>
                <Th>Código</Th>
                <Th>Prioridad</Th>
                <Th>Categoría</Th>
                <Th>Zona</Th>
                <Th>Personas</Th>
                <Th>Verificación</Th>
                <Th>Estado</Th>
                <Th>Fecha</Th>
              </tr>
            </thead>
            <tbody>
              {necesidades.map((n) => (
                <tr key={n.id}>
                  <Td className="font-medium">{n.codigo}</Td>
                  <Td><Badge tono={n.prioridad === "P1" ? "alerta" : n.prioridad === "P2" ? "aviso" : "neutro"}>{PRIO[n.prioridad] ?? n.prioridad}</Badge></Td>
                  <Td>{CAT[n.categoria] ?? n.categoria}</Td>
                  <Td>{n.zona || n.ciudad}</Td>
                  <Td>{n.personasAfectadas}</Td>
                  <Td><Badge tono={tonoEstado(n.estadoVerificacion)}>{n.estadoVerificacion.replace(/_/g, " ")}</Badge></Td>
                  <Td><Badge tono={tonoEstado(n.estadoResolucion)}>{n.estadoResolucion}</Badge></Td>
                  <Td className="text-texto-suave">{fechaHora(n.createdAt)}</Td>
                </tr>
              ))}
            </tbody>
          </Tabla>
        )}
      </Card>
    </>
  );
}
