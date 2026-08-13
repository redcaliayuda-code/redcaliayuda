import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  const existing = await prisma.need.findFirst({
    where: { contactoCelular: "3186546098" },
  });

  if (existing) {
    console.log("Ya existe:", existing.codigo);
    return;
  }

  const count = await prisma.need.count();
  const codigo = `NEC-${String(count + 1).padStart(4, "0")}`;

  const need = await prisma.need.create({
    data: {
      codigo,
      categoria: "HERRAMIENTAS",
      descripcion: "Se necesita una trozadora (pulidora) de cemento urgente. Rescate activo en Torres de Tequendama.",
      cantidad: "1 trozadora / pulidora de cemento",
      personasAfectadas: 1,
      ninos: 0,
      adultosMayores: 0,
      necesidadesEspeciales: "Rescate activo - topos en sitio",
      prioridad: "P1",
      contactoNombre: "Adriana",
      contactoCelular: "3186546098",
      direccion: "Carrera 45 - Calle 8b, cerca de Torres de Tequendama",
      zona: "Torres de Tequendama",
      ciudad: "Cali",
      lat: 3.416288,
      lng: -76.542610,
    },
  });

  console.log(`Creada: ${need.codigo} — Trozadora para Adriana, Torres de Tequendama`);
}

main().catch(console.error);
