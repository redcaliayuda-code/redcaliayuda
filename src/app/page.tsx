import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Landing() {
  const [necesidades, voluntarios, resueltas] = await Promise.all([
    prisma.need.count({ where: { estadoResolucion: { not: "CERRADO" } } }),
    prisma.volunteer.count(),
    prisma.need.count({ where: { estadoResolucion: "RESUELTO" } }),
  ]);

  return (
    <main className="min-h-screen safe-bottom">
      {/* Header fijo */}
      <header className="sticky top-0 z-10 border-b border-borde bg-superficie/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="text-sm font-bold tracking-tight text-acento">HumansCol</div>
          <nav className="flex items-center gap-3 text-xs">
            <Link href="/necesidades" className="text-texto-suave hover:text-texto">
              Necesidades
            </Link>
            <Link href="/personas" className="text-texto-suave hover:text-texto">
              Personas
            </Link>
            <Link href="/panel" className="text-texto-suave hover:text-texto">
              Panel
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4">
        {/* Alerta sísmica */}
        <section className="mt-4 animar-entrada">
          <div className="rounded-xl border border-alerta/30 bg-alerta-suave px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="pulso inline-block h-2.5 w-2.5 rounded-full bg-alerta" />
              <span className="text-xs font-bold text-alerta tracking-wide uppercase">Emergencia activa</span>
            </div>
            <p className="mt-1 text-sm font-medium text-alerta">
              Terremoto del 10 de agosto — Colombia
            </p>
          </div>
        </section>

        {/* Hero */}
        <section className="mt-8 animar-entrada" style={{ animationDelay: "100ms" }}>
          <h1 className="text-3xl font-bold tracking-tight leading-tight sm:text-4xl">
            No preguntes cómo ayudar.
            <br />
            <span className="text-acento">Mira qué hace falta.</span>
          </h1>
          <p className="mt-3 text-base text-texto-suave leading-relaxed">
            Conectamos personas que necesitan ayuda con personas que pueden darla.
            Con ubicación GPS precisa.
          </p>
        </section>

        {/* CTAs principales — móvil primero */}
        <section className="mt-6 grid gap-3 animar-entrada" style={{ animationDelay: "200ms" }}>
          <Link
            href="/necesito-ayuda"
            className="toque-activo flex items-center gap-4 rounded-2xl bg-alerta px-5 py-5 text-superficie transition hover:opacity-90"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 text-2xl">
              🆘
            </div>
            <div>
              <div className="text-lg font-bold">Necesito ayuda</div>
              <div className="text-sm opacity-90">Reportar una necesidad con GPS</div>
            </div>
          </Link>
          <Link
            href="/quiero-ayudar"
            className="toque-activo flex items-center gap-4 rounded-2xl bg-acento px-5 py-5 text-superficie transition hover:opacity-90"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 text-2xl">
              🤝
            </div>
            <div>
              <div className="text-lg font-bold">Quiero ayudar</div>
              <div className="text-sm opacity-90">Ofrecer recursos, tiempo o transporte</div>
            </div>
          </Link>
          <Link
            href="/cerca"
            className="toque-activo flex items-center gap-4 rounded-2xl border-2 border-acento bg-acento-suave px-5 py-5 transition hover:opacity-90"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-acento/20 text-2xl">
              📍
            </div>
            <div>
              <div className="text-lg font-bold text-acento">Cerca de mi</div>
              <div className="text-sm text-texto-suave">Ver necesidades por distancia GPS</div>
            </div>
          </Link>
          <Link
            href="/necesidades"
            className="toque-activo flex items-center gap-4 rounded-2xl border-2 border-borde bg-superficie px-5 py-5 transition hover:border-acento"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-acento-suave text-2xl">
              📋
            </div>
            <div>
              <div className="text-lg font-bold">Ver necesidades</div>
              <div className="text-sm text-texto-suave">Qué hace falta ahora mismo</div>
            </div>
          </Link>
        </section>

        {/* Nuevas funcionalidades */}
        <section className="mt-3 grid gap-3 sm:grid-cols-3 animar-entrada" style={{ animationDelay: "250ms" }}>
          <Link
            href="/personas"
            className="toque-activo flex items-center gap-3 rounded-2xl border border-borde bg-superficie px-4 py-4 transition hover:border-acento"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ok-suave text-xl">
              👥
            </div>
            <div>
              <div className="text-sm font-bold">Buscar personas</div>
              <div className="text-xs text-texto-suave">Estoy bien / Busco a alguien</div>
            </div>
          </Link>
          <Link
            href="/reportes"
            className="toque-activo flex items-center gap-3 rounded-2xl border border-borde bg-superficie px-4 py-4 transition hover:border-acento"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-aviso-suave text-xl">
              📡
            </div>
            <div>
              <div className="text-sm font-bold">Estado de zona</div>
              <div className="text-xs text-texto-suave">Vias, luz, agua, albergues</div>
            </div>
          </Link>
          <Link
            href="/recursos"
            className="toque-activo flex items-center gap-3 rounded-2xl border border-borde bg-superficie px-4 py-4 transition hover:border-acento"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-alerta-suave text-xl">
              🚨
            </div>
            <div>
              <div className="text-sm font-bold">Emergencia</div>
              <div className="text-xs text-texto-suave">Numeros y recursos</div>
            </div>
          </Link>
        </section>

        {/* Stats en vivo */}
        {(necesidades > 0 || voluntarios > 0) && (
          <section className="mt-8 grid grid-cols-3 gap-2 animar-entrada" style={{ animationDelay: "300ms" }}>
            <div className="rounded-xl bg-alerta-suave p-3 text-center">
              <div className="cifra text-2xl font-bold text-alerta">{necesidades}</div>
              <div className="mt-0.5 text-xs text-texto-suave">Activas</div>
            </div>
            <div className="rounded-xl bg-acento-suave p-3 text-center">
              <div className="cifra text-2xl font-bold text-acento">{voluntarios}</div>
              <div className="mt-0.5 text-xs text-texto-suave">Voluntarios</div>
            </div>
            <div className="rounded-xl bg-ok-suave p-3 text-center">
              <div className="cifra text-2xl font-bold text-ok">{resueltas}</div>
              <div className="mt-0.5 text-xs text-texto-suave">Resueltas</div>
            </div>
          </section>
        )}

        {/* Cómo funciona */}
        <section className="mt-10">
          <h2 className="text-lg font-bold tracking-tight">Cómo funciona</h2>
          <div className="mt-4 space-y-3 escalonar">
            {[
              { n: "1", icon: "📍", t: "Reporta con GPS", d: "Ubicación precisa automática para que la ayuda llegue exactamente donde se necesita." },
              { n: "2", icon: "✅", t: "Se verifica", d: "Un voluntario confirma la información antes de publicarla." },
              { n: "3", icon: "🔗", t: "Se conecta", d: "Cruzamos necesidades con voluntarios y recursos disponibles cerca." },
              { n: "4", icon: "📦", t: "Llega la ayuda", d: "Se crea una misión concreta con seguimiento hasta la entrega." },
            ].map((paso) => (
              <div key={paso.n} className="flex gap-4 rounded-xl border border-borde bg-superficie p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-acento-suave text-lg">
                  {paso.icon}
                </div>
                <div>
                  <div className="text-sm font-semibold">{paso.t}</div>
                  <p className="mt-0.5 text-xs text-texto-suave leading-relaxed">{paso.d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Categorías */}
        <section className="mt-10">
          <h2 className="text-lg font-bold tracking-tight">¿Qué se puede reportar?</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              "💧 Agua", "🍚 Alimentos", "💊 Medicamentos", "🧴 Higiene",
              "👶 Pañales", "🏠 Refugio", "🛏️ Cobijas", "🔦 Linternas",
              "🔧 Herramientas", "🏥 Médica", "🧠 Psicológica",
              "🚗 Transporte", "🏡 Alojamiento", "🚨 Evacuación", "🔍 Desaparecidos",
            ].map((cat) => (
              <span key={cat} className="rounded-full border border-borde bg-superficie px-3 py-1.5 text-xs">
                {cat}
              </span>
            ))}
          </div>
        </section>

        {/* Prioridades */}
        <section className="mt-10">
          <h2 className="text-lg font-bold tracking-tight">Prioridades</h2>
          <div className="mt-3 space-y-2">
            {[
              { color: "border-l-alerta bg-alerta-suave", label: "P1 — VIDA", desc: "Persona atrapada, emergencia médica" },
              { color: "border-l-aviso bg-aviso-suave", label: "P2 — SUPERVIVENCIA", desc: "Agua, alimentos, refugio" },
              { color: "border-l-acento bg-acento-suave", label: "P3 — RECUPERACIÓN", desc: "Herramientas, limpieza, reparaciones" },
              { color: "border-l-ok bg-ok-suave", label: "P4 — APOYO", desc: "Apoyo comunitario, donaciones" },
            ].map((p) => (
              <div key={p.label} className={`rounded-lg border-l-4 ${p.color} px-4 py-2.5`}>
                <span className="text-xs font-bold">{p.label}</span>
                <span className="ml-2 text-xs text-texto-suave">{p.desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Principios */}
        <section className="mt-10 rounded-xl border border-borde bg-superficie p-5">
          <h2 className="text-sm font-bold">Principios de HumansCol</h2>
          <ul className="mt-3 space-y-2 text-xs text-texto-suave leading-relaxed">
            <li className="flex gap-2"><span className="text-acento">→</span> Toda información se verifica antes de actuar.</li>
            <li className="flex gap-2"><span className="text-acento">→</span> Complementamos a las autoridades, no las reemplazamos.</li>
            <li className="flex gap-2"><span className="text-acento">→</span> Los recursos van donde más se necesitan.</li>
            <li className="flex gap-2"><span className="text-acento">→</span> Cada entrega se confirma con evidencia.</li>
            <li className="flex gap-2"><span className="text-acento">→</span> <strong>Plataforma 100% gratuita.</strong></li>
          </ul>
        </section>

        <footer className="mt-8 border-t border-borde py-6 text-center text-xs text-texto-suave">
          HumansCol — Coordinación humanitaria ciudadana.
          <br />
          Complementa los canales oficiales, no los reemplaza.
        </footer>
      </div>
    </main>
  );
}
