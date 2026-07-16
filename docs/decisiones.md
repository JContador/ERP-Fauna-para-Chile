# Decisiones técnicas — ERP Fauna para Chile

Este documento registra decisiones técnicas y su razón, en lenguaje simple, para que el equipo entienda por qué el sistema se construyó así. Se actualiza cada vez que se toma una decisión relevante.

---

## 2026-07-15 — Plan maestro v1.0 recibido

Se definió el plan completo del proyecto junto al equipo de Fauna para Chile. Las decisiones D1-D10 y reglas R1-R8 quedaron fijadas en `CLAUDE.md`. No se ha escrito código todavía.

### D1 — Inventario por ubicaciones, no por "cliente tiene X unidades"

**Qué se decidió:** en vez de guardar "el cliente Tricao tiene 15 poleras" como un número que se edita, cada cliente en concesión es una "ubicación" más (igual que la bodega). El stock de cualquier ubicación se calcula sumando los movimientos que entraron y salieron de ahí.

**Por qué:** si el stock fuera un campo editable, un error de tipeo o un despacho mal registrado deja el sistema con un número que nadie puede auditar después. Calculándolo desde movimientos, siempre se puede reconstruir "cómo llegamos a este número" y detectar errores.

### D2 — Movimientos inmutables

**Qué se decidió:** ningún movimiento de inventario se edita ni se borra una vez creado. Un error se corrige registrando el movimiento contrario (por ejemplo, si se despachó de más, se registra una devolución).

**Por qué:** es el mismo principio que la contabilidad de partida doble: si se permite editar el historial, se pierde la capacidad de confiar en él. Mantener todo como un libro contable de movimientos permite auditar y confiar en el stock calculado.

### D3 — Un solo tipo de "pedido" para todos los canales

**Qué se decidió:** mayorista, concesión, ecommerce y ferias usan la misma tabla `pedidos`, diferenciada por un campo `canal`. Lo que cambia entre canales es qué movimientos de inventario genera cada uno.

**Por qué:** evita duplicar lógica de negocio (crear pedido, calcular totales, etc.) en cuatro módulos distintos. La diferencia real entre canales está en el destino del inventario, no en la estructura del pedido.

### D4 — Conciliación por conteo, no por reporte de ventas del cliente

**Qué se decidió:** al cierre de mes, el sistema le dice a la tienda "según nuestros registros, deberías tener 15 unidades" y le pide que cuente su stock físico. Las ventas del período se calculan como `stock teórico − stock contado`.

**Por qué:** hoy el cliente reporta lo que cree que vendió, sin visibilidad real de su stock, lo que genera sobrepedidos e incertidumbre. Pedirle un conteo físico (que es mucho más fácil y confiable que recordar ventas) permite que el sistema — no el cliente — calcule las ventas.

### D8 — Stack técnico

**Qué se decidió:** Next.js + TypeScript, Supabase (Postgres + Auth + Storage), Drizzle ORM con migraciones versionadas, Tailwind + shadcn/ui, Vercel + Supabase para hosting, GitHub para el código.

**Por qué:** es un stack estándar, ampliamente documentado y usado en la industria, lo que reduce el riesgo de depender solo de Claude Code para mantener el sistema (cualquier desarrollador profesional podría tomarlo). Supabase da base de datos + autenticación + almacenamiento de archivos en un solo servicio, lo que simplifica la operación para un equipo sin experiencia técnica.

### D9 — Monolito modular (no microservicios)

**Qué se decidió:** un solo proyecto de código y un solo despliegue. La organización por módulos (inventario, clientes, pedidos, etc.) se logra con estructura de carpetas, no con servicios separados.

**Por qué:** con 3-5 usuarios y un equipo que no programa, microservicios agregarían complejidad operacional (múltiples despliegues, comunicación entre servicios) sin ningún beneficio real a este tamaño.

### D10 — Testing solo en la lógica crítica

**Qué se decidió:** pruebas automatizadas obligatorias solo para cálculo de stock, deducción de ventas en conciliaciones y generación de movimientos. El resto del sistema (formularios, vistas, CRUD simple) itera sin exigir cobertura de tests.

**Por qué:** esa lógica es la que, si falla, produce números de inventario o ventas incorrectos — el error más caro posible en este sistema. El resto del código es más fácil de verificar simplemente usándolo.

---

## 2026-07-16 — Base de datos conectada y esquema núcleo creado (Fase 0)

Se conectó el proyecto a Supabase (staging), se configuró Drizzle ORM y se escribió el esquema completo del modelo de datos núcleo (sección 5 del plan) en `src/db/schema.ts`. Se generó la primera migración con las 12 tablas.

### Identificadores: se usa UUID en vez de números correlativos

**Qué se decidió:** cada fila (producto, cliente, movimiento, etc.) se identifica con un UUID (un código largo aleatorio como `a1b2c3d4-...`) generado automáticamente, en vez de números 1, 2, 3...

**Por qué:** es el estándar de Supabase y calza con cómo Supabase Auth identifica a los usuarios. Además evita exponer cuántos registros hay (con números correlativos, un cliente "N°3" revela que solo hay 3) y facilita una eventual sincronización con el ecommerce en el futuro.

### La tabla `usuarios` se apoya en Supabase Auth

**Qué se decidió:** el login (correo, contraseña, sesión) lo maneja Supabase Auth en su propia tabla interna (`auth.users`). Nuestra tabla `usuarios` guarda solo el perfil (nombre, rol admin/operador) y usa el mismo id que Supabase Auth para vincularse.

**Por qué:** no reinventamos la seguridad de autenticación (que es difícil y riesgosa de hacer bien), y a la vez mantenemos en nuestra base de datos el rol de cada persona para controlar qué puede hacer. La conexión concreta entre ambas tablas se implementa en la fase de autenticación.

### Los movimientos usan `origen` y `destino` que pueden estar vacíos

**Qué se decidió:** cada movimiento de inventario tiene un origen y un destino, y cualquiera de los dos puede quedar vacío. El stock de una ubicación se calcula como: (suma de lo que llegó a esa ubicación) − (suma de lo que salió de ella).

**Por qué:** así un mismo modelo simple cubre todos los casos sin tablas extra: una "carga inicial" tiene destino pero no origen (el stock aparece); una "venta" tiene origen pero no destino (el stock sale del sistema); un "despacho" tiene ambos (bodega → tienda). Esto hace realidad la decisión D1/D2 de calcular el stock desde los movimientos.

### Montos con dos decimales (numeric 12,2)

**Qué se decidió:** los montos de dinero (costo, precio, facturas, pagos) se guardan con capacidad de dos decimales.

**Por qué:** aunque el peso chileno no usa centavos, guardar con decimales evita problemas de redondeo y deja el sistema preparado para la visión de largo plazo de adaptarlo a otras pymes que sí podrían necesitarlos, sin cambiar la base de datos.

---

## 2026-07-16 — Autenticación con roles (Fase 0)

Se implementó el inicio de sesión con Supabase Auth y el control de roles (admin/operador). Probado de punta a punta: login correcto, login incorrecto, protección de páginas privadas y cierre de sesión.

### El "middleware" ahora se llama `proxy.ts` (Next.js 16)

**Qué se decidió:** la lógica que se ejecuta antes de cada página (refrescar la sesión y redirigir al login a quien no ha entrado) vive en `src/proxy.ts`.

**Por qué:** Next.js 16 renombró el antiguo `middleware.ts` a `proxy.ts`. El `AGENTS.md` del proyecto advierte que esta versión tiene cambios respecto a versiones anteriores; se revisó la documentación incluida en `node_modules/next/dist/docs/` antes de programar. Otro cambio de esta versión: la función `cookies()` ahora es asíncrona (se usa con `await`).

### La sesión se valida en el servidor con `getUser()`, no `getSession()`

**Qué se decidió:** para saber si alguien realmente tiene sesión válida, el servidor pregunta a Supabase con `getUser()`.

**Por qué:** `getSession()` lee la cookie sin verificarla y podría falsificarse; `getUser()` valida contra el servidor de Supabase. La autorización (quién puede entrar) se decide en el servidor, no solo en la interfaz, como pide la sección 7 del plan.

### Perfil y rol: se crean solos al registrar un usuario (trigger)

**Qué se decidió:** cuando el administrador crea un usuario nuevo, un "disparador" en la base de datos crea automáticamente su fila en `usuarios` con rol "operador". El administrador luego promueve a quien corresponda a "admin".

**Por qué:** garantiza que todo el que puede iniciar sesión tenga siempre un perfil y un rol, sin pasos manuales que se puedan olvidar. El rol admin se asigna a mano a propósito, para que nadie quede como administrador por accidente.

### Limitación conocida: perfiles huérfanos al borrar un usuario

**Qué pasa:** si se borra un usuario del login de Supabase, su fila en `usuarios` NO se borra sola (queda "huérfana"), porque nuestra tabla no está enlazada con borrado en cascada al sistema de login de Supabase.

**Por qué se deja así por ahora:** enlazar ambas tablas con cascada requiere tocar el esquema interno de Supabase (`auth.users`), lo que agrega complejidad. Con 3-5 usuarios que casi nunca se borran, no es urgente. Queda anotado como mejora futura (agregar un trigger de borrado o limpieza periódica).
