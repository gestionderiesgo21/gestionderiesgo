import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Logo institucional PUCE (versión horizontal). El PNG es transparente, así que:
 * - sobre fondo claro (navbars blancas) usar `plate={false}` — se ve directo;
 * - sobre fondo azul marino usar la placa blanca (por defecto) para que resalte.
 * Se dimensiona por ALTURA (el ancho se ajusta solo). Asset: `public/puce.png`.
 */
export function PuceLogo({
  className,
  height = 36,
  plate = true,
}: {
  className?: string;
  height?: number;
  plate?: boolean;
}) {
  const img = (
    <Image
      src="/puce.png"
      alt="PUCE"
      width={500}
      height={180}
      className="w-auto object-contain"
      style={{ height }}
      priority
    />
  );

  if (!plate) {
    return <span className={cn("inline-flex items-center", className)}>{img}</span>;
  }

  return (
    <span className={cn("inline-flex items-center rounded-md bg-white px-4 py-2", className)}>
      {img}
    </span>
  );
}

/**
 * Lockup de marca: logo PUCE (institución) + nombre del producto "Gestión de
 * Riesgos", separados por una línea. Así se lee como plataforma de gestión de
 * riesgo asociada a la PUCE, no como una página de la PUCE.
 * - `onDark`: sobre fondo azul marino (login/registro) usa placa blanca y texto claro.
 */
export function BrandLockup({
  onDark = false,
  logoHeight = 30,
  className,
}: {
  onDark?: boolean;
  logoHeight?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <PuceLogo height={logoHeight} plate={onDark} />
      <span
        className={cn("h-8 w-px shrink-0", onDark ? "bg-white/25" : "bg-border")}
        aria-hidden
      />
      <div className="leading-tight">
        <div
          className={cn(
            "text-sm font-semibold tracking-tight",
            onDark ? "text-white" : "text-foreground"
          )}
        >
          Gestión de Riesgos
        </div>
        <div className={cn("text-xs", onDark ? "text-white/60" : "text-muted-foreground")}>
          Autoevaluación GIRD
        </div>
      </div>
    </div>
  );
}
