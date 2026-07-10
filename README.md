# Plataforma GIRD — Autoevaluación Municipal (GADM Ecuador)

Plataforma web para que los técnicos de gestión de riesgos de los GADM (cantones),
consultores e investigadores realicen la **autoevaluación de Gestión Integral del Riesgo
de Desastres (GIRD)**, calculen automáticamente el índice **IDM-GIRD** y analicen los
resultados. Los formularios y la fórmula del índice provienen del archivo
`data/INDICE GRIDS.xlsx`.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** — frontend y backend (Server Actions / Route Handlers).
- **PostgreSQL** + **Prisma** (ORM, migraciones, seed). En producción: **Neon**.
- **Autenticación propia**: JWT (`jose`) en cookie httpOnly + `bcryptjs`, con roles.
- **Tailwind CSS v4** (UI) + **Recharts** (gráficos) + **ExcelJS** (exportación).

## Roles

| Rol | Formularios | Panel de análisis | Admin |
|---|---|---|---|
| Técnico municipal | Su cantón | Su cantón | — |
| Consultor | Cantones asignados | Global | — |
| Investigador | — | Global (lectura) | — |
| Administrador | Todos | Global | Sí |

## Modelo de cálculo (replica el Excel)

- `puntaje_variable` = promedio de sus preguntas (madurez 1–3)
- `puntaje_componente` = (promedio de variables) / 10
- `IDM_GIRD` = Π (puntaje_componente ^ peso_componente) — media geométrica ponderada
- `CTI` = 0.8 + 0.4 · Σ(riesgo_evento · peso_evento)
- `IDM_GIRD_ajustado` = IDM_GIRD × CTI

Validado contra el cantón Ambato del Excel: `npm run test:calculo` (IDM = 0.22).

## Puesta en marcha (local)

1. Copia `.env.example` a `.env` y completa `DATABASE_URL` (Neon) y `AUTH_SECRET`.
2. Instala dependencias: `npm install`
3. Crea las tablas: `npx prisma db push`
4. Carga catálogos y usuario admin: `npm run db:seed`
5. Arranca: `npm run dev` → http://localhost:3000

Admin inicial (configurable en `.env`): `admin@girD.gob.ec` / `admin1234`.

## Scripts

- `npm run dev` — desarrollo
- `npm run build` / `npm start` — producción
- `npm run test:calculo` — valida el motor de cálculo contra el Excel
- `npm run db:push` — sincroniza el schema con la base
- `npm run db:seed` — siembra catálogos (componentes, variables, preguntas, cantones, eventos)

## Despliegue en Vercel

1. Sube el repo a GitHub e impórtalo en Vercel.
2. Crea una base **Neon** (Storage → Postgres) o usa una externa; añade `DATABASE_URL` y `AUTH_SECRET` en las variables de entorno del proyecto.
3. Ejecuta `npx prisma db push` y `npm run db:seed` una vez contra la base de Neon.
4. Deploy. Next.js corre como funciones serverless; Neon es la base de datos.

## Datos

- Catálogo extraído del Excel: `prisma/seed-data.json` (9 componentes, 55 variables, 275 preguntas, 219 cantones, 24 provincias, 46 eventos).
- Excel original de referencia: `data/INDICE GRIDS.xlsx`.
