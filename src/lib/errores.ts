import { redirect } from "next/navigation";

/**
 * Los controles operativos (código de servicio equivocado, activar a alguien sin
 * cédula, cerrar un incidente sin resolución) tienen que explicarle al operador
 * QUÉ pasó. Un `throw` en un server action produce una pantalla de error genérica
 * en producción, así que se devuelve el mensaje por la URL y la página lo muestra.
 */
export function fallar(ruta: string, mensaje: string): never {
  redirect(`${ruta}?error=${encodeURIComponent(mensaje)}`);
}

/// Lee el mensaje de error de los searchParams de una página.
export function leerError(params: { error?: string } | undefined): string | null {
  if (!params?.error) return null;
  return params.error;
}
