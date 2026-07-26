// =============================================================================
// Formulario para agregar un contacto (se usa en la página de editar cliente).
// =============================================================================

"use client";

import { useActionState, useEffect, useRef } from "react";
import { crearContacto } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function FormularioContacto({ clienteId }: { clienteId: string }) {
  const accion = crearContacto.bind(null, clienteId);
  const [estado, formAction, enviando] = useActionState(accion, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado?.ok) formRef.current?.reset();
  }, [estado]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="nombre" placeholder="Nombre *" required />
        <Input name="cargo" placeholder="Cargo (ej: Encargado de tienda)" />
        <Input name="telefono" placeholder="Teléfono" />
        <Input name="correo" type="email" placeholder="Correo" />
      </div>
      {estado?.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{estado.error}</p>
      )}
      <Button type="submit" variant="outline" size="sm" disabled={enviando}>
        {enviando ? "Agregando..." : "Agregar contacto"}
      </Button>
    </form>
  );
}
