// =============================================================================
// Consultas de productos (solo lectura).
// -----------------------------------------------------------------------------
// Funciones que leen el catálogo desde la base de datos. Se usan desde las
// páginas del servidor. Las escrituras están en actions.ts.
// =============================================================================

import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { productos } from "@/db/schema";

// Lista completa del catálogo: primero los activos, luego alfabético.
export async function listarProductos() {
  return db
    .select()
    .from(productos)
    .orderBy(desc(productos.activo), asc(productos.nombre));
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
