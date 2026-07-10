# Proyecto: Plataforma de Autoevaluación GIRD Municipal

## Contexto

Se requiere una plataforma web para que los **Gobiernos Autónomos Descentralizados
Municipales (GADM)** del Ecuador —los 221 cantones a nivel nacional— realicen una
**autoevaluación de su Gestión Integral del Riesgo de Desastres (GIRD)**, conforme a un
reglamento nuevo. Actualmente esa evaluación existe solo como un archivo Excel
(`INDICE GRIDS.xlsx`); este proyecto lo transforma en una plataforma con control de acceso,
formularios en línea, cálculo automático del índice y análisis de resultados.

Usuarios previstos: técnicos de gestión de riesgos de los GADM, consultores independientes
e investigadores.

## Qué hace la plataforma

1. **Control de acceso (login y roles).** Cada usuario ingresa con su cuenta según su perfil.
2. **Formularios de autoevaluación.** 275 preguntas organizadas en 9 componentes y 55
   variables, respondidas en una **escala de madurez 1–2–3**. Incluye un módulo de
   **amenazas/eventos** del cantón.
3. **Cálculo automático del índice IDM-GIRD.** El sistema replica exactamente la fórmula del
   Excel y calcula el índice y su versión ajustada por amenazas, en vivo mientras se responde.
4. **Panel de análisis.** Estadísticas agregadas: ranking de cantones, promedios por
   componente, por provincia y por tipo de cantón, con exportación a Excel.

## Estructura de la evaluación

- **9 componentes** (peso que suma 1.0 en conjunto):
  I. Gobernanza Institucional · II. Planificación Territorial · III. Prevención del Riesgo ·
  IV. Mitigación del Riesgo · V. Preparación y Fortalecimiento de Capacidades ·
  VI. Respuesta ante Emergencias · VII. Recuperación y Reconstrucción ·
  VIII. Financiamiento y Sostenibilidad · IX. Participación Social y Coordinación.
- **55 variables**, cada una con sus referencias legales (LOGIRD, LOOTUGS, COOTAD).
- **275 preguntas** (5 por variable).
- Catálogos: **219 cantones**, 24 provincias, 46 eventos/amenazas.

## Cómo se calcula el índice (IDM-GIRD)

1. **Puntaje de variable** = promedio de las respuestas (1–3) de sus 5 preguntas.
2. **Puntaje de componente** = (promedio de los puntajes de sus variables) ÷ 10.
3. **IDM-GIRD** = producto de (puntaje_componente ^ peso_componente) — media geométrica
   ponderada.
4. **CTI (coeficiente por amenazas)** = 0.8 + 0.4 × Σ(riesgo del evento × peso del evento),
   donde riesgo = (amenaza × vulnerabilidad × exposición ÷ mitigación) ÷ 1000.
5. **IDM-GIRD ajustado** = IDM-GIRD × CTI.

> Validado contra el cantón **Ambato** del Excel original: IDM = **0.22** (coincidencia exacta).

## Roles y permisos

| Rol | Llenar formularios | Panel de análisis | Administración |
|---|---|---|---|
| **Técnico municipal** | Su cantón | Su cantón | — |
| **Consultor** | Cantones asignados | Global | — |
| **Investigador** | — | Global (solo lectura) | — |
| **Administrador** | Todos | Global | Gestión de usuarios |

## Tecnología

Aplicación web **Next.js** (un solo proyecto para frontend y backend), base de datos
**PostgreSQL (Neon)** y despliegue en **Vercel**. Detalles técnicos en `README.md` y
`AGENTS.md`.

## Notas de gobernanza (a definir con la contraparte)

- Propiedad intelectual: cada evaluación pertenece a su municipio; los investigadores acceden
  a datos agregados. Falta confirmar si ven datos identificados o anonimizados.
- Confirmar: alta de usuarios (registro libre vs. por invitación del admin), significado fino
  de la escala 1–2–3, y si se permite una o varias evaluaciones por cantón/periodo.
- Completar los 2 cantones faltantes para llegar a 221 (el Excel trae 219).
