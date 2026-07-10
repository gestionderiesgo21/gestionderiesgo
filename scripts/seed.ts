/**
 * Seed de la base de datos desde prisma/seed-data.json (extraído de INDICE GRIDS.xlsx).
 * Carga catálogos (provincias, cantones, componentes, variables, preguntas, eventos)
 * y crea un usuario administrador inicial.
 *
 * Ejecutar: npm run db:seed
 * Idempotente: usa upsert, se puede correr varias veces.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import bcrypt from "bcryptjs";
import { PrismaClient, type TipoCanton } from "@prisma/client";

const prisma = new PrismaClient();

type SeedData = {
  componentes: { codigo: string; nombre: string; orden: number; peso: number }[];
  variables: {
    codigo: string;
    componenteCodigo: string;
    nombre: string;
    orden: number;
    refLogird: string | null;
    refLootugs: string | null;
    refCootad: string | null;
  }[];
  preguntas: { codigo: string; variableCodigo: string; texto: string; orden: number }[];
  provincias: string[];
  cantones: { nombre: string; provincia: string; tipo: string | null }[];
  eventos: { nombre: string; subcategoria: string; categoria: string }[];
};

const TIPO_MAP: Record<string, TipoCanton> = {
  micro: "MICRO",
  pequeno: "PEQUENO",
  "pequeño": "PEQUENO",
  mediano: "MEDIANO",
  grande: "GRANDE",
  metropolitano: "METROPOLITANO",
};

function normTipo(t: string | null): TipoCanton | null {
  if (!t) return null;
  const key = t
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  return TIPO_MAP[t.trim().toLowerCase()] ?? TIPO_MAP[key] ?? null;
}

async function main() {
  const data: SeedData = JSON.parse(
    readFileSync(join(process.cwd(), "prisma", "seed-data.json"), "utf-8")
  );

  console.log("Sembrando provincias...");
  const provinciaId = new Map<string, string>();
  for (const nombre of data.provincias) {
    const p = await prisma.provincia.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
    provinciaId.set(nombre, p.id);
  }

  console.log("Sembrando cantones...");
  for (const c of data.cantones) {
    const provId = provinciaId.get(c.provincia);
    if (!provId) continue;
    await prisma.canton.upsert({
      where: { nombre_provinciaId: { nombre: c.nombre, provinciaId: provId } },
      update: { tipo: normTipo(c.tipo) },
      create: { nombre: c.nombre, provinciaId: provId, tipo: normTipo(c.tipo) },
    });
  }

  console.log("Sembrando componentes...");
  const componenteId = new Map<string, string>();
  for (const comp of data.componentes) {
    const c = await prisma.componente.upsert({
      where: { codigo: comp.codigo },
      update: { nombre: comp.nombre, orden: comp.orden, peso: comp.peso },
      create: { codigo: comp.codigo, nombre: comp.nombre, orden: comp.orden, peso: comp.peso },
    });
    componenteId.set(comp.codigo, c.id);
  }

  console.log("Sembrando variables...");
  const variableId = new Map<string, string>();
  for (const v of data.variables) {
    const compId = componenteId.get(v.componenteCodigo);
    if (!compId) continue;
    const r = await prisma.variable.upsert({
      where: { codigo: v.codigo },
      update: {
        componenteId: compId,
        nombre: v.nombre,
        orden: v.orden,
        refLogird: v.refLogird,
        refLootugs: v.refLootugs,
        refCootad: v.refCootad,
      },
      create: {
        codigo: v.codigo,
        componenteId: compId,
        nombre: v.nombre,
        orden: v.orden,
        refLogird: v.refLogird,
        refLootugs: v.refLootugs,
        refCootad: v.refCootad,
      },
    });
    variableId.set(v.codigo, r.id);
  }

  console.log("Sembrando preguntas...");
  for (const q of data.preguntas) {
    const varId = variableId.get(q.variableCodigo);
    if (!varId) continue;
    await prisma.pregunta.upsert({
      where: { codigo: q.codigo },
      update: { variableId: varId, texto: q.texto, orden: q.orden },
      create: { codigo: q.codigo, variableId: varId, texto: q.texto, orden: q.orden },
    });
  }

  console.log("Sembrando eventos/amenazas...");
  for (const e of data.eventos) {
    await prisma.evento.upsert({
      where: { nombre: e.nombre },
      update: { subcategoria: e.subcategoria, categoria: e.categoria },
      create: { nombre: e.nombre, subcategoria: e.subcategoria, categoria: e.categoria },
    });
  }

  console.log("Creando usuario administrador...");
  // El login normaliza el correo a minúsculas: almacenarlo igual para que coincida.
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@gird.gob.ec").toLowerCase();
  const adminPass = process.env.ADMIN_PASSWORD || "admin1234";
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      nombre: "Administrador",
      rol: "ADMIN",
      passwordHash: await bcrypt.hash(adminPass, 12),
    },
  });

  const counts = {
    provincias: await prisma.provincia.count(),
    cantones: await prisma.canton.count(),
    componentes: await prisma.componente.count(),
    variables: await prisma.variable.count(),
    preguntas: await prisma.pregunta.count(),
    eventos: await prisma.evento.count(),
    usuarios: await prisma.user.count(),
  };
  console.log("\n✅ Seed completado:", counts);
  console.log(`\n   Admin: ${adminEmail} / ${adminPass}  (cámbialo luego)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
