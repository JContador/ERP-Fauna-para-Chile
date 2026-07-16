// =============================================================================
// Acciones de servidor para la autenticación (login y logout).
// -----------------------------------------------------------------------------
// "use server" = este código SOLO corre en el servidor, nunca en el navegador.
// Es el lugar seguro para manejar credenciales.
// =============================================================================

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Inicia sesión con correo y contraseña.
export async function iniciarSesion(
  _estadoPrevio: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const correo = String(formData.get("correo") ?? "").trim();
  const contrasena = String(formData.get("contrasena") ?? "");

  if (!correo || !contrasena) {
    return { error: "Ingresa tu correo y contraseña." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: correo,
    password: contrasena,
  });

  if (error) {
    // Mensaje genérico para no revelar si el correo existe o no.
    return { error: "Correo o contraseña incorrectos." };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

// Cierra la sesión actual.
export async function cerrarSesion() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
