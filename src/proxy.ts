import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE = "girD_session";
const PUBLIC = ["/", "/login", "/registro"];

function secretKey(): Uint8Array {
  return new TextEncoder().encode(process.env.AUTH_SECRET || "");
}

async function leerSesion(token?: string): Promise<{ rol?: string } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload as { rol?: string };
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE)?.value;
  const sesion = await leerSesion(token);

  const esPublica = PUBLIC.some((p) => pathname === p || pathname.startsWith(p + "/"));

  // Ya autenticado y va a login/registro -> al dashboard
  if (sesion && esPublica) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (esPublica) return NextResponse.next();

  // Ruta protegida sin sesión -> login
  if (!sesion) {
    const url = new URL("/login", req.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Solo ADMIN entra a /admin
  if (pathname.startsWith("/admin") && sesion.rol !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Protege todo salvo assets estáticos (rutas con extensión de archivo, p. ej.
  // /escudo.svg), los internos de Next y la API de auth.
  matcher: ["/((?!_next|api/auth|.*\\.[\\w]+$).*)"],
};
