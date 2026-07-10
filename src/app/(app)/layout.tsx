import Link from "next/link";
import { redirect } from "next/navigation";
import { obtenerSesion } from "@/lib/auth";
import { Wordmark } from "@/components/brand";
import { GobEcuador } from "@/components/gob-brand";
import { MainNav } from "@/components/main-nav";
import { UserMenu } from "@/components/user-menu";

const ROL_LABEL: Record<string, string> = {
  TECNICO_MUNICIPAL: "Técnico municipal",
  CONSULTOR: "Consultor",
  INVESTIGADOR: "Investigador",
  ADMIN: "Administrador",
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const sesion = await obtenerSesion();
  if (!sesion) redirect("/login");

  const puedeLlenar = sesion.rol !== "INVESTIGADOR";
  const esAdmin = sesion.rol === "ADMIN";

  const items = [
    ...(puedeLlenar ? [{ href: "/dashboard", label: "Mis evaluaciones" }] : []),
    { href: "/panel", label: "Panel de análisis" },
    ...(esAdmin ? [{ href: "/admin/usuarios", label: "Usuarios" }] : []),
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Franja de gobierno */}
      <div className="bg-brand-navy text-brand-navy-foreground">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2">
          <GobEcuador />
          <span className="hidden text-xs text-white/60 sm:block">
            República del Ecuador
          </span>
        </div>
      </div>

      {/* Cabecera principal */}
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-8">
            <Link href="/dashboard">
              <Wordmark subtitle={false} />
            </Link>
            <MainNav items={items} />
          </div>
          <UserMenu nombre={sesion.nombre} rolLabel={ROL_LABEL[sesion.rol]} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>

      <footer className="border-t bg-card">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted-foreground">
          Plataforma de Gestión Integral del Riesgo de Desastres (GIRD) · Gobiernos Autónomos
          Descentralizados Municipales del Ecuador
        </div>
      </footer>
    </div>
  );
}
