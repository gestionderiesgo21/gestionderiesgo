import { cn } from "@/lib/utils";

/** Marca institucional de la plataforma: isotipo (escudo de protección) + wordmark. */
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
        d="M20 8.2l9.2 3.3v7c0 5.8-3.9 10.4-9.2 12-5.3-1.6-9.2-6.2-9.2-12v-7z"
        fill="#fff"
      />
      <path
        d="M15.6 19.9l3.1 3.1 5.7-6.5"
        fill="none"
        stroke="var(--brand-orange)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
