import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { accion } = body;

  try {
    if (accion === "registrar") {
      const { nombre, celular, zona, especialidad, equipo, herramientasTiene, herramientasNecesita, notas } = body;
      if (!nombre || !celular || !zona) {
        return NextResponse.json({ error: "nombre, celular y zona requeridos" }, { status: 400 });
      }

      const count = await prisma.rescatista.count();
      const codigo = `RES-${String(count + 1).padStart(4, "0")}`;

      const rescatista = await prisma.rescatista.create({
        data: {
          codigo,
          nombre,
          celular,
          zona,
          especialidad: especialidad || "",
          equipo: equipo || "",
          herramientasTiene: herramientasTiene || "",
          herramientasNecesita: herramientasNecesita || "",
          notas: notas || "",
        },
      });

      return NextResponse.json({ ok: true, codigo: rescatista.codigo });
    }

    if (accion === "actualizar-estado") {
      const { codigo, estado } = body;
      if (!codigo || !estado) {
        return NextResponse.json({ error: "codigo y estado requeridos" }, { status: 400 });
      }
      await prisma.rescatista.update({
        where: { codigo },
        data: { estado },
      });
      return NextResponse.json({ ok: true });
    }

    if (accion === "actualizar-necesidades") {
      const { codigo, herramientasNecesita } = body;
      if (!codigo) {
        return NextResponse.json({ error: "codigo requerido" }, { status: 400 });
      }
      await prisma.rescatista.update({
        where: { codigo },
        data: { herramientasNecesita: herramientasNecesita || "" },
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  const rescatistas = await prisma.rescatista.findMany({
    where: { estado: { not: "INACTIVO" } },
    orderBy: [{ estado: "asc" }, { createdAt: "desc" }],
  });

  const porZona: Record<string, typeof rescatistas> = {};
  for (const r of rescatistas) {
    const z = r.zona || "Sin zona";
    if (!porZona[z]) porZona[z] = [];
    porZona[z].push(r);
  }

  return NextResponse.json({ rescatistas, porZona });
}
