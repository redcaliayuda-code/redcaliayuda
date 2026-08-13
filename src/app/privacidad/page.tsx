import Link from "next/link";

export default function PrivacidadPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-8">
      <Link href="/" className="text-sm text-texto-suave hover:text-texto">
        ← HumansCol
      </Link>

      <h1 className="mt-4 text-2xl font-bold tracking-tight">
        Tratamiento de datos personales
      </h1>
      <p className="mt-2 text-sm text-texto-suave">
        Ultima actualizacion: 12 de agosto de 2026
      </p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-texto-suave">
        <section>
          <h2 className="text-base font-bold text-texto">Quienes somos</h2>
          <p className="mt-2">
            HumansCol es una plataforma ciudadana sin animo de lucro creada para coordinar
            ayuda humanitaria durante la emergencia por el terremoto del 10 de agosto de 2026
            en Colombia. No somos una empresa ni una ONG registrada — somos ciudadanos
            organizandose para ayudar.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-texto">Para que usamos tus datos</h2>
          <p className="mt-2">
            Los datos que recoges en esta plataforma se usan exclusivamente para:
          </p>
          <ul className="mt-2 space-y-1 list-disc pl-5">
            <li>Conectar a personas que necesitan ayuda con voluntarios y recursos cercanos.</li>
            <li>Coordinar misiones de entrega de ayuda humanitaria.</li>
            <li>Facilitar la busqueda de personas desaparecidas o reportar que estan a salvo.</li>
            <li>Informar sobre el estado de zonas afectadas.</li>
          </ul>
          <p className="mt-2 font-medium text-texto">
            Nunca usamos tus datos para publicidad, venta, analisis comercial ni ningun otro
            fin distinto a la coordinacion humanitaria.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-texto">Que datos recogemos</h2>
          <div className="mt-2 space-y-3">
            <div className="rounded-lg border border-borde p-3">
              <div className="text-xs font-bold text-texto">Si reportas una necesidad</div>
              <p className="mt-1">Nombre, celular, ubicacion GPS, direccion, zona, descripcion de la necesidad.</p>
            </div>
            <div className="rounded-lg border border-borde p-3">
              <div className="text-xs font-bold text-texto">Si te registras como voluntario</div>
              <p className="mt-1">Nombre, celular, correo (opcional), ubicacion GPS, tipo de ayuda, vehiculo.</p>
            </div>
            <div className="rounded-lg border border-borde p-3">
              <div className="text-xs font-bold text-texto">Si reportas una persona o zona</div>
              <p className="mt-1">Nombre de la persona reportada, nombre de contacto, celular, ubicacion.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-base font-bold text-texto">Quien puede ver tus datos</h2>
          <ul className="mt-2 space-y-1 list-disc pl-5">
            <li><strong>Publico:</strong> la necesidad, zona, descripcion y estado se muestran publicamente para que los voluntarios puedan ayudar.</li>
            <li><strong>Solo coordinadores:</strong> tu nombre y celular solo son visibles para los coordinadores que asignan misiones de ayuda.</li>
            <li><strong>Nunca compartimos</strong> tus datos con terceros, empresas ni entidades ajenas a la coordinacion de ayuda.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-texto">Donde se almacenan</h2>
          <p className="mt-2">
            Los datos se almacenan en servidores de Supabase (infraestructura de Amazon Web Services)
            en Estados Unidos, protegidos con cifrado en transito y en reposo. El acceso a la base
            de datos esta restringido por credenciales que solo manejan los coordinadores de la plataforma.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-texto">Cuanto tiempo conservamos tus datos</h2>
          <p className="mt-2">
            Los datos se conservan unicamente mientras dure la emergencia y el periodo de
            recuperacion. Una vez que la emergencia se declare superada, los datos personales
            (nombre, celular, ubicacion exacta) seran eliminados de la base de datos.
          </p>
          <p className="mt-2">
            Solo se conservaran datos anonimizados y agregados con fines estadisticos
            (por ejemplo: "se atendieron 500 necesidades en 3 ciudades").
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-texto">Tus derechos</h2>
          <p className="mt-2">
            Conforme a la Ley 1581 de 2012, tienes derecho a:
          </p>
          <ul className="mt-2 space-y-1 list-disc pl-5">
            <li>Conocer que datos tuyos tenemos.</li>
            <li>Pedir que se actualicen o corrijan.</li>
            <li>Pedir que se eliminen en cualquier momento.</li>
            <li>Revocar tu autorizacion.</li>
          </ul>
          <p className="mt-2">
            Para ejercer cualquiera de estos derechos, escribe por WhatsApp al numero
            de coordinacion de HumansCol o al correo de contacto indicado en la plataforma.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-texto">Base legal</h2>
          <p className="mt-2">
            El tratamiento se realiza con base en el <strong>consentimiento libre e informado</strong> que
            das al enviar cada formulario (Art. 9, Ley 1581 de 2012), y en el <strong>interes
            legitimo de proteger la vida</strong> en una situacion de emergencia humanitaria
            (Art. 10, literal e).
          </p>
        </section>
      </div>

      <div className="mt-8 text-center">
        <Link href="/" className="text-sm text-acento hover:underline">
          ← Volver al inicio
        </Link>
      </div>
    </main>
  );
}
