import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  const count = await prisma.need.count();
  let idx = count;

  const necesidades = [
    {
      categoria: "OTRO",
      descripcion: "Necesitan mascaras 3M para quimicos y reflectores solares urgente. Zona de rescate activa con riesgo quimico.",
      cantidad: "Mascaras 3M para quimicos + reflectores solares",
      personasAfectadas: 10,
      ninos: 0,
      adultosMayores: 0,
      necesidadesEspeciales: "Equipo de proteccion para rescatistas",
      prioridad: "P1",
      contactoNombre: "Isabel Gomez",
      contactoCelular: "3158084234",
      direccion: "Cra 72 #10bis-21, Torres del Limonar",
      zona: "Limonar",
      ciudad: "Cali",
      lat: 3.3862,
      lng: -76.5395,
    },
    {
      categoria: "OTRO",
      descripcion: "Necesitan un Starlink pequeno con Power Bank DONADO para mandar bajo los escombros del Edificio Vanessa. Hay personas atrapadas y necesitan comunicacion bajo los escombros.",
      cantidad: "1 Starlink pequeno + 1 Power Bank",
      personasAfectadas: 20,
      ninos: 0,
      adultosMayores: 0,
      necesidadesEspeciales: "Rescate activo - personas atrapadas bajo escombros",
      prioridad: "P1",
      contactoNombre: "Miyerlady Diaz",
      contactoCelular: "3006090619",
      direccion: "Edificio Vanessa",
      zona: "Limonar",
      ciudad: "Cali",
      lat: 3.3855,
      lng: -76.5388,
    },
    {
      categoria: "TRANSPORTE",
      descripcion: "Se necesita camion de recogida para llevar ayudas a Buenaventura. Coordinacion de transporte de donaciones desde Cali hacia Buenaventura.",
      cantidad: "1 camion de carga",
      personasAfectadas: 100,
      ninos: 0,
      adultosMayores: 0,
      necesidadesEspeciales: "",
      prioridad: "P2",
      contactoNombre: "Javier",
      contactoCelular: "3184575725",
      direccion: "Cali - Buenaventura",
      zona: "Buenaventura",
      ciudad: "Cali",
      lat: 3.4516,
      lng: -76.5320,
    },
  ];

  for (const n of necesidades) {
    idx++;
    const codigo = `NEC-${String(idx).padStart(4, "0")}`;

    const existing = await prisma.need.findFirst({
      where: { contactoCelular: n.contactoCelular, categoria: n.categoria },
    });

    if (existing) {
      console.log(`Ya existe: ${existing.codigo} (${n.contactoNombre})`);
      continue;
    }

    const created = await prisma.need.create({
      data: { codigo, ...n },
    });
    console.log(`Creada: ${created.codigo} — ${n.contactoNombre} — ${n.descripcion.slice(0, 60)}`);
  }

  console.log("\nDone.");
}

main().catch(console.error);
