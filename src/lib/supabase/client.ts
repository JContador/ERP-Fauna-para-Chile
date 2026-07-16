// =============================================================================
// Cliente de Supabase para el NAVEGADOR (código que corre en el browser).
// -----------------------------------------------------------------------------
// Usa la "publishable key" (pública por diseño). Se usa, por ejemplo, en el
// formulario de login para iniciar sesión desde el navegador.
// =============================================================================

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
