import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { obtenerSesion } from "@/lib/auth";
import { logout } from "@/lib/actions/auth";
import { PuceLogo } from "@/components/puce-brand";
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
      {/* Navbar */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/80 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-4 sm:gap-5">
            <Link href="/dashboard" className="transition-opacity hover:opacity-80">
              <PuceLogo height={26} plate={false} />
            </Link>
            <span className="hidden h-6 w-px bg-border sm:block" />
            <MainNav items={items} />
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <UserMenu nombre={sesion.nombre} rolLabel={ROL_LABEL[sesion.rol]} />
            <form action={logout}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg border border-input px-3 py-1.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent hover:text-foreground hover:shadow-sm"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </form>
          </div>
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
