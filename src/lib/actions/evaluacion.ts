"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/auth";
import { calcularIndice } from "@/lib/calculo";
import { getCatalogo, catalogoParaCalculo } from "@/lib/data";

export type GuardarInput = {
  respuestas: { codigo: string; valor: number }[];
  eventos: {
    eventoId: string;
    cantidad: number;
    amenaza: number;
    vulnerabilidad: number;
    exposicion: number;
    mitigacion: number;
  }[];
};

/**
 * Devuelve el usuario de la sesión revalidado contra la BD (existe y sigue activo).
 * Cierra el hueco de que un usuario desactivado conserve el JWT hasta que expire, y usa
 * el rol/cantón autoritativos de la BD en lugar de los del token.
 */
async function usuarioActual() {
  const sesion = await obtenerSesion();
  if (!sesion) redirect("/login");
  const user = await prisma.user.findUnique({
    where: { id: sesion.userId },
    select: { id: true, rol: true, cantonId: true, activo: true },
  });
  if (!user || !user.activo) redirect("/login");
  return user;
}

/** ¿El usuario puede editar/ver esta evaluación? */
async function autorizarEvaluacion(evaluacionId: string, escritura: boolean) {
  const user = await usuarioActual();
  const ev = await prisma.evaluacion.findUnique({ where: { id: evaluacionId } });
  if (!ev) throw new Error("Evaluación no encontrada");

  if (user.rol === "ADMIN") return { user, ev };
  if (user.rol === "INVESTIGADOR") {
    if (escritura) throw new Error("Los investigadores no pueden editar evaluaciones");
    return { user, ev };
  }
  // Técnico / consultor: dueño de la evaluación o de su cantón
  const suyo = ev.usuarioId === user.id || (!!user.cantonId && ev.cantonId === user.cantonId);
  if (!suyo) throw new Error("No tienes permiso sobre esta evaluación");
  return { user, ev };
}

/** Crea una evaluación (borrador) para un cantón y periodo. */
export async function crearEvaluacion(formData: FormData) {
  const user = await usuarioActual();
  if (user.rol === "INVESTIGADOR") throw new Error("Los investigadores no crean evaluaciones");

  // Un técnico municipal SOLO puede crear evaluaciones de su propio cantón; se ignora
  // cualquier cantonId que venga del formulario. Consultor/Admin sí pueden elegir.
  const cantonId =
    user.rol === "TECNICO_MUNICIPAL"
      ? user.cantonId || ""
      : (formData.get("cantonId") as string) || user.cantonId || "";
  const periodo = parseInt((formData.get("periodo") as string) || "", 10);
  if (!cantonId) throw new Error("Selecciona un cantón");
  if (!periodo) throw new Error("Indica el periodo (año)");

  const existente = await prisma.evaluacion.findUnique({
    where: { cantonId_periodo: { cantonId, periodo } },
  });
  if (existente) redirect(`/evaluacion/${existente.id}`);

  const ev = await prisma.evaluacion.create({
    data: { cantonId, periodo, usuarioId: user.id },
  });
  redirect(`/evaluacion/${ev.id}`);
}

/** Recalcula y cachea el índice de una evaluación. */
async function recalcular(evaluacionId: string) {
  const [catalogo, respuestas, eventos] = await Promise.all([
    getCatalogo(),
    prisma.respuesta.findMany({
      where: { evaluacionId },
      include: { pregunta: { select: { codigo: true } } },
    }),
    prisma.eventoEvaluacion.findMany({ where: { evaluacionId } }),
  ]);

  const mapaResp: Record<string, number> = {};
  for (const r of respuestas) mapaResp[r.pregunta.codigo] = r.valor;

  const res = calcularIndice({
    componentes: catalogoParaCalculo(catalogo),
    respuestas: mapaResp,
    eventos,
  });

  await prisma.evaluacion.update({
    where: { id: evaluacionId },
    data: { idmGird: res.idmGird, cti: res.cti, idmGirdAjustado: res.idmGirdAjustado },
  });
  return res;
}

/** Guarda respuestas y eventos (borrador), recalcula el índice. */
export async function guardarEvaluacion(evaluacionId: string, input: GuardarInput) {
  await autorizarEvaluacion(evaluacionId, true);

  // Mapear códigos de pregunta a IDs
  const codigos = input.respuestas.map((r) => r.codigo);
  const preguntas = await prisma.pregunta.findMany({
    where: { codigo: { in: codigos } },
    select: { id: true, codigo: true },
  });
  const idPorCodigo = new Map(preguntas.map((p) => [p.codigo, p.id]));

  await prisma.$transaction([
    ...input.respuestas
      .filter((r) => idPorCodigo.has(r.codigo) && [1, 2, 3].includes(r.valor))
      .map((r) =>
        prisma.respuesta.upsert({
          where: {
            evaluacionId_preguntaId: {
              evaluacionId,
              preguntaId: idPorCodigo.get(r.codigo)!,
            },
          },
          update: { valor: r.valor },
          create: { evaluacionId, preguntaId: idPorCodigo.get(r.codigo)!, valor: r.valor },
        })
      ),
    ...input.eventos.map((e) =>
      prisma.eventoEvaluacion.upsert({
        where: { evaluacionId_eventoId: { evaluacionId, eventoId: e.eventoId } },
        update: {
          cantidad: e.cantidad,
          amenaza: e.amenaza,
          vulnerabilidad: e.vulnerabilidad,
          exposicion: e.exposicion,
          mitigacion: e.mitigacion,
        },
        create: {
          evaluacionId,
          eventoId: e.eventoId,
          cantidad: e.cantidad,
          amenaza: e.amenaza,
          vulnerabilidad: e.vulnerabilidad,
          exposicion: e.exposicion,
          mitigacion: e.mitigacion,
        },
      })
    ),
  ]);

  const res = await recalcular(evaluacionId);
  revalidatePath(`/evaluacion/${evaluacionId}`);
  return { ok: true, idmGird: res.idmGird, idmGirdAjustado: res.idmGirdAjustado, completo: res.completo };
}

/** Marca la evaluación como ENVIADA (requiere estar completa). */
export async function enviarEvaluacion(evaluacionId: string) {
  await autorizarEvaluacion(evaluacionId, true);
  const res = await recalcular(evaluacionId);
  if (!res.completo) {
    return { ok: false, error: "Debes responder las 275 preguntas antes de enviar." };
  }
  await prisma.evaluacion.update({ where: { id: evaluacionId }, data: { estado: "ENVIADA" } });
  revalidatePath(`/evaluacion/${evaluacionId}`);
  revalidatePath("/dashboard");
  return { ok: true };
}
