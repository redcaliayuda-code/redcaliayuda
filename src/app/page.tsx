import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Landing() {
  const [necesidades, voluntarios, resueltas] = await Promise.all([
    prisma.need.count({ where: { estadoResolucion: { not: "CERRADO" } } }),
    prisma.volunteer.count(),
    prisma.need.count({ where: { estadoResolucion: "RESUELTO" } }),
  ]);

  return (
    <main className="mx-auto max-w-5xl px-5 py-8">
      <header className="flex items-center justify-between">
        <div className="text-sm font-semibold tracking-tight text-acento">RED CALI</div>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/panel" className="text-texto-suave hover:text-texto">
            Panel de coordinación
          </Link>
        </nav>
      </header>

      {/* ALERTA */}
      <section className="mt-8">
        <div className="rounded-xl border border-alerta/30 bg-alerta-suave px-5 py-4">
          <div className="text-sm font-semibold text-alerta">
            Terremoto del 10 de agosto de 2026 — Cali y Pacífico colombiano
          </div>
          <p className="mt-1 text-sm text-texto-suave">
            Sistema de coordinación humanitaria ciudadana activo. Si necesitas ayuda o puedes
            ayudar, esta plataforma conecta necesidades reales con acciones concretas.
          </p>
        </div>
      </section>

      {/* HERO */}
      <section className="mt-10 max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          No preguntes cómo ayudar.
          <br />
          <span className="text-acento">Mira qué hace falta.</span>
        </h1>
        <p className="mt-4 text-lg text-texto-suave">
          RED CALI conecta personas que necesitan ayuda con personas que pueden darla.
          Coordinamos recursos, transporte y voluntarios para que la ayuda correcta llegue
          al lugar correcto.
        </p>
      </section>

      {/* CTAs */}
      <section className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/necesito-ayuda"
          className="rounded-xl bg-alerta px-6 py-4 text-center text-superficie transition hover:opacity-90"
        >
          <div className="text-lg font-semibold">Necesito ayuda</div>
          <div className="mt-0.5 text-sm opacity-90">Reportar una necesidad</div>
        </Link>
        <Link
          href="/quiero-ayudar"
          className="rounded-xl bg-acento px-6 py-4 text-center text-superficie transition hover:opacity-90"
        >
          <div className="text-lg font-semibold">Quiero ayudar</div>
          <div className="mt-0.5 text-sm opacity-90">Ofrecer recursos o tiempo</div>
        </Link>
      </section>

      {/* STATS */}
      {(necesidades > 0 || voluntarios > 0) && (
        <section className="mt-10 grid gap-3 sm:grid-cols-3">
          <Card className="p-4 text-center">
            <div className="text-3xl font-semibold text-alerta">{necesidades}</div>
            <div className="mt-1 text-sm text-texto-suave">Necesidades activas</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-semibold text-acento">{voluntarios}</div>
            <div className="mt-1 text-sm text-texto-suave">Voluntarios registrados</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-semibold text-ok">{resueltas}</div>
            <div className="mt-1 text-sm text-texto-suave">Necesidades resueltas</div>
          </Card>
        </section>
      )}

      {/* CÓMO FUNCIONA */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight">Cómo funciona</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { n: 1, t: "Reporta", d: "Una persona reporta qué necesita y dónde está. Con ubicación GPS." },
            { n: 2, t: "Verifica", d: "Un verificador confirma la información. Nada se publica sin revisión." },
            { n: 3, t: "Conecta", d: "El sistema cruza necesidades con recursos, voluntarios y transporte disponible." },
            { n: 4, t: "Entrega", d: "Se crea una misión concreta. La ayuda llega y se confirma con evidencia." },
          ].map((paso) => (
            <div key={paso.n}>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-acento-suave text-sm font-semibold text-acento">
                {paso.n}
              </div>
              <div className="mt-2 text-sm font-semibold">{paso.t}</div>
              <p className="mt-1 text-sm text-texto-suave">{paso.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORÍAS DE NECESIDAD */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight">¿Qué se puede reportar?</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            "Agua", "Alimentos", "Medicamentos", "Higiene", "Pañales",
            "Refugio", "Cobijas", "Carpas", "Linternas", "Herramientas",
            "Atención médica", "Atención psicológica", "Transporte",
            "Alojamiento", "Evacuación", "Personas desaparecidas",
          ].map((cat) => (
            <span
              key={cat}
              className="rounded-full border border-borde bg-superficie px-3 py-1.5 text-sm"
            >
              {cat}
            </span>
          ))}
        </div>
      </section>

      {/* PRIORIDADES */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight">Sistema de prioridades</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { color: "text-alerta", bg: "bg-alerta-suave", label: "P1 — VIDA", desc: "Persona atrapada, emergencia médica, evacuación, medicamentos críticos" },
            { color: "text-aviso", bg: "bg-aviso-suave", label: "P2 — SUPERVIVENCIA", desc: "Agua, alimentos, refugio, higiene, alimentación infantil" },
            { color: "text-acento", bg: "bg-acento-suave", label: "P3 — RECUPERACIÓN", desc: "Ropa, herramientas, limpieza, reparaciones" },
            { color: "text-ok", bg: "bg-ok-suave", label: "P4 — APOYO", desc: "Actividades infantiles, apoyo comunitario, donaciones no críticas" },
          ].map((p) => (
            <Card key={p.label} className={`${p.bg} border-transparent p-4`}>
              <div className={`text-sm font-semibold ${p.color}`}>{p.label}</div>
              <p className="mt-1 text-xs text-texto-suave">{p.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* PRINCIPIOS */}
      <section className="mt-14">
        <Card className="p-6">
          <h2 className="text-lg font-semibold">Principios de RED CALI</h2>
          <ul className="mt-3 space-y-2 text-sm text-texto-suave">
            <li>Toda información se verifica antes de actuar.</li>
            <li>No sustituimos a Bomberos, Cruz Roja, Defensa Civil ni autoridades.</li>
            <li>Los recursos se dirigen según necesidades reales, no suposiciones.</li>
            <li>Cada ayuda entregada se confirma con evidencia.</li>
            <li>La plataforma es gratuita. No tiene costo para nadie.</li>
          </ul>
        </Card>
      </section>

      <footer className="mt-14 border-t border-borde pt-6 text-xs text-texto-suave">
        RED CALI — Sistema de coordinación humanitaria ciudadana. Operado con acompañamiento
        humano. Complementa los canales oficiales, no los reemplaza.
      </footer>
    </main>
  );
}
