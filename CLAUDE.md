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

## Autorizaciones permanentes (dadas por Javier el 2026-07-17)

Estas acciones NO requieren pedir confirmación en el chat; se ejecutan directo siempre que el paso previo (build/typecheck, o verificación end-to-end) haya pasado:

- **Subir a GitHub (`git push`)** al repositorio `JContador/ERP-Fauna-para-Chile`, rama `main`, después de cada avance verificado (build sin errores).
- **Migraciones de base de datos en STAGING** (`fauna-staging` / `npm run db:migrate` apuntando a `.env.local`).

Todo lo demás sigue requiriendo confirmación explícita en el chat, en particular:
- Migraciones o cualquier cambio en la base de datos de **PRODUCCIÓN**.
- Operaciones destructivas de Git (force push, reset --hard, etc.) — nunca se autorizan de antemano.
- Crear/modificar cuentas, servicios externos o configuración de Vercel/Supabase que no sea solo aplicar una migración ya generada.

## Roadmap (ver plan completo para detalle)

0. Fundaciones — infra, esquema núcleo, auth.
1. Productos e inventario.
2. Clientes y pedidos.
3. Conciliaciones ⭐ (fase más importante).
4. Finanzas básicas y dashboard.
5. Alertas y link de conteo público.

## Estado actual

**Fase actual: Fase 1 — Productos e inventario (en curso).**

Plan de pasos de la Fase 1 (uno por sesión, R6):
- [x] Paso 1 — Productos (catálogo CRUD) ✔ + mejoras según catálogo real (precio mayorista, categorías tabla, estilo de marca)
- [x] Paso 2 — Ubicaciones (bodega, punto de venta, feria) ✔ probado end-to-end
- [x] Paso 3 — Movimientos + cálculo de stock ⭐ con tests (D10) ✔ probado end-to-end
- [ ] Paso 4 — Vista de stock por ubicación y total
- [ ] Paso 5 — Carga inicial del inventario real (requiere conteo físico de bodega)
- [ ] Paso 6 — Fotos de productos (Supabase Storage)

Decisión de proceso (validada con el equipo): producción NO se monta aún; se desarrolla la Fase 1 completa sobre staging y producción se configura cuando el equipo vaya a usar datos reales.

### Fase 0 — Fundaciones (funcionalmente completa; producción pendiente a propósito)

- [x] Repositorio en GitHub: https://github.com/JContador/ERP-Fauna-para-Chile (main)
- [x] Proyecto Next.js + TypeScript + Tailwind + shadcn/ui
- [~] Proyectos Supabase (staging conectado y migrado; producción creada pero aún sin migrar)
- [x] Drizzle + migraciones del modelo de datos núcleo (12 tablas aplicadas en staging)
- [x] Autenticación con roles (login Supabase Auth + roles admin/operador, probado end-to-end en staging)
- [~] Despliegue automático en Vercel (desplegado apuntando a STAGING; falta ambiente de producción)
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

### Autenticación (Fase 0)

- Login con Supabase Auth (`@supabase/ssr`). Clientes en `src/lib/supabase/` (client.ts navegador, server.ts servidor, proxy.ts sesión).
- `src/proxy.ts` (en Next.js 16 reemplaza a `middleware.ts`): refresca sesión y protege rutas. Rutas públicas: `/login`, `/auth`.
- Login: `src/app/login/page.tsx` + `src/app/login/actions.ts` (server actions iniciarSesion/cerrarSesion).
- `src/lib/auth.ts`: `obtenerUsuarioActual()` une la sesión con la tabla `usuarios` para traer el rol.
- Trigger `on_auth_user_created` (migración 0001): crea el perfil en `usuarios` con rol "operador" al registrar un usuario.
- **Cómo crear el primer usuario admin:** ver `docs/como-crear-usuarios.md`.
- Limitación conocida: borrar un usuario de Supabase Auth deja su perfil huérfano en `usuarios` (ver decisiones.md).

### Despliegue (Fase 0)

- App desplegada en Vercel: https://erp-fauna-para-chile.vercel.app (proyecto Vercel importado desde el repo GitHub, auto-deploy en cada push a `main`).
- Las 4 variables de entorno están cargadas en Vercel (Production and Preview), apuntando a la base de datos de **STAGING**.
- **Importante — DATABASE_URL en Vercel usa el Transaction Pooler** (host `...pooler.supabase.com:6543`), no la conexión directa. La conexión directa no sirve bien en Vercel (serverless). El `db/index.ts` ya usa `prepare: false`, requisito del pooler.
- Verificado end-to-end en la web real: login correcto entra y muestra el rol (o sea, el pooler funciona desde Vercel).
- OJO: hoy Vercel (producción del deploy) apunta a la BD de staging. Falta separar: un ambiente Vercel para staging y otro para la BD de producción real.

### Módulo de productos (Fase 1, paso 1)

- Estructura: `src/modules/inventario/productos/` (queries, actions, formulario) y `src/modules/inventario/categorias/` (actions, formulario).
- Páginas privadas bajo grupo de rutas `src/app/(privado)/` con layout común (encabezado + nav + usuario/rol + logout). La home es un panel de tarjetas de módulos.
- Rutas: `/productos` (listado), `/productos/nuevo`, `/productos/[id]/editar`, `/categorias` (gestión).
- Productos se desactivan, no se borran. SKU único y normalizado a mayúsculas. Montos CLP con `Intl.NumberFormat("es-CL")`.
- **Dos precios:** `precio` (venta al público) y `precioMayorista` (B2B). Más `costo`.
- **Categorías = tabla** `categorias` (no enum), elegida por desplegable; se pueden agregar/desactivar desde `/categorias`. Seed inicial: `npm run db:seed:categorias` (script `scripts/seed-categorias.mjs`, idempotente).
- **Variantes de tamaño (Mini/Grande):** se modelan como productos separados (Opción A elegida por el equipo), no como variantes de un producto.

### Módulo de ubicaciones (Fase 1, paso 2)

- Estructura: `src/modules/inventario/ubicaciones/` (queries, actions, formulario).
- Rutas: `/ubicaciones` (listado), `/ubicaciones/nueva`, `/ubicaciones/[id]/editar`.
- Tipos: bodega, punto_venta, feria (enum `tipo_ubicacion` en el esquema). Se desactivan, no se borran (mismo motivo que productos: no romper el historial de movimientos).
- El campo `cliente_id` existe en el esquema pero el formulario **no lo pide todavía** (Clientes es Fase 2). Cuando se construya Clientes, agregar el selector aquí.
- `listarUbicacionesActivas()` en queries.ts queda lista para el Paso 3 (elegir origen/destino de un movimiento).

### Módulo de movimientos y stock (Fase 1, paso 3) ⭐

- Estructura: `src/modules/inventario/movimientos/`:
  - `calculo-stock.ts` + `.test.ts` — función pura, calcula stock sumando/restando movimientos.
  - `validaciones.ts` + `.test.ts` — funciones puras: valida cantidad, valida combinación tipo/origen/destino, genera el movimiento inverso (`crearMovimientoInverso`).
  - `queries.ts` — lecturas: movimientos recientes (con nombres resueltos), stock de un producto en una ubicación, ids ya corregidos.
  - `actions.ts` — `registrarMovimiento` (valida forma + stock suficiente antes de insertar) y `deshacerMovimiento` (genera el inverso, mismo chequeo de stock).
  - `formulario-movimiento.tsx` (**totalmente controlado por React** — ver nota de bug abajo) y `boton-deshacer.tsx`.
- Rutas: `/movimientos` (listado con botón Deshacer), `/movimientos/nuevo`.
- **Testing:** se agregó Vitest (`npm test`). 20 tests sobre `calculo-stock` y `validaciones`. Comando: `npm test` → `vitest run`.
- **Tipos de movimiento y combinación de ubicaciones exigida** (`validaciones.ts`): carga_inicial=solo destino; despacho/devolucion/traspaso=origen y destino distintos; venta=solo origen; ajuste=exactamente uno de los dos (con un toggle "Entrada/Salida" en el form que decide cuál).
- **"Deshacer"**: crea un movimiento con `tipo: "ajuste"`, `referencia_tipo: "correccion"`, `referencia_id: <id original>`. Reportes futuros deben filtrar `referencia_tipo <> 'correccion'` para ver solo operación real. No se puede deshacer una corrección, ni deshacer dos veces el mismo movimiento (se verifica con `listarIdsYaCorregidos`).
- **Regla de integridad:** ningún movimiento puede dejar el stock del origen en negativo (se generalizó más allá de "bodega" a cualquier ubicación). Se valida en el servidor antes de insertar, tanto al registrar como al deshacer.
- **Bug encontrado y corregido durante pruebas:** un `<select>` controlado por React + `form.reset()` nativo se desincronizan (el navegador revierte visualmente a la opción que tenía el atributo HTML `selected` en el primer render, aunque el estado de React sea otro). Solución: TODOS los campos del formulario de movimiento son controlados por `useState` y se limpian explícitamente con `setState("")`, sin usar `formRef.current.reset()`. Tener presente este patrón para futuros formularios con selects dinámicos.

### Identidad visual (marca)

- Tema alineado a faunaparachile.com: primario naranja terracota `#D35400`, texto azul pizarra, en `src/app/globals.css` (variables oklch, light + dark).
- Fuentes: cuerpo **Inter**, títulos **DM Serif Display** (via `next/font/google` en `layout.tsx`). Clase `font-heading` para títulos; variable `--font-serif`.
- Al crear pantallas nuevas, usar colores del tema (`bg-background`, `text-foreground`, `text-muted-foreground`, `bg-card`, `border-border`, `text-primary`) en vez de `neutral-*` hardcodeado, para respetar la marca y el modo oscuro.
- **Nota técnica shadcn/Base UI:** esta versión de shadcn usa Base UI (no Radix). Los botones NO soportan `asChild`; se usa `render={<Link href=... />}`. Tener presente al agregar componentes.
- **Nota técnica Drizzle:** los errores de BD llegan envueltos; el error real de Postgres está en `err.cause` (ej: `cause.code === "23505"` para unicidad violada).
- En Next.js 16, `params` de páginas dinámicas es una promesa (`await params`).

### Pendientes acumulados (no urgentes)

1. Montar producción cuando el equipo vaya a usar datos reales: migrar esquema a `fauna-produccion` (con respaldo R4) + variables/deployment de Vercel apuntando a esa BD. Recién ahí se cumple formalmente el criterio de aceptación de Fase 0.
2. Cambiar la contraseña de la BD de staging por una más segura (parece nombre+fecha).
3. Personalizar el nombre del usuario admin (hoy quedó igual a su correo).
4. Backlog UI: convertir categoría de producto en lista con sugerencias cuando el equipo la estabilice.

## Última sesión

**2026-07-17 (parte 2)** — Paso 3 de la Fase 1 (⭐ el corazón técnico): libro de movimientos con cálculo de stock, botón "Deshacer" (movimiento inverso marcado como corrección, ligado al original), y validación de stock nunca negativo. Lógica crítica en funciones puras con 20 tests automatizados (Vitest instalado, `npm test`). Probado end-to-end en navegador: carga inicial, despacho, bloqueo por stock insuficiente, deshacer, y verificación de que no se puede deshacer dos veces. Se encontró y corrigió un bug real (desincronización de un `<select>` controlado con `form.reset()` nativo — ver nota técnica arriba). Se autorizó de forma permanente (ver sección de Autorizaciones) que Claude haga push a GitHub y migre staging sin pedir confirmación cada vez. Falta: Paso 4 (vista de stock), Paso 5 (carga inicial real), Paso 6 (fotos).

**2026-07-17 (parte 1)** — Paso 2 de la Fase 1: módulo de ubicaciones completo (bodega, punto de venta, feria) con CRUD, desactivar en vez de borrar, y agregado al menú/panel principal. Probado end-to-end en navegador (crear, editar tipo, desactivar/activar). Decisión: el vínculo a cliente se deja pendiente hasta que exista el módulo de Clientes (Fase 2), para no adelantar alcance. Falta commit/push.

**2026-07-16 (parte 5)** — Mejoras al módulo de productos tras revisar la tienda real (faunaparachile.com). Se agregó **precio mayorista** (separado del de venta), se convirtió la **categoría** en tabla con desplegable + página de gestión `/categorias` (7 categorías sembradas), y se aplicó la **identidad visual de la marca** (naranja terracota, serif DM Serif Display, Inter). Variantes de tamaño = productos separados (decisión del equipo). Verificado end-to-end en navegador (login, crear producto con categoría+2 precios, listado con nuevas columnas, edición pre-llenada, agregar/desactivar categoría y que desaparezca del desplegable). Se notó que el usuario ya había creado un producto real de prueba en la app (`LL0001 Llavero Martin Pescador`) — se dejó intacto. Falta commit/push.

**2026-07-16 (parte 4)** — Fase 1 iniciada: catálogo de productos completo (listar, crear, editar, desactivar/activar) con validaciones en servidor y mensajes en español. Panel principal con tarjetas de módulos y layout privado con navegación. Usuario admin real creado por el equipo (contadorlabbe@gmail.com, verificado rol=admin). Probado end-to-end en navegador; se detectó y corrigió un bug real (error de SKU duplicado no se capturaba porque Drizzle envuelve el error en `cause`). Falta commit/push de esta parte al cierre.

**2026-07-16 (parte 3)** — App desplegada en Vercel (https://erp-fauna-para-chile.vercel.app) importando el repo de GitHub, con las 4 variables de entorno apuntando a la BD de staging vía Transaction Pooler (puerto 6543, necesario para serverless). Verificado end-to-end en la web real: el login funciona en producción. Falta para cerrar Fase 0: crear el usuario admin real y separar el ambiente de producción (BD `fauna-produccion`).

**2026-07-16 (parte 2)** — Autenticación con roles lista. Login con Supabase Auth (`@supabase/ssr`), protección de rutas con `proxy.ts` (Next.js 16 renombró middleware→proxy; `cookies()` ahora es async), roles admin/operador vía tabla `usuarios` + trigger que crea el perfil al registrar. Probado end-to-end en el navegador (login ok, login incorrecto, logout, protección). Documentado en decisiones.md y glosario.md. Falta de Fase 0: despliegue en Vercel y migrar producción.

**2026-07-16 (parte 1)** — Se conectó el proyecto a Supabase staging, se configuró Drizzle ORM, se escribió el esquema completo del modelo de datos núcleo (12 tablas, sección 5 del plan) y se aplicó la primera migración en staging (verificadas las 12 tablas). Se documentaron las decisiones de diseño del esquema en `docs/decisiones.md`.

**2026-07-15** — Se recibió y guardó el plan maestro v1.0. Se crearon `CLAUDE.md`, `docs/decisiones.md` y `docs/glosario.md`. Se inicializó el repositorio Git local, se generó el proyecto Next.js + TypeScript + Tailwind + shadcn/ui, se creó la estructura de carpetas por módulo (`src/modules/*`), y se conectó el repositorio en GitHub (https://github.com/JContador/ERP-Fauna-para-Chile).
