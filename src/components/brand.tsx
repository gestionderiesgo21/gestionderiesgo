import { cn } from "@/lib/utils";

/** Marca institucional de la plataforma: isotipo (triángulo de alerta) + wordmark. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={cn("h-9 w-9", className)}
      role="img"
      aria-label="Gestión de Riesgos"
    >
      <rect width="40" height="40" rx="9" fill="var(--brand-orange)" />
      <path
        d="M20 9.5c.62 0 1.19.33 1.5.86l9.1 15.77c.63 1.1-.16 2.47-1.43 2.47H10.83c-1.27 0-2.06-1.37-1.43-2.47l9.1-15.77c.31-.53.88-.86 1.5-.86Z"
        fill="#fff"
      />
      <rect x="18.6" y="16.4" width="2.8" height="6.6" rx="1.4" fill="var(--brand-orange)" />
      <circle cx="20" cy="25.6" r="1.6" fill="var(--brand-orange)" />
    </svg>
  );
}

export function Wordmark({
  className,
  subtitle = true,
}: {
  className?: string;
  subtitle?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Logo />
      <div className="leading-tight">
        <div className="text-[15px] font-semibold tracking-tight">Gestión de Riesgos</div>
        {subtitle && (
          <div className="text-xs text-muted-foreground">Autoevaluación Municipal · GIRD</div>
        )}
      </div>
    </div>
  );
}
