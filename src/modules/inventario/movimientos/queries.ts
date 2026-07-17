// =============================================================================
// Consultas de movimientos y stock (solo lectura).
// =============================================================================

import { and, desc, eq, or } from "drizzle-orm";
import { db } from "@/db";
import { movimientos, productos, ubicaciones, usuarios } from "@/db/schema";
import { calcularStock } from "./calculo-stock";

// Movimientos recientes, con nombres legibles (producto, ubicaciones, usuario)
// en vez de solo ids, para mostrar en el listado.
export async function listarMovimientosRecientes(limite = 50) {
  const origenUbicacion = ubicaciones;
  const destinoUbicacion = ubicaciones;

  const filas = await db
    .select({
      id: movimientos.id,
      productoId: movimientos.productoId,
      productoNombre: productos.nombre,
      productoSku: productos.sku,
      origenId: movimientos.origenId,
      destinoId: movimientos.destinoId,
      cantidad: movimientos.cantidad,
      tipo: movimientos.tipo,
      referenciaTipo: movimientos.referenciaTipo,
      referenciaId: movimientos.referenciaId,
      usuarioNombre: usuarios.nombre,
      fecha: movimientos.fecha,
    })
    .from(movimientos)
    .innerJoin(productos, eq(movimientos.productoId, productos.id))
    .leftJoin(usuarios, eq(movimientos.usuarioId, usuarios.id))
    .orderBy(desc(movimientos.fecha))
    .limit(limite);

  // Los nombres de las ubicaciones se resuelven aparte para evitar un join
  // ambiguo (origen y destino apuntan a la misma tabla).
  const todasUbicaciones = await db.select().from(ubicaciones);
  const nombrePorId = new Map(todasUbicaciones.map((u) => [u.id, u.nombre]));

  return filas.map((f) => ({
    ...f,
    origenNombre: f.origenId ? (nombrePorId.get(f.origenId) ?? "—") : null,
    destinoNombre: f.destinoId ? (nombrePorId.get(f.destinoId) ?? "—") : null,
  }));
}

// Ids de movimientos que YA fueron deshechos (tienen una corrección que los
// referencia). Sirve para ocultar el botón "Deshacer" en esas filas.
export async function listarIdsYaCorregidos(): Promise<Set<string>> {
  const filas = await db
    .select({ referenciaId: movimientos.referenciaId })
    .from(movimientos)
    .where(eq(movimientos.referenciaTipo, "correccion"));
  return new Set(filas.map((f) => f.referenciaId).filter((id): id is string => !!id));
}

// Un movimiento por su id (para poder generar su inverso al "Deshacer").
export async function obtenerMovimiento(id: string) {
  const filas = await db.select().from(movimientos).where(eq(movimientos.id, id)).limit(1);
  return filas[0];
}

// Stock actual de un producto en una ubicación específica.
export async function obtenerStock(productoId: string, ubicacionId: string): Promise<number> {
  const filas = await db
    .select({
      origenId: movimientos.origenId,
      destinoId: movimientos.destinoId,
      cantidad: movimientos.cantidad,
    })
    .from(movimientos)
    .where(
      and(
        eq(movimientos.productoId, productoId),
        or(eq(movimientos.origenId, ubicacionId), eq(movimientos.destinoId, ubicacionId)),
      ),
    );

  return calcularStock(filas, ubicacionId);
}
