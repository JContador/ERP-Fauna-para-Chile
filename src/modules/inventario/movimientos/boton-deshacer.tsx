// =============================================================================
// Botón "Deshacer": genera el movimiento inverso de uno existente.
// -----------------------------------------------------------------------------
// Es su propio componente porque necesita mostrar el error específico de esa
// fila si el deshacer falla (ej: por falta de stock para revertir).
// =============================================================================

"use client";

import { useActionState } from "react";
import { deshacerMovimiento } from "./actions";
import { Button } from "@/components/ui/button";

type Estado = { error?: string };

export function BotonDeshacer({ movimientoId }: { movimientoId: string }) {
  const accion = async (
    _previo: Estado | undefined,
    formData: FormData,
  ): Promise<Estado> => {
    const id = String(formData.get("id"));
    return deshacerMovimiento(id);
  };

  const [estado, formAction, enviando] = useActionState(accion, {});

  return (
    <form action={formAction} className="inline-flex flex-col items-end gap-1">
      <input type="hidden" name="id" value={movimientoId} />
      <Button type="submit" variant="ghost" size="sm" disabled={enviando}>
        {enviando ? "Deshaciendo..." : "Deshacer"}
      </Button>
      {estado?.error && (
        <p className="max-w-56 text-right text-xs text-red-600 dark:text-red-400">
          {estado.error}
        </p>
      )}
    </form>
  );
}
