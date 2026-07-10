import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { Logo, Wordmark } from "@/components/brand";
import { GobEcuador } from "@/components/gob-brand";

/** Layout dividido para páginas de acceso: panel institucional (marino) + contenido. */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between bg-brand-navy p-10 text-brand-navy-foreground lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle at 20% 20%, #fff 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="relative flex flex-wrap items-center gap-3">
          <GobEcuador />
          <span className="h-8 w-px bg-white/20" />
          <span className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5">
            <Image src="/puce.svg" alt="PUCE" width={92} height={30} priority />
          </span>
        </div>
        <div className="relative space-y-5">
          <Logo className="h-12 w-12" />
          <h1 className="max-w-md text-3xl font-semibold leading-tight tracking-tight">
            Plataforma de Gestión Integral del Riesgo de Desastres
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-white/70">
            Autoevaluación del índice IDM-GIRD para los Gobiernos Autónomos Descentralizados
            Municipales del Ecuador.
          </p>
        </div>
        <div className="relative flex items-center gap-2 text-xs text-white/60">
          <ShieldCheck className="h-4 w-4" />
          Acceso seguro y controlado por rol
        </div>
      </aside>

      <section className="flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Wordmark />
          </div>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
