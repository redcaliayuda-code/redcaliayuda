"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { registrarEvento } from "@/lib/events";
import { codigoCorto, normalizarCelular } from "@/lib/format";

const Esquema = z.object({
  tipo: z.enum(["ESTOY_BIEN", "BUSCO_PERSONA"]),
  nombrePersona: z.string().trim().min(2, "Escribe el nombre de la persona."),
  edad: z.string().trim().default(""),
  descripcion: z.string().trim().default(""),
  ultimaUbicacion: z.string().trim().default(""),
  contactoNombre: z.string().trim().min(2, "Escribe tu nombre."),
  contactoCelular: z
    .string()
    .trim()
    .transform(normalizarCelular)
    .refine((v) => v.length >= 10, "El celular debe tener al menos 10 dígitos."),
  zona: z.string().trim().default(""),
  ciudad: z.string().trim().default(""),
  lat: z.string().trim().default(""),
  lng: z.string().trim().default(""),
});

export type EstadoFormulario = { error?: string };

export async function crearReportePersona(
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

  const codigo = codigoCorto("PER");

  await prisma.personReport.create({
    data: {
      codigo,
      tipo: d.tipo,
      nombrePersona: d.nombrePersona,
      edad: d.edad,
      descripcion: d.descripcion,
      ultimaUbicacion: d.ultimaUbicacion,
      contactoNombre: d.contactoNombre,
      contactoCelular: d.contactoCelular,
      zona: d.zona,
      ciudad: d.ciudad,
      lat,
      lng,
    },
  });

  await registrarEvento({
    entidad: "PersonReport",
    entidadId: codigo,
    tipo: d.tipo === "ESTOY_BIEN" ? "PERSONA_REPORTO_BIEN" : "PERSONA_BUSCADA",
    actor: "ciudadano",
    payload: { nombre: d.nombrePersona, tipo: d.tipo },
  });

  redirect(`/personas?registrado=${codigo}`);
}
