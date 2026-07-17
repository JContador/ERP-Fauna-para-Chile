// =============================================================================
// Acciones de categorías: crear y activar/desactivar.
// -----------------------------------------------------------------------------
// Permite al equipo ampliar la lista de categorías sin tocar el código.
// =============================================================================

"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { categorias } from "@/db/schema";
import { obtenerUsuarioActual } from "@/lib/auth";

export type EstadoCategoria = { error?: string; ok?: boolean };

export async function crearCategoria(
  _previo: EstadoCategoria | undefined,
  formData: FormData,
): Promise<EstadoCategoria> {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) return { error: "Tu sesión expiró. Vuelve a iniciar sesión." };

  const nombre = String(formData.get("nombre") ?? "").trim();
  if (!nombre) return { error: "Escribe el nombre de la categoría." };

  try {
    await db.insert(categorias).values({ nombre });
  } catch (err) {
    const codigo =
      (err as { code?: string })?.code ??
      (err as { cause?: { code?: string } })?.cause?.code;
    if (codigo === "23505") {
      return { error: `La categoría "${nombre}" ya existe.` };
    }
    throw err;
  }

  revalidatePath("/categorias");
  revalidatePath("/productos");
  return { ok: true };
}

export async function cambiarEstadoCategoria(id: string, activa: boolean) {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) return;

  await db.update(categorias).set({ activa }).where(eq(categorias.id, id));
  revalidatePath("/categorias");
  revalidatePath("/productos");
}
