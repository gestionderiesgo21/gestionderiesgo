import Link from "next/link";
import {
  ShieldCheck,
  ClipboardList,
  Calculator,
  BarChart3,
  Building2,
  LogIn,
  UserPlus,
  CheckCircle2,
} from "lucide-react";
import { Logo, Wordmark } from "@/components/brand";
import { GobEcuador } from "@/components/gob-brand";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      {/* ---------------------------------------------------------------- Header */}
      <header className="bg-brand-navy text-brand-navy-foreground">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <GobEcuador />
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-md px-3 py-2 text-sm font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="rounded-md bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Regístrate
            </Link>
          </nav>
        </div>
      </header>

      {/* ------------------------------------------------------------------ Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 15%, color-mix(in oklch, var(--brand-orange) 12%, transparent) 0, transparent 45%), radial-gradient(circle at 85% 0%, color-mix(in oklch, var(--brand-navy) 10%, transparent) 0, transparent 40%)",
          }}
        />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              Gestión Integral del Riesgo de Desastres
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
              Autoevaluación GIRD para los municipios del Ecuador
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Una plataforma para que cada Gobierno Autónomo Descentralizado Municipal (GADM)
              mida su capacidad de gestión del riesgo de desastres, calcule su índice{" "}
              <strong className="font-semibold text-foreground">IDM-GIRD</strong> y compare
              resultados a nivel nacional.
            </p>

            {/* Botones grandes y claros */}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md active:translate-y-px"
              >
                <LogIn className="h-5 w-5" />
                Iniciar sesión
              </Link>
              <Link
                href="/registro"
                className="inline-flex items-center justify-center gap-2.5 rounded-xl border-2 border-primary bg-card px-8 py-4 text-base font-semibold text-primary shadow-sm transition-all hover:bg-accent active:translate-y-px"
              >
                <UserPlus className="h-5 w-5" />
                Regístrate
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              El registro es para técnicos municipales. Un administrador aprueba cada cuenta
              antes del primer ingreso.
            </p>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- Métricas */}
      <section className="border-b border-border bg-secondary/50">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-px overflow-hidden px-4 py-10 sm:px-6 lg:grid-cols-4">
          {[
            { valor: "9", etiqueta: "Componentes de evaluación" },
            { valor: "275", etiqueta: "Preguntas guiadas" },
            { valor: "219", etiqueta: "Cantones del país" },
            { valor: "IDM", etiqueta: "Índice replicado del modelo oficial" },
          ].map((m) => (
            <div key={m.etiqueta} className="px-2 text-center">
              <div className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                {m.valor}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{m.etiqueta}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- ¿Qué es? */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-12 max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            ¿Qué es esta plataforma?
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Un instrumento de autoevaluación en línea que reemplaza el llenado manual en Excel.
            El municipio responde un cuestionario estructurado y el sistema calcula
            automáticamente su nivel de madurez en gestión del riesgo.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icono: ClipboardList,
              titulo: "Cuestionario guiado",
              texto:
                "275 preguntas organizadas en 9 componentes y 55 variables. Se responde por pasos, con el avance guardado y el índice actualizándose en vivo.",
            },
            {
              icono: Calculator,
              titulo: "Cálculo automático del IDM",
              texto:
                "El índice IDM-GIRD se calcula replicando fielmente la fórmula del modelo oficial. Sin hojas de cálculo, sin errores manuales.",
            },
            {
              icono: BarChart3,
              titulo: "Panel de resultados",
              texto:
                "Estadísticas por componente, provincia y amenaza, con mapas de calor, prioridades y exportación a Excel para informes.",
            },
          ].map((f) => (
            <div key={f.titulo} className="card p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-primary">
                <f.icono className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{f.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ ¿Cómo funciona? */}
      <section className="border-y border-border bg-secondary/50">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            ¿Cómo funciona?
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              {
                paso: "1",
                titulo: "Regístrate y espera aprobación",
                texto:
                  "El técnico municipal crea su cuenta asociada a su cantón. Un administrador la valida antes del primer acceso.",
              },
              {
                paso: "2",
                titulo: "Completa la autoevaluación",
                texto:
                  "Responde el cuestionario por componentes. Puedes guardar y retomar; el índice preliminar se muestra mientras avanzas.",
              },
              {
                paso: "3",
                titulo: "Consulta y exporta resultados",
                texto:
                  "Revisa tu índice IDM-GIRD, compáralo en el panel nacional y exporta el informe cuando lo necesites.",
              },
            ].map((s) => (
              <div key={s.paso} className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground">
                  {s.paso}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{s.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- ¿Para quién? */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
              ¿Para quién es?
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Pensada para los distintos actores del Sistema Nacional Descentralizado de Gestión
              de Riesgos.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Técnicos municipales que realizan la autoevaluación de su GADM.",
                "Consultores que acompañan procesos de fortalecimiento institucional.",
                "Investigadores que analizan resultados a escala provincial y nacional.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm leading-relaxed text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tarjeta CTA final */}
          <div className="card flex flex-col items-start gap-5 bg-brand-navy p-8 text-brand-navy-foreground">
            <Building2 className="h-9 w-9 text-white/90" />
            <div>
              <h3 className="text-xl font-semibold">¿Listo para evaluar tu municipio?</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                Ingresa si ya tienes cuenta, o regístrate para solicitar acceso.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <LogIn className="h-5 w-5" />
                Iniciar sesión
              </Link>
              <Link
                href="/registro"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-white/25 bg-transparent px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10"
              >
                <UserPlus className="h-5 w-5" />
                Regístrate
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- Footer */}
      <footer className="mt-auto border-t border-border bg-brand-navy text-brand-navy-foreground">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-6 px-4 py-8 sm:flex-row sm:items-center sm:px-6">
          <div className="flex items-center gap-4">
            <Logo className="h-9 w-9" />
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
