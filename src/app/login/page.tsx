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
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="font-heading text-2xl text-primary">
            Fauna para Chile
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Inicia sesión para continuar
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="correo"
              className="text-sm font-medium text-foreground"
            >
              Correo
            </label>
            <input
              id="correo"
              name="correo"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-ring focus:ring-3 focus:ring-ring/40"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="contrasena"
              className="text-sm font-medium text-foreground"
            >
              Contraseña
            </label>
            <input
              id="contrasena"
              name="contrasena"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-ring focus:ring-3 focus:ring-ring/40"
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
