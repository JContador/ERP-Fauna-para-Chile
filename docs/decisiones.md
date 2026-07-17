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

---

## 2026-07-16 — Catálogo de productos (Fase 1, paso 1)

Primera funcionalidad de negocio: crear, ver, editar y desactivar productos. Probada de punta a punta en el navegador (crear, editar, desactivar/activar, SKU duplicado, montos en pesos chilenos).

### Los productos no se borran: se desactivan

**Qué se decidió:** un producto puede marcarse como "inactivo" (deja de aparecer disponible), pero nunca se elimina de la base de datos.

**Por qué:** los movimientos de inventario y las líneas de pedido apuntan a productos. Si se borrara un producto, su historial quedaría roto o habría que borrarlo en cascada — justo lo contrario del espíritu de D2 (el historial es sagrado). Desactivar mantiene el historial intacto.

### El SKU se normaliza a mayúsculas y es único

**Qué se decidió:** al guardar, el SKU se convierte a mayúsculas (escribas "pol-chincol-m" o "POL-CHINCOL-M", queda igual) y no pueden existir dos productos con el mismo SKU. Si se intenta, el formulario lo explica con un mensaje claro.

**Por qué:** el SKU es el identificador que el equipo usa día a día (planillas, guías, conteos). Permitir mayúsculas/minúsculas mezcladas crearía duplicados "invisibles" (POL-1 y pol-1 parecerían distintos).

### La categoría es texto libre por ahora

**Qué se decidió:** la categoría del producto se escribe libremente (ej: "Peluches", "Poleras"), sin una lista predefinida.

**Por qué:** el equipo aún no fija su lista de categorías. Empezar con texto libre permite cargar el catálogo real ya; cuando las categorías se estabilicen, se puede convertir en una lista cerrada con sugerencias (mejora anotada en backlog).

---

## 2026-07-16 — Mejoras al módulo de productos según catálogo real

Tras revisar la tienda web real (faunaparachile.com/tienda, 66 productos), se ajustó el módulo de productos a cómo son los productos de verdad.

### Precio mayorista separado del precio de venta

**Qué se decidió:** cada producto guarda dos precios: **precio de venta** (público, el de la web) y **precio mayorista** (el que se cobra a tiendas B2B). El costo ya existía.

**Por qué:** el negocio vende por canal mayorista y retail a precios distintos (alineado con D3, canal del pedido). Tener ambos permite calcular correctamente los totales de un pedido según su canal y la rentabilidad por canal.

### Las variantes de tamaño se manejan como productos separados (Opción A)

**Qué se decidió:** un mismo diseño en distintos tamaños (ej: Gato Huiña Mini 4 cm y Grande 8 cm) se registra como **productos separados**, cada uno con su propio SKU, precio e inventario. NO se creó una estructura de "producto con variantes".

**Por qué:** el equipo eligió esta opción por simplicidad y porque calza con el modelo del plan (sección 5). En bodega, cada tamaño es un objeto físico distinto que se cuenta por separado, así que el inventario los distingue igual. Si en el futuro se necesita agrupar tamaños bajo un mismo diseño (para reportes), se puede migrar a variantes. Se recomienda una convención de SKU que deje clara la relación (ej: `HUINA-MINI`, `HUINA-GRANDE`).

### Categorías como tabla (lista fija pero extensible)

**Qué se decidió:** las categorías (Figuras 3D, Mini Fauna, Llaveros 3D, Botellas, Cuadernos de Campo, Libros, Descargables) dejaron de ser texto libre y ahora son una **tabla** (`categorias`). El producto elige su categoría de un desplegable. Hay una página `/categorias` donde el equipo puede agregar o desactivar categorías sin tocar el código.

**Por qué:** el equipo ya tiene sus 7 categorías definidas, así que un desplegable evita errores de tipeo y mantiene el catálogo ordenado; pero como tabla (no lista fija en el código), pueden ampliarla ellos mismos en el futuro.

### Estilo visual alineado con la marca

**Qué se decidió:** el ERP adoptó la identidad visual de faunaparachile.com de forma sobria: color principal **naranja terracota (#D35400)**, texto azul pizarra, títulos en tipografía serif **DM Serif Display** y cuerpo en **Inter**. Se aplicó vía variables de tema (`globals.css`), así que un cambio futuro de marca es un solo lugar.

**Por qué:** el equipo pidió mantener línea visual con su web para que el sistema se sienta parte de Fauna para Chile. Se mantuvo sobrio (es una herramienta de trabajo, no la tienda), usando el naranja solo como acento en botones y enlaces.

---

## 2026-07-17 — Ubicaciones (Fase 1, paso 2)

### Los puntos de venta se crean sin cliente vinculado todavía

**Qué se decidió:** el formulario de ubicaciones permite elegir el tipo (bodega, punto de venta, feria), pero por ahora **no** pide seleccionar un cliente, aunque el modelo de datos ya tiene el campo `cliente_id` listo para eso.

**Por qué:** el módulo de Clientes es la Fase 2, que todavía no se construye. Exigir un cliente ahora habría significado adelantar esa fase (scope creep, algo que el plan pide evitar explícitamente). Cuando se construya Clientes, se agregará el selector y se podrán vincular las ubicaciones tipo "punto de venta" existentes a su cliente correspondiente, sin perder nada de lo ya cargado.

### Las ubicaciones tampoco se borran, se desactivan

**Qué se decidió:** igual que los productos, una ubicación se desactiva en vez de eliminarse.

**Por qué:** los movimientos de inventario (Paso 3) van a referenciar ubicaciones como origen y destino. Si una ubicación se borrara, se rompería el historial de esos movimientos (mismo principio que D2).

---

## 2026-07-17 — Movimientos, cálculo de stock y "Deshacer" (Fase 1, paso 3) ⭐

El corazón técnico del sistema (D1, D2, D10). Lógica de negocio crítica separada en funciones puras y probada con tests automatizados (Vitest, `npm test`).

### El stock nunca queda negativo en el origen de un movimiento

**Qué se decidió:** antes de registrar cualquier movimiento que reste stock de una ubicación (despacho, venta, devolución, traspaso, ajuste de salida), el sistema verifica que haya stock suficiente. Si no lo hay, rechaza el movimiento con un mensaje claro (ej: "quedan 30 unidades, se intentan mover 200").

**Por qué:** la sección 5 del plan pide explícitamente que el stock nunca sea negativo en bodega. Se generalizó la regla a cualquier ubicación (no solo bodega): un número de stock negativo no tiene significado físico real y sería la señal de un error de tipeo o de un proceso mal seguido. Es más seguro bloquear y pedir que se investigue, que dejar que el sistema muestre un número imposible.

### Los errores no se editan: se corrigen con "Deshacer" (movimiento inverso)

**Qué se decidió:** siguiendo D2 al pie de la letra, un movimiento nunca se edita ni se borra. Para corregir un error, el botón "Deshacer" genera automáticamente un movimiento inverso (mismo producto y cantidad, origen/destino invertidos).

**Por qué:** así se mantiene un historial 100% confiable (ambas filas quedan, la original y su corrección), que es justo lo que después permite confiar en las conciliaciones mensuales. Hacerlo con un botón (en vez de pedir al operador que calcule el reverso a mano) evita que la rigidez del sistema se sienta como fricción innecesaria para errores de tipeo comunes.

### Las correcciones quedan marcadas para excluirlas de la analítica futura

**Qué se decidió:** el movimiento generado por "Deshacer" siempre se guarda con tipo `ajuste` y `referencia_tipo = "correccion"`, apuntando (`referencia_id`) al movimiento original que corrige.

**Por qué:** el equipo pidió poder diferenciar, más adelante, "operación real" de "correcciones", para que reportes y dashboards (Fase 4) no muestren mermas artificiales que en realidad son solo el arreglo de un error de tipeo. Cualquier reporte futuro simplemente filtra `referencia_tipo <> 'correccion'`. Además, guardar el `referencia_id` deja trazabilidad exacta de qué corrigió a qué.

### Reglas de seguridad del botón "Deshacer"

**Qué se decidió:** (1) un movimiento ya deshecho no se puede volver a deshacer (el botón desaparece); (2) una corrección tampoco se puede deshacer (para no encadenar reversos); (3) el "Deshacer" pasa por la misma validación de stock que cualquier movimiento — si el stock ya se movió de nuevo entre medio, se rechaza con un mensaje explicando por qué.

**Por qué:** protege contra el caso en que alguien deshaga un despacho después de que parte de ese stock ya se vendió en la tienda — deshacerlo a ciegas dejaría el sistema en un estado inconsistente. El mensaje de error guía a resolverlo con un ajuste manual explicado.

### Lógica de negocio separada en funciones puras (D10, sección 7 del plan)

**Qué se decidió:** el cálculo de stock (`calculo-stock.ts`) y las validaciones de forma de un movimiento (`validaciones.ts`) son funciones puras, sin acceso a la base de datos, con tests automatizados. La parte que sí toca la base de datos (consultas, verificación de stock real, inserción) vive aparte en `queries.ts` y `actions.ts`.

**Por qué:** es exactamente lo que pide la sección 7 del plan ("la lógica de negocio crítica vive en funciones puras separadas de la interfaz, para poder testearla de forma aislada") y D10 ("testing quirúrgico: solo lógica crítica"). Se agregó Vitest como herramienta de testing — liviana y estándar para proyectos Next.js/TypeScript.

---

## 2026-07-17 — Vista de stock (Fase 1, paso 4)

### El cálculo se hace en memoria (JavaScript), no con una consulta SQL de agregación

**Qué se decidió:** para mostrar el stock de todos los productos en todas las ubicaciones, el sistema trae todos los movimientos de una vez y calcula todo en una sola pasada en el servidor (función pura `calcularStockPorProductoYUbicacion`), en vez de pedirle a la base de datos que sume con SQL.

**Por qué:** para el tamaño de este negocio (decenas de productos, pocas ubicaciones), es más simple de mantener y de testear, y suficientemente rápido. Si en el futuro el volumen de movimientos crece mucho, se puede reemplazar el "adentro" de esa función por una consulta SQL de agregación sin cambiar cómo la usa el resto del sistema — quedó anotado como mejora futura, no se construye ahora (evitar over-engineering).

### El total de stock solo suma ubicaciones activas

**Qué se decidió:** la columna "Total" de la vista de stock suma el stock únicamente en las ubicaciones que están activas hoy. Si una ubicación se desactiva y le quedaba stock, ese stock deja de aparecer en el total (se avisa con una nota en la pantalla).

**Por qué:** mantiene la vista simple y consistente con las columnas que se muestran (evita un total que no coincide con la suma de lo visible). Desactivar una ubicación con stock pendiente es un caso que se resolverá formalmente con el proceso de conciliación (Fase 3); por ahora, queda documentado como una limitación conocida.
