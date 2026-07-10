# Estado del proyecto y pasos pendientes

_Última actualización: 2026-07-01_

## Resumen

El código de la plataforma está **completo y compilando** (`npm run build` ✔, `npx tsc
--noEmit` ✔, `npm run test:calculo` ✔). Falta **conectar la base de datos Neon** y hacer la
**verificación end-to-end**. Eso es lo único que queda antes de poder usarla y desplegarla.

## ✅ Terminado

- [x] Proyecto Next.js 16 + TypeScript + Tailwind v4, compila sin errores.
- [x] Motor de cálculo del índice IDM-GIRD, **validado contra Ambato (0.22)**.
- [x] Modelo de datos (Prisma) y extracción del Excel a `prisma/seed-data.json`.
- [x] Script de seed (`npm run db:seed`) para catálogos + usuario admin.
- [x] Login, registro y roles (técnico, consultor, investigador, admin).
- [x] Formularios (wizard) de los 9 componentes + módulo de amenazas, índice en vivo.
- [x] Panel de análisis con gráficos, ranking y exportación a Excel.
- [x] Administración de usuarios.
- [x] Documentación: `README.md`, `AGENTS.md`, `docs/PROYECTO.md`, este archivo.

## ⏳ Pendiente (lo que tienes que hacer tú)

### 1. Crear la base de datos en Neon

1. Entra a **https://neon.tech** y crea una cuenta gratis (puedes usar Google).
2. **Create Project** → nombre `gird` → elige la región más cercana → **Create**.
3. Copia la **Connection string** (empieza con `postgresql://...`). Si aparece la opción
   **Pooled connection**, usa esa.

### 2. Configurar el `.env`

Abre el archivo `.env` en la raíz del proyecto y reemplaza el valor de `DATABASE_URL` con la
cadena que copiaste de Neon. Asegúrate de que termine en `?sslmode=require`. Ejemplo:

```
DATABASE_URL="postgresql://usuario:clave@ep-xxx.neon.tech/gird?sslmode=require"
```

(`AUTH_SECRET` ya está generado. Puedes cambiar `ADMIN_EMAIL` / `ADMIN_PASSWORD` si quieres.)

### 3. Crear las tablas y cargar los datos

En una terminal, dentro de `C:\devu\gobierno`:

```bash
npx prisma db push     # crea las tablas en Neon
npm run db:seed        # carga componentes, variables, preguntas, cantones, admin
```

Deberías ver: `9 componentes, 55 variables, 275 preguntas, 219 cantones, 24 provincias, 46 eventos`.

### 4. Probar en local

```bash
npm run dev
```

Abre http://localhost:3000 e inicia sesión con el admin (`admin@girD.gob.ec` / `admin1234`).

**Checklist de prueba end-to-end:**

- [ ] Iniciar sesión como admin.
- [ ] En **Usuarios**, crear un usuario "técnico municipal" y asignarle un cantón.
- [ ] Cerrar sesión, entrar con ese técnico.
- [ ] Crear una autoevaluación (elige el periodo/año) y responder preguntas.
- [ ] Ver el **IDM-GIRD** calculándose en vivo; agregar un evento en "Amenazas".
- [ ] Guardar borrador; responder las 275 y **Enviar**.
- [ ] Entrar al **Panel de análisis**: ver KPIs, gráficos y ranking.
- [ ] **Exportar a Excel** desde el panel.

### 5. Desplegar en Vercel (cuando esté probado)

1. Sube el proyecto a un repositorio de GitHub.
2. Impórtalo en **Vercel**.
3. En Vercel → Settings → Environment Variables, agrega `DATABASE_URL` (la de Neon) y
   `AUTH_SECRET` (el mismo del `.env`).
4. Deploy. (Las tablas y el seed ya quedaron cargados en Neon en el paso 3.)

## Notas / decisiones a confirmar con la contraparte (Tatiana)

- Alta de usuarios: ¿registro libre o solo por invitación del administrador?
- Investigadores/consultores: ¿ven datos identificados o anonimizados? (propiedad intelectual)
- ¿Una evaluación por cantón por año, o varias versiones?
- Confirmar significado exacto de la escala 1–2–3 y los pesos por componente.
- Completar los 2 cantones faltantes (el Excel trae 219 de 221).

## Si algo falla

- **`Can't reach database server`**: revisa `DATABASE_URL` en `.env` (que sea la de Neon y
  termine en `?sslmode=require`).
- **Cambiaste el schema** (`prisma/schema.prisma`): corre `npx prisma generate` y luego
  `npx prisma db push`.
- **Verificar la fórmula del índice**: `npm run test:calculo` debe decir "TEST OK".
