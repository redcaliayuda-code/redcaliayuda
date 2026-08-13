"use client";

import Link from "next/link";

export function Consentimiento() {
  return (
    <label className="flex items-start gap-3 rounded-xl border border-borde bg-superficie p-4 cursor-pointer transition hover:border-acento">
      <input
        type="checkbox"
        name="consentimiento"
        required
        className="mt-0.5 h-5 w-5 shrink-0 accent-acento"
      />
      <span className="text-xs text-texto-suave leading-relaxed">
        Autorizo el uso de mis datos personales unicamente para la coordinacion
        de ayuda humanitaria durante esta emergencia, conforme a la{" "}
        <Link href="/privacidad" target="_blank" className="text-acento underline">
          politica de tratamiento de datos
        </Link>
        . Mis datos seran eliminados al terminar la emergencia.
      </span>
    </label>
  );
}
