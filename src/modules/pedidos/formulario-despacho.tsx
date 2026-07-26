// =============================================================================
// Formulario para despachar un pedido confirmado: elige la bodega de origen
// e ingresa el número de guía de despacho (la guía y la factura se siguen
// emitiendo en el portal del SII; acá solo se registra el folio).
// =============================================================================

"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EstadoDespacho } from "./actions";

type Bodega = { id: string; nombre: string };

type Props = {
  accion: (previo: EstadoDespacho | undefined, formData: FormData) => Promise<EstadoDespacho>;
  bodegas: Bodega[];
};

const claseSelect =
  "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30";

export function FormularioDespacho({ accion, bodegas }: Props) {
  const [estado, formAction, enviando] = useActionState(accion, {});
  const errores = estado?.errores ?? {};

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-xl border border-border bg-card p-5"
    >
      <p className="font-medium text-foreground">Despachar pedido</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="bodegaId">Bodega de origen *</Label>
          <select
            id="bodegaId"
            name="bodegaId"
            defaultValue={bodegas[0]?.id ?? ""}
            className={claseSelect}
            required
            disabled={bodegas.length === 0}
          >
            {bodegas.length === 0 && <option value="">— No hay bodegas activas —</option>}
            {bodegas.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nombre}
              </option>
            ))}
          </select>
          {errores.bodegaId && (
            <p className="text-sm text-red-600 dark:text-red-400">{errores.bodegaId}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="guiaDespacho">Número de guía de despacho *</Label>
          <Input
            id="guiaDespacho"
            name="guiaDespacho"
            placeholder="Folio emitido en el SII"
            required
          />
          {errores.guiaDespacho && (
            <p className="text-sm text-red-600 dark:text-red-400">{errores.guiaDespacho}</p>
          )}
        </div>
      </div>

      {estado?.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{estado.error}</p>
      )}

      <Button type="submit" disabled={enviando || bodegas.length === 0}>
        {enviando ? "Despachando..." : "Confirmar despacho"}
      </Button>
    </form>
  );
}
