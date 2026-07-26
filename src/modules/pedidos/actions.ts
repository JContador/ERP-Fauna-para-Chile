// =============================================================================
// Acciones de pedidos (escrituras): crear, editar y cambiar de estado.
// -----------------------------------------------------------------------------
// Un pedido solo se puede editar mientras está en estado "borrador". Una vez
// confirmado (o más adelante, despachado), el pedido queda fijo: para
// corregirlo hay que cancelarlo y crear uno nuevo. El despacho (que genera
// movimientos de inventario) es el Paso 3 de esta fase — todavía no existe.
// =============================================================================

"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { pedidos, lineasPedido, movimientos } from "@/db/schema";
import { obtenerUsuarioActual } from "@/lib/auth";
import { obtenerStock } from "@/modules/inventario/movimientos/queries";
import { obtenerUbicacionDeCliente } from "@/modules/inventario/ubicaciones/queries";

export type EstadoFormulario = {
  error?: string;
  errores?: Record<string, string>;
};

const CANALES_VALIDOS = ["mayorista", "concesion", "web", "feria"] as const;
type Canal = (typeof CANALES_VALIDOS)[number];

function validarCabecera(formData: FormData) {
  const errores: Record<string, string> = {};

  const clienteId = String(formData.get("clienteId") ?? "").trim();
  const canal = String(formData.get("canal") ?? "").trim();
  const notas = String(formData.get("notas") ?? "").trim();

  if (!CANALES_VALIDOS.includes(canal as Canal)) {
    errores.canal = "Elige un canal válido.";
  }

  return {
    errores,
    valores: {
      clienteId: clienteId || null,
      canal: canal as Canal,
      notas: notas || null,
    },
  };
}

// Lee las líneas del pedido desde el formulario (naming indexado: producto_0,
// cantidad_0, precio_0, producto_1, ...). Las filas sin producto elegido se
// ignoran (fila vacía que el usuario no llegó a completar).
function validarLineas(formData: FormData) {
  const errores: Record<string, string> = {};
  const numLineas = parseInt(String(formData.get("numLineas") ?? "0"), 10) || 0;

  const lineas: { productoId: string; cantidad: number; precioUnitario: string | null }[] = [];

  for (let i = 0; i < numLineas; i++) {
    const productoId = String(formData.get(`producto_${i}`) ?? "").trim();
    if (!productoId) continue;

    const cantidadTexto = String(formData.get(`cantidad_${i}`) ?? "").trim();
    const cantidad = parseInt(cantidadTexto, 10);
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      errores.lineas = "Revisa las cantidades: deben ser números enteros mayores a 0.";
      continue;
    }

    // Montos "a la chilena": el punto separa los miles (ej: "12.990").
    const precioTexto = String(formData.get(`precio_${i}`) ?? "").trim();
    let precioUnitario: string | null = null;
    if (precioTexto) {
      const limpio = precioTexto.replace(/\./g, "").replace(",", ".");
      if (Number.isNaN(Number(limpio)) || Number(limpio) < 0) {
        errores.lineas = "Revisa los precios: deben ser números válidos.";
        continue;
      }
      precioUnitario = limpio;
    }

    lineas.push({ productoId, cantidad, precioUnitario });
  }

  if (lineas.length === 0 && !errores.lineas) {
    errores.lineas = "Agrega al menos una línea con producto y cantidad.";
  }

  return { errores, lineas };
}

export async function crearPedido(
  _previo: EstadoFormulario | undefined,
  formData: FormData,
): Promise<EstadoFormulario> {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) return { error: "Tu sesión expiró. Vuelve a iniciar sesión." };

  const { errores: erroresCabecera, valores } = validarCabecera(formData);
  const { errores: erroresLineas, lineas } = validarLineas(formData);
  const errores = { ...erroresCabecera, ...erroresLineas };
  if (Object.keys(errores).length > 0) {
    return { error: "Revisa los campos marcados.", errores };
  }

  const idPedido = await db.transaction(async (tx) => {
    const [pedido] = await tx.insert(pedidos).values(valores).returning({ id: pedidos.id });
    await tx.insert(lineasPedido).values(
      lineas.map((l) => ({
        pedidoId: pedido.id,
        productoId: l.productoId,
        cantidad: l.cantidad,
        precioUnitario: l.precioUnitario,
      })),
    );
    return pedido.id;
  });

  revalidatePath("/pedidos");
  redirect(`/pedidos/${idPedido}`);
}

export async function editarPedido(
  id: string,
  _previo: EstadoFormulario | undefined,
  formData: FormData,
): Promise<EstadoFormulario> {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) return { error: "Tu sesión expiró. Vuelve a iniciar sesión." };

  const actual = await db
    .select({ estado: pedidos.estado })
    .from(pedidos)
    .where(eq(pedidos.id, id))
    .limit(1);
  if (!actual[0]) return { error: "El pedido ya no existe." };
  if (actual[0].estado !== "borrador") {
    return { error: "Este pedido ya no está en borrador y no se puede editar." };
  }

  const { errores: erroresCabecera, valores } = validarCabecera(formData);
  const { errores: erroresLineas, lineas } = validarLineas(formData);
  const errores = { ...erroresCabecera, ...erroresLineas };
  if (Object.keys(errores).length > 0) {
    return { error: "Revisa los campos marcados.", errores };
  }

  await db.transaction(async (tx) => {
    await tx.update(pedidos).set(valores).where(eq(pedidos.id, id));
    await tx.delete(lineasPedido).where(eq(lineasPedido.pedidoId, id));
    await tx.insert(lineasPedido).values(
      lineas.map((l) => ({
        pedidoId: id,
        productoId: l.productoId,
        cantidad: l.cantidad,
        precioUnitario: l.precioUnitario,
      })),
    );
  });

  revalidatePath("/pedidos");
  revalidatePath(`/pedidos/${id}`);
  redirect(`/pedidos/${id}`);
}

// Un borrador pasa a confirmado (deja de poder editarse).
export async function confirmarPedido(id: string) {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) return;

  await db
    .update(pedidos)
    .set({ estado: "confirmado" })
    .where(and(eq(pedidos.id, id), eq(pedidos.estado, "borrador")));

  revalidatePath("/pedidos");
  revalidatePath(`/pedidos/${id}`);
}

// Un pedido no despachado (borrador o confirmado) se puede cancelar.
export async function cancelarPedido(id: string) {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) return;

  await db
    .update(pedidos)
    .set({ estado: "cancelado" })
    .where(and(eq(pedidos.id, id), inArray(pedidos.estado, ["borrador", "confirmado"])));

  revalidatePath("/pedidos");
  revalidatePath(`/pedidos/${id}`);
}

// -----------------------------------------------------------------------------
// Despacho (Paso 3): la guía y la factura se emiten en el portal del SII como
// siempre; acá solo se registra el folio y se generan los movimientos de
// inventario según el canal del pedido:
//   - concesión: "despacho" desde la bodega elegida hacia la ubicación del
//     cliente (el stock sigue siendo del negocio hasta la conciliación).
//   - cualquier otro canal (mayorista/web/feria): "venta" directa desde la
//     bodega (el stock sale del sistema de inmediato).
// -----------------------------------------------------------------------------

export type EstadoDespacho = { error?: string; errores?: Record<string, string> };

export async function despacharPedido(
  id: string,
  _previo: EstadoDespacho | undefined,
  formData: FormData,
): Promise<EstadoDespacho> {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) return { error: "Tu sesión expiró. Vuelve a iniciar sesión." };

  const filasPedido = await db.select().from(pedidos).where(eq(pedidos.id, id)).limit(1);
  const pedido = filasPedido[0];
  if (!pedido) return { error: "El pedido ya no existe." };
  if (pedido.estado !== "confirmado") {
    return { error: "Solo se puede despachar un pedido confirmado." };
  }

  const bodegaId = String(formData.get("bodegaId") ?? "").trim();
  const guiaDespacho = String(formData.get("guiaDespacho") ?? "").trim();

  const errores: Record<string, string> = {};
  if (!bodegaId) errores.bodegaId = "Elige la bodega de origen.";
  if (!guiaDespacho) errores.guiaDespacho = "Ingresa el número de guía de despacho.";

  let destinoId: string | null = null;
  const tipoMovimiento: "despacho" | "venta" = pedido.canal === "concesion" ? "despacho" : "venta";

  if (pedido.canal === "concesion") {
    if (!pedido.clienteId) {
      errores.bodegaId = "Este pedido de concesión no tiene un cliente asociado.";
    } else {
      const ubicacionCliente = await obtenerUbicacionDeCliente(pedido.clienteId);
      if (!ubicacionCliente) {
        errores.bodegaId =
          "El cliente no tiene una ubicación de punto de venta vinculada. Ve a Ubicaciones y vincúlala primero.";
      } else {
        destinoId = ubicacionCliente.id;
      }
    }
  }

  if (Object.keys(errores).length > 0) {
    return { error: "Revisa los campos marcados.", errores };
  }

  const lineas = await db
    .select({ productoId: lineasPedido.productoId, cantidad: lineasPedido.cantidad })
    .from(lineasPedido)
    .where(eq(lineasPedido.pedidoId, id));
  if (lineas.length === 0) return { error: "Este pedido no tiene líneas para despachar." };

  // Se agrupa por producto antes de validar el stock: si el mismo producto
  // aparece en más de una línea, hay que exigir la suma total, no cada línea
  // por separado contra el mismo stock actual (dejaría pasar sobregiros).
  const cantidadPorProducto = new Map<string, number>();
  for (const l of lineas) {
    cantidadPorProducto.set(l.productoId, (cantidadPorProducto.get(l.productoId) ?? 0) + l.cantidad);
  }

  for (const [productoId, cantidad] of cantidadPorProducto) {
    const stockActual = await obtenerStock(productoId, bodegaId);
    if (cantidad > stockActual) {
      return {
        error: `No hay stock suficiente en la bodega elegida: quedan ${stockActual} unidades de un producto del pedido, se necesitan ${cantidad}.`,
      };
    }
  }

  await db.transaction(async (tx) => {
    await tx.insert(movimientos).values(
      lineas.map((l) => ({
        productoId: l.productoId,
        origenId: bodegaId,
        destinoId,
        cantidad: l.cantidad,
        tipo: tipoMovimiento,
        usuarioId: usuario.id,
        referenciaTipo: "pedido" as const,
        referenciaId: id,
      })),
    );
    await tx
      .update(pedidos)
      .set({ estado: "despachado", guiaDespacho, fechaDespacho: new Date() })
      .where(eq(pedidos.id, id));
  });

  revalidatePath("/pedidos");
  revalidatePath(`/pedidos/${id}`);
  revalidatePath("/movimientos");
  revalidatePath("/stock");
  return {};
}
