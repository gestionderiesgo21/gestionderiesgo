import Link from "next/link";
import {
  ClipboardList,
  Calculator,
  BarChart3,
  LogIn,
  UserPlus,
} from "lucide-react";
import { Logo } from "@/components/brand";
import { PuceLogo } from "@/components/puce-brand";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/80 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <PuceLogo height={30} plate={false} />
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/login"
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md active:translate-y-0"
            >
              Regístrate
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex flex-1 items-center overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, color-mix(in oklch, var(--brand-orange) 12%, transparent) 0, transparent 45%), radial-gradient(circle at 85% 10%, color-mix(in oklch, var(--brand-navy) 9%, transparent) 0, transparent 42%)",
          }}
        />
        <div className="relative mx-auto w-full max-w-5xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <div className="mx-auto max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
              Autoevaluación del riesgo de desastres para los municipios del Ecuador
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Mide la capacidad de gestión del riesgo de tu GADM y obtén tu índice IDM-GIRD,
              todo en línea.
            </p>

            {/* Botones grandes */}
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row sm:items-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg active:translate-y-0"
              >
                <LogIn className="h-5 w-5" />
                Iniciar sesión
              </Link>
              <Link
                href="/registro"
                className="inline-flex items-center justify-center gap-2.5 rounded-xl border-2 border-primary bg-card px-8 py-4 text-base font-semibold text-primary shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent hover:shadow-md active:translate-y-0"
              >
                <UserPlus className="h-5 w-5" />
                Regístrate
              </Link>
            </div>

            {/* Trío compacto de qué hace */}
            <div className="mx-auto mt-16 grid max-w-3xl gap-6 sm:grid-cols-3">
              {[
                { icono: ClipboardList, texto: "Cuestionario guiado por componentes" },
                { icono: Calculator, texto: "Cálculo automático del índice IDM" },
                { icono: BarChart3, texto: "Panel de resultados y comparación" },
              ].map((f) => (
                <div
                  key={f.texto}
                  className="group flex flex-col items-center gap-2"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-md">
                    <f.icono className="h-6 w-6" />
                  </div>
                  <p className="text-sm text-muted-foreground">{f.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-brand-navy text-brand-navy-foreground">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-start justify-between gap-4 px-4 py-6 sm:flex-row sm:items-center sm:px-6">
          <div className="flex items-center gap-3">
            <Logo className="h-8 w-8" />
            <div className="text-sm">
              <div className="font-semibold">Gestión de Riesgos</div>
              <div className="text-white/60">Autoevaluación Municipal · GIRD</div>
            </div>
          </div>
          <div className="flex items-center gap-5 text-sm">
            <Link href="/login" className="text-white/80 transition-colors hover:text-white">
              Iniciar sesión
            </Link>
            <Link href="/registro" className="text-white/80 transition-colors hover:text-white">
              Regístrate
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
