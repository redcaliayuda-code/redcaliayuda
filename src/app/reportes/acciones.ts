"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { registrarEvento } from "@/lib/events";
import { codigoCorto, normalizarCelular } from "@/lib/format";

const Esquema = z.object({
  tipo: z.string().trim().min(1, "Selecciona el tipo de reporte."),
  descripcion: z.string().trim().min(5, "Describe la situacion con mas detalle."),
  direccion: z.string().trim().default(""),
  zona: z.string().trim().min(2, "Indica el barrio o la zona."),
  ciudad: z.string().trim().default(""),
  reportadoPor: z.string().trim().min(2, "Escribe tu nombre."),
  celular: z
    .string()
    .trim()
    .transform(normalizarCelular)
    .refine((v) => v.length >= 10, "El celular debe tener al menos 10 digitos."),
  lat: z.string().trim().default(""),
  lng: z.string().trim().default(""),
});

export type EstadoFormulario = { error?: string };

export async function crearReporteZona(
  _previo: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const parseado = Esquema.safeParse(Object.fromEntries(formData));
  if (!parseado.success) {
    return { error: parseado.error.issues[0]?.message ?? "Revisa los datos." };
  }
  const d = parseado.data;

  const latNum = d.lat ? parseFloat(d.lat) : null;
  const lngNum = d.lng ? parseFloat(d.lng) : null;
  const lat = latNum != null && !Number.isNaN(latNum) ? latNum : null;
  const lng = lngNum != null && !Number.isNaN(lngNum) ? lngNum : null;

  const codigo = codigoCorto("REP");

  await prisma.zoneReport.create({
    data: {
      codigo,
      tipo: d.tipo,
      descripcion: d.descripcion,
      direccion: d.direccion,
      zona: d.zona,
      ciudad: d.ciudad,
      reportadoPor: d.reportadoPor,
      celular: d.celular,
      lat,
      lng,
    },
  });

  await registrarEvento({
    entidad: "ZoneReport",
    entidadId: codigo,
    tipo: "REPORTE_ZONA_CREADO",
    actor: "ciudadano",
    payload: { tipo: d.tipo, zona: d.zona },
  });

  redirect(`/reportes?registrado=${codigo}`);
}
