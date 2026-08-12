import Link from "next/link";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui";
import { haceCuanto } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PersonasPage({
  searchParams,
}: {
  searchParams: Promise<{ buscar?: string; registrado?: string }>;
}) {
  const params = await searchParams;
  const buscar = params.buscar?.trim() ?? "";
  const registrado = params.registrado ?? "";

  const reportes = await prisma.personReport.findMany({
    where: {
      estado: { not: "CERRADO" },
      ...(buscar
        ? {
            OR: [
              { nombrePersona: { contains: buscar, mode: "insensitive" } },
              { zona: { contains: buscar, mode: "insensitive" } },
              { ciudad: { contains: buscar, mode: "insensitive" } },
              { descripcion: { contains: buscar, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const estoyBien = reportes.filter((r) => r.tipo === "ESTOY_BIEN");
  const buscados = reportes.filter((r) => r.tipo === "BUSCO_PERSONA");

  return (
    <main className="min-h-screen safe-bottom">
      <header className="sticky top-0 z-10 border-b border-borde bg-superficie/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-sm font-bold tracking-tight text-acento">
            HumansCol
          </Link>
          <Link
            href="/personas/reportar"
            className="toque-activo rounded-lg bg-acento px-3 py-1.5 text-xs font-semibold text-superficie"
          >
            Reportar persona
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-5">
        {registrado && (
          <div className="mb-4 rounded-xl border border-ok/30 bg-ok-suave px-4 py-3 animar-entrada">
            <p className="text-sm font-medium text-ok">
              Reporte registrado con codigo {registrado}. Aparecera en el tablero.
            </p>
          </div>
        )}

        <h1 className="text-2xl font-bold tracking-tight">Tablero de personas</h1>
        <p className="mt-1 text-sm text-texto-suave">
          Busca a alguien o reporta que estas a salvo.
        </p>

        {/* Search */}
        <form className="mt-4">
          <div className="flex gap-2">
            <input
              name="buscar"
              defaultValue={buscar}
              placeholder="Buscar por nombre, barrio o ciudad..."
              className="flex-1 rounded-xl border border-borde bg-superficie px-4 py-3 text-sm outline-none focus:border-acento"
            />
            <button
              type="submit"
              className="toque-activo shrink-0 rounded-xl bg-acento px-4 py-3 text-sm font-semibold text-superficie"
            >
              Buscar
            </button>
          </div>
        </form>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-ok-suave p-3 text-center">
            <div className="text-2xl font-bold text-ok">{estoyBien.length}</div>
            <div className="text-xs text-texto-suave">Reportados a salvo</div>
          </div>
          <div className="rounded-xl bg-alerta-suave p-3 text-center">
            <div className="text-2xl font-bold text-alerta">{buscados.length}</div>
            <div className="text-xs text-texto-suave">Personas buscadas</div>
          </div>
        </div>

        {/* Buscados — primero, es lo urgente */}
        {buscados.length > 0 && (
          <section className="mt-6">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <span className="pulso inline-block h-2.5 w-2.5 rounded-full bg-alerta" />
              Personas buscadas
            </h2>
            <div className="mt-3 space-y-3 escalonar">
              {buscados.map((r) => (
                <article
                  key={r.id}
                  className="rounded-xl border border-alerta/30 bg-superficie p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🔍</span>
                        <span className="text-sm font-bold">{r.nombrePersona}</span>
                        {r.edad && <span className="text-xs text-texto-suave">{r.edad}</span>}
                      </div>
                      {r.descripcion && (
                        <p className="mt-1 text-sm text-texto-suave">{r.descripcion}</p>
                      )}
                    </div>
                    <Badge tono={r.estado === "ENCONTRADO" ? "ok" : "alerta"}>
                      {r.estado === "ENCONTRADO" ? "Encontrado" : "Buscando"}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-texto-suave">
                    {r.ultimaUbicacion && (
                      <span>Ultima vez: {r.ultimaUbicacion}</span>
                    )}
                    {r.zona && <span>Zona: {r.zona}</span>}
                    <span>{r.ciudad}</span>
                    <span>{haceCuanto(r.createdAt)}</span>
                  </div>
                  <div className="mt-2 text-xs">
                    <span className="text-texto-suave">Contacto: </span>
                    <span className="font-medium">{r.contactoNombre}</span>
                    <span className="text-texto-suave"> — </span>
                    <a href={`tel:${r.contactoCelular}`} className="font-medium text-acento">
                      {r.contactoCelular}
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Estoy bien */}
        {estoyBien.length > 0 && (
          <section className="mt-6">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-ok" />
              Reportados a salvo
            </h2>
            <div className="mt-3 space-y-2 escalonar">
              {estoyBien.map((r) => (
                <article
                  key={r.id}
                  className="rounded-xl border border-ok/20 bg-superficie p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">💚</span>
                        <span className="text-sm font-bold">{r.nombrePersona}</span>
                        {r.edad && <span className="text-xs text-texto-suave">{r.edad}</span>}
                      </div>
                      {r.descripcion && (
                        <p className="mt-1 text-sm text-texto-suave">{r.descripcion}</p>
                      )}
                    </div>
                    <Badge tono="ok">A salvo</Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-texto-suave">
                    {r.ultimaUbicacion && <span>Esta en: {r.ultimaUbicacion}</span>}
                    {r.zona && <span>Zona: {r.zona}</span>}
                    <span>{r.ciudad}</span>
                    <span>{haceCuanto(r.createdAt)}</span>
                  </div>
                  <div className="mt-2 text-xs">
                    <span className="text-texto-suave">Contacto: </span>
                    <a href={`tel:${r.contactoCelular}`} className="font-medium text-acento">
                      {r.contactoCelular}
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {reportes.length === 0 && (
          <div className="mt-10 rounded-xl border border-borde bg-superficie p-8 text-center">
            <div className="text-3xl">👥</div>
            <p className="mt-3 text-sm font-medium">
              {buscar
                ? `No se encontraron resultados para "${buscar}"`
                : "No hay reportes de personas aun"}
            </p>
            <p className="mt-1 text-xs text-texto-suave">
              {buscar
                ? "Intenta con otro nombre o zona."
                : "Se el primero en reportar que estas a salvo."}
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link
            href="/personas/reportar"
            className="toque-activo flex items-center justify-center gap-2 rounded-xl bg-ok px-4 py-3.5 text-sm font-semibold text-superficie"
          >
            💚 Estoy bien
          </Link>
          <Link
            href="/personas/reportar"
            className="toque-activo flex items-center justify-center gap-2 rounded-xl border-2 border-alerta bg-alerta-suave px-4 py-3.5 text-sm font-semibold text-alerta"
          >
            🔍 Busco a alguien
          </Link>
        </div>
      </div>
    </main>
  );
}
