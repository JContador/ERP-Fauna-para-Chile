// =============================================================================
// Estructura común de las páginas privadas: encabezado con navegación,
// nombre del usuario y botón de cerrar sesión.
// -----------------------------------------------------------------------------
// La carpeta "(privado)" es un "grupo de rutas": organiza sin cambiar las
// direcciones web (la página principal sigue siendo "/").
// =============================================================================

import Link from "next/link";
import { redirect } from "next/navigation";
import { obtenerUsuarioActual } from "@/lib/auth";
import { cerrarSesion } from "@/app/login/actions";
import { Button } from "@/components/ui/button";

export default async function LayoutPrivado({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) redirect("/login"); // salvaguarda extra (el proxy ya protege)

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-semibold text-neutral-900 dark:text-neutral-50"
            >
              ERP Fauna
            </Link>
            <nav className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
              <Link
                href="/productos"
                className="hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Productos
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-neutral-500 sm:inline">
              {usuario.nombre ?? usuario.correo}
              {usuario.rol && (
                <span className="text-neutral-400">
                  {" "}
                  · {usuario.rol === "admin" ? "Administrador" : "Operador"}
                </span>
              )}
            </span>
            <form action={cerrarSesion}>
              <Button type="submit" variant="outline" size="sm">
                Cerrar sesión
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
