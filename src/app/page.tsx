// =============================================================================
// Página principal (privada). Solo se ve si iniciaste sesión (lo garantiza el
// proxy). Por ahora es una app "vacía" que confirma el login y muestra el rol.
// =============================================================================

import { redirect } from "next/navigation";
import { obtenerUsuarioActual } from "@/lib/auth";
import { cerrarSesion } from "@/app/login/actions";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const usuario = await obtenerUsuarioActual();

  // Salvaguarda extra (el proxy ya protege, pero por si acaso).
  if (!usuario) redirect("/login");

  return (
    <main className="min-h-screen bg-neutral-50 p-6 dark:bg-neutral-950">
      <div className="mx-auto max-w-3xl">
        <header className="flex items-center justify-between border-b border-neutral-200 pb-4 dark:border-neutral-800">
          <div>
            <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
              ERP Fauna para Chile
            </h1>
            <p className="text-sm text-neutral-500">Panel principal</p>
          </div>
          <form action={cerrarSesion}>
            <Button type="submit" variant="outline" size="sm">
              Cerrar sesión
            </Button>
          </form>
        </header>

        <section className="mt-8 rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-sm text-neutral-500">Sesión iniciada como</p>
          <p className="mt-1 text-base font-medium text-neutral-900 dark:text-neutral-50">
            {usuario.nombre ?? usuario.correo}
          </p>
          <p className="text-sm text-neutral-500">{usuario.correo}</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
            Rol:{" "}
            {usuario.rol
              ? usuario.rol === "admin"
                ? "Administrador"
                : "Operador"
              : "Sin perfil asignado"}
          </div>
          {!usuario.rol && (
            <p className="mt-4 text-sm text-amber-600 dark:text-amber-400">
              Tu usuario entró correctamente, pero todavía no tiene un perfil en la
              tabla de usuarios. Falta crear su registro con nombre y rol.
            </p>
          )}
        </section>

        <p className="mt-8 text-center text-sm text-neutral-400">
          Fase 0 — Fundaciones. Los módulos (inventario, clientes, pedidos...) se
          construyen en las próximas fases.
        </p>
      </div>
    </main>
  );
}
