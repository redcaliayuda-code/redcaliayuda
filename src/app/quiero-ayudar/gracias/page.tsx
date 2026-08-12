import Link from "next/link";
import { Card } from "@/components/ui";

export default function GraciasPage() {
  return (
    <main className="mx-auto max-w-xl px-5 py-16 text-center">
      <Card className="p-8">
        <div className="text-4xl">✓</div>
        <h1 className="mt-4 text-2xl font-semibold">Gracias por querer ayudar</h1>
        <p className="mt-3 text-texto-suave">
          Tu registro quedó guardado. Te contactaremos cuando haya una misión compatible
          con lo que puedes ofrecer. Mientras tanto, comparte HumansCol con más personas
          que quieran ayudar.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg border border-borde px-4 py-2 text-sm font-medium transition hover:bg-fondo"
          >
            Volver al inicio
          </Link>
        </div>
      </Card>
    </main>
  );
}
