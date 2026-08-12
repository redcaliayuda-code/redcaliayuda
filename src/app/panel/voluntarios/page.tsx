import { prisma } from "@/lib/db";
import { Badge, Card, Tabla, Th, Td, Vacio } from "@/components/ui";
import { fechaHora } from "@/lib/format";

export const dynamic = "force-dynamic";

const TIPO: Record<string, string> = {
  VOLUNTARIO: "Voluntario",
  ESPECIALISTA: "Especialista",
  RECURSOS: "Recursos",
  LOGISTICA: "Logística",
};

export default async function VoluntariosPage() {
  const voluntarios = await prisma.volunteer.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <>
      <h1 className="text-xl font-semibold tracking-tight">Voluntarios registrados</h1>
      <p className="mt-1 text-sm text-texto-suave">{voluntarios.length} personas</p>

      <Card className="mt-4">
        {voluntarios.length === 0 ? (
          <Vacio>No hay voluntarios registrados.</Vacio>
        ) : (
          <Tabla>
            <thead>
              <tr>
                <Th>Código</Th>
                <Th>Nombre</Th>
                <Th>Tipo</Th>
                <Th>Especialidad</Th>
                <Th>Vehículo</Th>
                <Th>Zona</Th>
                <Th>Disponibilidad</Th>
                <Th>Fecha</Th>
              </tr>
            </thead>
            <tbody>
              {voluntarios.map((v) => (
                <tr key={v.id}>
                  <Td className="font-medium">{v.codigo}</Td>
                  <Td>{v.nombre}</Td>
                  <Td><Badge tono="acento">{TIPO[v.tipoAyuda] ?? v.tipoAyuda}</Badge></Td>
                  <Td className="text-texto-suave">{v.especializacion || "—"}</Td>
                  <Td>{v.vehiculo === "NINGUNO" ? "—" : v.vehiculo}</Td>
                  <Td>{v.zona || v.ciudad}</Td>
                  <Td>{v.disponibilidad}</Td>
                  <Td className="text-texto-suave">{fechaHora(v.createdAt)}</Td>
                </tr>
              ))}
            </tbody>
          </Tabla>
        )}
      </Card>
    </>
  );
}
