import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const FIN_CODE = process.env.FIN_CODE || "finanzas2026";

function checkAuth(req: NextRequest) {
  const code = req.headers.get("x-fin-code");
  return code === FIN_CODE;
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Codigo incorrecto" }, { status: 401 });
  }

  const body = await req.json();
  const { accion } = body;

  try {
    if (accion === "registrar-ingreso") {
      const { monto, moneda, fuente, donante, concepto, notas, fecha } = body;
      if (!monto || !fuente) {
        return NextResponse.json({ error: "monto y fuente requeridos" }, { status: 400 });
      }
      const count = await prisma.ingreso.count();
      const codigo = `ING-${String(count + 1).padStart(4, "0")}`;
      const ingreso = await prisma.ingreso.create({
        data: {
          codigo,
          monto: parseFloat(monto),
          moneda: moneda || "USD",
          fuente,
          donante: donante || "",
          concepto: concepto || "",
          notas: notas || "",
          fecha: fecha ? new Date(fecha) : new Date(),
        },
      });
      return NextResponse.json({ ok: true, codigo: ingreso.codigo });
    }

    if (accion === "registrar-gasto") {
      const { monto, moneda, area, concepto, proveedor, notas, fecha } = body;
      if (!monto || !area || !concepto) {
        return NextResponse.json({ error: "monto, area y concepto requeridos" }, { status: 400 });
      }
      const count = await prisma.gasto.count();
      const codigo = `GAS-${String(count + 1).padStart(4, "0")}`;
      const gasto = await prisma.gasto.create({
        data: {
          codigo,
          monto: parseFloat(monto),
          moneda: moneda || "USD",
          area,
          concepto,
          proveedor: proveedor || "",
          notas: notas || "",
          fecha: fecha ? new Date(fecha) : new Date(),
        },
      });
      return NextResponse.json({ ok: true, codigo: gasto.codigo });
    }

    if (accion === "eliminar-ingreso") {
      const { id } = body;
      if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });
      await prisma.ingreso.delete({ where: { id } });
      return NextResponse.json({ ok: true });
    }

    if (accion === "eliminar-gasto") {
      const { id } = body;
      if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });
      await prisma.gasto.delete({ where: { id } });
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

  const [ingresos, gastos] = await Promise.all([
    prisma.ingreso.findMany({ orderBy: { fecha: "desc" } }),
    prisma.gasto.findMany({ orderBy: { fecha: "desc" } }),
  ]);

  const totalIngresos = ingresos.reduce((s, i) => s + i.monto, 0);
  const totalGastos = gastos.reduce((s, g) => s + g.monto, 0);

  const porFuente: Record<string, number> = {};
  for (const i of ingresos) {
    porFuente[i.fuente] = (porFuente[i.fuente] || 0) + i.monto;
  }

  const porArea: Record<string, number> = {};
  for (const g of gastos) {
    porArea[g.area] = (porArea[g.area] || 0) + g.monto;
  }

  return NextResponse.json({
    ingresos,
    gastos,
    totalIngresos,
    totalGastos,
    disponible: totalIngresos - totalGastos,
    porFuente,
    porArea,
  });
}
