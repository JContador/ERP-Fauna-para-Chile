// =============================================================================
// Consultas de pedidos y líneas de pedido (solo lectura).
// -----------------------------------------------------------------------------
// El total de cada pedido no se guarda: se calcula sumando sus líneas
// (cantidad × precio unitario), mismo criterio que el stock (D1: los números
// derivados se calculan, no se guardan como campo editable aparte).
// =============================================================================

import { asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { pedidos, lineasPedido, clientes, productos } from "@/db/schema";

// Listado de pedidos con el nombre de su cliente y el total calculado.
// Más recientes primero.
export async function listarPedidos() {
  const filas = await db
    .select({
      id: pedidos.id,
      clienteNombre: clientes.nombre,
      canal: pedidos.canal,
      estado: pedidos.estado,
      fechaPedido: pedidos.fechaPedido,
    })
    .from(pedidos)
    .leftJoin(clientes, eq(pedidos.clienteId, clientes.id))
    .orderBy(desc(pedidos.fechaPedido));

  if (filas.length === 0) return [];

  const lineas = await db
    .select({
      pedidoId: lineasPedido.pedidoId,
      cantidad: lineasPedido.cantidad,
      precioUnitario: lineasPedido.precioUnitario,
    })
    .from(lineasPedido)
    .where(
      inArray(
        lineasPedido.pedidoId,
        filas.map((f) => f.id),
      ),
    );

  const totales = new Map<string, number>();
  for (const l of lineas) {
    const subtotal = Number(l.precioUnitario ?? 0) * l.cantidad;
    totales.set(l.pedidoId, (totales.get(l.pedidoId) ?? 0) + subtotal);
  }

  return filas.map((f) => ({ ...f, total: totales.get(f.id) ?? 0 }));
}

// Un pedido por su id, o undefined si no existe.
export async function obtenerPedido(id: string) {
  const filas = await db.select().from(pedidos).where(eq(pedidos.id, id)).limit(1);
  return filas[0];
}

// El nombre del cliente de un pedido (para mostrar en el detalle), o null si
// el pedido no tiene cliente asociado (ej: venta de feria).
export async function obtenerClienteDePedido(clienteId: string | null) {
  if (!clienteId) return null;
  const filas = await db
    .select({ id: clientes.id, nombre: clientes.nombre })
    .from(clientes)
    .where(eq(clientes.id, clienteId))
    .limit(1);
  return filas[0] ?? null;
}

// Las líneas de un pedido, con el nombre y SKU del producto.
export async function obtenerLineasPedido(pedidoId: string) {
  return db
    .select({
      id: lineasPedido.id,
      productoId: lineasPedido.productoId,
      productoNombre: productos.nombre,
      productoSku: productos.sku,
      cantidad: lineasPedido.cantidad,
      precioUnitario: lineasPedido.precioUnitario,
    })
    .from(lineasPedido)
    .leftJoin(productos, eq(lineasPedido.productoId, productos.id))
    .where(eq(lineasPedido.pedidoId, pedidoId));
}

// Productos activos con sus precios, para armar las líneas de un pedido
// (el precio se sugiere según el canal, pero siempre es editable).
export async function listarProductosParaPedido() {
  return db
    .select({
      id: productos.id,
      nombre: productos.nombre,
      sku: productos.sku,
      precio: productos.precio,
      precioMayorista: productos.precioMayorista,
    })
    .from(productos)
    .where(eq(productos.activo, true))
    .orderBy(asc(productos.nombre));
}
