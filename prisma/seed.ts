import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding RED CALI...");

  await prisma.collectionCenter.createMany({
    data: [
      {
        nombre: "Centro de Acopio Univalle",
        direccion: "Calle 13 # 100-00",
        zona: "Meléndez",
        ciudad: "Cali",
        lat: 3.3762,
        lng: -76.5322,
        responsable: "Coordinación Univalle",
        celular: "3001234567",
        horario: "6am - 8pm",
        necesitan: "Agua, Alimentos, Medicamentos, Cobijas",
        noNecesitan: "Ropa usada, Muebles",
      },
      {
        nombre: "Punto Solidario Siloé",
        direccion: "Carrera 50 con Calle 1",
        zona: "Siloé",
        ciudad: "Cali",
        lat: 3.4175,
        lng: -76.5569,
        responsable: "Junta Acción Comunal",
        celular: "3009876543",
        horario: "7am - 6pm",
        necesitan: "Agua, Alimentos, Pañales, Linternas, Herramientas",
        noNecesitan: "Juguetes",
      },
    ],
  });

  console.log("Seed completado.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
