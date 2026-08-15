import Link from "next/link";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui";

export const revalidate = 60;

export default async function AcopioPage() {
  const centros = await prisma.collectionCenter.findMany({
    where: { activo: true },
    orderBy: { createdAt: "desc" },
  });

  const conGeo = centros.filter((c) => c.lat && c.lng);

  const bboxPadding = 0.015;
  const mapSrc = conGeo.length > 0
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${
        Math.min(...conGeo.map((c) => c.lng!)) - bboxPadding
      }%2C${
        Math.min(...conGeo.map((c) => c.lat!)) - bboxPadding
      }%2C${
        Math.max(...conGeo.map((c) => c.lng!)) + bboxPadding
      }%2C${
        Math.max(...conGeo.map((c) => c.lat!)) + bboxPadding
      }&layer=mapnik&marker=${conGeo[0].lat}%2C${conGeo[0].lng}`
    : `https://www.openstreetmap.org/export/embed.html?bbox=-76.7%2C3.3%2C-75.4%2C5.1&layer=mapnik`;

  return (
    <main className="min-h-screen safe-bottom">
      <header className="sticky top-0 z-10 border-b border-borde bg-superficie/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-sm font-bold tracking-tight text-acento">
            Collab x Mindo
          </Link>
          <nav className="flex items-center gap-3 text-xs">
            <Link href="/necesidades" className="text-texto-suave hover:text-texto">Necesidades</Link>
            <Link href="/personas" className="text-texto-suave hover:text-texto">Personas</Link>
            <Link href="/recursos" className="text-texto-suave hover:text-texto">Recursos</Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Puntos de acopio y albergues</h1>
        <p className="mt-1 text-sm text-texto-suave">
          Lleva donaciones a estos puntos verificados. Toca la direccion para abrir en Google Maps.
        </p>

        {/* Mapa */}
        <div className="mt-4 overflow-hidden rounded-xl border border-borde">
          <iframe
            title="Mapa de puntos de acopio"
            src={mapSrc}
            className="h-56 w-full sm:h-72"
            style={{ border: "none" }}
          />
        </div>

        {/* Centros */}
        {centros.length === 0 ? (
          <div className="mt-6 rounded-xl border border-borde bg-superficie p-8 text-center">
            <div className="text-3xl">📦</div>
            <p className="mt-3 text-sm font-medium">No hay puntos de acopio registrados aun</p>
            <p className="mt-1 text-xs text-texto-suave">
              Se agregan desde el panel de coordinacion.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4 escalonar">
            {centros.map((c, i) => (
              <article
                key={c.id}
                className={`rounded-xl border-2 bg-superficie p-5 transition ${
                  i === 0 ? "border-acento shadow-lg" : "border-borde"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xl">📦</span>
                      <span className="text-base font-bold">{c.nombre}</span>
                      {i === 0 && <Badge tono="acento">Destacado</Badge>}
                      <Badge tono="ok">Activo</Badge>
                    </div>
                    <a
                      href={
                        c.lat && c.lng
                          ? `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`
                          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.direccion + ", " + c.ciudad)}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-sm text-acento hover:underline"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {c.direccion}, {c.ciudad}
                    </a>
                  </div>
                </div>

                {c.zona && (
                  <div className="mt-2 text-xs text-texto-suave">
                    Zona: {c.zona}
                  </div>
                )}

                <div className="mt-3 space-y-2">
                  {c.necesitan && (
                    <div className="rounded-lg bg-ok-suave px-3 py-2.5">
                      <div className="text-xs font-bold text-ok">Se necesita recibir:</div>
                      <p className="mt-0.5 text-sm text-ok">{c.necesitan}</p>
                    </div>
                  )}
                  {c.noNecesitan && (
                    <div className="rounded-lg bg-alerta-suave px-3 py-2.5">
                      <div className="text-xs font-bold text-alerta">NO enviar:</div>
                      <p className="mt-0.5 text-sm text-alerta">{c.noNecesitan}</p>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-texto-suave">
                  {c.horario && (
                    <span className="flex items-center gap-1">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                      {c.horario}
                    </span>
                  )}
                  {c.responsable && (
                    <span>Responsable: {c.responsable}</span>
                  )}
                  {c.celular && (
                    <a href={`tel:${c.celular}`} className="font-medium text-acento">
                      {c.celular}
                    </a>
                  )}
                </div>

                {/* Botones de accion */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={
                      c.lat && c.lng
                        ? `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.direccion + ", " + c.ciudad)}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="toque-activo inline-flex items-center gap-2 rounded-lg bg-acento px-4 py-2.5 text-sm font-semibold text-superficie"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                      <path d="M3 12h18M3 12l6-6M3 12l6 6" />
                    </svg>
                    Como llegar
                  </a>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `Punto de acopio Collab x Mindo:\n📦 ${c.nombre}\n📍 ${c.direccion}, ${c.ciudad}\n` +
                      (c.horario ? `🕐 ${c.horario}\n` : "") +
                      (c.necesitan ? `✅ Necesitan: ${c.necesitan}\n` : "") +
                      (c.lat && c.lng ? `🗺️ https://www.google.com/maps?q=${c.lat},${c.lng}\n` : "") +
                      `\nMas info: https://redcaliayuda-psi.vercel.app/acopio`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="toque-activo inline-flex items-center gap-2 rounded-lg border border-ok bg-ok-suave px-4 py-2.5 text-sm font-semibold text-ok"
                  >
                    💬 Compartir por WhatsApp
                  </a>
                </div>

                {/* Mapa individual */}
                {c.lat && c.lng && (
                  <div className="mt-4 overflow-hidden rounded-lg border border-borde">
                    <iframe
                      title={`Mapa ${c.nombre}`}
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${c.lng - 0.004}%2C${c.lat - 0.003}%2C${c.lng + 0.004}%2C${c.lat + 0.003}&layer=mapnik&marker=${c.lat}%2C${c.lng}`}
                      className="h-40 w-full"
                      style={{ border: "none" }}
                    />
                  </div>
                )}
              </article>
            ))}
          </div>
        )}

        {/* CTA para agregar */}
        <div className="mt-8 rounded-xl border border-borde bg-superficie p-5 text-center">
          <p className="text-sm font-medium">Conoces un punto de acopio o albergue?</p>
          <p className="mt-1 text-xs text-texto-suave">
            Reportalo en la seccion de reportes de zona para que mas personas lo encuentren.
          </p>
          <Link
            href="/reportes?ver=nuevo"
            className="toque-activo mt-3 inline-block rounded-lg bg-acento px-4 py-2 text-sm font-semibold text-superficie"
          >
            Reportar punto de acopio
          </Link>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-acento hover:underline">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
