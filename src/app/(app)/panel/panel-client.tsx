"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download, BarChart3, Search, TriangleAlert, TrendingDown, TrendingUp } from "lucide-react";
import type { PanelData } from "@/lib/panel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FilterBar } from "./filter-bar";
import { Heatmap } from "./heatmap";

// Colores semánticos de la escala (Bajo = brecha, Alto = capacidad)
const C = {
  bajo: "#e11d48",
  medio: "#f59e0b",
  alto: "#16a34a",
};
const axisTick = { fontSize: 12, fill: "var(--muted-foreground)" };
const tooltipStyle = {
  borderRadius: 8,
  border: "1px solid var(--border)",
  fontSize: 12,
  boxShadow: "0 6px 20px rgba(15,42,73,0.12)",
};

function Kpi({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`mt-1 text-2xl font-semibold tabular-nums ${accent ? "text-primary" : ""}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

export default function PanelClient({
  data,
  soloMiCanton,
}: {
  data: PanelData;
  soloMiCanton: boolean;
}) {
  const [q, setQ] = useState("");
  const a = data.analitica;
  const qs = new URLSearchParams();
  if (data.filtro.periodo) qs.set("periodo", String(data.filtro.periodo));
  if (data.filtro.provincia) qs.set("provincia", data.filtro.provincia);
  if (data.filtro.tipo) qs.set("tipo", data.filtro.tipo);
  const exportHref = `/api/export${qs.toString() ? `?${qs}` : ""}`;
  const hayFiltros =
    data.opciones.provincias.length > 0 ||
    data.opciones.periodos.length > 0 ||
    !!(data.filtro.periodo || data.filtro.provincia || data.filtro.tipo);
  const filas = data.filas.filter(
    (f) =>
      f.canton.toLowerCase().includes(q.toLowerCase()) ||
      f.provincia.toLowerCase().includes(q.toLowerCase())
  );

  // Datos derivados para gráficos
  const dg = a.distribucionGlobal;
  const pieData = [
    { name: "Bajo (1)", value: dg.bajo, fill: C.bajo },
    { name: "Medio (2)", value: dg.medio, fill: C.medio },
    { name: "Alto (3)", value: dg.alto, fill: C.alto },
  ];
  const stackData = a.porComponenteDist.map((c) => ({
    codigo: c.codigo,
    Bajo: c.total ? Math.round((c.bajo / c.total) * 100) : 0,
    Medio: c.total ? Math.round((c.medio / c.total) * 100) : 0,
    Alto: c.total ? Math.round((c.alto / c.total) * 100) : 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Panel de análisis</h1>
          <p className="text-sm text-muted-foreground">
            {soloMiCanton ? "Resultados de tu cantón" : "Estadísticas de las autoevaluaciones GIRD"}
          </p>
        </div>
        {!soloMiCanton && (
          <Button render={<Link href={exportHref} prefetch={false} />}>
            <Download className="h-4 w-4" /> Exportar a Excel
          </Button>
        )}
      </div>

      {hayFiltros && <FilterBar opciones={data.opciones} filtro={data.filtro} />}

      {data.filas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <BarChart3 className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              Aún no hay evaluaciones con resultados para analizar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Kpi label="Evaluaciones" value={String(data.kpis.totalEvaluaciones)} />
            <Kpi
              label="Cantones evaluados"
              value={`${data.kpis.cantonesEvaluados}/${a.cobertura.cantonesTotales}`}
            />
            <Kpi label="IDM-GIRD promedio" value={data.kpis.promedioIdm.toFixed(3)} accent />
            <Kpi label="Enviadas" value={`${a.cobertura.enviadas}/${data.kpis.totalEvaluaciones}`} />
            <Kpi label="Completitud" value={`${a.cobertura.completitudPromedio}%`} />
          </div>

          <Tabs defaultValue="resumen">
            <TabsList className="flex-wrap">
              <TabsTrigger value="resumen">Resumen</TabsTrigger>
              <TabsTrigger value="respuestas">Respuestas</TabsTrigger>
              <TabsTrigger value="prioridades">Prioridades</TabsTrigger>
              {!soloMiCanton && <TabsTrigger value="territorial">Territorial</TabsTrigger>}
              <TabsTrigger value="amenazas">Amenazas</TabsTrigger>
              <TabsTrigger value="ranking">Ranking</TabsTrigger>
            </TabsList>

            {/* ---------- RESUMEN ---------- */}
            <TabsContent value="resumen" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Perfil de madurez por componente</CardTitle>
                    <CardDescription>Promedio de respuestas (escala 1–3).</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={320}>
                      <RadarChart data={a.radar} outerRadius="70%">
                        <PolarGrid stroke="var(--border)" />
                        <PolarAngleAxis dataKey="codigo" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
                        <PolarRadiusAxis domain={[1, 3]} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                        <Radar
                          dataKey="promedio"
                          stroke="var(--chart-1)"
                          fill="var(--chart-1)"
                          fillOpacity={0.35}
                        />
                        <Tooltip
                          contentStyle={tooltipStyle}
                          formatter={(v) => [Number(v).toFixed(2), "Promedio"]}
                          labelFormatter={(l) => a.radar.find((r) => r.codigo === l)?.nombre ?? String(l)}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Puntaje promedio por componente</CardTitle>
                    <CardDescription>Puntaje del componente (0–1) en el índice.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={data.porComponente} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis dataKey="codigo" tick={axisTick} tickLine={false} axisLine={{ stroke: "var(--border)" }} />
                        <YAxis tick={axisTick} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={tooltipStyle}
                          cursor={{ fill: "var(--accent)" }}
                          formatter={(v) => [Number(v).toFixed(3), "Promedio"]}
                          labelFormatter={(l) => data.porComponente.find((c) => c.codigo === l)?.nombre ?? String(l)}
                        />
                        <Bar dataKey="promedio" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={48} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Distribución del IDM-GIRD</CardTitle>
                  <CardDescription>Cuántos cantones caen en cada rango del índice.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={a.histogramaIdm}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="rango" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={{ stroke: "var(--border)" }} />
                      <YAxis allowDecimals={false} tick={axisTick} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--accent)" }} formatter={(v) => [v, "Cantones"]} />
                      <Bar dataKey="n" fill="var(--chart-2)" radius={[4, 4, 0, 0]} maxBarSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ---------- RESPUESTAS ---------- */}
            <TabsContent value="respuestas" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Distribución global</CardTitle>
                    <CardDescription>{dg.total.toLocaleString()} respuestas registradas.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                          {pieData.map((d) => (
                            <Cell key={d.name} fill={d.fill} />
                          ))}
                        </Pie>
                        <Legend iconType="circle" />
                        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${Number(v)} (${dg.total ? Math.round((Number(v) / dg.total) * 100) : 0}%)`, "Respuestas"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Composición de respuestas por componente</CardTitle>
                    <CardDescription>
                      % Bajo / Medio / Alto. Más rojo = mayor brecha de capacidad.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={stackData} layout="vertical" margin={{ left: 8, right: 8 }} stackOffset="expand">
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                        <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${Math.round(v * 100)}%`} tick={axisTick} tickLine={false} axisLine={{ stroke: "var(--border)" }} />
                        <YAxis type="category" dataKey="codigo" width={40} tick={axisTick} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, ""]} />
                        <Legend iconType="circle" />
                        <Bar dataKey="Bajo" stackId="s" fill={C.bajo} />
                        <Bar dataKey="Medio" stackId="s" fill={C.medio} />
                        <Bar dataKey="Alto" stackId="s" fill={C.alto} radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      Fortalezas comunes
                    </CardTitle>
                    <CardDescription>Preguntas con mayor % de respuestas &ldquo;Alto&rdquo;.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {a.preguntasAlto.map((p) => (
                      <PreguntaRow key={p.codigo} p={p} tono="alto" />
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <TrendingDown className="h-4 w-4 text-rose-600" />
                      Brechas comunes
                    </CardTitle>
                    <CardDescription>Preguntas con mayor % de respuestas &ldquo;Bajo&rdquo;.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {a.preguntasBajo.map((p) => (
                      <PreguntaRow key={p.codigo} p={p} tono="bajo" />
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ---------- PRIORIDADES ---------- */}
            <TabsContent value="prioridades" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TriangleAlert className="h-4 w-4 text-rose-600" />
                    Variables más débiles
                  </CardTitle>
                  <CardDescription>
                    Menor promedio (1–3) = áreas prioritarias de intervención.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={Math.max(240, a.variablesDebiles.length * 34)}>
                    <BarChart data={a.variablesDebiles} layout="vertical" margin={{ left: 8, right: 24 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                      <XAxis type="number" domain={[1, 3]} tick={axisTick} tickLine={false} axisLine={{ stroke: "var(--border)" }} />
                      <YAxis type="category" dataKey="codigo" width={54} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        cursor={{ fill: "var(--accent)" }}
                        formatter={(v) => [Number(v).toFixed(2), "Promedio"]}
                        labelFormatter={(l) => a.variablesDebiles.find((x) => x.codigo === l)?.nombre ?? String(l)}
                      />
                      <Bar dataKey="promedio" fill={C.bajo} radius={[0, 4, 4, 0]} maxBarSize={22} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="overflow-hidden py-0">
                <div className="border-b p-4">
                  <CardTitle className="text-base">Detalle de variables prioritarias</CardTitle>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Variable</TableHead>
                      <TableHead>Componente</TableHead>
                      <TableHead>Promedio</TableHead>
                      <TableHead>Respuestas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {a.variablesDebiles.map((v) => (
                      <TableRow key={v.codigo}>
                        <TableCell className="font-medium">
                          <span className="text-muted-foreground">{v.codigo} · </span>
                          {v.nombre}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{v.componente}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              v.promedio < 1.7
                                ? "border-rose-200 bg-rose-100 text-rose-800"
                                : v.promedio < 2.3
                                  ? "border-amber-200 bg-amber-100 text-amber-800"
                                  : "border-green-200 bg-green-100 text-green-800"
                            }
                          >
                            {v.promedio.toFixed(2)}
                          </Badge>
                        </TableCell>
                        <TableCell className="tabular-nums text-muted-foreground">{v.n}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            {/* ---------- TERRITORIAL ---------- */}
            {!soloMiCanton && (
              <TabsContent value="territorial" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">IDM-GIRD promedio por tipo de cantón</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={data.porTipo}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                          <XAxis dataKey="tipo" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={{ stroke: "var(--border)" }} />
                          <YAxis tick={axisTick} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--accent)" }} formatter={(v) => [Number(v).toFixed(3), "IDM"]} />
                          <Bar dataKey="promedio" fill="var(--chart-2)" radius={[4, 4, 0, 0]} maxBarSize={48} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">IDM-GIRD promedio por provincia (top 10)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart layout="vertical" data={data.porProvincia.slice(0, 10)} margin={{ left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                          <XAxis type="number" tick={axisTick} tickLine={false} axisLine={{ stroke: "var(--border)" }} />
                          <YAxis type="category" dataKey="nombre" width={90} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--accent)" }} formatter={(v) => [Number(v).toFixed(3), "IDM"]} />
                          <Bar dataKey="promedio" fill="var(--chart-3)" radius={[0, 4, 4, 0]} maxBarSize={22} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Mapa de calor: componente × provincia</CardTitle>
                    <CardDescription>
                      Promedio de respuestas (1–3) por componente en cada provincia. Rojo = brecha,
                      verde = capacidad.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Heatmap data={a.heatmap} />
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* ---------- AMENAZAS ---------- */}
            <TabsContent value="amenazas" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Amenazas más frecuentes</CardTitle>
                  <CardDescription>Eventos registrados en más cantones.</CardDescription>
                </CardHeader>
                <CardContent>
                  {a.amenazas.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      Aún no se han registrado amenazas en las evaluaciones.
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height={Math.max(220, a.amenazas.length * 36)}>
                      <BarChart data={a.amenazas} layout="vertical" margin={{ left: 8, right: 24 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                        <XAxis type="number" allowDecimals={false} tick={axisTick} tickLine={false} axisLine={{ stroke: "var(--border)" }} />
                        <YAxis type="category" dataKey="nombre" width={130} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--accent)" }} formatter={(v, n) => [v, n === "veces" ? "Cantones" : n]} />
                        <Bar dataKey="veces" fill="var(--chart-4)" radius={[0, 4, 4, 0]} maxBarSize={22} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ---------- RANKING ---------- */}
            <TabsContent value="ranking">
              <Card className="overflow-hidden py-0">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
                  <CardTitle className="text-base">Ranking de cantones</CardTitle>
                  <div className="relative w-full max-w-xs">
                    <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input className="pl-8" placeholder="Buscar cantón o provincia…" value={q} onChange={(e) => setQ(e.target.value)} />
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-10">#</TableHead>
                      <TableHead>Cantón</TableHead>
                      <TableHead>Provincia</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Periodo</TableHead>
                      <TableHead>IDM-GIRD</TableHead>
                      <TableHead>Ajustado</TableHead>
                      <TableHead className="text-right">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filas.map((f, i) => (
                      <TableRow key={f.evaluacionId}>
                        <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                        <TableCell className="font-medium">{f.canton}</TableCell>
                        <TableCell className="text-muted-foreground">{f.provincia}</TableCell>
                        <TableCell>{f.tipo ? <Badge variant="secondary">{f.tipo}</Badge> : "—"}</TableCell>
                        <TableCell>{f.periodo}</TableCell>
                        <TableCell className="font-semibold tabular-nums text-primary">{f.idm.toFixed(3)}</TableCell>
                        <TableCell className="tabular-nums">{f.ajustado.toFixed(3)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            render={<Link href={`/evaluacion/${f.evaluacionId}`} />}
                          >
                            Ver
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

function PreguntaRow({
  p,
  tono,
}: {
  p: PanelData["analitica"]["preguntasAlto"][number];
  tono: "alto" | "bajo";
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b pb-2 last:border-b-0 last:pb-0">
      <div className="min-w-0">
        <p className="truncate text-sm" title={p.texto}>
          <span className="text-muted-foreground">{p.codigo} </span>
          {p.texto}
        </p>
        <p className="text-xs text-muted-foreground">{p.componente}</p>
      </div>
      <Badge
        className={
          tono === "alto"
            ? "shrink-0 border-green-200 bg-green-100 text-green-800"
            : "shrink-0 border-rose-200 bg-rose-100 text-rose-800"
        }
      >
        {p.pct}%
      </Badge>
    </div>
  );
}
