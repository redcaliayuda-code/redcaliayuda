import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";

const CAT: Record<string, string> = {
  AGUA: "Agua", ALIMENTOS: "Alimentos", MEDICAMENTOS: "Medicamentos",
  HIGIENE: "Higiene", PANALES: "Pañales", REFUGIO: "Refugio",
  COBIJAS: "Cobijas", LINTERNAS: "Linternas", HERRAMIENTAS: "Herramientas",
  ATENCION_MEDICA: "Atención médica", ATENCION_PSICOLOGICA: "Psicológica",
  TRANSPORTE: "Transporte", ALOJAMIENTO: "Alojamiento",
  EVACUACION: "Evacuación", DESAPARECIDOS: "Desaparecidos", OTRO: "Otro",
};

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default async function GraciasPage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const necesidad = await prisma.need.findFirst({ where: { codigo } });

  let voluntariosCercanos: { nombre: string; celular: string; distancia: number; tipoAyuda: string }[] = [];

  if (necesidad?.lat != null && necesidad?.lng != null) {
    const todos = await prisma.volunteer.findMany({
      where: {
        disponibilidad: { not: "INDEFINIDO" },
        lat: { not: null },
        lng: { not: null },
      },
      select: { nombre: true, celular: true, lat: true, lng: true, tipoAyuda: true },
    });

    voluntariosCercanos = todos
      .map((v) => ({
        nombre: v.nombre,
        celular: v.celular,
        tipoAyuda: v.tipoAyuda,
        distancia: haversine(necesidad.lat!, necesidad.lng!, v.lat!, v.lng!),
      }))
      .filter((v) => v.distancia <= 10000)
      .sort((a, b) => a.distancia - b.distancia)
      .slice(0, 5);
  }

  const catLabel = necesidad ? (CAT[necesidad.categoria] ?? necesidad.categoria) : "";
  const shareText = necesidad
    ? `Necesitan ayuda en ${necesidad.zona || necesidad.ciudad}:\n` +
      `📋 ${catLabel}${necesidad.cantidad ? ` — ${necesidad.cantidad}` : ""}\n` +
      `📍 ${necesidad.direccion}\n` +
      `👥 ${necesidad.personasAfectadas} persona${necesidad.personasAfectadas !== 1 ? "s" : ""}\n` +
      `⚡ Prioridad: ${necesidad.prioridad}\n` +
      (necesidad.lat && necesidad.lng ? `🗺️ https://www.google.com/maps?q=${necesidad.lat},${necesidad.lng}\n` : "") +
      `\nSi puedes ayudar, entra a Collab x Mindo: https://redcaliayuda.vercel.app/cerca`
    : "";

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

        {/* Compartir por WhatsApp */}
        {necesidad && (
          <div className="mt-5">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="toque-activo inline-flex items-center gap-2 rounded-xl bg-ok px-5 py-3 text-sm font-bold text-superficie"
            >
              💬 Compartir esta necesidad por WhatsApp
            </a>
            <p className="mt-2 text-xs text-texto-suave">
              Comparte con tus vecinos, grupos de barrio o familia para que alguien cercano pueda ayudar.
            </p>
          </div>
        )}

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

      {/* Voluntarios cercanos — visible para coordinadores */}
      {voluntariosCercanos.length > 0 && (
        <Card className="mt-6 p-5 text-left">
          <div className="flex items-center gap-2">
            <span className="text-lg">📡</span>
            <h2 className="text-sm font-bold">Voluntarios cercanos detectados</h2>
          </div>
          <p className="mt-1 text-xs text-texto-suave">
            Estos voluntarios estan cerca de la ubicacion reportada. Toca para notificarles por WhatsApp.
          </p>
          <div className="mt-3 space-y-2">
            {voluntariosCercanos.map((v) => {
              const distLabel = v.distancia < 1000
                ? `${Math.round(v.distancia)}m`
                : `${(v.distancia / 1000).toFixed(1)}km`;

              const msg =
                `Hola ${v.nombre}, hay una nueva necesidad cerca de ti en Collab x Mindo:\n\n` +
                `📋 ${catLabel}${necesidad!.cantidad ? ` — ${necesidad!.cantidad}` : ""}\n` +
                `📍 ${necesidad!.direccion}, ${necesidad!.zona || necesidad!.ciudad}\n` +
                `👥 ${necesidad!.personasAfectadas} persona${necesidad!.personasAfectadas !== 1 ? "s" : ""}\n` +
                `⚡ ${necesidad!.prioridad}\n` +
                (necesidad!.lat && necesidad!.lng ? `🗺️ https://www.google.com/maps?q=${necesidad!.lat},${necesidad!.lng}\n` : "") +
                `\nSi puedes ayudar, entra: https://redcaliayuda.vercel.app/cerca`;

              return (
                <a
                  key={v.celular}
                  href={`https://wa.me/57${v.celular}?text=${encodeURIComponent(msg)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="toque-activo flex items-center justify-between gap-3 rounded-lg border border-borde p-3 transition hover:border-ok"
                >
                  <div>
                    <div className="text-sm font-medium">{v.nombre}</div>
                    <div className="text-xs text-texto-suave">{v.tipoAyuda}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-acento-suave px-2 py-0.5 text-xs font-bold text-acento">
                      {distLabel}
                    </span>
                    <span className="text-sm text-ok">💬</span>
                  </div>
                </a>
              );
            })}
          </div>
        </Card>
      )}
    </main>
  );
}
