import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, FilePlus2, FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/auth";
import { crearEvaluacion } from "@/lib/actions/evaluacion";
import type { Prisma } from "@prisma/client";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function DashboardPage() {
  const sesion = await obtenerSesion();
  if (!sesion) redirect("/login");
  if (sesion.rol === "INVESTIGADOR") redirect("/panel");

  let where: Prisma.EvaluacionWhereInput = {};
  if (sesion.rol === "TECNICO_MUNICIPAL") {
    where = sesion.cantonId
      ? { OR: [{ cantonId: sesion.cantonId }, { usuarioId: sesion.userId }] }
      : { usuarioId: sesion.userId };
  } else if (sesion.rol === "CONSULTOR") {
    where = { usuarioId: sesion.userId };
  }

  const evaluaciones = await prisma.evaluacion.findMany({
    where,
    include: { canton: { include: { provincia: true } } },
    orderBy: [{ periodo: "desc" }, { updatedAt: "desc" }],
  });

  const cantonFijo =
    sesion.rol === "TECNICO_MUNICIPAL" && sesion.cantonId
      ? await prisma.canton.findUnique({
          where: { id: sesion.cantonId },
          include: { provincia: true },
        })
      : null;
  const cantones =
    sesion.rol !== "TECNICO_MUNICIPAL"
      ? await prisma.canton.findMany({
          select: { id: true, nombre: true, provincia: { select: { nombre: true } } },
          orderBy: [{ provincia: { nombre: "asc" } }, { nombre: "asc" }],
        })
      : [];

  const anioActual = new Date().getFullYear();
  const enviadas = evaluaciones.filter((e) => e.estado === "ENVIADA").length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mis evaluaciones</h1>
          <p className="text-sm text-muted-foreground">
            Autoevaluación de Gestión Integral del Riesgo de Desastres (GIRD)
          </p>
        </div>
        <div className="flex gap-6">
          <div>
            <div className="text-2xl font-semibold">{evaluaciones.length}</div>
            <div className="text-xs text-muted-foreground">Totales</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-primary">{enviadas}</div>
            <div className="text-xs text-muted-foreground">Enviadas</div>
          </div>
        </div>
      </div>

      {/* Nueva autoevaluación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FilePlus2 className="h-4 w-4 text-primary" />
            Nueva autoevaluación
          </CardTitle>
          <CardDescription>
            Selecciona el periodo para iniciar una evaluación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={crearEvaluacion} className="flex flex-wrap items-end gap-3">
            {cantonFijo ? (
              <div className="space-y-2">
                <Label>Cantón</Label>
                <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm">
                  {cantonFijo.nombre} · {cantonFijo.provincia.nombre}
                </div>
                <input type="hidden" name="cantonId" value={cantonFijo.id} />
              </div>
            ) : (
              <div className="min-w-64 space-y-2">
                <Label htmlFor="cantonId">Cantón</Label>
                <select
                  id="cantonId"
                  name="cantonId"
                  required
                  defaultValue=""
                  className="border-input focus-visible:border-primary focus-visible:ring-primary/20 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                >
                  <option value="" disabled>
                    — Selecciona —
                  </option>
                  {cantones.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} ({c.provincia.nombre})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="w-32 space-y-2">
              <Label htmlFor="periodo">Periodo (año)</Label>
              <Input
                id="periodo"
                name="periodo"
                type="number"
                defaultValue={anioActual}
                min={2020}
                max={2100}
                required
              />
            </div>
            <Button type="submit">
              Crear y responder <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Listado */}
      <Card className="overflow-hidden py-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Cantón</TableHead>
              <TableHead>Periodo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>IDM-GIRD</TableHead>
              <TableHead>Ajustado</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {evaluaciones.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <FileText className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">
                    Aún no tienes evaluaciones. Crea una arriba para empezar.
                  </p>
                </TableCell>
              </TableRow>
            )}
            {evaluaciones.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-medium">
                  {e.canton.nombre}
                  <span className="text-muted-foreground"> · {e.canton.provincia.nombre}</span>
                </TableCell>
                <TableCell>{e.periodo}</TableCell>
                <TableCell>
                  {e.estado === "ENVIADA" ? (
                    <Badge className="border-green-200 bg-green-100 text-green-800">Enviada</Badge>
                  ) : (
                    <Badge className="border-amber-200 bg-amber-100 text-amber-800">Borrador</Badge>
                  )}
                </TableCell>
                <TableCell className="tabular-nums">{e.idmGird?.toFixed(3) ?? "—"}</TableCell>
                <TableCell className="tabular-nums">{e.idmGirdAjustado?.toFixed(3) ?? "—"}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    render={<Link href={`/evaluacion/${e.id}`} />}
                  >
                    {e.estado === "ENVIADA" ? "Ver" : "Continuar"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
