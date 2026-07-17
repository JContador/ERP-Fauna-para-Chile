// =============================================================================
// Consultas de ubicaciones (solo lectura).
// -----------------------------------------------------------------------------
// Una ubicación es cualquier lugar donde puede haber stock: la bodega central,
// un punto de venta (cliente en concesión) o una feria (D1).
// =============================================================================

import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { ubicaciones } from "@/db/schema";

// Lista completa: primero las activas, luego por tipo y nombre.
export async function listarUbicaciones() {
  return db
    .select()
    .from(ubicaciones)
    .orderBy(desc(ubicaciones.activa), asc(ubicaciones.tipo), asc(ubicaciones.nombre));
}

// Una ubicación por su id, o undefined si no existe.
export async function obtenerUbicacion(id: string) {
  const filas = await db
    .select()
    .from(ubicaciones)
    .where(eq(ubicaciones.id, id))
    .limit(1);
  return filas[0];
}

// Ubicaciones activas, para usarlas como origen/destino de un movimiento
// (se necesitará en el Paso 3).
export async function listarUbicacionesActivas() {
  return db
    .select()
    .from(ubicaciones)
    .where(eq(ubicaciones.activa, true))
    .orderBy(asc(ubicaciones.tipo), asc(ubicaciones.nombre));
}
