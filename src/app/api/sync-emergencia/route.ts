import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

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
}

function buildNeedData(p: Punto) {
  const categoria = TIPO_TO_CATEGORIA[p.tipo] || "OTRO";
  const prioridad = ESTADO_TO_PRIORIDAD[p.estado] || "P2";
  const descripcion =
    p.necesidades.length > 0
      ? `${p.nombre}: Se necesita ${p.necesidades.join(", ")}`
      : p.notas || p.nombre;
  const celMatch = (p.contacto || p.autor || "").match(/(\d{7,10})/);
  const celular = celMatch ? celMatch[1] : "0000000000";
  const contactoNombre = p.autor || p.contacto || p.nombre.slice(0, 50);

  let estadoResolucion = "PENDIENTE";
  if (p.estado === "cubierto" || p.saturacion === "exceso")
    estadoResolucion = "EN_PROCESO";
  if (p.estado === "cerrado") estadoResolucion = "RESUELTO";

  return {
    lat: p.lat,
    lng: p.lng,
    direccion: p.direccion || p.nombre,
    zona: p.barrio || p.nombre.slice(0, 60),
    ciudad: "Cali",
    categoria,
    descripcion: descripcion.slice(0, 500),
    cantidad: p.necesidades.slice(0, 5).join(", ") || "",
    personasAfectadas: Math.max(p.voluntarios_faltan, 1),
    necesidadesEspeciales: p.notas.slice(0, 200),
    prioridad,
    contactoNombre: contactoNombre.slice(0, 100),
    contactoCelular: celular,
    fuente: "MAPA_EMERGENCIA",
    estadoVerificacion:
      p.saturacion === "exceso" ? "VERIFICADO" : "NO_VERIFICADO",
    estadoResolucion,
  };
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const res = await fetch(API_URL, { cache: "no-store" });
    const data = await res.json();
    const puntos: Punto[] = data.puntos;

    const importables = puntos.filter(
      (p) =>
        p.ubicado && p.lat && p.lng && p.estado !== "descartado"
    );

    const necesidades = importables.filter((p) => p.tipo !== "acopio");
    const acopios = importables.filter((p) => p.tipo === "acopio");

    let created = 0;
    let updated = 0;
    let centersCreated = 0;
    let centersUpdated = 0;

    for (const p of necesidades) {
      const codigo = `NEC-ME-${p.id.slice(0, 8)}`;
      const needData = buildNeedData(p);

      try {
        const existing = await prisma.need.findUnique({ where: { codigo } });
        if (existing) {
          await prisma.need.update({
            where: { codigo },
            data: {
              ...needData,
              ninos: existing.ninos,
              adultosMayores: existing.adultosMayores,
            },
          });
          updated++;
        } else {
          await prisma.need.create({
            data: { codigo, ...needData, ninos: 0, adultosMayores: 0 },
          });
          created++;
        }
      } catch {
        // skip errors
      }
    }

    for (const p of acopios) {
      const nombre = `[ME] ${p.nombre.slice(0, 80)}`;
      const celMatch = (p.contacto || p.autor || "").match(/(\d{7,10})/);
      const centerData = {
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
      };

      try {
        const existing = await prisma.collectionCenter.findFirst({
          where: { nombre },
        });
        if (existing) {
          await prisma.collectionCenter.update({
            where: { id: existing.id },
            data: centerData,
          });
          centersUpdated++;
        } else {
          await prisma.collectionCenter.create({
            data: { nombre, ...centerData },
          });
          centersCreated++;
        }
      } catch {
        // skip errors
      }
    }

    const totalNeeds = await prisma.need.count();
    const totalCenters = await prisma.collectionCenter.count();

    return NextResponse.json({
      ok: true,
      sync: new Date().toISOString(),
      fuente: "mapa-emergencia.artefactofilms.workers.dev",
      puntosRecibidos: puntos.length,
      necesidades: { creadas: created, actualizadas: updated },
      centros: { creados: centersCreated, actualizados: centersUpdated },
      totales: { necesidades: totalNeeds, centros: totalCenters },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Error de sync" },
      { status: 500 }
    );
  }
}
