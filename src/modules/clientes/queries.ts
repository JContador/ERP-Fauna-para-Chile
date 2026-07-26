// =============================================================================
// Consultas de clientes y contactos (solo lectura).
// =============================================================================

import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { clientes, contactos } from "@/db/schema";

// Lista completa: primero los activos, luego alfabético.
export async function listarClientes() {
  return db
    .select()
    .from(clientes)
    .orderBy(desc(clientes.estado), asc(clientes.nombre));
}

// Clientes activos, para desplegables (ej: elegir cliente al despachar un pedido).
export async function listarClientesActivos() {
  return db
    .select({ id: clientes.id, nombre: clientes.nombre })
    .from(clientes)
    .where(eq(clientes.estado, true))
    .orderBy(asc(clientes.nombre));
}

// Un cliente por su id, o undefined si no existe.
export async function obtenerCliente(id: string) {
  const filas = await db.select().from(clientes).where(eq(clientes.id, id)).limit(1);
  return filas[0];
}

// Contactos de un cliente, más recientes primero.
export async function listarContactos(clienteId: string) {
  return db
    .select()
    .from(contactos)
    .where(eq(contactos.clienteId, clienteId))
    .orderBy(desc(contactos.creadoEn));
}
