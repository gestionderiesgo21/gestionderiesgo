"use client";

import { useRouter } from "next/navigation";
import { Filter, X } from "lucide-react";
import type { PanelFiltro, PanelOpciones } from "@/lib/panel";
import { Button } from "@/components/ui/button";

const selectCls =
  "border-input focus-visible:border-primary focus-visible:ring-primary/20 h-9 rounded-md border bg-card px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px]";

export function FilterBar({
  opciones,
  filtro,
}: {
  opciones: PanelOpciones;
  filtro: PanelFiltro;
}) {
  const router = useRouter();

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/panel?${params.toString()}`);
  };

  const activo = !!(filtro.periodo || filtro.provincia || filtro.tipo);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-3">
      <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
        <Filter className="h-4 w-4" /> Filtros
      </span>

      <select
        className={selectCls}
        value={filtro.periodo ?? ""}
        onChange={(e) => setParam("periodo", e.target.value)}
        aria-label="Periodo"
      >
        <option value="">Todos los periodos</option>
        {opciones.periodos.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      <select
        className={selectCls}
        value={filtro.provincia ?? ""}
        onChange={(e) => setParam("provincia", e.target.value)}
        aria-label="Provincia"
      >
        <option value="">Todas las provincias</option>
        {opciones.provincias.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      {opciones.tipos.length > 0 && (
        <select
          className={selectCls}
          value={filtro.tipo ?? ""}
          onChange={(e) => setParam("tipo", e.target.value)}
          aria-label="Tipo de cantón"
        >
          <option value="">Todos los tipos</option>
          {opciones.tipos.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      )}

      {activo && (
        <Button variant="ghost" size="sm" onClick={() => router.push("/panel")}>
          <X className="h-4 w-4" /> Limpiar
        </Button>
      )}
    </div>
  );
}
