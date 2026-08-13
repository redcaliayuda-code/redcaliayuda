import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  const existente = await prisma.collectionCenter.findFirst({
    where: { nombre: "Tipico Casero" },
  });

  if (existente) {
    console.log("Tipico Casero ya existe:", existente.id);
    return;
  }

  const centro = await prisma.collectionCenter.create({
    data: {
      nombre: "Tipico Casero",
      direccion: "Calle 10 #49-60",
      zona: "Centro",
      ciudad: "Cali",
      lat: 3.4516,
      lng: -76.5320,
      responsable: "HumansCol",
      celular: "",
      horario: "24 horas",
      necesitan: "Agua, alimentos no perecederos, cobijas, kits de higiene, medicamentos",
      noNecesitan: "Ropa usada en mal estado",
      activo: true,
    },
  });

  console.log("Centro creado:", centro.id, centro.nombre);
}

main().catch(console.error);
