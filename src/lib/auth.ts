/**
 * Autenticación ligera basada en JWT (jose) guardado en cookie httpOnly.
 * - Firma/verifica la sesión sin depender de la base de datos (compatible con middleware/edge).
 * - Helpers de rol para proteger Server Actions y páginas.
 */
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { Rol } from "@prisma/client";

const COOKIE = "girD_session";
const MAX_AGE = 60 * 60 * 8; // 8 horas

export type SessionPayload = {
  userId: string;
  email: string;
  nombre: string;
  rol: Rol;
  cantonId: string | null;
};

function secretKey(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("Falta la variable de entorno AUTH_SECRET");
  return new TextEncoder().encode(s);
}

export async function crearToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secretKey());
}

export async function verificarToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/** Escribe la cookie de sesión (usar dentro de un Server Action o Route Handler). */
export async function iniciarSesion(payload: SessionPayload) {
  const token = await crearToken(payload);
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function cerrarSesion() {
  const store = await cookies();
  store.delete(COOKIE);
}

/** Devuelve la sesión actual o null. Lee la cookie del request. */
export async function obtenerSesion(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  return verificarToken(token);
}

export const COOKIE_NAME = COOKIE;
