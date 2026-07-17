// =============================================================================
// Acciones de movimientos: registrar uno nuevo, y "Deshacer" (D2, D10).
// -----------------------------------------------------------------------------
// La validación de FORMA (qué combinación de origen/destino tiene sentido)
// vive en validaciones.ts (lógica pura, testeada). Aquí se agrega la validación
// que sí necesita la base de datos: que el origen no quede con stock negativo.
// =============================================================================

"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { movimientos } from "@/db/schema";
import { obtenerUsuarioActual } from "@/lib/auth";
import {
  validarCantidad,
  validarCombinacionUbicaciones,
  crearMovimientoInverso,
  type TipoMovimiento,
} from "./validaciones";
import { obtenerStock, obtenerMovimiento } from "./queries";

export type EstadoFormulario = {
  error?: string;
  errores?: Record<string, string>;
  ok?: boolean;
};

const TIPOS_VALIDOS: TipoMovimiento[] = [
  "carga_inicial",
  "despacho",
  "venta",
  "ajuste",
  "devolucion",
  "traspaso",
];

// Verifica que un movimiento con origen no deje esa ubicación en stock
// negativo para ese producto. Devuelve un mensaje de error o null si está OK.
async function validarStockSuficiente(
  productoId: string,
  origenId: string | null,
  cantidad: number,
): Promise<string | null> {
  if (!origenId) return null;
  const stockActual = await obtenerStock(productoId, origenId);
  if (cantidad > stockActual) {
    return `No hay stock suficiente en el origen: quedan ${stockActual} unidades, se intentan mover ${cantidad}.`;
  }
  return null;
}

export async function registrarMovimiento(
  _previo: EstadoFormulario | undefined,
  formData: FormData,
): Promise<EstadoFormulario> {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) return { error: "Tu sesión expiró. Vuelve a iniciar sesión." };

  const productoId = String(formData.get("productoId") ?? "").trim();
  const tipo = String(formData.get("tipo") ?? "").trim() as TipoMovimiento;
  const origenId = String(formData.get("origenId") ?? "").trim() || null;
  const destinoId = String(formData.get("destinoId") ?? "").trim() || null;
  const cantidadTexto = String(formData.get("cantidad") ?? "").trim();

  const errores: Record<string, string> = {};

  if (!productoId) errores.productoId = "Elige un producto.";
  if (!TIPOS_VALIDOS.includes(tipo)) errores.tipo = "Elige un tipo de movimiento válido.";

  const cantidad = Number(cantidadTexto);
  const validacionCantidad = validarCantidad(cantidad);
  if (!validacionCantidad.valido) errores.cantidad = validacionCantidad.error;

  if (Object.keys(errores).length === 0) {
    const validacionCombinacion = validarCombinacionUbicaciones(tipo, origenId, destinoId);
    if (!validacionCombinacion.valido) {
      errores.tipo = validacionCombinacion.error;
    }
  }

  if (Object.keys(errores).length > 0) {
    return { error: "Revisa los campos marcados.", errores };
  }

  const errorStock = await validarStockSuficiente(productoId, origenId, cantidad);
  if (errorStock) {
    return { error: errorStock, errores: { origenId: errorStock } };
  }

  await db.insert(movimientos).values({
    productoId,
    origenId,
    destinoId,
    cantidad,
    tipo,
    usuarioId: usuario.id,
    referenciaTipo: "manual",
  });

  revalidatePath("/movimientos");
  return { ok: true };
}

// Genera el movimiento inverso de uno existente ("Deshacer"), respetando la
// misma validación de stock que cualquier otro movimiento.
export async function deshacerMovimiento(
  movimientoId: string,
): Promise<{ error?: string }> {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) return { error: "Tu sesión expiró. Vuelve a iniciar sesión." };

  const original = await obtenerMovimiento(movimientoId);
  if (!original) return { error: "El movimiento ya no existe." };
  if (original.referenciaTipo === "correccion") {
    return { error: "No se puede deshacer una corrección (evita cadenas de reversos)." };
  }

  const inverso = crearMovimientoInverso(original);

  const errorStock = await validarStockSuficiente(
    inverso.productoId,
    inverso.origenId,
    inverso.cantidad,
  );
  if (errorStock) {
    return {
      error: `No se puede deshacer: ${errorStock} (puede que ese stock ya se haya movido de nuevo).`,
    };
  }

  await db.insert(movimientos).values({ ...inverso, usuarioId: usuario.id });

  revalidatePath("/movimientos");
  return {};
}
