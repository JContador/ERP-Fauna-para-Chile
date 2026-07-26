// =============================================================================
// Consultas de ubicaciones (solo lectura).
// -----------------------------------------------------------------------------
// Una ubicación es cualquier lugar donde puede haber stock: la bodega central,
// un punto de venta (cliente en concesión) o una feria (D1).
// =============================================================================

import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { ubicaciones, clientes } from "@/db/schema";

// Lista completa con el nombre del cliente vinculado (si es punto de venta).
// Primero las activas, luego por tipo y nombre.
export async function listarUbicaciones() {
  return db
    .select({
      id: ubicaciones.id,
      nombre: ubicaciones.nombre,
      tipo: ubicaciones.tipo,
      clienteId: ubicaciones.clienteId,
      clienteNombre: clientes.nombre,
      calle: ubicaciones.calle,
      numero: ubicaciones.numero,
      geolocalizacion: ubicaciones.geolocalizacion,
      activa: ubicaciones.activa,
    })
    .from(ubicaciones)
    .leftJoin(clientes, eq(ubicaciones.clienteId, clientes.id))
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

// Ubicaciones activas, para usarlas como origen/destino de un movimiento.
export async function listarUbicacionesActivas() {
  return db
    .select()
    .from(ubicaciones)
    .where(eq(ubicaciones.activa, true))
    .orderBy(asc(ubicaciones.tipo), asc(ubicaciones.nombre));
}

// Bodegas activas, para elegir el origen de un despacho (Fase 2, Paso 3).
export async function listarBodegasActivas() {
  return db
    .select({ id: ubicaciones.id, nombre: ubicaciones.nombre })
    .from(ubicaciones)
    .where(and(eq(ubicaciones.activa, true), eq(ubicaciones.tipo, "bodega")))
    .orderBy(asc(ubicaciones.nombre));
}

// La ubicación tipo "punto de venta" activa vinculada a un cliente, o
// undefined si el cliente no tiene ninguna vinculada todavía.
export async function obtenerUbicacionDeCliente(clienteId: string) {
  const filas = await db
    .select({ id: ubicaciones.id, nombre: ubicaciones.nombre })
    .from(ubicaciones)
    .where(
      and(
        eq(ubicaciones.activa, true),
        eq(ubicaciones.tipo, "punto_venta"),
        eq(ubicaciones.clienteId, clienteId),
      ),
    )
    .limit(1);
  return filas[0];
}
