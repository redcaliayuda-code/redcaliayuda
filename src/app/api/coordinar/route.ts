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
  const { accion, needId, volunteerId, estado, notas } = body;

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

    return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Codigo incorrecto" }, { status: 401 });
  }

  const [needs, volunteers, missions] = await Promise.all([
    prisma.need.findMany({
      where: { estadoResolucion: { in: ["PENDIENTE", "EN_PROCESO"] } },
      orderBy: [{ prioridad: "asc" }, { createdAt: "desc" }],
      take: 300,
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
      },
    }),
    prisma.mission.findMany({
      where: { estado: { not: "CANCELADA" } },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { need: { select: { codigo: true, zona: true } }, volunteer: { select: { nombre: true } } },
    }),
  ]);

  return NextResponse.json({ needs, volunteers, missions });
}
