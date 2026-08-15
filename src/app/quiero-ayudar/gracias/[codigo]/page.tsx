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

const CAT_ICON: Record<string, string> = {
  AGUA: "💧", ALIMENTOS: "🍚", MEDICAMENTOS: "💊", HIGIENE: "🧴",
  PANALES: "👶", REFUGIO: "🏠", COBIJAS: "🛏️", LINTERNAS: "🔦",
  HERRAMIENTAS: "🔧", ATENCION_MEDICA: "🏥", ATENCION_PSICOLOGICA: "🧠",
  TRANSPORTE: "🚗", ALOJAMIENTO: "🏡", EVACUACION: "🚨",
  DESAPARECIDOS: "🔍", OTRO: "📋",
};

const PRIO_LABEL: Record<string, string> = {
  P1: "VIDA", P2: "SUPERVIVENCIA", P3: "RECUPERACIÓN", P4: "APOYO",
};

const PRIO_COLOR: Record<string, string> = {
  P1: "text-alerta", P2: "text-aviso", P3: "text-acento", P4: "text-ok",
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

export default async function GraciasVoluntarioPage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const voluntario = await prisma.volunteer.findFirst({ where: { codigo } });

  let necesidadesCercanas: {
    codigo: string; categoria: string; descripcion: string; cantidad: string | null;
    prioridad: string; personasAfectadas: number; direccion: string;
    zona: string; ciudad: string; lat: number; lng: number; distancia: number;
    contactoNombre: string; contactoCelular: string;
  }[] = [];

  if (voluntario?.lat != null && voluntario?.lng != null) {
    const necesidades = await prisma.need.findMany({
      where: {
        estadoResolucion: { in: ["PENDIENTE", "EN_PROCESO"] },
        lat: { not: null },
        lng: { not: null },
      },
      select: {
        codigo: true, categoria: true, descripcion: true, cantidad: true,
        prioridad: true, personasAfectadas: true, direccion: true,
        zona: true, ciudad: true, lat: true, lng: true,
        contactoNombre: true, contactoCelular: true,
      },
    });

    necesidadesCercanas = necesidades
      .map((n) => ({
        ...n,
        lat: n.lat!,
        lng: n.lng!,
        distancia: haversine(voluntario.lat!, voluntario.lng!, n.lat!, n.lng!),
      }))
      .filter((n) => n.distancia <= 15000)
      .sort((a, b) => a.distancia - b.distancia)
      .slice(0, 10);
  }

  const tipoLabel: Record<string, string> = {
    VOLUNTARIO: "Voluntario", ESPECIALISTA: "Especialista",
    RECURSOS: "Recursos", LOGISTICA: "Logistica",
  };

  const shareText = voluntario
    ? `Nuevo voluntario en Collab x Mindo:\n` +
      `🤝 ${voluntario.nombre} — ${tipoLabel[voluntario.tipoAyuda] ?? voluntario.tipoAyuda}\n` +
      (voluntario.descripcion ? `📋 ${voluntario.descripcion}\n` : "") +
      (voluntario.vehiculo !== "NINGUNO" ? `🚗 Vehiculo: ${voluntario.vehiculo}\n` : "") +
      `📍 ${voluntario.zona || voluntario.ciudad}\n` +
      `\nSi necesitas ayuda: https://redcaliayuda.vercel.app/necesito-ayuda`
    : "";

  const allPoints = necesidadesCercanas.length > 0
    ? necesidadesCercanas.map((n) => ({ lat: n.lat, lng: n.lng }))
    : [];

  const mapSrc = voluntario?.lat != null && voluntario?.lng != null
    ? allPoints.length > 0
      ? (() => {
          const pts = [...allPoints, { lat: voluntario.lat!, lng: voluntario.lng! }];
          const minLat = Math.min(...pts.map((p) => p.lat)) - 0.005;
          const maxLat = Math.max(...pts.map((p) => p.lat)) + 0.005;
          const minLng = Math.min(...pts.map((p) => p.lng)) - 0.008;
          const maxLng = Math.max(...pts.map((p) => p.lng)) + 0.008;
          return `https://www.openstreetmap.org/export/embed.html?bbox=${minLng}%2C${minLat}%2C${maxLng}%2C${maxLat}&layer=mapnik&marker=${voluntario.lat}%2C${voluntario.lng}`;
        })()
      : `https://www.openstreetmap.org/export/embed.html?bbox=${voluntario.lng! - 0.005}%2C${voluntario.lat! - 0.003}%2C${voluntario.lng! + 0.005}%2C${voluntario.lat! + 0.003}&layer=mapnik&marker=${voluntario.lat}%2C${voluntario.lng}`
    : null;

  return (
    <main className="mx-auto max-w-xl px-5 py-16 text-center">
      <Card className="p-8">
        <div className="text-4xl">✓</div>
        <h1 className="mt-4 text-2xl font-semibold">Gracias por querer ayudar</h1>
        <p className="mt-2 text-texto-suave">
          Tu registro quedo guardado con el codigo:
        </p>
        <div className="mt-3 inline-flex rounded-lg bg-acento-suave px-4 py-2 text-lg font-semibold text-acento">
          {codigo}
        </div>

        {mapSrc && (
          <div className="mt-5 overflow-hidden rounded-lg border border-borde text-left">
            <iframe
              title="Tu ubicacion registrada"
              src={mapSrc}
              className="h-48 w-full"
              style={{ border: "none" }}
            />
            <div className="flex items-center gap-2 bg-superficie-elevada px-3 py-1.5 text-xs text-texto-suave">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5 shrink-0 text-acento">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{voluntario?.zona || voluntario?.ciudad} — Tu ubicacion</span>
            </div>
          </div>
        )}

        <p className="mt-4 text-sm text-texto-suave">
          Te contactaremos cuando haya una mision compatible con lo que puedes ofrecer.
          Si tu zona tiene emergencias activas, las veras abajo.
        </p>

        {voluntario && (
          <div className="mt-5">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="toque-activo inline-flex items-center gap-2 rounded-xl bg-ok px-5 py-3 text-sm font-bold text-superficie"
            >
              💬 Compartir que eres voluntario
            </a>
            <p className="mt-2 text-xs text-texto-suave">
              Comparte para que mas personas sepan que hay ayuda disponible cerca.
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
            href="/necesidades"
            className="rounded-lg bg-acento px-4 py-2 text-sm font-medium text-superficie transition hover:opacity-90"
          >
            Ver necesidades
          </Link>
        </div>
      </Card>

      {/* Necesidades cercanas — match automatico */}
      {necesidadesCercanas.length > 0 && (
        <Card className="mt-6 p-5 text-left">
          <div className="flex items-center gap-2">
            <span className="text-lg">📡</span>
            <h2 className="text-sm font-bold">Necesidades cerca de ti</h2>
          </div>
          <p className="mt-1 text-xs text-texto-suave">
            Estas necesidades estan cerca de tu ubicacion. Toca para ver detalles o notificar que puedes ayudar.
          </p>
          <div className="mt-3 space-y-2">
            {necesidadesCercanas.map((n) => {
              const distLabel = n.distancia < 1000
                ? `${Math.round(n.distancia)}m`
                : `${(n.distancia / 1000).toFixed(1)}km`;

              const catLabel = CAT[n.categoria] ?? n.categoria;
              const icon = CAT_ICON[n.categoria] ?? "📋";

              const msg =
                `Hola, soy ${voluntario!.nombre} y estoy registrado como voluntario en Collab x Mindo.\n\n` +
                `Vi que necesitan ayuda cerca de mi:\n` +
                `${icon} ${catLabel}${n.cantidad ? ` — ${n.cantidad}` : ""}\n` +
                `📍 ${n.direccion}, ${n.zona || n.ciudad}\n` +
                `👥 ${n.personasAfectadas} persona${n.personasAfectadas !== 1 ? "s" : ""}\n` +
                `⚡ ${n.prioridad} ${PRIO_LABEL[n.prioridad]}\n` +
                (n.lat && n.lng ? `🗺️ https://www.google.com/maps?q=${n.lat},${n.lng}\n` : "") +
                `\nPuedo ayudar. Coordino contigo.`;

              return (
                <a
                  key={n.codigo}
                  href={`https://wa.me/57${n.contactoCelular}?text=${encodeURIComponent(msg)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="toque-activo flex items-center justify-between gap-3 rounded-lg border border-borde p-3 transition hover:border-acento"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span>{icon}</span>
                      <span className="text-sm font-medium">{catLabel}</span>
                      <span className={`text-xs font-bold ${PRIO_COLOR[n.prioridad]}`}>
                        {n.prioridad}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-texto-suave line-clamp-1">{n.descripcion}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-texto-suave">
                      <span>{n.zona || n.ciudad}</span>
                      <span>· {n.personasAfectadas} persona{n.personasAfectadas !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="rounded-full bg-acento-suave px-2 py-0.5 text-xs font-bold text-acento">
                      {distLabel}
                    </span>
                    <span className="text-sm text-ok">💬</span>
                  </div>
                </a>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-texto-suave text-center">
            Toca una necesidad para contactar al solicitante por WhatsApp y coordinar la ayuda.
          </p>
        </Card>
      )}

      {necesidadesCercanas.length === 0 && voluntario?.lat != null && (
        <Card className="mt-6 p-5 text-center">
          <div className="text-2xl">✓</div>
          <p className="mt-2 text-sm font-medium">No hay necesidades activas cerca de ti</p>
          <p className="mt-1 text-xs text-texto-suave">
            Te notificaremos cuando aparezca una necesidad compatible en tu zona.
          </p>
        </Card>
      )}
    </main>
  );
}
