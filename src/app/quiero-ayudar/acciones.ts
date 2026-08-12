"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { registrarEvento } from "@/lib/events";
import { codigoCorto, normalizarCelular } from "@/lib/format";

const Esquema = z.object({
  nombre: z.string().trim().min(2, "Escribe tu nombre."),
  celular: z
    .string()
    .trim()
    .transform(normalizarCelular)
    .refine((v) => v.length >= 10, "El celular debe tener al menos 10 dígitos."),
  email: z.string().trim().email("Correo inválido.").or(z.literal("")).default(""),
  tipoAyuda: z.string().trim().min(1, "Selecciona cómo puedes ayudar."),
  especializacion: z.string().trim().default(""),
  recursosOfrecidos: z.string().trim().default(""),
  descripcion: z.string().trim().default(""),
  vehiculo: z.string().trim().default("NINGUNO"),
  capacidadCarga: z.string().trim().default(""),
  disponibilidad: z.string().trim().default("HOY"),
  zona: z.string().trim().default(""),
  ciudad: z.string().trim().default(""),
  lat: z.string().trim().default(""),
  lng: z.string().trim().default(""),
});

export type EstadoFormulario = { error?: string };

export async function crearVoluntario(
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

  const existente = await prisma.volunteer.findUnique({ where: { celular: d.celular } });
  if (existente) {
    await prisma.volunteer.update({
      where: { celular: d.celular },
      data: {
        nombre: d.nombre,
        email: d.email || undefined,
        tipoAyuda: d.tipoAyuda,
        especializacion: d.especializacion,
        recursosOfrecidos: d.recursosOfrecidos,
        descripcion: d.descripcion,
        vehiculo: d.vehiculo,
        capacidadCarga: d.capacidadCarga,
        disponibilidad: d.disponibilidad,
        zona: d.zona,
        ciudad: d.ciudad,
        lat,
        lng,
      },
    });
    redirect("/quiero-ayudar/gracias");
  }

  const codigo = codigoCorto("VOL");
  const vol = await prisma.volunteer.create({
    data: {
      codigo,
      nombre: d.nombre,
      celular: d.celular,
      email: d.email,
      tipoAyuda: d.tipoAyuda,
      especializacion: d.especializacion,
      recursosOfrecidos: d.recursosOfrecidos,
      descripcion: d.descripcion,
      vehiculo: d.vehiculo,
      capacidadCarga: d.capacidadCarga,
      disponibilidad: d.disponibilidad,
      zona: d.zona,
      ciudad: d.ciudad,
      lat,
      lng,
    },
  });

  await registrarEvento({
    entidad: "Volunteer",
    entidadId: vol.id,
    tipo: "VOLUNTARIO_REGISTRADO",
    actor: "ciudadano",
    payload: { codigo, tipoAyuda: d.tipoAyuda, vehiculo: d.vehiculo },
  });

  redirect("/quiero-ayudar/gracias");
}
