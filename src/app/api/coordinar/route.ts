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
  const { accion, needId, volunteerId, estado, notas, centerId, inventario } = body;

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

    return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Codigo incorrecto" }, { status: 401 });
  }

  const [needs, volunteers, missions, centers, inventory] = await Promise.all([
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
  ]);

  const demanda: Record<string, number> = {};
  for (const n of needs) {
    demanda[n.categoria] = (demanda[n.categoria] || 0) + 1;
  }

  return NextResponse.json({ needs, volunteers, missions, centers, inventory, demanda });
}
