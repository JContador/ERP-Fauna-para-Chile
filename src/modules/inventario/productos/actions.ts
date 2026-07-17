// =============================================================================
// Acciones de productos (escrituras): crear, editar, activar/desactivar.
// -----------------------------------------------------------------------------
// "use server": este código corre solo en el servidor. Valida los datos antes
// de tocar la base de datos y devuelve mensajes de error en español simple.
//
// Nota (D2-espíritu): los productos NO se borran, se desactivan. Así nunca se
// rompe el historial de movimientos que los referencia.
// =============================================================================

"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { productos } from "@/db/schema";
import { obtenerUsuarioActual } from "@/lib/auth";

export type EstadoFormulario = {
  error?: string;
  // Errores por campo, para marcarlos en el formulario.
  errores?: Record<string, string>;
};

// Lee y valida los campos del formulario. Devuelve los valores listos para
// guardar, o una lista de errores por campo.
function validarCampos(formData: FormData) {
  const errores: Record<string, string> = {};

  const sku = String(formData.get("sku") ?? "").trim().toUpperCase();
  const nombre = String(formData.get("nombre") ?? "").trim();
  const categoriaId = String(formData.get("categoriaId") ?? "").trim();
  const costoTexto = String(formData.get("costo") ?? "").trim();
  const precioTexto = String(formData.get("precio") ?? "").trim();
  const precioMayoristaTexto = String(formData.get("precioMayorista") ?? "").trim();
  const pesoTexto = String(formData.get("pesoGramos") ?? "").trim();
  const dimensiones = String(formData.get("dimensiones") ?? "").trim();

  if (!sku) errores.sku = "El SKU es obligatorio.";
  else if (!/^[A-Z0-9][A-Z0-9\-_.]*$/.test(sku))
    errores.sku = "Usa solo letras, números, guiones o puntos (sin espacios).";

  if (!nombre) errores.nombre = "El nombre es obligatorio.";

  // Los montos aceptan solo números (pesos chilenos, sin puntos de miles).
  const parsearMonto = (texto: string, campo: string): string | null => {
    if (!texto) return null;
    const limpio = texto.replace(",", ".");
    const numero = Number(limpio);
    if (Number.isNaN(numero) || numero < 0) {
      errores[campo] = "Debe ser un número igual o mayor a 0, sin puntos de miles.";
      return null;
    }
    return limpio;
  };

  const costo = parsearMonto(costoTexto, "costo");
  const precio = parsearMonto(precioTexto, "precio");
  const precioMayorista = parsearMonto(precioMayoristaTexto, "precioMayorista");

  let pesoGramos: number | null = null;
  if (pesoTexto) {
    const peso = Number(pesoTexto);
    if (!Number.isInteger(peso) || peso < 0) {
      errores.pesoGramos = "Debe ser un número entero de gramos (ej: 250).";
    } else {
      pesoGramos = peso;
    }
  }

  return {
    errores,
    valores: {
      sku,
      nombre,
      categoriaId: categoriaId || null,
      costo,
      precio,
      precioMayorista,
      pesoGramos,
      dimensiones: dimensiones || null,
    },
  };
}

// ¿El error de la base de datos es "SKU repetido"? (violación de unicidad,
// código 23505 de Postgres). Drizzle envuelve el error original dentro de
// "cause", así que revisamos ambos niveles.
function esSkuDuplicado(err: unknown): boolean {
  const codigoDe = (e: unknown): string | undefined =>
    typeof e === "object" && e !== null && "code" in e
      ? (e as { code?: string }).code
      : undefined;

  if (codigoDe(err) === "23505") return true;
  const causa = (err as { cause?: unknown })?.cause;
  return codigoDe(causa) === "23505";
}

// Crear un producto nuevo.
export async function crearProducto(
  _previo: EstadoFormulario | undefined,
  formData: FormData,
): Promise<EstadoFormulario> {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) return { error: "Tu sesión expiró. Vuelve a iniciar sesión." };

  const { errores, valores } = validarCampos(formData);
  if (Object.keys(errores).length > 0) {
    return { error: "Revisa los campos marcados.", errores };
  }

  try {
    await db.insert(productos).values(valores);
  } catch (err) {
    if (esSkuDuplicado(err)) {
      return {
        error: "Revisa los campos marcados.",
        errores: { sku: `Ya existe un producto con el SKU "${valores.sku}".` },
      };
    }
    throw err;
  }

  revalidatePath("/productos");
  redirect("/productos");
}

// Editar un producto existente.
export async function editarProducto(
  id: string,
  _previo: EstadoFormulario | undefined,
  formData: FormData,
): Promise<EstadoFormulario> {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) return { error: "Tu sesión expiró. Vuelve a iniciar sesión." };

  const { errores, valores } = validarCampos(formData);
  if (Object.keys(errores).length > 0) {
    return { error: "Revisa los campos marcados.", errores };
  }

  try {
    await db.update(productos).set(valores).where(eq(productos.id, id));
  } catch (err) {
    if (esSkuDuplicado(err)) {
      return {
        error: "Revisa los campos marcados.",
        errores: { sku: `Ya existe otro producto con el SKU "${valores.sku}".` },
      };
    }
    throw err;
  }

  revalidatePath("/productos");
  redirect("/productos");
}

// Activar o desactivar un producto (nunca se borra, ver nota de arriba).
export async function cambiarEstadoProducto(id: string, activo: boolean) {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) return;

  await db.update(productos).set({ activo }).where(eq(productos.id, id));
  revalidatePath("/productos");
}
