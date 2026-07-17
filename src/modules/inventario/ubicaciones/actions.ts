// =============================================================================
// Acciones de ubicaciones (escrituras): crear, editar, activar/desactivar.
// -----------------------------------------------------------------------------
// Nota (espíritu D2): las ubicaciones NO se borran, se desactivan. Los
// movimientos de inventario (Paso 3) referencian ubicaciones y su historial
// no debe romperse.
// =============================================================================

"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { ubicaciones } from "@/db/schema";
import { obtenerUsuarioActual } from "@/lib/auth";

export type EstadoFormulario = {
  error?: string;
  errores?: Record<string, string>;
};

const TIPOS_VALIDOS = ["bodega", "punto_venta", "feria"] as const;
type TipoUbicacion = (typeof TIPOS_VALIDOS)[number];

function validarCampos(formData: FormData) {
  const errores: Record<string, string> = {};

  const nombre = String(formData.get("nombre") ?? "").trim();
  const tipo = String(formData.get("tipo") ?? "").trim();

  if (!nombre) errores.nombre = "El nombre es obligatorio.";

  if (!TIPOS_VALIDOS.includes(tipo as TipoUbicacion)) {
    errores.tipo = "Elige un tipo de ubicación válido.";
  }

  return {
    errores,
    valores: { nombre, tipo: tipo as TipoUbicacion },
  };
}

export async function crearUbicacion(
  _previo: EstadoFormulario | undefined,
  formData: FormData,
): Promise<EstadoFormulario> {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) return { error: "Tu sesión expiró. Vuelve a iniciar sesión." };

  const { errores, valores } = validarCampos(formData);
  if (Object.keys(errores).length > 0) {
    return { error: "Revisa los campos marcados.", errores };
  }

  await db.insert(ubicaciones).values(valores);

  revalidatePath("/ubicaciones");
  redirect("/ubicaciones");
}

export async function editarUbicacion(
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

  await db.update(ubicaciones).set(valores).where(eq(ubicaciones.id, id));

  revalidatePath("/ubicaciones");
  redirect("/ubicaciones");
}

export async function cambiarEstadoUbicacion(id: string, activa: boolean) {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) return;

  await db.update(ubicaciones).set({ activa }).where(eq(ubicaciones.id, id));
  revalidatePath("/ubicaciones");
}
