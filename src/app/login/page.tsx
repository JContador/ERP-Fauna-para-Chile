// =============================================================================
// Página de inicio de sesión (/login).
// -----------------------------------------------------------------------------
// Formulario simple de correo + contraseña. Al enviarlo, llama a la acción de
// servidor "iniciarSesion". Si hay error, lo muestra bajo el formulario.
// =============================================================================

"use client";

import { useActionState } from "react";
import { iniciarSesion } from "./actions";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [estado, formAction, enviando] = useActionState(iniciarSesion, {});

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 p-4 dark:bg-neutral-950">
      <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">
            ERP Fauna para Chile
          </h1>
          <p className="mt-1 text-sm text-neutral-500">Inicia sesión para continuar</p>
        </div>

        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="correo"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Correo
            </label>
            <input
              id="correo"
              name="correo"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50 dark:focus:border-neutral-400"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="contrasena"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Contraseña
            </label>
            <input
              id="contrasena"
              name="contrasena"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-50 dark:focus:border-neutral-400"
            />
          </div>

          {estado?.error && (
            <p className="text-sm text-red-600 dark:text-red-400">{estado.error}</p>
          )}

          <Button type="submit" className="w-full" disabled={enviando}>
            {enviando ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </main>
  );
}
