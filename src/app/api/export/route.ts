import ExcelJS from "exceljs";
import { obtenerSesion } from "@/lib/auth";
import { getPanelData, type PanelFiltro } from "@/lib/panel";

export async function GET(req: Request) {
  const sesion = await obtenerSesion();
  if (!sesion) return new Response("No autorizado", { status: 401 });

  const sp = new URL(req.url).searchParams;
  const filtro: PanelFiltro = {
    periodo: sp.get("periodo") ? parseInt(sp.get("periodo")!, 10) || undefined : undefined,
    provincia: sp.get("provincia") || undefined,
    tipo: sp.get("tipo") || undefined,
  };

  const restringido =
    sesion.rol === "TECNICO_MUNICIPAL" ? sesion.cantonId ?? "__none__" : undefined;
  const data = await getPanelData(restringido, filtro);
  const a = data.analitica;

  const wb = new ExcelJS.Workbook();
  wb.creator = "Gestión de Riesgos";
  wb.created = new Date();

  const encabezar = (ws: ExcelJS.Worksheet) => {
    ws.getRow(1).font = { bold: true };
    ws.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0B2E4F" },
    };
    ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  };

  // Hoja: Ranking
  const ws = wb.addWorksheet("Ranking");
  ws.columns = [
    { header: "#", key: "pos", width: 6 },
    { header: "Cantón", key: "canton", width: 24 },
    { header: "Provincia", key: "provincia", width: 20 },
    { header: "Tipo", key: "tipo", width: 16 },
    { header: "Periodo", key: "periodo", width: 10 },
    { header: "Estado", key: "estado", width: 12 },
    { header: "IDM-GIRD", key: "idm", width: 12 },
    { header: "IDM ajustado", key: "ajustado", width: 14 },
    { header: "CTI", key: "cti", width: 10 },
  ];
  data.filas.forEach((f, i) => {
    ws.addRow({
      pos: i + 1,
      canton: f.canton,
      provincia: f.provincia,
      tipo: f.tipo ?? "",
      periodo: f.periodo,
      estado: f.estado,
      idm: Number(f.idm.toFixed(4)),
      ajustado: Number(f.ajustado.toFixed(4)),
      cti: Number(f.cti.toFixed(4)),
    });
  });
  encabezar(ws);

  // Hoja: Distribución por componente
  const wd = wb.addWorksheet("Por componente");
  wd.columns = [
    { header: "Código", key: "codigo", width: 10 },
    { header: "Componente", key: "nombre", width: 42 },
    { header: "Puntaje prom.", key: "puntaje", width: 14 },
    { header: "Prom. (1-3)", key: "promedio", width: 12 },
    { header: "Bajo", key: "bajo", width: 8 },
    { header: "Medio", key: "medio", width: 8 },
    { header: "Alto", key: "alto", width: 8 },
    { header: "% Bajo", key: "pctBajo", width: 8 },
  ];
  a.porComponenteDist.forEach((c) => {
    const puntaje = data.porComponente.find((p) => p.codigo === c.codigo)?.promedio ?? 0;
    wd.addRow({
      codigo: c.codigo,
      nombre: c.nombre,
      puntaje: Number(puntaje.toFixed(4)),
      promedio: Number(c.promedio.toFixed(2)),
      bajo: c.bajo,
      medio: c.medio,
      alto: c.alto,
      pctBajo: c.total ? Math.round((c.bajo / c.total) * 100) : 0,
    });
  });
  encabezar(wd);

  // Hoja: Variables prioritarias
  const wv = wb.addWorksheet("Variables prioritarias");
  wv.columns = [
    { header: "Código", key: "codigo", width: 10 },
    { header: "Variable", key: "nombre", width: 46 },
    { header: "Componente", key: "componente", width: 34 },
    { header: "Promedio (1-3)", key: "promedio", width: 14 },
    { header: "Respuestas", key: "n", width: 12 },
  ];
  a.variablesDebiles.forEach((v) =>
    wv.addRow({ codigo: v.codigo, nombre: v.nombre, componente: v.componente, promedio: v.promedio, n: v.n })
  );
  encabezar(wv);

  // Hoja: Brechas y fortalezas comunes
  const wp = wb.addWorksheet("Brechas y fortalezas");
  wp.columns = [
    { header: "Tipo", key: "tipo", width: 12 },
    { header: "Código", key: "codigo", width: 10 },
    { header: "Pregunta", key: "texto", width: 70 },
    { header: "Componente", key: "componente", width: 30 },
    { header: "%", key: "pct", width: 8 },
  ];
  a.preguntasBajo.forEach((p) =>
    wp.addRow({ tipo: "Brecha", codigo: p.codigo, texto: p.texto, componente: p.componente, pct: p.pct })
  );
  a.preguntasAlto.forEach((p) =>
    wp.addRow({ tipo: "Fortaleza", codigo: p.codigo, texto: p.texto, componente: p.componente, pct: p.pct })
  );
  encabezar(wp);

  // Hoja: Amenazas
  if (a.amenazas.length) {
    const wa = wb.addWorksheet("Amenazas");
    wa.columns = [
      { header: "Amenaza", key: "nombre", width: 34 },
      { header: "Categoría", key: "categoria", width: 20 },
      { header: "Cantones", key: "veces", width: 12 },
      { header: "Riesgo prom.", key: "riesgo", width: 14 },
    ];
    a.amenazas.forEach((am) =>
      wa.addRow({ nombre: am.nombre, categoria: am.categoria, veces: am.veces, riesgo: am.riesgo })
    );
    encabezar(wa);
  }

  const buffer = await wb.xlsx.writeBuffer();
  const fecha = new Date().toISOString().slice(0, 10);
  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="analisis-gird-${fecha}.xlsx"`,
    },
  });
}
