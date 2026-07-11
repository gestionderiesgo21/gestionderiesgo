import Link from "next/link";
import {
  ClipboardList,
  Calculator,
  BarChart3,
  LogIn,
  UserPlus,
} from "lucide-react";
import { BrandLockup } from "@/components/puce-brand";

const features = [
  {
    icono: ClipboardList,
    titulo: "Cuestionario guiado",
    texto: "275 preguntas en 9 componentes, respondidas por pasos.",
    tono: "navy" as const,
  },
  {
    icono: Calculator,
    titulo: "Índice IDM automático",
    texto: "Cálculo del IDM-GIRD sin hojas de cálculo ni errores manuales.",
    tono: "sky" as const,
  },
  {
    icono: BarChart3,
    titulo: "Panel de resultados",
    texto: "Compara tu municipio a nivel nacional y exporta a Excel.",
    tono: "navy" as const,
  },
];

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      {/* Línea de acento institucional */}
      <div className="h-1 w-full bg-gradient-to-r from-brand-navy via-brand-sky to-brand-navy" />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/80 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <BrandLockup logoHeight={26} />
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/login"
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:translate-y-0"
            >
              Regístrate
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex flex-1 items-center overflow-hidden">
        {/* Textura de puntos */}
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-[0.35] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        {/* Glows suaves navy + celeste */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 60% 50% at 15% 10%, color-mix(in oklch, var(--brand-navy) 13%, transparent) 0, transparent 60%), radial-gradient(ellipse 50% 45% at 88% 15%, color-mix(in oklch, var(--brand-sky) 16%, transparent) 0, transparent 55%)",
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
                className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:translate-y-0"
              >
                <LogIn className="h-5 w-5" />
                Iniciar sesión
              </Link>
              <Link
                href="/registro"
                className="inline-flex items-center justify-center gap-2.5 rounded-xl border-2 border-primary bg-card px-8 py-4 text-base font-semibold text-primary shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:translate-y-0"
              >
                <UserPlus className="h-5 w-5" />
                Regístrate
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Franja de features (tinte + tarjetas con profundidad) */}
      <section className="relative border-y border-border bg-secondary/50">
        <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6">
          <div className="grid gap-5 sm:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.titulo}
                className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-sm transition-transform duration-200 group-hover:scale-105 ${
                    f.tono === "sky"
                      ? "bg-brand-sky-soft text-brand-sky"
                      : "bg-accent text-primary"
                  }`}
                >
                  <f.icono className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{f.titulo}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-brand-navy text-brand-navy-foreground">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-start justify-between gap-4 px-4 py-6 sm:flex-row sm:items-center sm:px-6">
          <BrandLockup onDark logoHeight={24} />
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
