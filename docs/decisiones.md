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
