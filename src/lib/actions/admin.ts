"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { obtenerSesion } from "@/lib/auth";

async function requireAdmin() {
  const sesion = await obtenerSesion();
  if (!sesion) throw new Error("No autorizado");
  // Revalidar contra la BD: el usuario debe existir, estar activo y seguir siendo ADMIN.
  const user = await prisma.user.findUnique({
    where: { id: sesion.userId },
    select: { id: true, rol: true, activo: true },
  });
  if (!user || !user.activo || user.rol !== "ADMIN") throw new Error("No autorizado");
  return user;
}

export type AdminState = { error?: string; ok?: string } | undefined;

const crearSchema = z.object({
  nombre: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  rol: z.enum(["TECNICO_MUNICIPAL", "CONSULTOR", "INVESTIGADOR", "ADMIN"]),
  cantonId: z.string().optional(),
});

export async function crearUsuarioAdmin(_prev: AdminState, formData: FormData): Promise<AdminState> {
  await requireAdmin();
  const parsed = crearSchema.safeParse({
    nombre: formData.get("nombre"),
    email: formData.get("email"),
    password: formData.get("password"),
    rol: formData.get("rol"),
    cantonId: formData.get("cantonId") || undefined,
  });
  if (!parsed.success) return { error: "Datos inválidos: " + parsed.error.issues[0].message };

  const { nombre, email, password, rol, cantonId } = parsed.data;
  const existe = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existe) return { error: "Ya existe un usuario con ese correo" };

  await prisma.user.create({
    data: {
      nombre,
      email: email.toLowerCase(),
      passwordHash: await bcrypt.hash(password, 12),
      rol,
      cantonId: rol === "TECNICO_MUNICIPAL" || rol === "CONSULTOR" ? cantonId || null : null,
    },
  });
  revalidatePath("/admin/usuarios");
  return { ok: "Usuario creado" };
}

const actualizarSchema = z.object({
  id: z.string().min(1),
  rol: z.enum(["TECNICO_MUNICIPAL", "CONSULTOR", "INVESTIGADOR", "ADMIN"]),
  cantonId: z.string().optional(),
  activo: z.boolean(),
});

/** Aprueba (activa) una cuenta pendiente. */
export async function aprobarUsuario(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) throw new Error("Usuario inválido");
  await prisma.user.update({ where: { id }, data: { activo: true } });
  revalidatePath("/admin/usuarios");
}

export async function actualizarUsuario(formData: FormData) {
  await requireAdmin();
  const parsed = actualizarSchema.safeParse({
    id: formData.get("id"),
    rol: formData.get("rol"),
    cantonId: (formData.get("cantonId") as string) || undefined,
    activo: formData.get("activo") === "on",
  });
  if (!parsed.success) throw new Error("Datos inválidos");
  const { id, rol, cantonId, activo } = parsed.data;

  await prisma.user.update({
    where: { id },
    data: {
      rol,
      cantonId: rol === "TECNICO_MUNICIPAL" || rol === "CONSULTOR" ? cantonId || null : null,
      activo,
    },
  });
  revalidatePath("/admin/usuarios");
}
