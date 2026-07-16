// =============================================================================
// Cliente de Supabase para el SERVIDOR (Server Components, Server Actions).
// -----------------------------------------------------------------------------
// Lee y escribe la sesión del usuario en las cookies. En Next.js 16 la función
// cookies() es asíncrona, por eso este helper es async y usa await.
// =============================================================================

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Si se llama desde un Server Component (que no puede escribir cookies),
            // se ignora: el refresco de sesión lo maneja el proxy (proxy.ts).
          }
        },
      },
    },
  );
}
