/**
 * Motor de cálculo del índice IDM-GIRD.
 *
 * Replica exactamente la fórmula del Excel "INDICE GRIDS.xlsx":
 *   - puntaje_variable   = promedio de las respuestas (1-3) de sus preguntas
 *   - puntaje_componente = (promedio de los puntajes de sus variables) / 10
 *   - IDM_GIRD           = Π (puntaje_componente ^ peso_componente)   [media geométrica ponderada]
 *   - CTI (amenazas)     = 0.8 + 0.4 * Σ(riesgo_evento * peso_evento)
 *         riesgo_evento  = (amenaza * vulnerabilidad * exposicion / mitigacion) / 1000
 *         peso_evento    = cantidad / Σ cantidades
 *   - IDM_GIRD_ajustado  = round(IDM_GIRD, 3) * CTI
 *
 * Función pura: no depende de la base de datos. Ver test en scripts/test-calculo.ts
 */

export type CatalogoVariable = {
  codigo: string;
  preguntas: string[]; // códigos de pregunta (P1.1, ...)
};

export type CatalogoComponente = {
  codigo: string;
  peso: number;
  variables: CatalogoVariable[];
};

export type EventoInput = {
  cantidad: number;
  amenaza: number;
  vulnerabilidad: number;
  exposicion: number;
  mitigacion: number;
};

export type CalculoInput = {
  componentes: CatalogoComponente[];
  respuestas: Record<string, number>; // preguntaCodigo -> valor (1..3)
  eventos: EventoInput[];
};

export type CalculoResultado = {
  puntajesVariable: Record<string, number>;
  puntajesComponente: Record<string, number>;
  idmGird: number;
  cti: number;
  idmGirdAjustado: number;
  totalPreguntas: number;
  preguntasRespondidas: number;
  completo: boolean;
};

function redondear(x: number, decimales: number): number {
  const f = Math.pow(10, decimales);
  return Math.round((x + Number.EPSILON) * f) / f;
}

/** Calcula el coeficiente CTI a partir de los eventos/amenazas del cantón. */
export function calcularCti(eventos: EventoInput[]): number {
  const totalCantidad = eventos.reduce((s, e) => s + (e.cantidad || 0), 0);
  if (totalCantidad <= 0) return 0.8; // sin eventos registrados
  let suma = 0;
  for (const e of eventos) {
    const mitig = e.mitigacion && e.mitigacion !== 0 ? e.mitigacion : 1;
    const riesgo = (e.amenaza * e.vulnerabilidad * e.exposicion) / mitig / 1000;
    const pesoEvento = (e.cantidad || 0) / totalCantidad;
    suma += riesgo * pesoEvento;
  }
  return 0.8 + 0.4 * suma;
}

export function calcularIndice(input: CalculoInput): CalculoResultado {
  const { componentes, respuestas, eventos } = input;

  const puntajesVariable: Record<string, number> = {};
  const puntajesComponente: Record<string, number> = {};

  let totalPreguntas = 0;
  let preguntasRespondidas = 0;

  for (const comp of componentes) {
    let sumaVars = 0;
    for (const variable of comp.variables) {
      const valores: number[] = [];
      for (const pCod of variable.preguntas) {
        totalPreguntas++;
        const v = respuestas[pCod];
        if (typeof v === "number" && !Number.isNaN(v)) {
          valores.push(v);
          preguntasRespondidas++;
        }
      }
      // promedio de las preguntas respondidas (AVERAGE ignora vacías, como en Excel)
      const prom = valores.length > 0 ? valores.reduce((a, b) => a + b, 0) / valores.length : 0;
      puntajesVariable[variable.codigo] = prom;
      sumaVars += prom;
    }
    const numVars = comp.variables.length || 1;
    puntajesComponente[comp.codigo] = sumaVars / numVars / 10;
  }

  // IDM-GIRD = producto de (puntaje_componente ^ peso_componente)
  let producto = 1;
  for (const comp of componentes) {
    const base = puntajesComponente[comp.codigo];
    producto *= Math.pow(base, comp.peso);
  }
  const idmGird = redondear(producto, 3);

  const cti = calcularCti(eventos);
  const idmGirdAjustado = idmGird * cti;

  return {
    puntajesVariable,
    puntajesComponente,
    idmGird,
    cti,
    idmGirdAjustado,
    totalPreguntas,
    preguntasRespondidas,
    completo: preguntasRespondidas === totalPreguntas && totalPreguntas > 0,
  };
}
