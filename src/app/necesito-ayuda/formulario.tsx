"use client";

import { useActionState, useState } from "react";
import { crearNecesidad, type EstadoFormulario } from "./acciones";
import { Aviso, Boton, Campo, Card, claseInput } from "@/components/ui";
import { UbicacionPicker } from "@/components/ubicacion-picker";
import { Consentimiento } from "@/components/consentimiento";

const CATEGORIAS = [
  { valor: "AGUA", etiqueta: "Agua" },
  { valor: "ALIMENTOS", etiqueta: "Alimentos" },
  { valor: "MEDICAMENTOS", etiqueta: "Medicamentos" },
  { valor: "HIGIENE", etiqueta: "Higiene" },
  { valor: "PANALES", etiqueta: "Pañales / Alimentación infantil" },
  { valor: "REFUGIO", etiqueta: "Refugio" },
  { valor: "COBIJAS", etiqueta: "Cobijas / Carpas" },
  { valor: "LINTERNAS", etiqueta: "Linternas / Baterías" },
  { valor: "HERRAMIENTAS", etiqueta: "Herramientas" },
  { valor: "ATENCION_MEDICA", etiqueta: "Atención médica" },
  { valor: "ATENCION_PSICOLOGICA", etiqueta: "Atención psicológica" },
  { valor: "ATENCION_VETERINARIA", etiqueta: "Atención veterinaria" },
  { valor: "TRANSPORTE", etiqueta: "Transporte" },
  { valor: "ALOJAMIENTO", etiqueta: "Alojamiento" },
  { valor: "EVACUACION", etiqueta: "Evacuación" },
  { valor: "DESAPARECIDOS", etiqueta: "Personas desaparecidas" },
  { valor: "OTRO", etiqueta: "Otro" },
];

const PRIORIDADES = [
  { valor: "P1", etiqueta: "P1 — Vida en riesgo", nota: "Persona atrapada, emergencia médica, evacuación urgente", color: "border-alerta bg-alerta-suave" },
  { valor: "P2", etiqueta: "P2 — Supervivencia", nota: "Agua, alimentos, refugio, higiene básica", color: "border-aviso bg-aviso-suave" },
  { valor: "P3", etiqueta: "P3 — Recuperación", nota: "Ropa, herramientas, limpieza, reparaciones", color: "border-acento bg-acento-suave" },
  { valor: "P4", etiqueta: "P4 — Apoyo", nota: "Apoyo comunitario, donaciones no críticas", color: "border-ok bg-ok-suave" },
];

export function FormularioNecesidad() {
  const [estado, accion, enviando] = useActionState<EstadoFormulario, FormData>(crearNecesidad, {});

  const [categoria, setCategoria] = useState("");
  const [prioridad, setPrioridad] = useState("P2");

  // Ubicación
  const [direccion, setDireccion] = useState("");
  const [zona, setZona] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  return (
    <form action={accion} className="space-y-5">
      <input type="hidden" name="lat" value={lat ?? ""} />
      <input type="hidden" name="lng" value={lng ?? ""} />
      <input type="hidden" name="prioridad" value={prioridad} />

      {/* 1. UBICACIÓN — lo primero, para saber dónde ir */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold">1. ¿Dónde estás?</h2>
        <p className="mt-1 text-xs text-texto-suave">
          Detecta tu ubicación con GPS para que la ayuda te encuentre más rápido.
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

      {/* 2. QUÉ NECESITA */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold">2. ¿Qué necesitas?</h2>
        <div className="mt-4 space-y-4">
          <Campo etiqueta="Categoría">
            <select
              name="categoria"
              className={claseInput}
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              required
            >
              <option value="">Selecciona...</option>
              {CATEGORIAS.map((c) => (
                <option key={c.valor} value={c.valor}>{c.etiqueta}</option>
              ))}
            </select>
          </Campo>

          <Campo etiqueta="Describe la situación" ayuda="Con tus palabras. Qué pasa, qué necesitas, cuánta gente hay.">
            <textarea
              name="descripcion"
              rows={3}
              className={claseInput}
              placeholder="Ej: Somos 7 personas, 2 niños. No tenemos agua desde el terremoto. La casa tiene daños y no podemos cocinar."
              required
            />
          </Campo>

          <Campo etiqueta="Cantidad (si aplica)" ayuda="Ej: 20 litros de agua, 5 kits de comida, etc.">
            <input name="cantidad" className={claseInput} placeholder="20 litros, 5 kits, etc." />
          </Campo>
        </div>
      </Card>

      {/* 3. PERSONAS AFECTADAS */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold">3. ¿A cuántas personas afecta?</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Campo etiqueta="Personas en total">
            <input name="personasAfectadas" type="number" min={1} className={claseInput} defaultValue={1} />
          </Campo>
          <Campo etiqueta="Niños">
            <input name="ninos" type="number" min={0} className={claseInput} defaultValue={0} />
          </Campo>
          <Campo etiqueta="Adultos mayores">
            <input name="adultosMayores" type="number" min={0} className={claseInput} defaultValue={0} />
          </Campo>
        </div>
        <div className="mt-4">
          <Campo etiqueta="Necesidades especiales (opcional)" ayuda="Discapacidad, condición médica, embarazo, etc.">
            <input name="necesidadesEspeciales" className={claseInput} placeholder="Persona en silla de ruedas, diabético, etc." />
          </Campo>
        </div>
      </Card>

      {/* 4. PRIORIDAD */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold">4. ¿Qué tan urgente es?</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {PRIORIDADES.map((p) => (
            <label
              key={p.valor}
              className={`cursor-pointer rounded-lg border p-3 transition ${
                prioridad === p.valor ? p.color : "border-borde"
              }`}
            >
              <input
                type="radio"
                className="sr-only"
                checked={prioridad === p.valor}
                onChange={() => setPrioridad(p.valor)}
              />
              <span className="block text-sm font-medium">{p.etiqueta}</span>
              <span className="block text-xs text-texto-suave">{p.nota}</span>
            </label>
          ))}
        </div>
      </Card>

      {/* 5. CONTACTO */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold">5. ¿Cómo te contactamos?</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Nombre">
            <input name="contactoNombre" className={claseInput} required />
          </Campo>
          <Campo etiqueta="Celular">
            <input name="contactoCelular" className={claseInput} inputMode="tel" required />
          </Campo>
        </div>
      </Card>

      <Consentimiento />

      {estado.error && (
        <Aviso tono="alerta">{estado.error}</Aviso>
      )}

      <Boton className="w-full py-3" disabled={enviando}>
        {enviando ? "Enviando…" : "Reportar necesidad"}
      </Boton>

      <p className="text-center text-xs text-texto-suave">
        La información será verificada antes de ser publicada. Si tu situación es de
        riesgo vital, llama al 123, Bomberos o Defensa Civil.
      </p>
    </form>
  );
}
