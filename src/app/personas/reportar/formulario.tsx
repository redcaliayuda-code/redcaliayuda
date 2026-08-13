"use client";

import { useActionState, useState } from "react";
import { crearReportePersona, type EstadoFormulario } from "./acciones";
import { Aviso, Boton, Campo, Card, claseInput } from "@/components/ui";
import { UbicacionPicker } from "@/components/ubicacion-picker";
import { Consentimiento } from "@/components/consentimiento";

export function FormularioPersona() {
  const [estado, accion, enviando] = useActionState<EstadoFormulario, FormData>(crearReportePersona, {});

  const [tipo, setTipo] = useState<"ESTOY_BIEN" | "BUSCO_PERSONA">("ESTOY_BIEN");
  const [direccion, setDireccion] = useState("");
  const [zona, setZona] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  return (
    <form action={accion} className="space-y-5">
      <input type="hidden" name="tipo" value={tipo} />
      <input type="hidden" name="lat" value={lat ?? ""} />
      <input type="hidden" name="lng" value={lng ?? ""} />
      <input type="hidden" name="zona" value={zona} />

      {/* Tipo */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setTipo("ESTOY_BIEN")}
          className={`toque-activo rounded-xl border-2 px-4 py-4 text-center transition ${
            tipo === "ESTOY_BIEN"
              ? "border-ok bg-ok-suave text-ok"
              : "border-borde"
          }`}
        >
          <div className="text-2xl">💚</div>
          <div className="mt-1 text-sm font-bold">Estoy bien</div>
          <div className="text-xs text-texto-suave">Avisar que estoy a salvo</div>
        </button>
        <button
          type="button"
          onClick={() => setTipo("BUSCO_PERSONA")}
          className={`toque-activo rounded-xl border-2 px-4 py-4 text-center transition ${
            tipo === "BUSCO_PERSONA"
              ? "border-alerta bg-alerta-suave text-alerta"
              : "border-borde"
          }`}
        >
          <div className="text-2xl">🔍</div>
          <div className="mt-1 text-sm font-bold">Busco a alguien</div>
          <div className="text-xs text-texto-suave">Reportar persona desaparecida</div>
        </button>
      </div>

      {/* Datos de la persona */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold">
          {tipo === "ESTOY_BIEN" ? "Tus datos" : "Datos de la persona que buscas"}
        </h2>
        <div className="mt-4 space-y-4">
          <Campo etiqueta="Nombre completo">
            <input
              name="nombrePersona"
              className={claseInput}
              placeholder={tipo === "ESTOY_BIEN" ? "Tu nombre completo" : "Nombre de la persona que buscas"}
              required
            />
          </Campo>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Edad (aproximada)">
              <input name="edad" className={claseInput} placeholder="35 años" />
            </Campo>
            <Campo etiqueta={tipo === "ESTOY_BIEN" ? "¿Dónde estás ahora?" : "Última ubicación conocida"}>
              <input
                name="ultimaUbicacion"
                className={claseInput}
                placeholder="Barrio, dirección, refugio..."
              />
            </Campo>
          </div>
          <Campo
            etiqueta={tipo === "ESTOY_BIEN" ? "Mensaje para tu familia" : "Descripción física / detalles"}
            ayuda={tipo === "ESTOY_BIEN" ? "Opcional: algo que quieras que sepan" : "Ropa, estatura, señas particulares"}
          >
            <textarea
              name="descripcion"
              rows={2}
              className={claseInput}
              placeholder={
                tipo === "ESTOY_BIEN"
                  ? "Estamos bien, estamos en el albergue del Coliseo..."
                  : "Estatura media, cabello negro, llevaba camisa azul..."
              }
            />
          </Campo>
        </div>
      </Card>

      {/* Ubicación */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold">Ubicación</h2>
        <p className="mt-1 text-xs text-texto-suave">
          {tipo === "ESTOY_BIEN"
            ? "¿Dónde te encuentras ahora?"
            : "¿Dónde fue vista por última vez?"}
        </p>
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
        <h2 className="text-sm font-semibold">
          {tipo === "ESTOY_BIEN" ? "Tu contacto" : "¿Quién busca?"}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Nombre de contacto">
            <input name="contactoNombre" className={claseInput} required />
          </Campo>
          <Campo etiqueta="Celular">
            <input name="contactoCelular" className={claseInput} inputMode="tel" required />
          </Campo>
        </div>
      </Card>

      <Campo etiqueta="Ciudad">
        <input name="ciudad" className={claseInput} placeholder="Cali, Manizales, Pereira…" />
      </Campo>

      <Consentimiento />

      {estado.error && <Aviso tono="alerta">{estado.error}</Aviso>}

      <Boton className="w-full py-3" disabled={enviando}>
        {enviando
          ? "Enviando..."
          : tipo === "ESTOY_BIEN"
            ? "Reportar que estoy bien"
            : "Reportar persona desaparecida"}
      </Boton>
    </form>
  );
}
