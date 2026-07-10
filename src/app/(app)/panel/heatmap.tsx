"use client";

import type { Heatmap as HeatmapData } from "@/lib/panel";

// Color por valor 1..3 (rojo → ámbar → verde), interpolando el matiz.
function color(v: number | undefined) {
  if (v === undefined) return { bg: "var(--muted)", fg: "var(--muted-foreground)" };
  const t = Math.max(0, Math.min(1, (v - 1) / 2));
  const hue = t * 120; // 0=rojo, 120=verde
  return { bg: `hsl(${hue} 65% 42%)`, fg: "#fff" };
}

export function Heatmap({ data }: { data: HeatmapData }) {
  const mapa = new Map<string, number>();
  for (const c of data.celdas) mapa.set(`${c.provincia}||${c.compCodigo}`, c.valor);

  if (data.provincias.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Sin datos suficientes para el mapa de calor.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-1 text-center text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-card px-2 py-1 text-left font-medium text-muted-foreground">
                Provincia
              </th>
              {data.componentes.map((c) => (
                <th key={c.codigo} className="px-1 py-1 font-medium text-muted-foreground" title={c.nombre}>
                  {c.codigo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.provincias.map((prov) => (
              <tr key={prov}>
                <td className="sticky left-0 z-10 whitespace-nowrap bg-card px-2 py-1 text-left font-medium">
                  {prov}
                </td>
                {data.componentes.map((c) => {
                  const v = mapa.get(`${prov}||${c.codigo}`);
                  const col = color(v);
                  return (
                    <td
                      key={c.codigo}
                      className="h-8 min-w-9 rounded-md font-medium tabular-nums"
                      style={{ background: col.bg, color: col.fg }}
                      title={`${prov} · ${c.nombre}: ${v?.toFixed(2) ?? "sin datos"}`}
                    >
                      {v !== undefined ? v.toFixed(1) : ""}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Leyenda */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Menor (brecha)</span>
        <div className="h-3 w-40 rounded" style={{ background: "linear-gradient(90deg, hsl(0 65% 42%), hsl(60 65% 42%), hsl(120 65% 42%))" }} />
        <span>Mayor (capacidad)</span>
      </div>
    </div>
  );
}
