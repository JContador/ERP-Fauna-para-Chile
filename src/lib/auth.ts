// =============================================================================
// Ayudantes de autorización — obtener el usuario actual y su rol.
// -----------------------------------------------------------------------------
// Combina la sesión de Supabase Auth (quién eres) con nuestra tabla "usuarios"
// (tu perfil y tu rol admin/operador). Todo se verifica EN EL SERVIDOR.
// =============================================================================

import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { usuarios } from "@/db/schema";

export type UsuarioActual = {
  id: string;
  correo: string;
  nombre: string | null;
  rol: "admin" | "operador" | null;
};

// Devuelve el usuario autenticado con su rol, o null si no hay sesión.
export async function obtenerUsuarioActual(): Promise<UsuarioActual | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Buscamos el perfil/rol en nuestra tabla usuarios (ligada por el mismo id).
  const perfil = await db
    .select()
    .from(usuarios)
    .where(eq(usuarios.id, user.id))
    .limit(1);

  const fila = perfil[0];

  return {
    id: user.id,
    correo: user.email ?? "",
    nombre: fila?.nombre ?? null,
    rol: fila?.rol ?? null,
  };
}
