/**
 * Test de aceptación del motor de cálculo.
 * Reconstruye el catálogo desde prisma/seed-data.json, carga las respuestas y
 * eventos del cantón Ambato (ejemplo del Excel) y verifica que el índice
 * calculado coincida con el Excel: IDM ≈ 0.22, ajustado ≈ 0.224142641509434.
 *
 * Ejecutar: npm run test:calculo
 */
import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { calcularIndice, type CatalogoComponente } from "../src/lib/calculo";

type SeedData = {
  componentes: { codigo: string; peso: number }[];
  variables: { codigo: string; componenteCodigo: string; orden: number }[];
  preguntas: { codigo: string; variableCodigo: string; orden: number }[];
  ambato: {
    respuestas: Record<string, number>;
    eventos: {
      cantidad: number;
      amenaza: number;
      vulnerabilidad: number;
      exposicion: number;
      mitigacion: number;
    }[];
    idmEsperado: number;
    ctiEsperado: number;
    idmAjustadoEsperado: number;
  };
};

const data: SeedData = JSON.parse(
  readFileSync(join(process.cwd(), "prisma", "seed-data.json"), "utf-8")
);

// Reconstruir el catálogo anidado componentes -> variables -> preguntas
const catalogo: CatalogoComponente[] = data.componentes.map((c) => ({
  codigo: c.codigo,
  peso: c.peso,
  variables: data.variables
    .filter((v) => v.componenteCodigo === c.codigo)
    .sort((a, b) => a.orden - b.orden)
    .map((v) => ({
      codigo: v.codigo,
      preguntas: data.preguntas
        .filter((p) => p.variableCodigo === v.codigo)
        .sort((a, b) => a.orden - b.orden)
        .map((p) => p.codigo),
    })),
}));

const res = calcularIndice({
  componentes: catalogo,
  respuestas: data.ambato.respuestas,
  eventos: data.ambato.eventos,
});

console.log("Resultado Ambato:");
console.log("  preguntas respondidas:", res.preguntasRespondidas, "/", res.totalPreguntas);
console.log("  IDM-GIRD           :", res.idmGird, " (esperado", data.ambato.idmEsperado + ")");
console.log("  CTI                :", res.cti, " (esperado", data.ambato.ctiEsperado + ")");
console.log("  IDM-GIRD ajustado  :", res.idmGirdAjustado, " (esperado", data.ambato.idmAjustadoEsperado + ")");

const casi = (a: number, b: number, tol = 1e-9) => Math.abs(a - b) < tol;

assert.strictEqual(res.totalPreguntas, 275, "deben ser 275 preguntas");
assert.strictEqual(res.preguntasRespondidas, 275, "Ambato debe tener las 275 respondidas");
assert.ok(casi(res.idmGird, data.ambato.idmEsperado), "IDM-GIRD no coincide con el Excel");
assert.ok(casi(res.cti, data.ambato.ctiEsperado), "CTI no coincide con el Excel");
assert.ok(
  casi(res.idmGirdAjustado, data.ambato.idmAjustadoEsperado),
  "IDM-GIRD ajustado no coincide con el Excel"
);

console.log("\n✅ TEST OK — el motor de cálculo replica el Excel exactamente.");
