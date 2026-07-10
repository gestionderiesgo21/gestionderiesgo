import { UserCheck, UserCog, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { actualizarUsuario, aprobarUsuario } from "@/lib/actions/admin";
import CrearUsuarioForm from "./crear-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ROLES = [
  { v: "TECNICO_MUNICIPAL", l: "Técnico municipal" },
  { v: "CONSULTOR", l: "Consultor" },
  { v: "INVESTIGADOR", l: "Investigador" },
  { v: "ADMIN", l: "Administrador" },
];

const selectCls =
  "border-input focus-visible:border-primary focus-visible:ring-primary/20 h-9 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px]";

export default async function AdminUsuariosPage() {
  const [usuarios, cantones] = await Promise.all([
    prisma.user.findMany({
      include: { canton: { include: { provincia: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.canton.findMany({
      select: { id: true, nombre: true, provincia: { select: { nombre: true } } },
      orderBy: [{ provincia: { nombre: "asc" } }, { nombre: "asc" }],
    }),
  ]);

  const cantonOpts = cantones.map((c) => ({ id: c.id, label: `${c.nombre} (${c.provincia.nombre})` }));
  const pendientes = usuarios.filter((u) => !u.activo);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Gestión de usuarios</h1>
        <p className="text-sm text-muted-foreground">
          Aprobación de cuentas, alta de usuarios y asignación de rol y cantón.
        </p>
      </div>

      {/* Pendientes de aprobación */}
      {pendientes.length > 0 && (
        <Card className="border-amber-300 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-amber-900">
              <Clock className="h-4 w-4 text-amber-600" />
              Cuentas pendientes de aprobación
              <Badge className="border-amber-300 bg-amber-100 text-amber-800">
                {pendientes.length}
              </Badge>
            </CardTitle>
            <CardDescription className="text-amber-800/80">
              Estos usuarios se registraron y esperan aprobación para poder ingresar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendientes.map((u) => (
              <div
                key={u.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{u.nombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {u.email}
                    {u.canton && ` · ${u.canton.nombre} (${u.canton.provincia.nombre})`}
                  </p>
                </div>
                <form action={aprobarUsuario}>
                  <input type="hidden" name="id" value={u.id} />
                  <Button type="submit" size="sm">
                    <UserCheck className="h-4 w-4" /> Aprobar
                  </Button>
                </form>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Nuevo usuario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserCog className="h-4 w-4 text-primary" />
            Nuevo usuario
          </CardTitle>
          <CardDescription>
            Los usuarios creados aquí quedan activos de inmediato.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CrearUsuarioForm cantones={cantonOpts} />
        </CardContent>
      </Card>

      {/* Todos los usuarios */}
      <Card className="overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Usuario</TableHead>
              <TableHead>Rol / Cantón / Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="align-top">
                  <p className="font-medium">{u.nombre}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </TableCell>
                <TableCell>
                  <form action={actualizarUsuario} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="id" value={u.id} />
                    <select
                      name="rol"
                      defaultValue={u.rol}
                      aria-label={`Rol de ${u.nombre}`}
                      className={`${selectCls} w-44`}
                    >
                      {ROLES.map((r) => (
                        <option key={r.v} value={r.v}>
                          {r.l}
                        </option>
                      ))}
                    </select>
                    <select
                      name="cantonId"
                      defaultValue={u.cantonId ?? ""}
                      aria-label={`Cantón de ${u.nombre}`}
                      className={`${selectCls} w-60`}
                    >
                      <option value="">— Sin cantón —</option>
                      {cantonOpts.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <input type="checkbox" name="activo" defaultChecked={u.activo} /> Activo
                    </label>
                    <Button type="submit" variant="secondary" size="sm">
                      Guardar
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
