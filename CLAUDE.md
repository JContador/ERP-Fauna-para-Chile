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

- [ ] Repositorio en GitHub (repo Git local ya existe, falta conectar remoto)
- [x] Proyecto Next.js + TypeScript + Tailwind + shadcn/ui
- [ ] Proyectos Supabase (staging y producción)
- [ ] Drizzle + migraciones del modelo de datos núcleo
- [ ] Autenticación con roles
- [ ] Despliegue automático en Vercel
- [x] `docs/decisiones.md` y `docs/glosario.md`

### Notas técnicas para próximas sesiones

- El proyecto se creó con `create-next-app@latest` usando Next.js **16.2.10** (versión reciente). Hay un archivo `AGENTS.md` en la raíz que recuerda revisar `node_modules/next/dist/docs/` antes de escribir código, porque las convenciones pueden diferir de versiones anteriores conocidas. Respetar esa nota.
- Estructura de módulos creada en `src/modules/`: `inventario`, `clientes`, `pedidos`, `conciliaciones`, `finanzas`, `dashboard` (cada uno con un `.gitkeep` mientras están vacíos). Carpeta `src/db/` reservada para el esquema y config de Drizzle (aún vacía).
- shadcn/ui inicializado con configuración por defecto (`components.json`, `src/components/ui/`, `src/lib/utils.ts`).
- `npm run build` corre sin errores como verificación de que el scaffold quedó sano.
- Aún no se ha corrido `npm run dev` para revisión visual, ni se ha hecho el primer commit.
- Node.js/npm y Git ya están instalados en la máquina del usuario (Node v26.5.0, npm 11.17.0, Git 2.55.0).

## Última sesión

**2026-07-15** — Se recibió y guardó el plan maestro v1.0. Se crearon `CLAUDE.md`, `docs/decisiones.md` y `docs/glosario.md`. Se inicializó el repositorio Git local, se generó el proyecto Next.js + TypeScript + Tailwind + shadcn/ui, y se creó la estructura de carpetas por módulo (`src/modules/*`). Falta: primer commit, conectar GitHub, y decidir con el equipo las cuentas de Supabase/Vercel a usar.
