# CLAUDE.md — ERP Fauna para Chile

Este archivo resume el plan maestro (`docs/plan-maestro.md` si se guarda una copia, o el documento entregado por el equipo) para que cualquier sesión de Claude Code arranque con el contexto correcto. Léelo siempre al empezar una sesión.

## Qué es este proyecto

ERP ligero y modular para **Fauna para Chile** (diseño, fabricación y venta de productos educativos/de conservación inspirados en fauna chilena). No es un CRM: centraliza inventario, clientes en concesión, pedidos, conciliaciones y finanzas básicas. El problema central hoy es la **concesión**: las tiendas no saben cuánto stock les queda y sobrepiden.

## Decisiones cerradas (no se reabren sin justificar al equipo)

- **D1** — Inventario por ubicaciones (bodega central y cada cliente en concesión son "ubicaciones"). El stock siempre se calcula desde movimientos, nunca es un campo editable.
- **D2** — Movimientos inmutables. Nunca se editan ni borran; un error se corrige con movimiento inverso.
- **D3** — Pedido único con campo `canal` (mayorista, concesión, web, feria). Lo que cambia son los movimientos que genera cada tipo.
- **D4** — Cierre de concesión por conteo (conciliación). El sistema es la fuente de verdad del stock teórico; el cliente cuenta su stock físico y el sistema deduce ventas = teórico − contado.
- **D5** — Sin multi-tenant. Diseño limpio pero para una sola empresa por ahora.
- **D6** — Finanzas solo registran (facturas, folio SII, pagos). Sin integración tributaria.
- **D7** — Ecommerce fuera del MVP (pedidos manuales con canal "web").
- **D8** — Stack: Next.js + TypeScript, Supabase (Postgres + Auth + Storage), Drizzle ORM, Tailwind + shadcn/ui, Vercel + Supabase hosting, GitHub.
- **D9** — Monolito modular: un solo proyecto/despliegue, módulos aislados por carpeta.
- **D10** — Testing quirúrgico: solo lógica crítica (stock, deducción de conciliaciones, generación de movimientos).

## Reglas de trabajo obligatorias

- **R1** — Todo pasa por Git/GitHub, nada directo a producción.
- **R2** — Base de datos solo cambia por migraciones Drizzle, nunca a mano en Supabase.
- **R3** — Dos ambientes: staging y producción. Probar en staging primero.
- **R4** — Verificar backups automáticos de Supabase + export manual antes de migraciones importantes.
- **R5** — Explicar todo en español simple. Mantener `docs/decisiones.md` y `docs/glosario.md`.
- **R6** — Una tarea/funcionalidad por sesión. Actualizar este archivo al cerrar sesión.
- **R7** — Una fase cierra solo cuando su criterio de aceptación se cumple con datos reales y el equipo la usó.
- **R8** — Ante instrucciones que contradicen el plan, señalarlo y preguntar antes de ejecutar.

## Roadmap (ver plan completo para detalle)

0. Fundaciones — infra, esquema núcleo, auth.
1. Productos e inventario.
2. Clientes y pedidos.
3. Conciliaciones ⭐ (fase más importante).
4. Finanzas básicas y dashboard.
5. Alertas y link de conteo público.

## Estado actual

**Fase actual: Fase 0 — Fundaciones (en curso).**

- [x] Repositorio en GitHub: https://github.com/JContador/ERP-Fauna-para-Chile (main)
- [x] Proyecto Next.js + TypeScript + Tailwind + shadcn/ui
- [~] Proyectos Supabase (staging conectado y migrado; producción creada pero aún sin migrar)
- [x] Drizzle + migraciones del modelo de datos núcleo (12 tablas aplicadas en staging)
- [ ] Autenticación con roles
- [ ] Despliegue automático en Vercel
- [x] `docs/decisiones.md` y `docs/glosario.md`

### Notas técnicas para próximas sesiones

- El proyecto se creó con `create-next-app@latest` usando Next.js **16.2.10** (versión reciente). Hay un archivo `AGENTS.md` en la raíz que recuerda revisar `node_modules/next/dist/docs/` antes de escribir código, porque las convenciones pueden diferir de versiones anteriores conocidas. Respetar esa nota.
- Estructura de módulos creada en `src/modules/`: `inventario`, `clientes`, `pedidos`, `conciliaciones`, `finanzas`, `dashboard` (cada uno con un `.gitkeep` mientras están vacíos). Carpeta `src/db/` reservada para el esquema y config de Drizzle (aún vacía).
- shadcn/ui inicializado con configuración por defecto (`components.json`, `src/components/ui/`, `src/lib/utils.ts`).
- `npm run build` corre sin errores como verificación de que el scaffold quedó sano.
- Aún no se ha corrido `npm run dev` para revisión visual.
- Node.js/npm y Git ya están instalados en la máquina del usuario (Node v26.5.0, npm 11.17.0, Git 2.55.0).

### Base de datos (Fase 0)

- Esquema núcleo en `src/db/schema.ts` (12 tablas), conexión en `src/db/index.ts`, config en `drizzle.config.ts`.
- Comandos: `npm run db:generate` (crea archivos de migración), `npm run db:migrate` (aplica a la BD), `npm run db:studio` (explorador visual).
- Migración `0000_dear_crystal.sql` **ya aplicada en staging**. Producción todavía NO migrada.
- Proyecto Supabase staging: `fauna-staging` (ref: ersafmjngakjwzpadxbn). Producción: `fauna-produccion` (creado, sin conectar).
- **Pendiente de seguridad:** la contraseña de la BD de staging parece poco segura (nombre+fecha). Cambiarla por una aleatoria antes de producción.
- `.env.local` tiene las credenciales de STAGING. Falta un `.env` separado o estrategia para producción (se define al desplegar en Vercel).

### Próximos pasos sugeridos (resto de Fase 0)

1. Autenticación con Supabase Auth + roles (admin/operador), vinculando `usuarios` con `auth.users`.
2. Despliegue en Vercel (conectar el repo, variables de entorno, apuntar a staging).
3. Migrar el esquema también a producción y verificar backups (R4).

## Última sesión

**2026-07-16** — Fase 0 avanzando. Se conectó el proyecto a Supabase staging, se configuró Drizzle ORM, se escribió el esquema completo del modelo de datos núcleo (12 tablas, sección 5 del plan) y se aplicó la primera migración en staging (verificadas las 12 tablas). Se documentaron las decisiones de diseño del esquema en `docs/decisiones.md`. Falta: autenticación, despliegue en Vercel y migrar producción.

**2026-07-15** — Se recibió y guardó el plan maestro v1.0. Se crearon `CLAUDE.md`, `docs/decisiones.md` y `docs/glosario.md`. Se inicializó el repositorio Git local, se generó el proyecto Next.js + TypeScript + Tailwind + shadcn/ui, se creó la estructura de carpetas por módulo (`src/modules/*`), y se conectó el repositorio en GitHub (https://github.com/JContador/ERP-Fauna-para-Chile).
