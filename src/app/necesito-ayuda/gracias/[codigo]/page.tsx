import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function GraciasPage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const necesidad = await prisma.need.findFirst({ where: { codigo } });

  return (
    <main className="mx-auto max-w-xl px-5 py-16 text-center">
      <Card className="p-8">
        <div className="text-4xl">✓</div>
        <h1 className="mt-4 text-2xl font-semibold">Necesidad reportada</h1>
        <p className="mt-2 text-texto-suave">
          Tu reporte fue registrado con el código:
        </p>
        <div className="mt-3 inline-flex rounded-lg bg-acento-suave px-4 py-2 text-lg font-semibold text-acento">
          {codigo}
        </div>

        {necesidad?.lat != null && necesidad?.lng != null && (
          <div className="mt-5 overflow-hidden rounded-lg border border-borde text-left">
            <iframe
              title="Tu ubicación reportada"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${necesidad.lng - 0.005}%2C${necesidad.lat - 0.003}%2C${necesidad.lng + 0.005}%2C${necesidad.lat + 0.003}&layer=mapnik&marker=${necesidad.lat}%2C${necesidad.lng}`}
              className="h-48 w-full"
              style={{ border: "none" }}
            />
            <div className="flex items-center gap-2 bg-superficie-elevada px-3 py-1.5 text-xs text-texto-suave">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5 shrink-0 text-acento">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{necesidad.zona || necesidad.ciudad} — {necesidad.direccion}</span>
            </div>
          </div>
        )}

        <p className="mt-4 text-sm text-texto-suave">
          Un verificador revisará la información. Te contactaremos por celular para
          confirmar y coordinar la ayuda. Si tu situación es de riesgo vital, llama
          al <strong>123</strong>.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg border border-borde px-4 py-2 text-sm font-medium transition hover:bg-fondo"
          >
            Volver al inicio
          </Link>
          <Link
            href="/necesito-ayuda"
            className="rounded-lg bg-acento px-4 py-2 text-sm font-medium text-superficie transition hover:opacity-90"
          >
            Reportar otra necesidad
          </Link>
        </div>
      </Card>
    </main>
  );
}
