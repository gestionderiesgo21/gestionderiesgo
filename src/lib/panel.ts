import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { calcularIndice } from "@/lib/calculo";
import { getCatalogo, catalogoParaCalculo } from "@/lib/data";

export type FilaPanel = {
  evaluacionId: string;
  cantonId: string;
  canton: string;
  provincia: string;
  tipo: string | null;
  periodo: number;
  estado: string;
  idm: number;
  ajustado: number;
  cti: number;
  puntajesComponente: Record<string, number>;
};

export type Distribucion = { bajo: number; medio: number; alto: number; total: number };
export type CompDist = {
  codigo: string;
  nombre: string;
  bajo: number;
  medio: number;
  alto: number;
  total: number;
  promedio: number; // 1..3
};
export type VariableStat = {
  codigo: string;
  nombre: string;
  componente: string;
  promedio: number; // 1..3
  n: number;
};
export type PreguntaDestacada = {
  codigo: string;
  texto: string;
  componente: string;
  pct: number; // 0..100
  n: number;
};
export type AmenazaFrec = { nombre: string; categoria: string; veces: number; riesgo: number };
export type HistBin = { rango: string; n: number };
export type PanelFiltro = { periodo?: number; provincia?: string; tipo?: string };
export type HeatCelda = { provincia: string; compCodigo: string; valor: number; n: number };
export type Heatmap = {
  provincias: string[];
  componentes: { codigo: string; nombre: string }[];
  celdas: HeatCelda[];
};
export type PanelOpciones = { periodos: number[]; provincias: string[]; tipos: string[] };

export type PanelData = {
  componentes: { codigo: string; nombre: string }[];
  filas: FilaPanel[];
  kpis: {
    totalEvaluaciones: number;
    cantonesEvaluados: number;
    promedioIdm: number;
    promedioAjustado: number;
  };
  porComponente: { codigo: string; nombre: string; promedio: number }[];
  porProvincia: { nombre: string; promedio: number; n: number }[];
  porTipo: { tipo: string; promedio: number; n: number }[];
  analitica: {
    distribucionGlobal: Distribucion;
    porComponenteDist: CompDist[];
    radar: { codigo: string; nombre: string; promedio: number }[];
    variablesDebiles: VariableStat[];
    variablesFuertes: VariableStat[];
    preguntasAlto: PreguntaDestacada[];
    preguntasBajo: PreguntaDestacada[];
    amenazas: AmenazaFrec[];
    histogramaIdm: HistBin[];
    heatmap: Heatmap;
    cobertura: {
      enviadas: number;
      borradores: number;
      completitudPromedio: number; // 0..100
      cantonesTotales: number;
      preguntasTotales: number;
    };
  };
  opciones: PanelOpciones;
  filtro: PanelFiltro;
};

const prom = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const banda = (v: number) => (v === 1 ? "bajo" : v === 2 ? "medio" : "alto");

/** Calcula datos agregados del panel. Si cantonId se indica, restringe a ese cantón. */
export async function getPanelData(
  cantonId?: string,
  filtro: PanelFiltro = {}
): Promise<PanelData> {
  const catalogo = await getCatalogo();
  const calcCat = catalogoParaCalculo(catalogo);

  // Metadatos por pregunta y por variable (para atribuir respuestas a componente/variable).
  type Meta = {
    texto: string;
    varCodigo: string;
    varNombre: string;
    compCodigo: string;
    compNombre: string;
  };
  const preguntaMeta = new Map<string, Meta>();
  let preguntasTotales = 0;
  for (const c of catalogo) {
    for (const v of c.variables) {
      for (const p of v.preguntas) {
        preguntasTotales++;
        preguntaMeta.set(p.codigo, {
          texto: p.texto,
          varCodigo: v.codigo,
          varNombre: v.nombre,
          compCodigo: c.codigo,
          compNombre: c.nombre,
        });
      }
    }
  }

  const baseWhere: Prisma.EvaluacionWhereInput = {
    ...(cantonId ? { cantonId } : {}),
    idmGird: { not: null },
  };

  const cantonWhere: Prisma.CantonWhereInput = {};
  if (filtro.tipo) cantonWhere.tipo = filtro.tipo as Prisma.CantonWhereInput["tipo"];
  if (filtro.provincia) cantonWhere.provincia = { nombre: filtro.provincia };

  const where: Prisma.EvaluacionWhereInput = {
    ...baseWhere,
    ...(filtro.periodo ? { periodo: filtro.periodo } : {}),
    ...(Object.keys(cantonWhere).length ? { canton: cantonWhere } : {}),
  };

  const [evaluaciones, eventosCat, cantonesTotales, todas] = await Promise.all([
    prisma.evaluacion.findMany({
      where,
      include: {
        canton: { include: { provincia: true } },
        respuestas: { include: { pregunta: { select: { codigo: true } } } },
        eventos: true,
      },
      orderBy: { idmGird: "desc" },
    }),
    prisma.evento.findMany({ select: { id: true, nombre: true, categoria: true } }),
    prisma.canton.count(),
    // Universo (sin filtro) para poblar los selectores de forma estable.
    prisma.evaluacion.findMany({
      where: baseWhere,
      select: { periodo: true, canton: { select: { tipo: true, provincia: { select: { nombre: true } } } } },
    }),
  ]);

  const opciones: PanelOpciones = {
    periodos: [...new Set(todas.map((e) => e.periodo))].sort((a, b) => b - a),
    provincias: [...new Set(todas.map((e) => e.canton.provincia.nombre))].sort(),
    tipos: [
      ...new Set(
        todas
          .map((e) => e.canton.tipo)
          .filter((t): t is NonNullable<typeof t> => t != null)
          .map((t) => String(t))
      ),
    ].sort(),
  };

  const filas: FilaPanel[] = evaluaciones.map((ev) => {
    const mapaResp: Record<string, number> = {};
    for (const r of ev.respuestas) mapaResp[r.pregunta.codigo] = r.valor;
    const res = calcularIndice({ componentes: calcCat, respuestas: mapaResp, eventos: ev.eventos });
    return {
      evaluacionId: ev.id,
      cantonId: ev.cantonId,
      canton: ev.canton.nombre,
      provincia: ev.canton.provincia.nombre,
      tipo: ev.canton.tipo,
      periodo: ev.periodo,
      estado: ev.estado,
      idm: res.idmGird,
      ajustado: res.idmGirdAjustado,
      cti: res.cti,
      puntajesComponente: res.puntajesComponente,
    };
  });

  const componentes = catalogo.map((c) => ({ codigo: c.codigo, nombre: c.nombre }));

  const porComponente = componentes.map((c) => ({
    ...c,
    promedio: prom(filas.map((f) => f.puntajesComponente[c.codigo] ?? 0)),
  }));

  const grupo = <T extends string>(key: (f: FilaPanel) => T | null) => {
    const m = new Map<string, number[]>();
    for (const f of filas) {
      const k = key(f);
      if (!k) continue;
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(f.idm);
    }
    return [...m.entries()].map(([nombre, xs]) => ({ nombre, promedio: prom(xs), n: xs.length }));
  };

  const porProvincia = grupo((f) => f.provincia).sort((a, b) => b.promedio - a.promedio);
  const porTipo = grupo((f) => f.tipo).map((g) => ({ tipo: g.nombre, promedio: g.promedio, n: g.n }));

  // ---------- Analítica profunda ----------
  const cont = () => ({ bajo: 0, medio: 0, alto: 0, total: 0, suma: 0 });
  const global = cont();
  const porComp = new Map<string, ReturnType<typeof cont>>();
  const porVar = new Map<string, ReturnType<typeof cont> & { nombre: string; comp: string }>();
  const porPreg = new Map<
    string,
    ReturnType<typeof cont> & { texto: string; comp: string }
  >();
  const heatAcc = new Map<string, { suma: number; total: number }>();

  for (const ev of evaluaciones) {
    for (const r of ev.respuestas) {
      const meta = preguntaMeta.get(r.pregunta.codigo);
      if (!meta) continue;
      const b = banda(r.valor) as "bajo" | "medio" | "alto";

      global[b]++; global.total++; global.suma += r.valor;

      if (!porComp.has(meta.compCodigo)) porComp.set(meta.compCodigo, cont());
      const c = porComp.get(meta.compCodigo)!;
      c[b]++; c.total++; c.suma += r.valor;

      if (!porVar.has(meta.varCodigo))
        porVar.set(meta.varCodigo, { ...cont(), nombre: meta.varNombre, comp: meta.compNombre });
      const v = porVar.get(meta.varCodigo)!;
      v[b]++; v.total++; v.suma += r.valor;

      if (!porPreg.has(r.pregunta.codigo))
        porPreg.set(r.pregunta.codigo, { ...cont(), texto: meta.texto, comp: meta.compNombre });
      const p = porPreg.get(r.pregunta.codigo)!;
      p[b]++; p.total++; p.suma += r.valor;

      const hk = ev.canton.provincia.nombre + "||" + meta.compCodigo;
      if (!heatAcc.has(hk)) heatAcc.set(hk, { suma: 0, total: 0 });
      const h = heatAcc.get(hk)!;
      h.suma += r.valor; h.total++;
    }
  }

  const heatmap: Heatmap = {
    provincias: [...new Set(evaluaciones.map((e) => e.canton.provincia.nombre))].sort(),
    componentes,
    celdas: [...heatAcc.entries()].map(([k, v]) => {
      const [provincia, compCodigo] = k.split("||");
      return { provincia, compCodigo, valor: Number((v.suma / v.total).toFixed(2)), n: v.total };
    }),
  };

  const distribucionGlobal: Distribucion = {
    bajo: global.bajo,
    medio: global.medio,
    alto: global.alto,
    total: global.total,
  };

  const porComponenteDist: CompDist[] = componentes.map((c) => {
    const d = porComp.get(c.codigo) ?? cont();
    return {
      codigo: c.codigo,
      nombre: c.nombre,
      bajo: d.bajo,
      medio: d.medio,
      alto: d.alto,
      total: d.total,
      promedio: d.total ? d.suma / d.total : 0,
    };
  });

  const radar = porComponenteDist.map((c) => ({
    codigo: c.codigo,
    nombre: c.nombre,
    promedio: Number(c.promedio.toFixed(2)),
  }));

  const variablesStats: VariableStat[] = [...porVar.entries()]
    .filter(([, v]) => v.total > 0)
    .map(([codigo, v]) => ({
      codigo,
      nombre: v.nombre,
      componente: v.comp,
      promedio: Number((v.suma / v.total).toFixed(2)),
      n: v.total,
    }));
  const variablesDebiles = [...variablesStats].sort((a, b) => a.promedio - b.promedio).slice(0, 10);
  const variablesFuertes = [...variablesStats].sort((a, b) => b.promedio - a.promedio).slice(0, 10);

  const preguntas = [...porPreg.entries()]
    .filter(([, p]) => p.total > 0)
    .map(([codigo, p]) => ({ codigo, ...p }));
  const preguntasAlto: PreguntaDestacada[] = [...preguntas]
    .sort((a, b) => b.alto / b.total - a.alto / a.total || b.total - a.total)
    .slice(0, 8)
    .map((p) => ({
      codigo: p.codigo,
      texto: p.texto,
      componente: p.comp,
      pct: Math.round((p.alto / p.total) * 100),
      n: p.total,
    }));
  const preguntasBajo: PreguntaDestacada[] = [...preguntas]
    .sort((a, b) => b.bajo / b.total - a.bajo / a.total || b.total - a.total)
    .slice(0, 8)
    .map((p) => ({
      codigo: p.codigo,
      texto: p.texto,
      componente: p.comp,
      pct: Math.round((p.bajo / p.total) * 100),
      n: p.total,
    }));

  // Amenazas más frecuentes
  const nombreEvento = new Map(eventosCat.map((e) => [e.id, e]));
  const amenAcc = new Map<string, { veces: number; riesgos: number[] }>();
  for (const ev of evaluaciones) {
    for (const e of ev.eventos) {
      const mitig = e.mitigacion && e.mitigacion !== 0 ? e.mitigacion : 1;
      const riesgo = (e.amenaza * e.vulnerabilidad * e.exposicion) / mitig / 1000;
      if (!amenAcc.has(e.eventoId)) amenAcc.set(e.eventoId, { veces: 0, riesgos: [] });
      const a = amenAcc.get(e.eventoId)!;
      a.veces++; a.riesgos.push(riesgo);
    }
  }
  const amenazas: AmenazaFrec[] = [...amenAcc.entries()]
    .map(([id, a]) => {
      const ev = nombreEvento.get(id);
      return {
        nombre: ev?.nombre ?? id,
        categoria: ev?.categoria ?? "",
        veces: a.veces,
        riesgo: Number(prom(a.riesgos).toFixed(3)),
      };
    })
    .sort((a, b) => b.veces - a.veces)
    .slice(0, 8);

  // Histograma del IDM-GIRD (6 bins entre min y max)
  const idms = filas.map((f) => f.idm);
  const histogramaIdm: HistBin[] = [];
  if (idms.length) {
    const min = Math.min(...idms);
    const max = Math.max(...idms);
    const bins = 6;
    const ancho = (max - min) / bins || 1;
    const counts = new Array(bins).fill(0);
    for (const x of idms) {
      let i = ancho ? Math.floor((x - min) / ancho) : 0;
      if (i >= bins) i = bins - 1;
      if (i < 0) i = 0;
      counts[i]++;
    }
    for (let i = 0; i < bins; i++) {
      const a = min + i * ancho;
      const b = a + ancho;
      histogramaIdm.push({ rango: `${a.toFixed(2)}–${b.toFixed(2)}`, n: counts[i] });
    }
  }

  // Cobertura
  const enviadas = filas.filter((f) => f.estado === "ENVIADA").length;
  const completitudes = evaluaciones.map((ev) =>
    preguntasTotales ? (ev.respuestas.length / preguntasTotales) * 100 : 0
  );

  return {
    componentes,
    filas,
    kpis: {
      totalEvaluaciones: filas.length,
      cantonesEvaluados: new Set(filas.map((f) => f.cantonId)).size,
      promedioIdm: prom(filas.map((f) => f.idm)),
      promedioAjustado: prom(filas.map((f) => f.ajustado)),
    },
    porComponente,
    porProvincia,
    porTipo,
    analitica: {
      distribucionGlobal,
      porComponenteDist,
      radar,
      variablesDebiles,
      variablesFuertes,
      preguntasAlto,
      preguntasBajo,
      amenazas,
      histogramaIdm,
      heatmap,
      cobertura: {
        enviadas,
        borradores: filas.length - enviadas,
        completitudPromedio: Number(prom(completitudes).toFixed(1)),
        cantonesTotales,
        preguntasTotales,
      },
    },
    opciones,
    filtro,
  };
}
