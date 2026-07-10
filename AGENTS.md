<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Plataforma GIRD — guía del proyecto

Plataforma web de **autoevaluación GIRD** (Gestión Integral del Riesgo de Desastres) para
los GADM (cantones) del Ecuador. Los usuarios llenan formularios (275 preguntas en 9
componentes), el sistema calcula el índice **IDM-GIRD** replicando la fórmula del Excel
`data/INDICE GRIDS.xlsx`, y un panel muestra estadísticas. Contexto en `docs/PROYECTO.md`,
estado y pendientes en `docs/ESTADO.md`.

## Stack

- **Next.js 16 (App Router) + React 19 + TypeScript**. Frontend y backend en el mismo proyecto.
- **Prisma + PostgreSQL** (Neon en prod). Schema en `prisma/schema.prisma`.
- **Auth propia**: JWT (`jose`) en cookie httpOnly + `bcryptjs`. No usa NextAuth.
- **Tailwind CSS v4**, **Recharts** (gráficos), **ExcelJS** (exportación).
- Despliegue objetivo: **Vercel** (serverless) + **Neon**.

## Comandos

```bash
npm run dev            # desarrollo (http://localhost:3000)
npm run build          # build de producción
npm run test:calculo   # valida el motor de cálculo contra el Excel (Ambato = 0.22)
npm run db:push        # sincroniza schema Prisma con la base
npm run db:seed        # siembra catálogos + usuario admin desde prisma/seed-data.json
npx prisma generate    # regenera el cliente Prisma tras cambiar el schema
npx tsc --noEmit       # chequeo de tipos
```

Requiere `.env` con `DATABASE_URL` (Neon) y `AUTH_SECRET`. Ver `.env.example`.

## Arquitectura y convenciones

- **Motor de cálculo**: `src/lib/calculo.ts` es una **función pura** (sin DB) — se usa en el
  servidor (recalcular al guardar) y en el cliente (índice en vivo del wizard). Cambios a la
  fórmula van aquí y deben seguir pasando `npm run test:calculo`.
- **Datos**: `src/lib/prisma.ts` (singleton); `src/lib/data.ts` arma el catálogo anidado
  (componentes→variables→preguntas) y lo convierte al formato del motor; `src/lib/panel.ts`
  agrega los resultados para el panel.
- **Auth**: `src/lib/auth.ts` (sesión/cookie). `src/proxy.ts` (proxy de Next 16, antes
  "middleware") protege rutas y restringe `/admin` a ADMIN.
- **Server Actions** en `src/lib/actions/` (`auth.ts`, `evaluacion.ts`, `admin.ts`): validan
  permisos por rol antes de escribir.
- **Rutas** (`src/app/`): `login/`, `registro/` (públicas); `(app)/` (grupo protegido:
  `dashboard/`, `evaluacion/[id]/` wizard, `panel/`, `admin/usuarios/`);
  `api/export/route.ts` (Excel).
- **Roles** (`Rol` enum): `TECNICO_MUNICIPAL`, `CONSULTOR`, `INVESTIGADOR`, `ADMIN`.
- **Patrón de páginas**: Server Component carga datos con Prisma → pasa props serializables a
  un Client Component (`*-form.tsx`, `wizard.tsx`, `panel-client.tsx`) para interactividad.
- **UI**: utilidades en `src/app/globals.css` (`.btn-primary`, `.card`, `.input`…). En
  Tailwind v4 **no** encadenar `@apply` de una clase de componente a otra.

## Datos / Excel

- El catálogo se extrae del Excel a `prisma/seed-data.json` (9 componentes, 55 variables,
  275 preguntas, 219 cantones, 24 provincias, 46 eventos). Si cambia el Excel, regenerar ese
  JSON y correr `db:seed`.
- **Fórmula**: puntaje_variable = promedio de respuestas (1–3); puntaje_componente =
  promedio de variables / 10; IDM = Π(componente^peso); CTI = 0.8 + 0.4·Σ(riesgo·peso_evento);
  ajustado = IDM × CTI.
- Notas del Excel ya contempladas: typo "Varible 43"; su fórmula reutiliza el peso M7 para dos
  componentes, pero como M6=M7 el resultado no cambia.

## Estado

Código completo y compilando. **Pendiente**: conectar Neon (`DATABASE_URL`), correr
`db:push` + `db:seed` y verificar end-to-end. Ver `docs/ESTADO.md`.
