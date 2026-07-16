// =============================================================================
// proxy.ts — se ejecuta antes de cada página (en Next.js 16 esto reemplaza al
// antiguo "middleware.ts"). Aquí solo delegamos al helper que maneja la sesión.
// =============================================================================

import { type NextRequest } from "next/server";
import { actualizarSesion } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return await actualizarSesion(request);
}

export const config = {
  // Se ejecuta en todas las rutas EXCEPTO archivos estáticos e imágenes,
  // para no bloquear el CSS, JS ni las imágenes.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
