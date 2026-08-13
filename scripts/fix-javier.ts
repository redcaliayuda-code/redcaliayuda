import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  // Delete the need
  const need = await prisma.need.findFirst({
    where: { contactoCelular: "3184575725" },
  });
  if (need) {
    await prisma.need.delete({ where: { id: need.id } });
    console.log("Necesidad eliminada:", need.codigo);
  }

  // Create as volunteer
  const existing = await prisma.volunteer.findUnique({
    where: { celular: "3184575725" },
  });
  if (existing) {
    console.log("Voluntario ya existe:", existing.codigo);
    return;
  }

  const count = await prisma.volunteer.count();
  const codigo = `VOL-${String(count + 1).padStart(4, "0")}`;

  const vol = await prisma.volunteer.create({
    data: {
      codigo,
      nombre: "Javier",
      celular: "3184575725",
      tipoAyuda: "LOGISTICA",
      descripcion: "Camion de recogida y ayudas para Buenaventura",
      vehiculo: "CAMION",
      capacidadCarga: "Camion de carga completo",
      disponibilidad: "HOY",
      zona: "",
      ciudad: "Cali",
      lat: 3.4516,
      lng: -76.5320,
    },
  });

  console.log("Voluntario creado:", vol.codigo, vol.nombre);
}

main().catch(console.error);
