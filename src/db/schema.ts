// =============================================================================
// Esquema de la base de datos — ERP Fauna para Chile
// -----------------------------------------------------------------------------
// Este archivo describe TODAS las tablas del sistema en código (Drizzle ORM).
// A partir de aquí se generan las "migraciones" que crean las tablas reales
// en la base de datos (regla R2: la base de datos SOLO cambia por migraciones).
//
// Corresponde al "modelo de datos núcleo" de la sección 5 del plan maestro.
// Principios que refleja este esquema:
//   - D1: el inventario se maneja por UBICACIONES (bodega y clientes son ubicaciones).
//   - D2: los MOVIMIENTOS son el libro inmutable; el stock se CALCULA desde ellos.
//   - D3: un solo tipo de PEDIDO, diferenciado por "canal".
//   - D4: las CONCILIACIONES cierran la concesión por conteo físico.
// =============================================================================

import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  numeric,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

// -----------------------------------------------------------------------------
// Enums (listas de valores permitidos para ciertos campos)
// -----------------------------------------------------------------------------

// Rol del usuario dentro del sistema.
export const rolUsuario = pgEnum("rol_usuario", ["admin", "operador"]);

// Tipo de ubicación: la bodega central, un punto de venta (cliente) o una feria.
export const tipoUbicacion = pgEnum("tipo_ubicacion", [
  "bodega",
  "punto_venta",
  "feria",
]);

// Cómo compra un cliente: al por mayor, en concesión, o ambas modalidades.
export const tipoComercial = pgEnum("tipo_comercial", [
  "mayorista",
  "concesion",
  "ambos",
]);

// Canal de un pedido (D3). La diferencia real entre canales está en los
// movimientos de inventario que genera cada uno, no en la estructura del pedido.
export const canalPedido = pgEnum("canal_pedido", [
  "mayorista",
  "concesion",
  "web",
  "feria",
]);

// Estado por el que pasa un pedido a lo largo de su vida.
export const estadoPedido = pgEnum("estado_pedido", [
  "borrador",
  "confirmado",
  "despachado",
  "cancelado",
]);

// Tipo de movimiento de inventario. Determina el "por qué" de cada movimiento.
export const tipoMovimiento = pgEnum("tipo_movimiento", [
  "carga_inicial", // stock que entra al sistema por primera vez (conteo de bodega)
  "despacho", // envío de bodega a una tienda (concesión) — no es venta todavía
  "venta", // producto que sale del sistema (deducido en conciliación o venta directa)
  "ajuste", // correcciones y mermas
  "devolucion", // producto que vuelve de una tienda a bodega
  "traspaso", // movimiento entre dos ubicaciones internas
]);

// De qué documento nació un movimiento (para poder rastrearlo).
// "correccion" = movimiento inverso generado por el botón "Deshacer"; los
// reportes de operación real deben excluir estos (referencia_tipo <> 'correccion').
export const referenciaMovimiento = pgEnum("referencia_movimiento", [
  "pedido",
  "conciliacion",
  "manual",
  "correccion",
]);

// Modalidad de la conciliación: contada en persona o reportada a distancia.
export const tipoConciliacion = pgEnum("tipo_conciliacion", [
  "presencial",
  "remota",
]);

// Estado de una factura para el control de cuentas por cobrar.
export const estadoFactura = pgEnum("estado_factura", [
  "emitida",
  "pagada_parcial",
  "pagada",
  "anulada",
]);

// -----------------------------------------------------------------------------
// usuarios — personas que usan el sistema (3 a 5 personas)
// -----------------------------------------------------------------------------
// El "id" coincide con el id del usuario en Supabase Auth (auth.users). Así, el
// login lo maneja Supabase y esta tabla guarda los datos de perfil y el rol.
// La conexión con auth.users se implementa en la fase de autenticación.
export const usuarios = pgTable("usuarios", {
  id: uuid("id").primaryKey(),
  nombre: text("nombre").notNull(),
  correo: text("correo").notNull().unique(),
  rol: rolUsuario("rol").notNull().default("operador"),
  activo: boolean("activo").notNull().default(true),
  creadoEn: timestamp("creado_en", { withTimezone: true }).notNull().defaultNow(),
});

// -----------------------------------------------------------------------------
// clientes — puntos de venta B2B (parques, tiendas, museos, librerías...)
// -----------------------------------------------------------------------------
export const clientes = pgTable("clientes", {
  id: uuid("id").primaryKey().defaultRandom(),
  nombre: text("nombre").notNull(),
  tipoComercial: tipoComercial("tipo_comercial").notNull(),
  region: text("region"),
  condiciones: text("condiciones"), // condiciones comerciales acordadas (texto libre)
  estado: boolean("estado").notNull().default(true), // true = activo
  notas: text("notas"),
  creadoEn: timestamp("creado_en", { withTimezone: true }).notNull().defaultNow(),
});

// -----------------------------------------------------------------------------
// contactos — personas de contacto dentro de cada cliente
// -----------------------------------------------------------------------------
export const contactos = pgTable("contactos", {
  id: uuid("id").primaryKey().defaultRandom(),
  clienteId: uuid("cliente_id")
    .notNull()
    .references(() => clientes.id),
  nombre: text("nombre").notNull(),
  cargo: text("cargo"),
  telefono: text("telefono"),
  correo: text("correo"),
  creadoEn: timestamp("creado_en", { withTimezone: true }).notNull().defaultNow(),
});

// -----------------------------------------------------------------------------
// categorias — lista de categorías de producto (Figuras 3D, Llaveros, etc.)
// -----------------------------------------------------------------------------
// Es una tabla (no una lista fija en el código) para que el equipo pueda
// agregar categorías nuevas en el futuro sin tocar el código.
export const categorias = pgTable("categorias", {
  id: uuid("id").primaryKey().defaultRandom(),
  nombre: text("nombre").notNull().unique(),
  activa: boolean("activa").notNull().default(true),
  creadoEn: timestamp("creado_en", { withTimezone: true }).notNull().defaultNow(),
});

// -----------------------------------------------------------------------------
// productos — catálogo (SKU, categoría, costo, precios, fotos, estado)
// -----------------------------------------------------------------------------
export const productos = pgTable("productos", {
  id: uuid("id").primaryKey().defaultRandom(),
  sku: text("sku").notNull().unique(),
  nombre: text("nombre").notNull(),
  categoriaId: uuid("categoria_id").references(() => categorias.id),
  costo: numeric("costo", { precision: 12, scale: 2 }), // lo que cuesta producirlo
  precio: numeric("precio", { precision: 12, scale: 2 }), // precio de venta al público
  precioMayorista: numeric("precio_mayorista", { precision: 12, scale: 2 }), // precio a tiendas B2B
  fotos: text("fotos").array(), // URLs de las fotos en Supabase Storage
  pesoGramos: integer("peso_gramos"),
  dimensiones: text("dimensiones"), // texto libre, ej: "10x20x5 cm"
  activo: boolean("activo").notNull().default(true),
  creadoEn: timestamp("creado_en", { withTimezone: true }).notNull().defaultNow(),
});

// -----------------------------------------------------------------------------
// ubicaciones — cualquier lugar donde puede haber stock (D1)
// -----------------------------------------------------------------------------
// La bodega central es una ubicación tipo "bodega". Cada cliente en concesión
// tiene su propia ubicación tipo "punto_venta" ligada a su cliente_id.
export const ubicaciones = pgTable("ubicaciones", {
  id: uuid("id").primaryKey().defaultRandom(),
  nombre: text("nombre").notNull(),
  tipo: tipoUbicacion("tipo").notNull(),
  clienteId: uuid("cliente_id").references(() => clientes.id), // opcional: solo para puntos de venta
  activa: boolean("activa").notNull().default(true),
  creadoEn: timestamp("creado_en", { withTimezone: true }).notNull().defaultNow(),
});

// -----------------------------------------------------------------------------
// pedidos — un pedido de cualquier canal (D3)
// -----------------------------------------------------------------------------
export const pedidos = pgTable("pedidos", {
  id: uuid("id").primaryKey().defaultRandom(),
  clienteId: uuid("cliente_id").references(() => clientes.id), // opcional (ej: feria sin cliente)
  canal: canalPedido("canal").notNull(),
  estado: estadoPedido("estado").notNull().default("borrador"),
  guiaDespacho: text("guia_despacho"), // número de la guía de despacho al despachar
  fechaPedido: timestamp("fecha_pedido", { withTimezone: true }).notNull().defaultNow(),
  fechaDespacho: timestamp("fecha_despacho", { withTimezone: true }),
  notas: text("notas"),
  creadoEn: timestamp("creado_en", { withTimezone: true }).notNull().defaultNow(),
});

// -----------------------------------------------------------------------------
// lineas_pedido — el detalle de cada pedido (qué productos y cuántos)
// -----------------------------------------------------------------------------
export const lineasPedido = pgTable("lineas_pedido", {
  id: uuid("id").primaryKey().defaultRandom(),
  pedidoId: uuid("pedido_id")
    .notNull()
    .references(() => pedidos.id),
  productoId: uuid("producto_id")
    .notNull()
    .references(() => productos.id),
  cantidad: integer("cantidad").notNull(),
  precioUnitario: numeric("precio_unitario", { precision: 12, scale: 2 }),
});

// -----------------------------------------------------------------------------
// movimientos — el LIBRO INMUTABLE de inventario (D2). Tabla estrella.
// -----------------------------------------------------------------------------
// El stock de cualquier ubicación se CALCULA sumando estos movimientos, nunca
// se guarda como un número editable. Un error NO se edita: se corrige con un
// movimiento inverso.
//
// origen_id y destino_id pueden ser nulos:
//   - carga_inicial: origen = null,   destino = bodega   (el stock entra)
//   - despacho:      origen = bodega,  destino = tienda
//   - venta:         origen = tienda,  destino = null     (el stock sale del sistema)
//   - devolucion:    origen = tienda,  destino = bodega
//
// Stock de una ubicación = SUM(cantidad donde destino = ubicación)
//                        − SUM(cantidad donde origen  = ubicación)
export const movimientos = pgTable("movimientos", {
  id: uuid("id").primaryKey().defaultRandom(),
  productoId: uuid("producto_id")
    .notNull()
    .references(() => productos.id),
  origenId: uuid("origen_id").references(() => ubicaciones.id),
  destinoId: uuid("destino_id").references(() => ubicaciones.id),
  cantidad: integer("cantidad").notNull(), // siempre positiva; el sentido lo dan origen/destino
  tipo: tipoMovimiento("tipo").notNull(),
  usuarioId: uuid("usuario_id").references(() => usuarios.id), // quién lo registró
  referenciaTipo: referenciaMovimiento("referencia_tipo").notNull().default("manual"),
  referenciaId: uuid("referencia_id"), // id del pedido o conciliación que lo generó
  fecha: timestamp("fecha", { withTimezone: true }).notNull().defaultNow(),
});

// -----------------------------------------------------------------------------
// conciliaciones — el cierre mensual por conteo de cada tienda (D4) ⭐
// -----------------------------------------------------------------------------
export const conciliaciones = pgTable("conciliaciones", {
  id: uuid("id").primaryKey().defaultRandom(),
  clienteId: uuid("cliente_id")
    .notNull()
    .references(() => clientes.id),
  fecha: timestamp("fecha", { withTimezone: true }).notNull().defaultNow(),
  tipo: tipoConciliacion("tipo").notNull(),
  notas: text("notas"),
  facturaId: uuid("factura_id"), // factura del período (se liga después)
  pedidoReposicionId: uuid("pedido_reposicion_id").references(() => pedidos.id),
  creadoEn: timestamp("creado_en", { withTimezone: true }).notNull().defaultNow(),
});

// -----------------------------------------------------------------------------
// conteos — el detalle de una conciliación: por cada SKU, teórico vs contado
// -----------------------------------------------------------------------------
// ventas del período = stock_teorico − stock_contado (lo calcula el sistema).
export const conteos = pgTable("conteos", {
  id: uuid("id").primaryKey().defaultRandom(),
  conciliacionId: uuid("conciliacion_id")
    .notNull()
    .references(() => conciliaciones.id),
  productoId: uuid("producto_id")
    .notNull()
    .references(() => productos.id),
  stockTeorico: integer("stock_teorico").notNull(), // lo que el sistema dice que debería haber
  stockContado: integer("stock_contado"), // lo que la tienda contó físicamente
});

// -----------------------------------------------------------------------------
// facturas — registro de documentos tributarios (D6: solo registra, no integra SII)
// -----------------------------------------------------------------------------
export const facturas = pgTable("facturas", {
  id: uuid("id").primaryKey().defaultRandom(),
  clienteId: uuid("cliente_id")
    .notNull()
    .references(() => clientes.id),
  folioSii: text("folio_sii"), // número de folio emitido en el portal del SII
  monto: numeric("monto", { precision: 12, scale: 2 }).notNull(),
  estado: estadoFactura("estado").notNull().default("emitida"),
  fechaEmision: timestamp("fecha_emision", { withTimezone: true }).notNull().defaultNow(),
  creadoEn: timestamp("creado_en", { withTimezone: true }).notNull().defaultNow(),
});

// -----------------------------------------------------------------------------
// pagos — abonos a las facturas (para el control de cuentas por cobrar)
// -----------------------------------------------------------------------------
export const pagos = pgTable("pagos", {
  id: uuid("id").primaryKey().defaultRandom(),
  facturaId: uuid("factura_id")
    .notNull()
    .references(() => facturas.id),
  monto: numeric("monto", { precision: 12, scale: 2 }).notNull(),
  fecha: timestamp("fecha", { withTimezone: true }).notNull().defaultNow(),
  creadoEn: timestamp("creado_en", { withTimezone: true }).notNull().defaultNow(),
});
