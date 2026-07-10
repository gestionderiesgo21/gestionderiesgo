import { prisma } from "@/lib/prisma";
import type { CatalogoComponente } from "@/lib/calculo";

/** Catálogo completo (componentes -> variables -> preguntas) para renderizar formularios. */
export async function getCatalogo() {
  return prisma.componente.findMany({
    orderBy: { orden: "asc" },
    include: {
      variables: {
        orderBy: { orden: "asc" },
        include: {
          preguntas: { orderBy: { orden: "asc" } },
        },
      },
    },
  });
}

export type CatalogoCompleto = Awaited<ReturnType<typeof getCatalogo>>;

/** Convierte el catálogo al formato que espera el motor de cálculo. */
export function catalogoParaCalculo(catalogo: CatalogoCompleto): CatalogoComponente[] {
  return catalogo.map((c) => ({
    codigo: c.codigo,
    peso: c.peso,
    variables: c.variables.map((v) => ({
      codigo: v.codigo,
      preguntas: v.preguntas.map((p) => p.codigo),
    })),
  }));
}
