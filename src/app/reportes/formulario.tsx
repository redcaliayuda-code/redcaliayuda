"use client";

import { useActionState, useState } from "react";
import { crearReporteZona, type EstadoFormulario } from "./acciones";
import { Aviso, Boton, Campo, Card, claseInput } from "@/components/ui";
import { UbicacionPicker } from "@/components/ubicacion-picker";
import { Consentimiento } from "@/components/consentimiento";

const TIPOS = [
  { valor: "VIA_BLOQUEADA", etiqueta: "🚧 Via bloqueada", desc: "Calle, carretera o puente intransitable" },
  { valor: "VIA_HABILITADA", etiqueta: "✅ Via habilitada", desc: "Ruta despejada y transitable" },
  { valor: "SIN_LUZ", etiqueta: "🔌 Sin luz", desc: "Zona sin energia electrica" },
  { valor: "SIN_AGUA", etiqueta: "💧 Sin agua", desc: "Zona sin servicio de agua" },
  { valor: "EDIFICIO_DANADO", etiqueta: "🏚️ Edificio danado", desc: "Estructura con riesgo de colapso" },
  { valor: "HOSPITAL_OPERATIVO", etiqueta: "🏥 Hospital operativo", desc: "Hospital/centro de salud funcionando" },
  { valor: "HOSPITAL_COLAPSADO", etiqueta: "🚑 Hospital colapsado", desc: "Hospital danado o sin capacidad" },
  { valor: "ALBERGUE_DISPONIBLE", etiqueta: "🏕️ Albergue disponible", desc: "Refugio con cupo para personas" },
  { valor: "ZONA_RIESGO", etiqueta: "⚠️ Zona de riesgo", desc: "Area peligrosa (deslizamiento, inundacion)" },
  { valor: "OTRO", etiqueta: "📋 Otro", desc: "Otro tipo de reporte" },
];

export function FormularioReporte() {
  const [estado, accion, enviando] = useActionState<EstadoFormulario, FormData>(crearReporteZona, {});

  const [tipo, setTipo] = useState("");
  const [direccion, setDireccion] = useState("");
  const [zona, setZona] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  return (
    <form action={accion} className="space-y-5">
      <input type="hidden" name="tipo" value={tipo} />
      <input type="hidden" name="lat" value={lat ?? ""} />
      <input type="hidden" name="lng" value={lng ?? ""} />

      {/* Tipo */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold">1. Que quieres reportar?</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {TIPOS.map((t) => (
            <button
              key={t.valor}
              type="button"
              onClick={() => setTipo(t.valor)}
              className={`toque-activo rounded-xl border-2 p-3 text-left transition ${
                tipo === t.valor
                  ? "border-acento bg-acento-suave"
                  : "border-borde hover:border-acento/50"
              }`}
            >
              <div className="text-sm font-medium">{t.etiqueta}</div>
              <div className="text-xs text-texto-suave">{t.desc}</div>
            </button>
          ))}
        </div>
      </Card>

      {/* Descripcion */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold">2. Describe la situacion</h2>
        <div className="mt-4">
          <Campo etiqueta="Que esta pasando?" ayuda="Se lo mas especifico posible: que calle, que edificio, desde cuando.">
            <textarea
              name="descripcion"
              rows={3}
              className={claseInput}
              placeholder="Ej: El puente de la Calle 70 con Autopista esta caido, no se puede pasar. Hay escombros bloqueando ambos carriles."
              required
            />
          </Campo>
        </div>
      </Card>

      {/* Ubicacion */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold">3. Donde esta?</h2>
        <div className="mt-4">
          <UbicacionPicker
            direccion={direccion}
            zona={zona}
            lat={lat}
            lng={lng}
            onDireccionChange={setDireccion}
            onZonaChange={setZona}
            onCoordsChange={(newLat, newLng, dir, zon) => {
              setLat(newLat);
              setLng(newLng);
              setDireccion(dir);
              setZona(zon);
            }}
          />
        </div>
      </Card>

      {/* Contacto */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold">4. Quien reporta?</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Tu nombre">
            <input name="reportadoPor" className={claseInput} required />
          </Campo>
          <Campo etiqueta="Celular">
            <input name="celular" className={claseInput} inputMode="tel" required />
          </Campo>
        </div>
        <div className="mt-4">
          <Campo etiqueta="Ciudad">
            <input name="ciudad" className={claseInput} placeholder="Cali, Manizales, Pereira…" />
          </Campo>
        </div>
      </Card>

      <Consentimiento />

      {estado.error && <Aviso tono="alerta">{estado.error}</Aviso>}

      <Boton className="w-full py-3" disabled={enviando || !tipo}>
        {enviando ? "Enviando..." : "Enviar reporte"}
      </Boton>
    </form>
  );
}
