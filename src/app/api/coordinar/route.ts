import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const COORD_CODE = process.env.COORD_CODE || "coordinar2026";

function checkAuth(req: NextRequest) {
  const code = req.headers.get("x-coord-code");
  return code === COORD_CODE;
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Codigo incorrecto" }, { status: 401 });
  }

  const body = await req.json();
  const { accion, needId, volunteerId, estado, notas, centerId, inventario, turnoId, zona, titulo, inicio, fin, asignacionId } = body;

  try {
    if (accion === "actualizar-necesidad") {
      const need = await prisma.need.update({
        where: { id: needId },
        data: {
          estadoResolucion: estado,
          ...(notas ? { necesidadesEspeciales: notas } : {}),
        },
      });
      return NextResponse.json({ ok: true, need: { id: need.id, codigo: need.codigo, estado: need.estadoResolucion } });
    }

    if (accion === "crear-mision") {
      const missionCount = await prisma.mission.count();
      const codigo = `MIS-${String(missionCount + 1).padStart(4, "0")}`;

      const need = await prisma.need.findUnique({ where: { id: needId } });
      if (!need) return NextResponse.json({ error: "Necesidad no encontrada" }, { status: 404 });

      const mission = await prisma.mission.create({
        data: {
          codigo,
          needId,
          volunteerId: volunteerId || null,
          prioridad: need.prioridad,
          estado: volunteerId ? "ASIGNADA" : "PENDIENTE",
          descripcion: `Misión coordinada: ${need.descripcion.slice(0, 100)}`,
        },
      });

      if (volunteerId) {
        await prisma.need.update({
          where: { id: needId },
          data: { estadoResolucion: "EN_PROCESO" },
        });
      }

      return NextResponse.json({ ok: true, mission: { id: mission.id, codigo: mission.codigo } });
    }

    if (accion === "verificar-necesidad") {
      const need = await prisma.need.update({
        where: { id: needId },
        data: { estadoVerificacion: "VERIFICADO" },
      });
      return NextResponse.json({ ok: true, need: { id: need.id, codigo: need.codigo, verificado: true } });
    }

    if (accion === "guardar-inventario") {
      if (!centerId || !Array.isArray(inventario)) {
        return NextResponse.json({ error: "centerId e inventario requeridos" }, { status: 400 });
      }
      await prisma.inventoryItem.deleteMany({ where: { centerId } });
      if (inventario.length > 0) {
        await prisma.inventoryItem.createMany({
          data: inventario.map((item: { categoria: string; nombre: string; cantidad: number; unidad: string; estado: string; notas?: string }) => ({
            centerId,
            categoria: item.categoria,
            nombre: item.nombre || "",
            cantidad: item.cantidad,
            unidad: item.unidad || "unidades",
            estado: item.estado || "DISPONIBLE",
            notas: item.notas || "",
          })),
        });
      }
      return NextResponse.json({ ok: true });
    }

    if (accion === "crear-turno") {
      if (!zona || !inicio || !fin) {
        return NextResponse.json({ error: "zona, inicio y fin requeridos" }, { status: 400 });
      }
      const turno = await prisma.turno.create({
        data: {
          zona,
          titulo: titulo || "",
          inicio: new Date(inicio),
          fin: new Date(fin),
          notas: notas || "",
        },
      });
      return NextResponse.json({ ok: true, turno: { id: turno.id } });
    }

    if (accion === "asignar-turno") {
      if (!turnoId || !volunteerId) {
        return NextResponse.json({ error: "turnoId y volunteerId requeridos" }, { status: 400 });
      }
      const asig = await prisma.turnoVoluntario.create({
        data: { turnoId, volunteerId },
      });
      return NextResponse.json({ ok: true, asignacion: { id: asig.id } });
    }

    if (accion === "estado-asignacion") {
      if (!asignacionId || !estado) {
        return NextResponse.json({ error: "asignacionId y estado requeridos" }, { status: 400 });
      }
      const data: Record<string, any> = { estado };
      if (estado === "ACTIVO") data.inicioReal = new Date();
      if (estado === "DESCANSANDO" || estado === "COMPLETADO") data.finReal = new Date();
      await prisma.turnoVoluntario.update({ where: { id: asignacionId }, data });
      return NextResponse.json({ ok: true });
    }

    if (accion === "estado-turno") {
      if (!turnoId || !estado) {
        return NextResponse.json({ error: "turnoId y estado requeridos" }, { status: 400 });
      }
      await prisma.turno.update({ where: { id: turnoId }, data: { estado } });
      return NextResponse.json({ ok: true });
    }

    if (accion === "eliminar-asignacion") {
      if (!asignacionId) {
        return NextResponse.json({ error: "asignacionId requerido" }, { status: 400 });
      }
      await prisma.turnoVoluntario.delete({ where: { id: asignacionId } });
      return NextResponse.json({ ok: true });
    }

    if (accion === "registrar-rescatista") {
      const { nombre, celular, especialidad, equipo, herramientasTiene, herramientasNecesita } = body;
      if (!nombre || !zona) {
        return NextResponse.json({ error: "nombre y zona requeridos" }, { status: 400 });
      }
      const count = await prisma.rescatista.count();
      const codigo = `RES-${String(count + 1).padStart(4, "0")}`;
      const rescatista = await prisma.rescatista.create({
        data: {
          codigo,
          nombre,
          celular: celular || "",
          zona,
          especialidad: especialidad || "",
          equipo: equipo || "",
          herramientasTiene: herramientasTiene || "",
          herramientasNecesita: herramientasNecesita || "",
        },
      });
      const volCount = await prisma.volunteer.count();
      const volCodigo = `VOL-${String(volCount + 1).padStart(4, "0")}`;
      const celularVal = celular || `res-${codigo}`;
      const existing = celular ? await prisma.volunteer.findUnique({ where: { celular } }) : null;
      if (!existing) {
        await prisma.volunteer.create({
          data: {
            codigo: volCodigo,
            nombre,
            celular: celularVal,
            zona,
            tipoAyuda: "ESPECIALISTA",
            especializacion: especialidad || "rescatista",
            descripcion: `Rescatista ${codigo}${equipo ? ` — ${equipo}` : ""}`,
            recursosOfrecidos: herramientasTiene || "",
          },
        });
      }
      return NextResponse.json({ ok: true, codigo: rescatista.codigo });
    }

    return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Codigo incorrecto" }, { status: 401 });
  }

  const [needs, volunteers, missions, centers, inventory, turnos, rescatistas] = await Promise.all([
    prisma.need.findMany({
      where: { estadoResolucion: { in: ["PENDIENTE", "EN_PROCESO"] } },
      orderBy: [{ createdAt: "desc" }],
      take: 1000,
      select: {
        id: true, codigo: true, categoria: true, prioridad: true,
        descripcion: true, zona: true, ciudad: true, lat: true, lng: true,
        estadoResolucion: true, estadoVerificacion: true, contactoNombre: true,
        contactoCelular: true, createdAt: true,
      },
    }),
    prisma.volunteer.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true, codigo: true, nombre: true, celular: true,
        tipoAyuda: true, descripcion: true, vehiculo: true,
        lat: true, lng: true, zona: true, disponibilidad: true,
        especializacion: true, recursosOfrecidos: true,
        capacidadCarga: true, verificado: true, misionesCompletadas: true,
        createdAt: true,
      },
    }),
    prisma.mission.findMany({
      where: { estado: { not: "CANCELADA" } },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { need: { select: { codigo: true, zona: true } }, volunteer: { select: { nombre: true } } },
    }),
    prisma.collectionCenter.findMany({
      where: { activo: true },
      select: { id: true, nombre: true, direccion: true, zona: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.inventoryItem.findMany({
      orderBy: { categoria: "asc" },
      include: { center: { select: { nombre: true } } },
    }),
    prisma.turno.findMany({
      where: { estado: { in: ["PROGRAMADO", "ACTIVO"] } },
      orderBy: { inicio: "asc" },
      include: {
        asignaciones: {
          include: { volunteer: { select: { id: true, nombre: true, celular: true, tipoAyuda: true, especializacion: true } } },
        },
      },
    }),
    prisma.rescatista.findMany({
      where: { estado: { not: "INACTIVO" } },
      orderBy: { createdAt: "desc" },
      select: { id: true, codigo: true, nombre: true, celular: true, zona: true, especialidad: true, equipo: true, estado: true, herramientasNecesita: true },
    }),
  ]);

  const ITEMS_KEYWORDS: [string, string[]][] = [
    ["Agua", ["agua"]],
    ["Comida/Alimentos", ["comida", "alimentos", "alimentación", "alimentacion"]],
    ["Colchonetas", ["colchonetas", "colchoneta"]],
    ["Cobijas", ["cobijas", "cobija", "frazadas"]],
    ["Carpas", ["carpas", "carpa"]],
    ["Pañales", ["pañales", "panal", "pañal"]],
    ["Medicamentos", ["medicamentos", "medicinas", "medicina", "botiquín", "botiquin"]],
    ["Linternas", ["linternas", "linterna"]],
    ["Ropa", ["ropa"]],
    ["Leche", ["leche"]],
    ["Electrolitos", ["electrolitos"]],
    ["Tapabocas", ["tapabocas"]],
    ["Colchones", ["colchones", "colchon"]],
    ["Comida animales", ["comida para animales", "mascotas"]],
    ["Voluntarios", ["voluntarios"]],
    ["Herramientas", ["herramientas"]],
    ["Materiales reparar", ["materiales para reparar", "materiales"]],
    ["Cintas seguridad", ["cintas de seguridad", "cintas"]],
    ["Atención médica", ["atención médica", "atencion medica", "medico", "médico"]],
    ["Atención psicológica", ["psicológica", "psicologica", "psicólogo", "psicologo"]],
    ["Transporte", ["transporte"]],
    ["Refugio/Albergue", ["refugio", "albergue", "alojamiento"]],
  ];

  const demandaItems: Record<string, number> = {};
  for (const n of needs) {
    const text = (n.descripcion + " " + (n.categoria === "OTRO" ? "" : n.categoria)).toLowerCase();
    for (const [label, keywords] of ITEMS_KEYWORDS) {
      if (keywords.some((kw) => text.includes(kw))) {
        demandaItems[label] = (demandaItems[label] || 0) + 1;
      }
    }
  }

  const demandaCat: Record<string, number> = {};
  for (const n of needs) {
    demandaCat[n.categoria] = (demandaCat[n.categoria] || 0) + 1;
  }

  return NextResponse.json({ needs, volunteers, missions, centers, inventory, turnos, rescatistas, demandaItems, demandaCat });
}
