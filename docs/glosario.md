# Glosario técnico — ERP Fauna para Chile

Términos técnicos usados en el proyecto, explicados en simple para el equipo. Se va ampliando a medida que aparecen conceptos nuevos.

**ERP** — "Enterprise Resource Planning". Sistema que centraliza la gestión de una empresa (inventario, clientes, pedidos, finanzas) en una sola plataforma, en vez de tener planillas o WhatsApp sueltos para cada cosa.

**Repositorio (Git/GitHub)** — la carpeta donde vive todo el código del proyecto, con historial de cada cambio. GitHub es el servicio donde se guarda ese repositorio en internet, para que el equipo (y Claude Code) pueda acceder a él y colaborar.

**Migración (de base de datos)** — un archivo que describe un cambio a la estructura de la base de datos (por ejemplo, "agregar la tabla productos"). En vez de modificar la base de datos a mano, se escribe la migración, se revisa, y se aplica. Así queda un historial de cómo fue evolucionando la base de datos.

**Staging / Producción** — dos copias separadas del sistema. "Staging" es donde se prueban los cambios antes de que el equipo los use de verdad. "Producción" es el sistema real que usa el equipo día a día. Todo cambio se prueba primero en staging.

**Supabase** — el servicio que aloja la base de datos (Postgres), maneja el login de usuarios (Auth) y guarda archivos como fotos de productos (Storage).

**Vercel** — el servicio donde queda publicada la aplicación web para que el equipo la use desde el navegador o el celular.

**Drizzle (ORM)** — la herramienta que traduce entre el código (TypeScript) y la base de datos (Postgres), y que genera las migraciones.

**Monolito modular** — un solo proyecto de código (no varios sistemas separados), pero organizado en carpetas por función (inventario, clientes, pedidos, etc.) para que cada área sea fácil de encontrar y mantener.

**Movimiento (de inventario)** — un registro de que una cantidad de un producto se movió de un lugar a otro (por ejemplo, de bodega a la tienda Tricao). El stock de cualquier lugar es la suma de sus movimientos, nunca un número que se edita directamente.

**Ubicación** — cualquier lugar donde puede haber stock: la bodega central, una tienda en concesión, o una feria. Cada cliente en concesión tiene su propia ubicación.

**Conciliación** — el proceso mensual de cierre con una tienda en concesión: se compara el stock teórico (lo que el sistema calcula que debería tener) contra el stock contado (lo que la tienda cuenta físicamente), y la diferencia se registra como ventas o como ajuste/merma.

**Stock teórico** — lo que el sistema calcula que debería haber en una ubicación, según los movimientos registrados.

**SKU** — código único que identifica un producto específico (por ejemplo, una polera talla M de un diseño en particular).

**Rol (admin/operador)** — el tipo de usuario dentro del sistema. Define qué puede hacer cada persona (por ejemplo, un operador registra despachos, un administrador además puede ver reportes financieros).
