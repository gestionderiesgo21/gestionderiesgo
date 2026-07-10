# Seguridad — Plataforma Gestión de Riesgos

Guía de seguridad **específica de este proyecto** (Next.js 16 + Prisma + PostgreSQL +
auth propia con JWT). No es teoría genérica: refleja la arquitectura real y los hallazgos
de la auditoría de código. Léelo antes de tocar auth, roles o Server Actions.

> Herramienta: corre `/security-review` (skill integrada de Claude Code) sobre el diff
> **antes de cada despliegue**. Es el chequeo de vulnerabilidades del código pendiente.

---

## 1. Modelo de amenazas (qué protegemos y de quién)

- **Datos sensibles**: evaluaciones GIRD por cantón, usuarios (correos, hashes), índices
  IDM. No es dato personal crítico, pero sí información institucional que **no debe ser
  legible por cualquiera de internet**.
- **Atacantes plausibles**: usuario anónimo que se auto-registra para leer datos ajenos;
  un rol bajo (técnico) que intenta ver/editar otro cantón; fuerza bruta contra el login;
  robo de cookie de sesión.
- **Objetivo**: que cada usuario vea y modifique **solo lo que su rol permite**, y que
  nadie entre "como si nada".

## 2. El control real NO es RLS de Postgres, es la autorización en Server Actions

En esta arquitectura el navegador **nunca** se conecta a la base: solo el servidor Next.js
lo hace, con **una sola** `DATABASE_URL`. Por eso Row Level Security de Postgres **no**
distingue a nuestros usuarios (todos comparten la misma conexión Prisma). El control de
acceso vive en la aplicación:

- **`src/proxy.ts`** — primera barrera: exige sesión válida en rutas protegidas y restringe
  `/admin` a `ADMIN`. Es filtro grueso; **no** confíes solo en él.
- **`src/lib/actions/*`** — barrera real: **toda** Server Action que lee o escribe datos
  debe verificar rol **y** propiedad ANTES de tocar la base (`autorizarEvaluacion`,
  `requireAdmin`). El proxy puede pasarse por alto en llamadas directas a la acción; la
  verificación en la acción no.

> Regla de oro: **nunca** confíes en `cantonId`, `rol` ni ids que vengan del formulario para
> decidir permisos. Usa siempre la sesión del servidor (`obtenerSesion()`).

## 3. Reglas obligatorias al escribir código

1. **Autoriza en la acción, no solo en el proxy.** Cada `"use server"` que accede a datos
   empieza validando la sesión y el permiso.
2. **Valida toda entrada con `zod`** (`safeParse`) antes de usarla. Aplica también a acciones
   de admin.
3. **Roles sensibles solo los crea un ADMIN.** El registro público crea únicamente
   `TECNICO_MUNICIPAL` y queda **inactivo** hasta aprobación. `CONSULTOR`, `INVESTIGADOR` y
   `ADMIN` se crean desde `/admin/usuarios`.
4. **Ata el técnico a su cantón.** Un `TECNICO_MUNICIPAL` solo opera sobre `sesion.cantonId`;
   ignora cualquier `cantonId` del formulario.
5. **Contraseñas**: hash con `bcrypt` coste ≥ 12. Mínimo 8 caracteres (idealmente 12).
   Nunca las registres en logs.
6. **Prisma** parametriza las queries: úsalo siempre. Si algún día necesitas SQL crudo, usa
   `$queryRaw` con parámetros, **jamás** interpolación de strings.

## 4. Sesión y cookies

- JWT firmado (HS256) en cookie **`httpOnly`**, `secure` en producción, `sameSite=lax`,
  expiración 8 h. Correcto — no lo debilites.
- Al **desactivar** un usuario (`activo=false`), su JWT sigue válido hasta expirar. Por eso
  las acciones sensibles **revalidan contra la BD** que el usuario siga existiendo y activo.
- El login **rechaza usuarios inactivos** y aplica **bloqueo temporal** tras varios intentos
  fallidos (anti fuerza bruta).

## 5. Secretos y configuración

- `.env*` está en `.gitignore`: **nunca** commitear secretos.
- **`AUTH_SECRET`**: cadena aleatoria larga (≥ 32 bytes). Genera una **distinta** para
  producción; no reutilices la de desarrollo. Generar: `openssl rand -hex 32`.
- Credenciales del proyecto (Neon, Vercel, admin inicial) van con una **cuenta dedicada del
  proyecto**, no personales. Cambia la contraseña del admin sembrado (`admin1234`) antes de
  entregar/desplegar.

## 6. Cabeceras de seguridad (en `next.config.ts`)

Aplicadas a todas las respuestas: `Strict-Transport-Security` (HSTS),
`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` (anti-clickjacking),
`Referrer-Policy: strict-origin-when-cross-origin`, `X-DNS-Prefetch-Control`.

## 7. Checklist antes de desplegar

- [ ] `AUTH_SECRET` de producción nuevo y fuerte (≠ desarrollo).
- [ ] Contraseña del admin inicial cambiada (no `admin1234`).
- [ ] Registro público limitado a técnico e inactivo por defecto.
- [ ] Rate-limiting/bloqueo de login activo.
- [ ] Técnico atado a su cantón en crear/editar evaluación.
- [ ] Cabeceras de seguridad presentes.
- [ ] `/security-review` corrido sobre el diff sin hallazgos abiertos.
- [ ] Verificar que no hay secretos en el repo (`git log`/`git grep`).
- [ ] HTTPS forzado (Vercel lo da) y cookies `secure` en prod.

## 8. Estado de los hallazgos de la auditoría

| # | Sev. | Hallazgo | Estado |
|---|------|----------|--------|
| 1 | Alta | Registro público permite auto-asignarse rol `INVESTIGADOR`/`CONSULTOR` (fuga de datos) | ✅ Corregido — registro solo crea `TECNICO_MUNICIPAL` inactivo hasta aprobación |
| 2 | Alta | Login sin límite de intentos (fuerza bruta) | ✅ Corregido — bloqueo 15 min tras 5 intentos fallidos |
| 3 | Media | Técnico puede crear/editar evaluación de otro cantón (`cantonId` del form) | ✅ Corregido — técnico atado a `sesion.cantonId` |
| 4 | Media | Usuario desactivado conserva sesión hasta 8 h | ✅ Corregido — acciones sensibles revalidan usuario activo contra BD |
| 5 | Media | `AUTH_SECRET` de prod debe ser nuevo/fuerte; admin sembrado con clave débil | ⏳ Diferido a Fase 4 (despliegue) |
| 6 | Baja | bcrypt coste 10→12; `actualizarUsuario` sin zod; faltan cabeceras | ✅ Corregido — bcrypt 12, zod añadido, cabeceras en `next.config.ts` |

> Pendiente el hallazgo 5 (secretos de producción), que se aplica al desplegar. Antes del
> deploy, correr `/security-review` para confirmar el cierre completo.
