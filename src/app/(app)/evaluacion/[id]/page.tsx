import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/auth";
import { getCatalogo } from "@/lib/data";
import EvaluacionWizard from "./wizard";

export default async function EvaluacionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sesion = await obtenerSesion();
  if (!sesion) redirect("/login");

  const ev = await prisma.evaluacion.findUnique({
    where: { id },
    include: {
      canton: { include: { provincia: true } },
      respuestas: { include: { pregunta: { select: { codigo: true } } } },
      eventos: true,
    },
  });
  if (!ev) notFound();

  // Autorización
  const esAdmin = sesion.rol === "ADMIN";
  const dueño =
    ev.usuarioId === sesion.userId || (!!sesion.cantonId && ev.cantonId === sesion.cantonId);
  const puedeVer = esAdmin || sesion.rol === "INVESTIGADOR" || dueño || sesion.rol === "CONSULTOR";
  if (!puedeVer) redirect("/dashboard");

  const soloLectura =
    ev.estado === "ENVIADA" || sesion.rol === "INVESTIGADOR" || (!esAdmin && !dueño);

  const catalogo = await getCatalogo();

  const componentes = catalogo.map((c) => ({
    codigo: c.codigo,
    nombre: c.nombre,
    peso: c.peso,
    variables: c.variables.map((v) => ({
      codigo: v.codigo,
      nombre: v.nombre,
      refLogird: v.refLogird,
      refLootugs: v.refLootugs,
      refCootad: v.refCootad,
      preguntas: v.preguntas.map((p) => ({ codigo: p.codigo, texto: p.texto })),
    })),
  }));

  const eventosCatalogo = await prisma.evento.findMany({
    orderBy: [{ categoria: "asc" }, { nombre: "asc" }],
    select: { id: true, nombre: true, categoria: true, subcategoria: true },
  });

  const initialRespuestas: Record<string, number> = {};
  for (const r of ev.respuestas) initialRespuestas[r.pregunta.codigo] = r.valor;

  const initialEventos: Record<
    string,
    { cantidad: number; amenaza: number; vulnerabilidad: number; exposicion: number; mitigacion: number }
  > = {};
  for (const e of ev.eventos) {
    initialEventos[e.eventoId] = {
      cantidad: e.cantidad,
      amenaza: e.amenaza,
      vulnerabilidad: e.vulnerabilidad,
      exposicion: e.exposicion,
      mitigacion: e.mitigacion,
    };
  }

  return (
    <EvaluacionWizard
      evaluacionId={ev.id}
      estado={ev.estado}
      soloLectura={soloLectura}
      canton={`${ev.canton.nombre} · ${ev.canton.provincia.nombre}`}
      periodo={ev.periodo}
      componentes={componentes}
      eventosCatalogo={eventosCatalogo}
      initialRespuestas={initialRespuestas}
      initialEventos={initialEventos}
    />
  );
}
