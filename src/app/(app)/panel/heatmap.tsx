"use client";

import type { Heatmap as HeatmapData } from "@/lib/panel";

// Escala secuencial de un solo tono (navy): claro = menor, oscuro = mayor.
// Apta para daltónicos (no depende de rojo/verde) y el valor numérico va en la celda.
function color(v: number | undefined) {
  if (v === undefined) return { bg: "var(--muted)", fg: "var(--muted-foreground)" };
  const t = Math.max(0, Math.min(1, (v - 1) / 2)); // 0..1
  const L = 0.93 - t * 0.59; // claro (0.93) → navy oscuro (0.34)
  const C = 0.03 + t * 0.08;
  const fg = L < 0.6 ? "#fff" : "oklch(0.32 0.07 254)";
  return { bg: `oklch(${L} ${C} 254)`, fg };
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
      {/* Leyenda con escala numérica */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>Menor (brecha)</span>
        <div className="relative h-3 w-40 rounded" style={{ background: "linear-gradient(90deg, oklch(0.93 0.03 254), oklch(0.635 0.07 254), oklch(0.34 0.11 254))" }} />
        <span>Mayor (capacidad)</span>
        <span className="ml-1 flex items-center gap-2 tabular-nums text-muted-foreground/80">
          <span>1</span>
          <span>2</span>
          <span>3</span>
        </span>
      </div>
      <p className="text-xs text-muted-foreground/70">
        El valor exacto (1–3) se muestra en cada celda y al pasar el cursor.
      </p>
    </div>
  );
}
