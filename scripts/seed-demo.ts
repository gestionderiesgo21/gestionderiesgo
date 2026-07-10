/**
 * Datos de DEMO para ver el panel de análisis con contenido.
 * Crea evaluaciones con respuestas aleatorias (ponderadas por componente) y algunas
 * amenazas, para varios cantones. Solo para desarrollo — puedes borrarlo con:
 *   DELETE FROM "Evaluacion" WHERE periodo = 2025;  (o vía Prisma Studio)
 *
 * Uso: npx tsx scripts/seed-demo.ts [cantidadCantones]
 */
import { PrismaClient } from "@prisma/client";
import { calcularIndice } from "../src/lib/calculo";

const prisma = new PrismaClient();

// Sesgo por componente para que unos se vean más débiles que otros (realismo).
const sesgo: Record<string, number> = {};
const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];

function respuestaPonderada(compCodigo: string): number {
  const base = sesgo[compCodigo] ?? 0.5; // 0=débil, 1=fuerte
  const r = Math.random();
  // mezcla base con azar
  const s = base * 0.6 + r * 0.4;
  if (s < 0.4) return 1;
  if (s < 0.72) return 2;
  return 3;
}

async function main() {
  const n = parseInt(process.argv[2] || "12", 10);

  const [comps, cantones, eventos, admin] = await Promise.all([
    prisma.componente.findMany({
      orderBy: { orden: "asc" },
      include: { variables: { include: { preguntas: true } } },
    }),
    prisma.canton.findMany({ take: n * 3 }),
    prisma.evento.findMany({ take: 40 }),
    prisma.user.findFirst({ where: { rol: "ADMIN" } }),
  ]);
  if (!admin) throw new Error("No hay usuario ADMIN. Corre primero db:seed.");

  for (const c of comps) sesgo[c.codigo] = Math.random();

  const calcCat = comps.map((c) => ({
    codigo: c.codigo,
    peso: c.peso,
    variables: c.variables.map((v) => ({ codigo: v.codigo, preguntas: v.preguntas.map((p) => p.codigo) })),
  }));

  // Elegir n cantones distintos al azar
  const elegidos = [...cantones].sort(() => Math.random() - 0.5).slice(0, n);
  let creadas = 0;

  for (const canton of elegidos) {
    // recalcular sesgo por cantón para variedad
    for (const c of comps) sesgo[c.codigo] = Math.random();

    const existe = await prisma.evaluacion.findUnique({
      where: { cantonId_periodo: { cantonId: canton.id, periodo: 2025 } },
    });
    if (existe) continue;

    const respuestas: Record<string, number> = {};
    const dataResp: { preguntaId: string; valor: number }[] = [];
    for (const c of comps) {
      for (const v of c.variables) {
        for (const p of v.preguntas) {
          const val = respuestaPonderada(c.codigo);
          respuestas[p.codigo] = val;
          dataResp.push({ preguntaId: p.id, valor: val });
        }
      }
    }

    // 1-4 amenazas al azar
    const nAmen = 1 + Math.floor(Math.random() * 4);
    const elegidosEv = [...eventos].sort(() => Math.random() - 0.5).slice(0, nAmen);
    const eventosInput = elegidosEv.map((e) => ({
      eventoId: e.id,
      cantidad: 1 + Math.floor(Math.random() * 5),
      amenaza: 1 + Math.floor(Math.random() * 10),
      vulnerabilidad: 1 + Math.floor(Math.random() * 10),
      exposicion: 1 + Math.floor(Math.random() * 10),
      mitigacion: 1 + Math.floor(Math.random() * 10),
    }));

    const res = calcularIndice({ componentes: calcCat, respuestas, eventos: eventosInput });
    const estado = Math.random() < 0.6 ? "ENVIADA" : "BORRADOR";

    await prisma.evaluacion.create({
      data: {
        cantonId: canton.id,
        periodo: 2025,
        estado: estado as "ENVIADA" | "BORRADOR",
        usuarioId: admin.id,
        idmGird: res.idmGird,
        cti: res.cti,
        idmGirdAjustado: res.idmGirdAjustado,
        respuestas: { create: dataResp },
        eventos: { create: eventosInput },
      },
    });
    creadas++;
  }

  console.log(`✅ Demo: ${creadas} evaluaciones creadas (periodo 2025).`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
