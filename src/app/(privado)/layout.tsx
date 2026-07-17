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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="font-heading text-lg text-primary"
            >
              Fauna para Chile
            </Link>
            <nav className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link href="/productos" className="hover:text-foreground">
                Productos
              </Link>
              <Link href="/categorias" className="hover:text-foreground">
                Categorías
              </Link>
              <Link href="/ubicaciones" className="hover:text-foreground">
                Ubicaciones
              </Link>
              <Link href="/movimientos" className="hover:text-foreground">
                Movimientos
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {usuario.nombre ?? usuario.correo}
              {usuario.rol && (
                <span className="opacity-70">
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
