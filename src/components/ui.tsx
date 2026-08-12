import Link from "next/link";
import type { ReactNode } from "react";

type Tono = "neutro" | "ok" | "aviso" | "alerta" | "acento";

const TONOS: Record<Tono, string> = {
  neutro: "bg-fondo text-texto-suave border-borde",
  ok: "bg-ok-suave text-ok border-transparent",
  aviso: "bg-aviso-suave text-aviso border-transparent",
  alerta: "bg-alerta-suave text-alerta border-transparent",
  acento: "bg-acento-suave text-acento border-transparent",
};

export function Badge({ children, tono = "neutro" }: { children: ReactNode; tono?: Tono }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${TONOS[tono]}`}
    >
      {children}
    </span>
  );
}

/// Colores de estado centralizados: el mismo estado se ve igual en toda la app.
export function tonoEstado(estado: string): Tono {
  if (["ACTIVO", "VIGENTE", "VERIFICADA", "CERTIFICADA", "ACEPTADA", "ACEPTO", "EJECUTADA", "CALIFICADA", "CERRADA", "RESUELTO", "APROBADO", "LIQUIDADO", "COBRADO"].includes(estado))
    return "ok";
  if (["EN_VERIFICACION", "EN_REVISION", "PENDIENTE", "NUEVA", "SOLICITADO", "ABIERTO", "EN_INVESTIGACION", "DECLARADA", "SUGERIDO", "CONTACTADO", "BORRADOR"].includes(estado))
    return "aviso";
  if (["BLOQUEADO", "SUSPENDIDO", "VENCIDO", "RECHAZADO", "PERDIDA", "NO_SHOW", "CANCELADA_CLIENTE", "CANCELADA_PROFESIONAL", "NO_HABILITADA", "RECHAZO", "ESCALADO", "FALLIDO"].includes(estado))
    return "alerta";
  if (["ASIGNADA", "CONFIRMADA", "EN_CAMINO", "EN_SITIO", "EN_EJECUCION", "COTIZADA", "CLASIFICADA", "AUTORIZADO"].includes(estado))
    return "acento";
  return "neutro";
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-borde bg-superficie ${className}`}>{children}</div>
  );
}

export function CardTitulo({
  children,
  accion,
}: {
  children: ReactNode;
  accion?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-borde px-4 py-3">
      <h2 className="text-sm font-semibold">{children}</h2>
      {accion}
    </div>
  );
}

export function Metrica({
  etiqueta,
  valor,
  nota,
  tono,
}: {
  etiqueta: string;
  valor: string;
  nota?: string;
  tono?: Tono;
}) {
  const color =
    tono === "alerta" ? "text-alerta" : tono === "aviso" ? "text-aviso" : tono === "ok" ? "text-ok" : "text-texto";
  return (
    <Card className="p-4">
      <div className="text-xs text-texto-suave">{etiqueta}</div>
      <div className={`cifra mt-1 text-2xl font-semibold ${color}`}>{valor}</div>
      {nota ? <div className="mt-1 text-xs text-texto-suave">{nota}</div> : null}
    </Card>
  );
}

export function Vacio({ children }: { children: ReactNode }) {
  return (
    <div className="px-4 py-10 text-center text-sm text-texto-suave">{children}</div>
  );
}

export function Boton({
  children,
  tipo = "primario",
  type = "submit",
  name,
  value,
  disabled,
  className = "",
}: {
  children: ReactNode;
  tipo?: "primario" | "secundario" | "peligro";
  type?: "submit" | "button";
  name?: string;
  value?: string;
  disabled?: boolean;
  className?: string;
}) {
  const estilos = {
    primario: "bg-acento text-superficie hover:opacity-90",
    secundario: "border border-borde bg-superficie hover:bg-fondo",
    peligro: "border border-alerta text-alerta hover:bg-alerta-suave",
  }[tipo];
  return (
    <button
      type={type}
      name={name}
      value={value}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${estilos} ${className}`}
    >
      {children}
    </button>
  );
}

export function Enlace({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-acento hover:underline">
      {children}
    </Link>
  );
}

export function Campo({
  etiqueta,
  ayuda,
  children,
}: {
  etiqueta: string;
  ayuda?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{etiqueta}</span>
      {ayuda ? <span className="mt-0.5 block text-xs text-texto-suave">{ayuda}</span> : null}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

export const claseInput =
  "w-full rounded-lg border border-borde bg-superficie px-3 py-2 text-sm outline-none focus:border-acento";

export function Tabla({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, right }: { children: ReactNode; right?: boolean }) {
  return (
    <th
      className={`border-b border-borde px-4 py-2 text-xs font-medium text-texto-suave ${
        right ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  right,
  className = "",
}: {
  children: ReactNode;
  right?: boolean;
  className?: string;
}) {
  return (
    <td className={`border-b border-borde px-4 py-2.5 ${right ? "text-right" : ""} ${className}`}>
      {children}
    </td>
  );
}

/// Barra de aporte usada en los desgloses de Trust y Match: el score siempre
/// se muestra con su explicación al lado, nunca solo.
export function Barra({ valor, maximo }: { valor: number; maximo: number }) {
  const pct = maximo <= 0 ? 0 : Math.max(0, Math.min(100, (valor / maximo) * 100));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-fondo">
      <div className="h-full rounded-full bg-acento" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Aviso({ tono = "aviso", children }: { tono?: Tono; children: ReactNode }) {
  const estilos = {
    aviso: "border-aviso/40 bg-aviso-suave text-aviso",
    alerta: "border-alerta/40 bg-alerta-suave text-alerta",
    ok: "border-ok/40 bg-ok-suave text-ok",
    acento: "border-acento/40 bg-acento-suave text-acento",
    neutro: "border-borde bg-fondo text-texto-suave",
  }[tono];
  return (
    <div className={`rounded-lg border px-3 py-2 text-sm ${estilos}`}>{children}</div>
  );
}
