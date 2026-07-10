import { redirect } from "next/navigation";
import { obtenerSesion } from "@/lib/auth";
import { getPanelData, type PanelFiltro } from "@/lib/panel";
import PanelClient from "./panel-client";

export default async function PanelPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sesion = await obtenerSesion();
  if (!sesion) redirect("/login");

  const sp = await searchParams;
  const filtro: PanelFiltro = {
    periodo: sp.periodo ? parseInt(sp.periodo, 10) || undefined : undefined,
    provincia: sp.provincia || undefined,
    tipo: sp.tipo || undefined,
  };

  // Los técnicos municipales solo ven su cantón
  const restringido = sesion.rol === "TECNICO_MUNICIPAL" ? sesion.cantonId ?? "__none__" : undefined;
  const data = await getPanelData(restringido, filtro);

  return <PanelClient data={data} soloMiCanton={sesion.rol === "TECNICO_MUNICIPAL"} />;
}
