import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AuthShell } from "@/components/auth-shell";
import RegistroForm from "./registro-form";

export const dynamic = "force-dynamic";

export default async function RegistroPage() {
  const cantones = await prisma.canton.findMany({
    select: { id: true, nombre: true, provincia: { select: { nombre: true } } },
    orderBy: [{ provincia: { nombre: "asc" } }, { nombre: "asc" }],
  });
  const opciones = cantones.map((c) => ({
    id: c.id,
    label: `${c.nombre} (${c.provincia.nombre})`,
  }));

  return (
    <AuthShell
      title="Crear cuenta"
      subtitle="Registro para técnicos municipales de los GADM."
    >
      <RegistroForm cantones={opciones} />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Inicia sesión
        </Link>
      </p>
    </AuthShell>
  );
}
