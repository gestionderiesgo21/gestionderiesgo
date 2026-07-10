"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { iniciarSesion, cerrarSesion } from "@/lib/auth";

export type FormState = { error?: string } | undefined;

const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

const MAX_INTENTOS = 5;
const BLOQUEO_MS = 15 * 60 * 1000; // 15 minutos

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const ahora = new Date();
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });

  // Bloqueo temporal por intentos fallidos (anti fuerza bruta).
  if (user?.bloqueadoHasta && user.bloqueadoHasta > ahora) {
    return { error: "Demasiados intentos fallidos. Vuelve a intentar en unos minutos." };
  }
  if (!user || !user.activo) {
    return { error: "Credenciales incorrectas o cuenta pendiente de aprobación" };
  }

  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!ok) {
    const intentos = user.intentosFallidos + 1;
    const bloquear = intentos >= MAX_INTENTOS;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        intentosFallidos: bloquear ? 0 : intentos,
        bloqueadoHasta: bloquear ? new Date(ahora.getTime() + BLOQUEO_MS) : user.bloqueadoHasta,
      },
    });
    return { error: "Credenciales incorrectas" };
  }

  // Éxito: limpiar contadores de intentos.
  if (user.intentosFallidos !== 0 || user.bloqueadoHasta) {
    await prisma.user.update({
      where: { id: user.id },
      data: { intentosFallidos: 0, bloqueadoHasta: null },
    });
  }

  await iniciarSesion({
    userId: user.id,
    email: user.email,
    nombre: user.nombre,
    rol: user.rol,
    cantonId: user.cantonId,
  });

  const redirectTo = (formData.get("redirect") as string) || "/dashboard";
  redirect(redirectTo);
}

// El registro público SOLO crea técnicos municipales (usuarios de GADM que llenan la
// encuesta). Roles con acceso a datos (CONSULTOR, INVESTIGADOR, ADMIN) los crea un ADMIN
// desde /admin/usuarios. Las cuentas nuevas quedan INACTIVAS hasta aprobación del admin.
const registroSchema = z.object({
  nombre: z.string().min(2, "Ingresa tu nombre"),
  email: z.string().email("Correo inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  cantonId: z.string().min(1, "Selecciona tu cantón"),
});

export async function registro(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = registroSchema.safeParse({
    nombre: formData.get("nombre"),
    email: formData.get("email"),
    password: formData.get("password"),
    cantonId: formData.get("cantonId") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { nombre, email, password, cantonId } = parsed.data;

  // Validar que el cantón exista (evita cantonId arbitrario).
  const canton = await prisma.canton.findUnique({ where: { id: cantonId } });
  if (!canton) {
    return { error: "El cantón seleccionado no es válido" };
  }

  const existe = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existe) {
    return { error: "Ya existe un usuario con ese correo" };
  }

  await prisma.user.create({
    data: {
      nombre,
      email: email.toLowerCase(),
      passwordHash: await bcrypt.hash(password, 12),
      rol: "TECNICO_MUNICIPAL",
      activo: false, // Requiere aprobación de un administrador.
      cantonId,
    },
  });

  // Sin auto-login: la cuenta está inactiva. Se avisa en el login.
  redirect("/login?pendiente=1");
}

export async function logout() {
  await cerrarSesion();
  redirect("/login");
}
