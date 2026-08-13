"use client";

import { useActionState, useState } from "react";
import { crearVoluntario, type EstadoFormulario } from "./acciones";
import { Aviso, Boton, Campo, Card, claseInput } from "@/components/ui";
import { UbicacionPicker } from "@/components/ubicacion-picker";
import { Consentimiento } from "@/components/consentimiento";

const TIPOS_AYUDA = [
  { valor: "VOLUNTARIO", etiqueta: "Voluntario general", nota: "Empacar, transportar, distribuir, cocinar, limpiar" },
  { valor: "ESPECIALISTA", etiqueta: "Especialista", nota: "Médico, enfermero, psicólogo, ingeniero, paramédico" },
  { valor: "RECURSOS", etiqueta: "Tengo recursos para donar", nota: "Agua, alimentos, medicamentos, ropa, equipos" },
  { valor: "LOGISTICA", etiqueta: "Tengo transporte", nota: "Puedo mover carga o personas" },
];

const DISPONIBILIDADES = [
  { valor: "AHORA", etiqueta: "Ahora mismo" },
  { valor: "HOY", etiqueta: "Hoy" },
  { valor: "VARIOS_DIAS", etiqueta: "Varios días" },
  { valor: "INDEFINIDO", etiqueta: "El tiempo que haga falta" },
];

const VEHICULOS = [
  { valor: "NINGUNO", etiqueta: "No tengo vehículo" },
  { valor: "MOTO", etiqueta: "Moto" },
  { valor: "AUTO", etiqueta: "Automóvil" },
  { valor: "CAMIONETA", etiqueta: "Camioneta" },
  { valor: "CAMION", etiqueta: "Camión" },
];

export function FormularioVoluntario() {
  const [estado, accion, enviando] = useActionState<EstadoFormulario, FormData>(crearVoluntario, {});

  const [tipoAyuda, setTipoAyuda] = useState("");
  const [vehiculo, setVehiculo] = useState("NINGUNO");
  const [disponibilidad, setDisponibilidad] = useState("HOY");

  // Ubicación
  const [direccion, setDireccion] = useState("");
  const [zona, setZona] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  return (
    <form action={accion} className="space-y-5">
      <input type="hidden" name="lat" value={lat ?? ""} />
      <input type="hidden" name="lng" value={lng ?? ""} />
      <input type="hidden" name="disponibilidad" value={disponibilidad} />

      {/* 1. CÓMO PUEDE AYUDAR */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold">1. ¿Cómo puedes ayudar?</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {TIPOS_AYUDA.map((t) => (
            <label
              key={t.valor}
              className={`cursor-pointer rounded-lg border p-3 transition ${
                tipoAyuda === t.valor ? "border-acento bg-acento-suave" : "border-borde"
              }`}
            >
              <input
                type="radio"
                name="tipoAyuda"
                value={t.valor}
                className="sr-only"
                checked={tipoAyuda === t.valor}
                onChange={() => setTipoAyuda(t.valor)}
              />
              <span className="block text-sm font-medium">{t.etiqueta}</span>
              <span className="block text-xs text-texto-suave">{t.nota}</span>
            </label>
          ))}
        </div>
      </Card>

      {/* Detalle según tipo */}
      {tipoAyuda === "ESPECIALISTA" && (
        <Card className="p-5">
          <Campo etiqueta="¿Cuál es tu especialidad?" ayuda="Médico, enfermero, psicólogo, ingeniero civil, paramédico, veterinario, etc.">
            <input name="especializacion" className={claseInput} placeholder="Ej: Médico general" required />
          </Campo>
        </Card>
      )}

      {tipoAyuda === "RECURSOS" && (
        <Card className="p-5">
          <Campo etiqueta="¿Qué recursos puedes donar?" ayuda="Describe qué tienes disponible: tipo, cantidad, estado.">
            <textarea
              name="recursosOfrecidos"
              rows={3}
              className={claseInput}
              placeholder="Ej: 50 botellas de agua, 20 kits de alimentos no perecederos, 10 cobijas"
              required
            />
          </Campo>
        </Card>
      )}

      {(tipoAyuda === "LOGISTICA" || tipoAyuda === "VOLUNTARIO") && (
        <Card className="p-5">
          <h2 className="text-sm font-semibold">¿Tienes vehículo?</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {VEHICULOS.map((v) => (
              <label
                key={v.valor}
                className={`cursor-pointer rounded-lg border px-3 py-2 text-sm transition ${
                  vehiculo === v.valor ? "border-acento bg-acento-suave" : "border-borde"
                }`}
              >
                <input
                  type="radio"
                  name="vehiculo"
                  value={v.valor}
                  className="sr-only"
                  checked={vehiculo === v.valor}
                  onChange={() => setVehiculo(v.valor)}
                />
                {v.etiqueta}
              </label>
            ))}
          </div>
          {vehiculo !== "NINGUNO" && (
            <div className="mt-3">
              <Campo etiqueta="Capacidad de carga (opcional)">
                <input name="capacidadCarga" className={claseInput} placeholder="Ej: 500 kg, 2 toneladas" />
              </Campo>
            </div>
          )}
        </Card>
      )}

      {/* 2. UBICACIÓN */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold">2. ¿Dónde estás?</h2>
        <p className="mt-1 text-xs text-texto-suave">
          Para conectarte con las necesidades más cercanas.
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

      {/* 3. DISPONIBILIDAD */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold">3. ¿Cuándo puedes?</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {DISPONIBILIDADES.map((d) => (
            <label
              key={d.valor}
              className={`cursor-pointer rounded-lg border px-4 py-2 text-sm transition ${
                disponibilidad === d.valor ? "border-acento bg-acento-suave" : "border-borde"
              }`}
            >
              <input
                type="radio"
                className="sr-only"
                checked={disponibilidad === d.valor}
                onChange={() => setDisponibilidad(d.valor)}
              />
              {d.etiqueta}
            </label>
          ))}
        </div>
      </Card>

      {/* 4. DATOS */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold">4. Tus datos</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Nombre completo">
            <input name="nombre" className={claseInput} required />
          </Campo>
          <Campo etiqueta="Celular">
            <input name="celular" className={claseInput} inputMode="tel" required />
          </Campo>
          <Campo etiqueta="Correo (opcional)">
            <input name="email" type="email" className={claseInput} />
          </Campo>
        </div>
        <div className="mt-4">
          <Campo etiqueta="¿Algo más que quieras agregar? (opcional)">
            <textarea name="descripcion" rows={2} className={claseInput} placeholder="Información adicional sobre tu disponibilidad o capacidad" />
          </Campo>
        </div>
      </Card>

      <Consentimiento />

      {estado.error && (
        <Aviso tono="alerta">{estado.error}</Aviso>
      )}

      <Boton className="w-full py-3" disabled={enviando}>
        {enviando ? "Registrando…" : "Registrarme como voluntario"}
      </Boton>

      <p className="text-center text-xs text-texto-suave">
        Te contactaremos cuando haya una misión compatible con lo que puedes ofrecer.
      </p>
    </form>
  );
}
