import Link from "next/link";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

const ICONOS_EMERGENCIA: { tipo: string; icono: string; nombre: string; telefono: string }[] = [
  { tipo: "emergencia", icono: "🚨", nombre: "Linea de emergencias", telefono: "123" },
  { tipo: "bomberos", icono: "🚒", nombre: "Bomberos Cali", telefono: "119" },
  { tipo: "cruz_roja", icono: "🏥", nombre: "Cruz Roja", telefono: "132" },
  { tipo: "defensa_civil", icono: "🛡️", nombre: "Defensa Civil", telefono: "144" },
  { tipo: "gestion_riesgo", icono: "📋", nombre: "Gestion del Riesgo Cali", telefono: "112" },
];

export default async function RecursosPage() {
  const centros = await prisma.collectionCenter.findMany({
    where: { activo: true },
    orderBy: { createdAt: "desc" },
  });

  const conGeo = centros.filter((c) => c.lat && c.lng);

  return (
    <main className="min-h-screen safe-bottom">
      <header className="sticky top-0 z-10 border-b border-borde bg-superficie/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-sm font-bold tracking-tight text-acento">
            RED CALI
          </Link>
          <nav className="flex items-center gap-3 text-xs">
            <Link href="/necesidades" className="text-texto-suave hover:text-texto">Necesidades</Link>
            <Link href="/personas" className="text-texto-suave hover:text-texto">Personas</Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Recursos de emergencia</h1>
        <p className="mt-1 text-sm text-texto-suave">
          Numeros de emergencia, centros de acopio y puntos de ayuda.
        </p>

        {/* Numeros de emergencia */}
        <section className="mt-6">
          <h2 className="text-lg font-bold">Numeros de emergencia</h2>
          <div className="mt-3 space-y-2 escalonar">
            {ICONOS_EMERGENCIA.map((e) => (
              <a
                key={e.tipo}
                href={`tel:${e.telefono}`}
                className="toque-activo flex items-center gap-4 rounded-xl border border-borde bg-superficie p-4 transition hover:border-acento"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-alerta-suave text-2xl">
                  {e.icono}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{e.nombre}</div>
                  <div className="text-xs text-texto-suave">Toca para llamar</div>
                </div>
                <div className="text-xl font-bold text-acento">{e.telefono}</div>
              </a>
            ))}
          </div>
        </section>

        {/* Mapa de centros */}
        {conGeo.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-bold">Mapa de centros de acopio</h2>
            <div className="mt-3 overflow-hidden rounded-xl border border-borde">
              <iframe
                title="Mapa de centros de acopio"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                  Math.min(...conGeo.map((c) => c.lng!)) - 0.01
                }%2C${
                  Math.min(...conGeo.map((c) => c.lat!)) - 0.006
                }%2C${
                  Math.max(...conGeo.map((c) => c.lng!)) + 0.01
                }%2C${
                  Math.max(...conGeo.map((c) => c.lat!)) + 0.006
                }&layer=mapnik&marker=${conGeo[0].lat}%2C${conGeo[0].lng}`}
                className="h-56 w-full"
                style={{ border: "none" }}
              />
            </div>
          </section>
        )}

        {/* Centros de acopio */}
        <section className="mt-8">
          <h2 className="text-lg font-bold">Centros de acopio</h2>
          {centros.length === 0 ? (
            <div className="mt-3 rounded-xl border border-borde bg-superficie p-8 text-center">
              <div className="text-3xl">📦</div>
              <p className="mt-3 text-sm font-medium">No hay centros de acopio registrados</p>
              <p className="mt-1 text-xs text-texto-suave">
                Los centros se agregan desde el panel de coordinacion.
              </p>
            </div>
          ) : (
            <div className="mt-3 space-y-3 escalonar">
              {centros.map((c) => (
                <article key={c.id} className="rounded-xl border border-borde bg-superficie p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📦</span>
                        <span className="text-sm font-bold">{c.nombre}</span>
                      </div>
                      <p className="mt-1 text-xs text-texto-suave">{c.direccion}</p>
                    </div>
                    <Badge tono="ok">Activo</Badge>
                  </div>

                  <div className="mt-3 space-y-2">
                    {c.necesitan && (
                      <div className="rounded-lg bg-aviso-suave px-3 py-2">
                        <div className="text-xs font-bold text-aviso">Necesitan recibir:</div>
                        <p className="text-xs text-aviso">{c.necesitan}</p>
                      </div>
                    )}
                    {c.noNecesitan && (
                      <div className="rounded-lg bg-alerta-suave px-3 py-2">
                        <div className="text-xs font-bold text-alerta">NO enviar:</div>
                        <p className="text-xs text-alerta">{c.noNecesitan}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-texto-suave">
                    {c.zona && <span>Zona: {c.zona}</span>}
                    {c.horario && <span>Horario: {c.horario}</span>}
                    <span>
                      Responsable: {c.responsable} —{" "}
                      <a href={`tel:${c.celular}`} className="font-medium text-acento">
                        {c.celular}
                      </a>
                    </span>
                  </div>

                  {c.lat && c.lng && (
                    <div className="mt-3 overflow-hidden rounded-lg border border-borde">
                      <iframe
                        title={`Mapa ${c.nombre}`}
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${c.lng - 0.003}%2C${c.lat - 0.002}%2C${c.lng + 0.003}%2C${c.lat + 0.002}&layer=mapnik&marker=${c.lat}%2C${c.lng}`}
                        className="h-32 w-full"
                        style={{ border: "none" }}
                      />
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Info util */}
        <section className="mt-8 rounded-xl border border-borde bg-superficie p-5">
          <h2 className="text-sm font-bold">Recomendaciones post-sismo</h2>
          <ul className="mt-3 space-y-2 text-xs text-texto-suave leading-relaxed">
            <li className="flex gap-2"><span className="text-alerta">!</span> No entrar a edificios con grietas visibles en columnas o muros.</li>
            <li className="flex gap-2"><span className="text-alerta">!</span> Cerrar llaves de gas y agua si hay fugas.</li>
            <li className="flex gap-2"><span className="text-aviso">!</span> Hervir el agua antes de consumirla hasta nuevo aviso.</li>
            <li className="flex gap-2"><span className="text-aviso">!</span> Mantener el celular cargado y ahorrar bateria.</li>
            <li className="flex gap-2"><span className="text-ok">i</span> Usar WhatsApp o mensajes de texto en vez de llamadas para no saturar la red.</li>
            <li className="flex gap-2"><span className="text-ok">i</span> Verificar informacion antes de compartirla.</li>
          </ul>
        </section>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-acento hover:underline">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
