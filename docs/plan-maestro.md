# Plan maestro — ERP Fauna para Chile

**Versión 1.0 — julio 2026**

Este documento es la hoja de ruta oficial del proyecto. Claude Code debe leerlo al inicio de cada sesión de trabajo (o leer el `CLAUDE.md` que lo resume) y respetar las decisiones aquí cerradas. Fue construido y validado por el equipo de Fauna para Chile junto a Claude.

## 1. Qué estamos construyendo

Un ERP ligero, modular y escalable para Fauna para Chile, empresa que diseña, fabrica y comercializa productos educativos y de conservación inspirados en la fauna chilena.

No es un CRM: es una plataforma integral de gestión que centraliza lo comercial, operacional y administrativo. Su corazón es la gestión de inventario y de clientes en concesión, que es el problema principal del negocio hoy.

Principio rector del proyecto: preferimos un producto funcional con estructura sólida que crezca con el negocio, antes que un producto perfecto que nunca llega a producción. Cada fase debe terminar con algo usable en el día a día.

Visión de largo plazo: el sistema debe poder adaptarse en el futuro a otras pymes que venden productos físicos, con modificaciones mínimas. Por eso se evita hardcodear lógica específica de Fauna, aunque el sistema opere para una sola empresa.

## 2. Contexto del negocio

- Canales de venta: (1) B2B a puntos de venta — el canal estratégico — con dos modelos: venta mayorista y venta en concesión; (2) ecommerce propio (plataforma aún no definida); (3) ferias y eventos.
- Clientes B2B: ~11 activos (ej.: Parque Tricao, Clerk Punta Arenas, Clerk Puerto Natales), con meta de crecer a cientos. Son parques, tiendas de souvenirs, museos, centros turísticos, fundaciones, librerías.
- Facturación: hoy se emite directamente en el portal del SII. El sistema NO integra con el SII; solo registra los documentos.
- Usuarios del sistema: 3 a 5 personas. Roles: administrador y operador.
- Equipo: nadie sabe programar. El desarrollo es 100% con Claude Code. El equipo quiere entender lo que se construye para aprender.

### El problema central: la concesión

Proceso actual: la tienda pide stock por WhatsApp o correo → se emite guía de despacho y se envía → al cierre de mes el cliente reporta qué vendió → se factura lo vendido y se envía reposición con nueva guía.

Problema: el cliente es quien reporta las ventas, pero muchos no tienen claridad de cuánto stock les queda. Sobrepiden, y hay incertidumbre permanente sobre el stock real en cada punto de venta.

## 3. Decisiones cerradas

Estas decisiones ya fueron discutidas y validadas. No se reabren salvo que aparezca una razón de peso, que debe explicarse al equipo antes de cambiar nada.

- **D1** — Inventario por ubicaciones. La bodega central es una ubicación; cada cliente en concesión es otra ubicación. El stock de cualquier lugar se calcula desde los movimientos, nunca se guarda como un campo editable.
- **D2** — Movimientos inmutables. Todo cambio de inventario es un movimiento (producto, origen, destino, cantidad, tipo, usuario, fecha, referencia). Los movimientos nunca se editan ni borran; un error se corrige con un movimiento inverso. La interfaz debe hacer fácil "anular y volver a registrar".
- **D3** — Pedido único diferenciado por canal. Mayorista, concesión, web y feria usan la misma entidad `pedidos` con un campo `canal`. La diferencia está en los movimientos que genera cada tipo: un pedido mayorista mueve bodega → vendido; una entrega en concesión mueve bodega → ubicación del cliente.
- **D4** — Cierre de concesión por conteo (conciliación). El sistema es la fuente de verdad del stock teórico de cada punto de venta. Al cierre, se le envía al cliente su estado de cuenta y se le pide contar su stock físico, no recordar sus ventas. Ventas del período = stock teórico − stock contado. Las diferencias no explicadas se registran como ajustes/mermas asociadas al cliente.
- **D5** — Sin multi-tenant. El sistema asume una sola empresa. Se diseña limpio y sin hardcodeos para que convertirlo a multiempresa sea un proyecto acotado en el futuro, pero no se construye ahora.
- **D6** — Finanzas solo registran. El módulo financiero registra facturas (tipo, folio SII, monto, estado) y pagos, asociados a clientes y pedidos. Sin integración tributaria. Objetivo: cuentas por cobrar y rentabilidad por cliente/producto.
- **D7** — Ecommerce fuera del MVP. Las ventas web se registran como pedidos manuales con canal "web". La futura integración (sincronización de stock y pedidos vía API de la plataforma que se elija) es un módulo posterior.
- **D8** — Stack técnico: Next.js + TypeScript (monolito modular), Supabase (Postgres + Auth + Storage), Drizzle ORM con migraciones versionadas, Tailwind CSS + shadcn/ui, hosting en Vercel + Supabase, código en GitHub.
- **D9** — Monolito modular. Un solo proyecto y un solo despliegue. La modularidad se logra con estructura de carpetas: cada módulo aislado en su carpeta, compartiendo una única base de datos.
- **D10** — Testing quirúrgico. Pruebas automatizadas obligatorias solo sobre la lógica crítica: cálculo de stock por ubicación, deducción de ventas en conciliaciones, generación de movimientos. El resto itera rápido sin tests exhaustivos.

## 4. Alcance del MVP

Incluye: catálogo de productos (SKU, categoría, costo, precio, fotos, estado), inventario por ubicaciones con libro de movimientos, clientes B2B con contactos y notas, pedidos y despachos con registro de guía, módulo de conciliaciones completo, registro de facturas y pagos (cuentas por cobrar), dashboard básico, exportación a Excel/CSV, autenticación con roles admin/operador, interfaz responsive (uso en terreno desde celular).

Fuera del MVP (backlog): pipeline comercial y registro de llamadas/correos, automatizaciones de correo, link público de conteo para clientes, sugerencia automática de reposición, integración ecommerce, alertas avanzadas, funcionalidades de IA, multiempresa.

## 5. Modelo de datos núcleo

Entidades principales y sus relaciones (el esquema definitivo se implementa en Fase 0 como migraciones Drizzle):

- **productos** — sku, nombre, categoría, costo, precio, fotos, peso/dimensiones, estado.
- **ubicaciones** — nombre, tipo (bodega / punto de venta / feria), cliente_id opcional.
- **movimientos** — producto_id, origen_id, destino_id, cantidad, tipo (despacho, venta, ajuste, carga inicial, devolución...), usuario_id, fecha, referencia (pedido o conciliación que lo generó). Tabla estrella e inmutable.
- **clientes** — nombre, tipo comercial (mayorista / concesión / ambos), región, condiciones, estado.
- **contactos** — cliente_id, nombre, cargo, teléfono, correo.
- **pedidos + lineas_pedido** — cliente_id, canal, estado, fechas; líneas con producto, cantidad, precio unitario.
- **conciliaciones + conteos** — cliente_id, fecha, tipo (presencial / remota), notas; conteos por SKU con stock teórico y stock contado; genera movimientos de venta y ajuste, y se liga a factura y pedido de reposición.
- **facturas + pagos** — cliente_id, folio SII, monto, estado; pagos con monto y fecha.
- **usuarios** — nombre, correo, rol (admin / operador).

Reglas de integridad: el stock nunca es negativo en bodega (validar antes de despachar); todo movimiento registra quién lo hizo; las ventas deducidas en una conciliación no pueden superar el stock teórico sin generar un ajuste explícito.

## 6. El proceso de conciliación (corazón del sistema)

1. Durante el mes, las tiendas piden reposición (WhatsApp/correo). Cada solicitud se registra como pedido canal "concesión". Al despachar, se registra la guía y el sistema genera los movimientos bodega → tienda. El stock teórico de la tienda queda actualizado.
2. Al pedir reposición, el operador ve en pantalla el stock teórico de esa tienda y puede responder con datos ("según sistema te quedan 15 unidades").
3. Al cierre de mes, el sistema genera el estado de cuenta de cada tienda: stock teórico por SKU. Se envía al cliente (PDF/planilla en el MVP) pidiéndole contar su stock físico.
4. El operador ingresa el conteo. El sistema calcula ventas = teórico − contado, genera los movimientos de venta, registra diferencias como ajuste/merma, y deja la conciliación lista para asociar la factura y el pedido de reposición del período.
5. El cliente recibe un reporte claro de su punto de venta — esto profesionaliza la relación comercial.

## 7. Arquitectura y estructura del proyecto

- Estructura por módulos: `/modules/inventario`, `/modules/clientes`, `/modules/pedidos`, `/modules/conciliaciones`, `/modules/finanzas`, `/modules/dashboard`. Cada módulo contiene su lógica, componentes y consultas.
- La lógica de negocio crítica (movimientos, cálculo de stock, deducción de conciliaciones) vive en funciones puras separadas de la interfaz, para poder testearla de forma aislada.
- Autenticación con Supabase Auth; autorización por roles verificada en el servidor (no solo en la interfaz).
- Fotos de productos en Supabase Storage.
- Secretos y llaves solo en variables de entorno, jamás en el código.

## 8. Reglas de trabajo (obligatorias — el equipo no programa)

- **R1** — Todo pasa por Git/GitHub. Ningún cambio directo en producción. Cada sesión de trabajo termina con cambios comiteados y descritos en lenguaje simple.
- **R2** — La base de datos solo cambia por migraciones. Nunca modificar tablas a mano en el panel de Supabase.
- **R3** — Dos ambientes. Un proyecto Supabase + despliegue para staging (pruebas) y otro para producción. Todo se prueba en staging antes de llegar a producción.
- **R4** — Respaldos. Verificar que los backups automáticos de Supabase estén activos y hacer una exportación manual antes de cualquier migración importante.
- **R5** — Claude Code explica todo. Cada cambio relevante se explica en español simple: qué se hizo, por qué, y qué archivo tocarlo afecta. Mantener `docs/decisiones.md` (decisiones técnicas y su razón) y `docs/glosario.md` (términos técnicos explicados para el equipo).
- **R6** — Sesiones acotadas. Una tarea o funcionalidad por sesión. Al cerrar, actualizar `CLAUDE.md` con el estado actual para que la próxima sesión arranque con contexto.
- **R7** — Cierre de fase. Una fase termina solo cuando sus criterios de aceptación se cumplen con datos reales y el equipo la usó. No se avanza a la siguiente con cabos sueltos.
- **R8** — Ante la duda, preguntar. Si una instrucción del equipo contradice este plan, Claude Code lo señala y explica el conflicto antes de ejecutar.

## 9. Roadmap por fases

Los tiempos asumen dedicación parcial del equipo y son referenciales.

### Fase 0 — Fundaciones (1-2 semanas)

- Objetivo: infraestructura lista y esquema núcleo creado.
- Entregables: repositorio en GitHub; proyecto Next.js + TypeScript + Tailwind + shadcn/ui; proyectos Supabase de staging y producción; Drizzle configurado con las migraciones del modelo de datos núcleo (sección 5); autenticación con roles funcionando; despliegue automático en Vercel; `CLAUDE.md`, `docs/decisiones.md` y `docs/glosario.md` creados.
- Criterio de aceptación: el equipo puede entrar con su usuario a una app vacía desplegada, en staging y producción.
- Riesgo principal: sobre-ingeniería inicial. Mitigación: solo lo listado, nada más.

### Fase 1 — Productos e inventario (2-3 semanas)

- Objetivo: catálogo real cargado y libro de movimientos operativo.
- Entregables: CRUD de productos con fotos; gestión de ubicaciones; registro de movimientos con validaciones; vista de stock por ubicación y stock total; carga del inventario inicial real como movimientos de "carga inicial" (requiere conteo físico de bodega); tests de la lógica de stock.
- Criterio de aceptación: el stock que muestra el sistema coincide con el conteo físico de bodega.
- Dependencia: Fase 0.

### Fase 2 — Clientes y pedidos (2-3 semanas)

- Objetivo: los 11 clientes reales y el flujo de despacho dentro del sistema.
- Entregables: CRUD de clientes y contactos con historial y notas; creación de pedidos por canal; flujo de despacho que registra guía y genera movimientos; cada cliente en concesión con su ubicación y stock teórico visible; usable desde celular.
- Criterio de aceptación: un despacho real a una tienda se registra completo en el sistema y el stock teórico de esa tienda queda correcto.
- Dependencia: Fase 1.

### Fase 3 — Conciliaciones (2-3 semanas) ⭐ la fase más importante

- Objetivo: el cierre mensual por conteo funcionando de punta a punta.
- Entregables: generación del estado de cuenta por tienda (PDF/planilla exportable); ingreso de conteos; cálculo de ventas por deducción con generación automática de movimientos; registro de ajustes/mermas; asociación con factura y pedido de reposición; historial de conciliaciones por cliente; tests de la lógica de deducción.
- Criterio de aceptación: un cierre de mes real con al menos 2 tiendas se hace completamente en el sistema, más rápido y con menos errores que el proceso actual.
- Riesgo: resistencia de algunos clientes al conteo. Mitigación: comunicarlo como beneficio (reporte mensual profesional de su punto de venta) y partir con las tiendas de mejor relación.
- Dependencia: Fase 2.

### Fase 4 — Finanzas básicas y dashboard (1-2 semanas)

- Objetivo: visibilidad del negocio.
- Entregables: registro de facturas y pagos; cuentas por cobrar por cliente; dashboard con ventas mensuales, ventas por canal/cliente/producto, productos más vendidos, stock crítico, rentabilidad por cliente y producto; exportación Excel/CSV de las vistas principales.
- Criterio de aceptación: el equipo deja de necesitar sus planillas actuales para responder "¿cuánto vendimos y quién nos debe?".
- Dependencia: Fase 3.

### Fase 5 — Alertas y link de conteo (2-3 semanas)

- Objetivo: reducir trabajo manual del ciclo de concesión.
- Entregables: alertas de stock crítico en tiendas y bodega; recordatorios de conciliación pendiente y clientes sin visita; link público simple (sin login) donde cada tienda ingresa su conteo desde el celular; sugerencia de reposición basada en velocidad de venta por tienda.
- Criterio de aceptación: al menos 3 tiendas hacen su conteo mensual directamente por el link.
- Dependencia: Fase 3 en producción y usada al menos un ciclo completo.

### Backlog futuro (sin orden comprometido)

Integración ecommerce (cuando se elija plataforma), automatizaciones de correo (cobranza, seguimientos, clientes inactivos), pipeline comercial para la expansión a cientos de clientes, funcionalidades de IA (resúmenes de clientes, predicción de reposiciones y ventas, chat en lenguaje natural sobre los datos — el stack elegido con Postgres + pgvector lo facilita), multiempresa.

## 10. Riesgos transversales y mitigaciones

- Equipo sin experiencia técnica → reglas R1-R8, staging obligatorio, explicaciones en lenguaje simple, respaldos.
- Errores en la lógica de stock (el riesgo más caro) → tests obligatorios en esa lógica + las propias conciliaciones actúan como verificación mensual contra la realidad.
- Scope creep → las decisiones cerradas y el backlog existen para decir "eso va después". Toda idea nueva entra al backlog, no a la fase en curso.
- Dependencia total de Claude Code → código en tecnologías estándar y dominantes, documentación en `docs/`, esquema versionado: cualquier desarrollador profesional podría tomar el proyecto si hiciera falta.

## 11. Instrucciones para Claude Code

1. Al iniciar el proyecto, crea el `CLAUDE.md` resumiendo este plan (decisiones D1-D10, reglas R1-R8, fase actual y su estado). Mantenlo actualizado al cierre de cada sesión.
2. Trabaja estrictamente fase por fase. No implementes funcionalidades de fases futuras "ya que estamos".
3. Explica cada cambio en español simple, orientado a personas que no programan pero quieren aprender. Alimenta `docs/decisiones.md` y `docs/glosario.md`.
4. Puedes proponer mejoras y cuestionar este plan cuando detectes algo mejor — pero explica el conflicto y espera la validación del equipo antes de desviarte de una decisión cerrada.
5. Antes de cualquier migración de base de datos o despliegue a producción, indica explícitamente al equipo qué va a pasar y qué respaldo corresponde hacer.
