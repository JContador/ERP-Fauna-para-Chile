// =============================================================================
// Consultas de productos y categorías (solo lectura).
// -----------------------------------------------------------------------------
// Funciones que leen el catálogo desde la base de datos. Se usan desde las
// páginas del servidor. Las escrituras están en actions.ts.
// =============================================================================

import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { productos, categorias } from "@/db/schema";

// Lista del catálogo con el nombre de su categoría (unida por categoria_id).
// Primero los activos, luego alfabético.
export async function listarProductos() {
  return db
    .select({
      id: productos.id,
      sku: productos.sku,
      nombre: productos.nombre,
      categoriaNombre: categorias.nombre,
      costo: productos.costo,
      precio: productos.precio,
      precioMayorista: productos.precioMayorista,
      activo: productos.activo,
    })
    .from(productos)
    .leftJoin(categorias, eq(productos.categoriaId, categorias.id))
    .orderBy(desc(productos.activo), asc(productos.nombre));
}

// Productos activos, para desplegables donde no tiene sentido elegir uno
// desactivado (ej: registrar un movimiento nuevo).
export async function listarProductosActivos() {
  return db
    .select({ id: productos.id, sku: productos.sku, nombre: productos.nombre })
    .from(productos)
    .where(eq(productos.activo, true))
    .orderBy(asc(productos.nombre));
}

// Un producto por su id, o undefined si no existe.
export async function obtenerProducto(id: string) {
  const filas = await db
    .select()
    .from(productos)
    .where(eq(productos.id, id))
    .limit(1);
  return filas[0];
}

// Lista de categorías activas, para los desplegables. Alfabético.
export async function listarCategorias() {
  return db
    .select()
    .from(categorias)
    .where(eq(categorias.activa, true))
    .orderBy(asc(categorias.nombre));
}

// Todas las categorías (activas e inactivas), para la página de gestión.
export async function listarTodasLasCategorias() {
  return db
    .select()
    .from(categorias)
    .orderBy(desc(categorias.activa), asc(categorias.nombre));
}
