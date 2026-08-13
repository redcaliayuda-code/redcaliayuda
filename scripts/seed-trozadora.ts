import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  const count = await prisma.need.count();
  const codigo = `NEC-${String(count + 1).padStart(4, "0")}`;

  const existing = await prisma.need.findFirst({
    where: { contactoCelular: "0000000000", categoria: "HERRAMIENTAS", descripcion: { contains: "trozadora" } },
  });

  if (existing) {
    console.log("Ya existe:", existing.codigo);
    return;
  }

  const need = await prisma.need.create({
    data: {
      codigo,
      categoria: "HERRAMIENTAS",
      descripcion: "URGENTE: Se necesita trozadora de cemento para los topos. Acaban de encontrar posibles señales de vida. Rescate activo.",
      cantidad: "1 trozadora de cemento",
      personasAfectadas: 10,
      ninos: 0,
      adultosMayores: 0,
      necesidadesEspeciales: "Rescate activo - posibles señales de vida bajo escombros. Topos rescatistas en sitio.",
      prioridad: "P1",
      contactoNombre: "Abie Cohen (Topo rescatista)",
      contactoCelular: "0000000000",
      direccion: "Carrera 45 - Calle 8b, cerca de Torres de Tequendama",
      zona: "Torres de Tequendama",
      ciudad: "Cali",
      lat: 3.4185,
      lng: -76.5365,
    },
  });

  console.log(`URGENTE creada: ${need.codigo} — Trozadora de cemento para topos`);
}

main().catch(console.error);
