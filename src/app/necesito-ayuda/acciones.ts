"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { registrarEvento } from "@/lib/events";
import { codigoCorto, normalizarCelular } from "@/lib/format";

const Esquema = z.object({
  categoria: z.string().trim().min(1, "Selecciona qué necesitas."),
  descripcion: z.string().trim().min(5, "Describe la situación con más detalle."),
  cantidad: z.string().trim().default(""),
  personasAfectadas: z.string().trim().default("1"),
  ninos: z.string().trim().default("0"),
  adultosMayores: z.string().trim().default("0"),
  necesidadesEspeciales: z.string().trim().default(""),
  prioridad: z.string().trim().default("P2"),
  contactoNombre: z.string().trim().min(2, "Escribe tu nombre."),
  contactoCelular: z
    .string()
    .trim()
    .transform(normalizarCelular)
    .refine((v) => v.length >= 10, "El celular debe tener al menos 10 dígitos."),
  direccion: z.string().trim().min(3, "Necesitamos saber dónde estás."),
  zona: z.string().trim().min(2, "Indica el barrio o la zona."),
  ciudad: z.string().trim().default(""),
  lat: z.string().trim().default(""),
  lng: z.string().trim().default(""),
});

export type EstadoFormulario = { error?: string };

export async function crearNecesidad(
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

  const codigo = codigoCorto("NEC");

  const need = await prisma.need.create({
    data: {
      codigo,
      categoria: d.categoria,
      descripcion: d.descripcion,
      cantidad: d.cantidad,
      personasAfectadas: parseInt(d.personasAfectadas) || 1,
      ninos: parseInt(d.ninos) || 0,
      adultosMayores: parseInt(d.adultosMayores) || 0,
      necesidadesEspeciales: d.necesidadesEspeciales,
      prioridad: d.prioridad,
      contactoNombre: d.contactoNombre,
      contactoCelular: d.contactoCelular,
      direccion: d.direccion,
      zona: d.zona,
      ciudad: d.ciudad,
      lat,
      lng,
    },
  });

  await registrarEvento({
    entidad: "Need",
    entidadId: need.id,
    tipo: "NECESIDAD_REPORTADA",
    actor: "ciudadano",
    payload: { codigo, categoria: d.categoria, prioridad: d.prioridad, lat, lng },
  });

  redirect(`/necesito-ayuda/gracias/${codigo}`);
}
