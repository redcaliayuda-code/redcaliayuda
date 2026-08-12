import { prisma } from "@/lib/db";
import { Badge, Card, Boton, tonoEstado } from "@/components/ui";
import { fechaHora } from "@/lib/format";
import { notFound, redirect } from "next/navigation";
import { registrarEvento } from "@/lib/events";
import Link from "next/link";

export const dynamic = "force-dynamic";

const CAT: Record<string, string> = {
  AGUA: "💧 Agua", ALIMENTOS: "🍚 Alimentos", MEDICAMENTOS: "💊 Medicamentos",
  HIGIENE: "🧴 Higiene", PANALES: "👶 Pañales", REFUGIO: "🏠 Refugio",
  COBIJAS: "🛏️ Cobijas", LINTERNAS: "🔦 Linternas", HERRAMIENTAS: "🔧 Herramientas",
  ATENCION_MEDICA: "🏥 Atención médica", ATENCION_PSICOLOGICA: "🧠 Psicológica",
  TRANSPORTE: "🚗 Transporte", ALOJAMIENTO: "🏡 Alojamiento",
  EVACUACION: "🚨 Evacuación", DESAPARECIDOS: "🔍 Desaparecidos", OTRO: "📋 Otro",
};

const PRIO: Record<string, { label: string; tono: "alerta" | "aviso" | "acento" | "ok" }> = {
  P1: { label: "P1 — VIDA", tono: "alerta" },
  P2: { label: "P2 — SUPERVIVENCIA", tono: "aviso" },
  P3: { label: "P3 — RECUPERACIÓN", tono: "acento" },
  P4: { label: "P4 — APOYO", tono: "ok" },
};

export default async function NecesidadDetalle({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mision?: string; vid?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  const necesidad = await prisma.need.findUnique({ where: { id }, include: { missions: { include: { volunteer: true } } } });
  if (!necesidad) notFound();

  const volNotificar = sp.vid
    ? await prisma.volunteer.findUnique({ where: { id: sp.vid } })
    : null;

  const voluntarios = await prisma.volunteer.findMany({
    where: { disponibilidad: { not: "INDEFINIDO" } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const prio = PRIO[necesidad.prioridad] ?? { label: necesidad.prioridad, tono: "acento" as const };

  async function asignarVoluntario(formData: FormData) {
    "use server";
    const volunteerId = formData.get("volunteerId") as string;
    const needId = formData.get("needId") as string;

    const count = await prisma.mission.count();
    const codigo = `MIS-${String(count + 1).padStart(4, "0")}`;

    const need = await prisma.need.findUnique({ where: { id: needId } });

    await prisma.mission.create({
      data: {
        codigo,
        needId,
        volunteerId,
        prioridad: need?.prioridad ?? "P2",
        estado: "ASIGNADA",
        descripcion: `Misión creada para ${need?.categoria ?? "necesidad"} en ${need?.zona ?? need?.ciudad ?? "ubicación desconocida"}`,
      },
    });

    await prisma.need.update({
      where: { id: needId },
      data: { estadoResolucion: "EN_PROCESO" },
    });

    await registrarEvento({ entidad: "Mission", entidadId: codigo, tipo: "MISION_CREADA", actor: "coordinador" });

    redirect(`/panel/necesidades/${needId}?mision=${codigo}&vid=${volunteerId}`);
  }

  async function cambiarEstado(formData: FormData) {
    "use server";
    const needId = formData.get("needId") as string;
    const estado = formData.get("estado") as string;

    await prisma.need.update({
      where: { id: needId },
      data: { estadoResolucion: estado },
    });

    await registrarEvento({ entidad: "Need", entidadId: needId, tipo: `ESTADO_${estado}`, actor: "coordinador" });

    redirect(`/panel/necesidades/${needId}`);
  }

  return (
    <>
      <Link href="/panel/necesidades" className="text-sm text-acento hover:underline">
        ← Volver a necesidades
      </Link>

      {/* WhatsApp notification banner */}
      {sp.mision && volNotificar && (
        <div className="mt-4 rounded-xl border border-ok/30 bg-ok-suave p-4 animar-entrada">
          <div className="text-sm font-bold text-ok">Mision {sp.mision} creada</div>
          <p className="mt-1 text-xs text-texto-suave">
            Voluntario asignado: <strong>{volNotificar.nombre}</strong> — {volNotificar.celular}
          </p>
          <a
            href={`https://wa.me/57${volNotificar.celular}?text=${encodeURIComponent(
              `Hola ${volNotificar.nombre}, te hemos asignado la misión ${sp.mision} de RED CALI.\n\n` +
              `📋 Necesidad: ${CAT[necesidad.categoria] ?? necesidad.categoria}\n` +
              `📍 Ubicación: ${necesidad.direccion || necesidad.zona || necesidad.ciudad}\n` +
              `👤 Contacto: ${necesidad.contactoNombre} — ${necesidad.contactoCelular}\n` +
              `⚡ Prioridad: ${necesidad.prioridad}\n` +
              (necesidad.lat && necesidad.lng ? `🗺️ Mapa: https://www.google.com/maps?q=${necesidad.lat},${necesidad.lng}\n` : "") +
              `\nGracias por tu ayuda. 🙏`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="toque-activo mt-3 inline-flex items-center gap-2 rounded-lg bg-ok px-4 py-2.5 text-sm font-semibold text-superficie"
          >
            💬 Notificar por WhatsApp
          </a>
        </div>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Info principal */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium text-texto-suave">{necesidad.codigo}</span>
                  <Badge tono={prio.tono}>{prio.label}</Badge>
                  <Badge tono={tonoEstado(necesidad.estadoResolucion)}>
                    {necesidad.estadoResolucion}
                  </Badge>
                </div>
                <h1 className="mt-2 text-xl font-bold">
                  {CAT[necesidad.categoria] ?? necesidad.categoria}
                </h1>
              </div>
            </div>

            <p className="mt-3 text-sm leading-relaxed">{necesidad.descripcion}</p>

            {necesidad.cantidad && (
              <p className="mt-2 text-sm font-medium text-acento">
                Cantidad solicitada: {necesidad.cantidad}
              </p>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg bg-fondo p-3 text-center">
                <div className="text-lg font-bold">{necesidad.personasAfectadas}</div>
                <div className="text-xs text-texto-suave">Personas</div>
              </div>
              <div className="rounded-lg bg-fondo p-3 text-center">
                <div className="text-lg font-bold">{necesidad.ninos}</div>
                <div className="text-xs text-texto-suave">Niños</div>
              </div>
              <div className="rounded-lg bg-fondo p-3 text-center">
                <div className="text-lg font-bold">{necesidad.adultosMayores}</div>
                <div className="text-xs text-texto-suave">Adultos mayores</div>
              </div>
              <div className="rounded-lg bg-fondo p-3 text-center">
                <div className="text-xs font-medium">{fechaHora(necesidad.createdAt)}</div>
                <div className="text-xs text-texto-suave">Reportada</div>
              </div>
            </div>
          </Card>

          {/* Ubicación */}
          <Card className="p-5">
            <h2 className="text-sm font-bold">Ubicación</h2>
            <div className="mt-2 space-y-1 text-sm">
              <p><span className="text-texto-suave">Zona:</span> {necesidad.zona || "—"}</p>
              <p><span className="text-texto-suave">Ciudad:</span> {necesidad.ciudad}</p>
              <p><span className="text-texto-suave">Dirección:</span> {necesidad.direccion || "—"}</p>
              {necesidad.lat && necesidad.lng && (
                <p className="text-xs text-ok font-medium">
                  GPS: {necesidad.lat.toFixed(6)}, {necesidad.lng.toFixed(6)}
                </p>
              )}
            </div>
            {necesidad.lat && necesidad.lng && (
              <div className="mt-3 overflow-hidden rounded-lg border border-borde">
                <iframe
                  title="Ubicación de necesidad"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${necesidad.lng - 0.003}%2C${necesidad.lat - 0.002}%2C${necesidad.lng + 0.003}%2C${necesidad.lat + 0.002}&layer=mapnik&marker=${necesidad.lat}%2C${necesidad.lng}`}
                  className="h-48 w-full"
                  style={{ border: "none" }}
                />
              </div>
            )}
          </Card>

          {/* Contacto */}
          <Card className="p-5">
            <h2 className="text-sm font-bold">Contacto</h2>
            <div className="mt-2 space-y-1 text-sm">
              <p><span className="text-texto-suave">Nombre:</span> {necesidad.contactoNombre}</p>
              <p><span className="text-texto-suave">Celular:</span> {necesidad.contactoCelular}</p>
            </div>
          </Card>
        </div>

        {/* Sidebar: acciones */}
        <div className="space-y-4">
          {/* Cambiar estado */}
          <Card className="p-4">
            <h3 className="text-sm font-bold">Estado</h3>
            <form action={cambiarEstado} className="mt-3 space-y-2">
              <input type="hidden" name="needId" value={necesidad.id} />
              {["PENDIENTE", "EN_PROCESO", "RESUELTO", "CERRADO"].map((e) => (
                <button
                  key={e}
                  type="submit"
                  name="estado"
                  value={e}
                  disabled={necesidad.estadoResolucion === e}
                  className={`toque-activo block w-full rounded-lg border px-3 py-2 text-left text-xs font-medium transition ${
                    necesidad.estadoResolucion === e
                      ? "border-acento bg-acento-suave text-acento"
                      : "border-borde hover:border-acento"
                  } disabled:cursor-default`}
                >
                  {e.replace(/_/g, " ")}
                </button>
              ))}
            </form>
          </Card>

          {/* Misiones existentes */}
          {necesidad.missions.length > 0 && (
            <Card className="p-4">
              <h3 className="text-sm font-bold">Misiones asignadas</h3>
              <div className="mt-2 space-y-2">
                {necesidad.missions.map((m) => (
                  <div key={m.id} className="rounded-lg border border-borde p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{m.codigo}</span>
                      <Badge tono={tonoEstado(m.estado)}>{m.estado}</Badge>
                    </div>
                    {m.volunteer && (
                      <>
                        <p className="mt-1 text-xs text-texto-suave">
                          {m.volunteer.nombre} — {m.volunteer.celular}
                        </p>
                        <a
                          href={`https://wa.me/57${m.volunteer.celular}?text=${encodeURIComponent(
                            `Hola ${m.volunteer.nombre}, actualización de tu misión ${m.codigo} (RED CALI).\n` +
                            `📋 ${CAT[necesidad.categoria] ?? necesidad.categoria}\n` +
                            `📍 ${necesidad.direccion || necesidad.zona || necesidad.ciudad}\n` +
                            `👤 ${necesidad.contactoNombre} — ${necesidad.contactoCelular}` +
                            (necesidad.lat && necesidad.lng ? `\n🗺️ https://www.google.com/maps?q=${necesidad.lat},${necesidad.lng}` : "")
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="toque-activo mt-2 inline-flex items-center gap-1 rounded-md bg-ok px-2 py-1 text-xs font-medium text-superficie"
                        >
                          💬 WhatsApp
                        </a>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Asignar voluntario */}
          <Card className="p-4">
            <h3 className="text-sm font-bold">Asignar voluntario</h3>
            {voluntarios.length === 0 ? (
              <p className="mt-2 text-xs text-texto-suave">No hay voluntarios registrados.</p>
            ) : (
              <form action={asignarVoluntario} className="mt-3">
                <input type="hidden" name="needId" value={necesidad.id} />
                <select
                  name="volunteerId"
                  required
                  className="w-full rounded-lg border border-borde bg-superficie px-3 py-2 text-xs"
                >
                  <option value="">Seleccionar voluntario...</option>
                  {voluntarios.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.nombre} — {v.tipoAyuda} {v.zona ? `(${v.zona})` : ""} {v.vehiculo !== "NINGUNO" ? `🚗 ${v.vehiculo}` : ""}
                    </option>
                  ))}
                </select>
                <Boton className="mt-3 w-full" tipo="primario">
                  Crear misión
                </Boton>
              </form>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
