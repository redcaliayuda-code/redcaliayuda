import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const API_URL =
  "https://mapa-emergencia.artefactofilms.workers.dev/api/snapshot";

const TIPO_TO_CATEGORIA: Record<string, string> = {
  rescate: "EVACUACION",
  albergue: "REFUGIO",
  agua: "AGUA",
  salud: "ATENCION_MEDICA",
  cocina: "ALIMENTOS",
  psicologico: "ATENCION_PSICOLOGICA",
  veterinario: "ATENCION_VETERINARIA",
  info: "OTRO",
  otro: "OTRO",
};

const ESTADO_TO_PRIORIDAD: Record<string, string> = {
  urgente: "P1",
  necesita: "P2",
  cubierto: "P3",
};

interface Punto {
  id: string;
  nombre: string;
  tipo: string;
  lat: number;
  lng: number;
  direccion: string;
  barrio: string;
  estado: string;
  necesidades: string[];
  voluntarios_hay: number;
  voluntarios_faltan: number;
  contacto: string;
  notas: string;
  autor: string;
  creado: number;
  actualizado: number;
  ubicado: boolean;
  saturacion: string;
  media_total: number;
}

async function main() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  const prisma = new PrismaClient({ adapter });

  console.log("Descargando datos de Mapa Emergencia...");
  const res = await fetch(API_URL);
  const data = await res.json();
  const puntos: Punto[] = data.puntos;

  console.log(`Total puntos recibidos: ${puntos.length}`);
  console.log(`Resumen: ${JSON.stringify(data.resumen)}`);

  // Filter: only points with GPS, skip closed/discarded
  const importables = puntos.filter(
    (p) =>
      p.ubicado &&
      p.lat &&
      p.lng &&
      p.estado !== "cerrado" &&
      p.estado !== "descartado"
  );

  console.log(`Puntos importables (con GPS, activos): ${importables.length}`);

  // Separate acopio (collection centers) from needs
  const acopios = importables.filter((p) => p.tipo === "acopio");
  const necesidades = importables.filter((p) => p.tipo !== "acopio");

  console.log(`Necesidades: ${necesidades.length}, Acopios: ${acopios.length}`);

  // Check existing imported needs to avoid duplicates
  const existingNeeds = await prisma.need.findMany({
    where: { fuente: "MAPA_EMERGENCIA" },
    select: { codigo: true },
  });
  const existingCodes = new Set(existingNeeds.map((n) => n.codigo));

  const existingCenters = await prisma.collectionCenter.findMany({
    where: { nombre: { startsWith: "[ME]" } },
    select: { nombre: true },
  });
  const existingCenterNames = new Set(existingCenters.map((c) => c.nombre));

  // Get current need count for sequential codes
  let needCount = await prisma.need.count();
  let centerCount = await prisma.collectionCenter.count();

  let needsCreated = 0;
  let centersCreated = 0;
  let skipped = 0;

  // Import needs in batches
  for (const p of necesidades) {
    const codigo = `NEC-ME-${p.id.slice(0, 8)}`;
    if (existingCodes.has(codigo)) {
      skipped++;
      continue;
    }

    const categoria = TIPO_TO_CATEGORIA[p.tipo] || "OTRO";
    const prioridad = ESTADO_TO_PRIORIDAD[p.estado] || "P2";
    const descripcion =
      p.necesidades.length > 0
        ? `${p.nombre}: Se necesita ${p.necesidades.join(", ")}`
        : p.notas || p.nombre;

    // Extract phone from contacto or autor
    const celMatch = (p.contacto || p.autor || "").match(
      /(\d{7,10})/
    );
    const celular = celMatch ? celMatch[1] : "0000000000";
    const contactoNombre =
      p.autor || p.contacto || p.nombre.slice(0, 50);

    // Determine resolution status based on saturacion
    let estadoResolucion = "PENDIENTE";
    if (p.saturacion === "exceso") estadoResolucion = "EN_PROCESO";

    try {
      await prisma.need.create({
        data: {
          codigo,
          lat: p.lat,
          lng: p.lng,
          direccion: p.direccion || p.nombre,
          zona: p.barrio || p.nombre.slice(0, 60),
          ciudad: "Cali",
          categoria,
          descripcion: descripcion.slice(0, 500),
          cantidad: p.necesidades.slice(0, 5).join(", ") || "",
          personasAfectadas: p.voluntarios_faltan || 1,
          ninos: 0,
          adultosMayores: 0,
          necesidadesEspeciales: p.notas.slice(0, 200),
          prioridad,
          contactoNombre: contactoNombre.slice(0, 100),
          contactoCelular: celular,
          fuente: "MAPA_EMERGENCIA",
          estadoVerificacion: p.saturacion === "exceso" ? "VERIFICADO" : "NO_VERIFICADO",
          estadoResolucion,
        },
      });
      needsCreated++;
      if (needsCreated % 50 === 0) {
        console.log(`  ... ${needsCreated} necesidades creadas`);
      }
    } catch (err: any) {
      console.error(`Error creando ${codigo}: ${err.message?.slice(0, 80)}`);
    }
  }

  // Import collection centers
  for (const p of acopios) {
    const nombre = `[ME] ${p.nombre.slice(0, 80)}`;
    if (existingCenterNames.has(nombre)) {
      skipped++;
      continue;
    }

    const celMatch = (p.contacto || p.autor || "").match(/(\d{7,10})/);

    try {
      await prisma.collectionCenter.create({
        data: {
          nombre,
          direccion: p.direccion || p.nombre,
          zona: p.barrio || p.nombre.slice(0, 60),
          ciudad: "Cali",
          lat: p.lat,
          lng: p.lng,
          responsable: p.autor || p.contacto || "Comunidad",
          celular: celMatch ? celMatch[1] : "",
          horario: "24 horas",
          necesitan: p.necesidades.join(", ").slice(0, 300),
          noNecesitan:
            p.saturacion === "exceso" ? "Ya tienen suficiente ayuda" : "",
          activo: p.estado !== "cerrado",
        },
      });
      centersCreated++;
    } catch (err: any) {
      console.error(`Error creando acopio ${nombre}: ${err.message?.slice(0, 80)}`);
    }
  }

  console.log("\n=== IMPORTACIÓN COMPLETA ===");
  console.log(`Necesidades creadas: ${needsCreated}`);
  console.log(`Centros de acopio creados: ${centersCreated}`);
  console.log(`Omitidos (ya existían): ${skipped}`);
  console.log(
    `Total en BD: ${await prisma.need.count()} necesidades, ${await prisma.collectionCenter.count()} centros`
  );
}

main().catch(console.error);
