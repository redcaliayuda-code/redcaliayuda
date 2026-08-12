import Link from "next/link";
import { FormularioNecesidad } from "./formulario";

export default function NecesitoAyudaPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-8">
      <Link href="/" className="text-sm text-texto-suave hover:text-texto">
        ← HumansCol
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Necesito ayuda</h1>
      <p className="mt-2 text-texto-suave">
        Indica tu ubicación y cuéntanos qué necesitas. Un verificador revisará tu reporte
        y lo conectaremos con recursos disponibles.
      </p>

      <div className="mt-8">
        <FormularioNecesidad />
      </div>
    </main>
  );
}
