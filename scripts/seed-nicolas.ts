import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  const existing = await prisma.volunteer.findFirst({
    where: { nombre: { contains: "Poveda" } },
  });

  if (existing) {
    console.log("Ya existe:", existing.codigo, existing.nombre);
    return;
  }

  const count = await prisma.volunteer.count();
  const codigo = `VOL-${String(count + 1).padStart(4, "0")}`;

  const vol = await prisma.volunteer.create({
    data: {
      codigo,
      nombre: "Nicolás Poveda",
      celular: "0000000001",
      tipoAyuda: "LOGISTICA",
      descripcion: "2 vans de 15 pasajeros para movilizar personas, medicos o rescatistas. Empresa Estarter.co",
      vehiculo: "CAMIONETA",
      capacidadCarga: "2 vans x 15 pasajeros",
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
