// =============================================================================
// Formulario para agregar una categoría nueva (se usa en la página /categorias).
// =============================================================================

"use client";

import { useActionState, useEffect, useRef } from "react";
import { crearCategoria } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function FormularioCategoria() {
  const [estado, formAction, enviando] = useActionState(crearCategoria, {});
  const formRef = useRef<HTMLFormElement>(null);

  // Al crear con éxito, limpiamos el campo para agregar otra rápido.
  useEffect(() => {
    if (estado?.ok) formRef.current?.reset();
  }, [estado]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-start gap-3">
      <div className="flex-1 min-w-48">
        <Input name="nombre" placeholder="Nueva categoría (ej: Stickers)" required />
        {estado?.error && (
          <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
            {estado.error}
          </p>
        )}
      </div>
      <Button type="submit" disabled={enviando}>
        {enviando ? "Agregando..." : "Agregar categoría"}
      </Button>
    </form>
  );
}
