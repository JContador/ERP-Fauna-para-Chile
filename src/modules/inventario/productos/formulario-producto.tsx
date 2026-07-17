// =============================================================================
// Formulario de producto (crear y editar usan este mismo componente).
// -----------------------------------------------------------------------------
// "use client": corre en el navegador para mostrar errores sin recargar la
// página. La acción (crear o editar) llega como prop desde la página.
// =============================================================================

"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EstadoFormulario } from "./actions";

type ValoresIniciales = {
  sku?: string;
  nombre?: string;
  categoria?: string | null;
  costo?: string | null;
  precio?: string | null;
  pesoGramos?: number | null;
  dimensiones?: string | null;
};

type Props = {
  accion: (
    previo: EstadoFormulario | undefined,
    formData: FormData,
  ) => Promise<EstadoFormulario>;
  valores?: ValoresIniciales;
  textoBoton: string;
};

// Un campo con su etiqueta y mensaje de error opcional.
function Campo({
  id,
  etiqueta,
  error,
  children,
}: {
  id: string;
  etiqueta: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{etiqueta}</Label>
      {children}
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

export function FormularioProducto({ accion, valores = {}, textoBoton }: Props) {
  const [estado, formAction, enviando] = useActionState(accion, {});
  const errores = estado?.errores ?? {};

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo id="sku" etiqueta="SKU *" error={errores.sku}>
          <Input
            id="sku"
            name="sku"
            defaultValue={valores.sku ?? ""}
            placeholder="Ej: POL-CHINCOL-M"
            required
          />
        </Campo>

        <Campo id="categoria" etiqueta="Categoría" error={errores.categoria}>
          <Input
            id="categoria"
            name="categoria"
            defaultValue={valores.categoria ?? ""}
            placeholder="Ej: Poleras"
          />
        </Campo>
      </div>

      <Campo id="nombre" etiqueta="Nombre *" error={errores.nombre}>
        <Input
          id="nombre"
          name="nombre"
          defaultValue={valores.nombre ?? ""}
          placeholder="Ej: Polera Chincol talla M"
          required
        />
      </Campo>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo id="costo" etiqueta="Costo (CLP)" error={errores.costo}>
          <Input
            id="costo"
            name="costo"
            inputMode="decimal"
            defaultValue={valores.costo ?? ""}
            placeholder="Ej: 4500"
          />
        </Campo>

        <Campo id="precio" etiqueta="Precio de venta (CLP)" error={errores.precio}>
          <Input
            id="precio"
            name="precio"
            inputMode="decimal"
            defaultValue={valores.precio ?? ""}
            placeholder="Ej: 12990"
          />
        </Campo>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo id="pesoGramos" etiqueta="Peso (gramos)" error={errores.pesoGramos}>
          <Input
            id="pesoGramos"
            name="pesoGramos"
            inputMode="numeric"
            defaultValue={valores.pesoGramos ?? ""}
            placeholder="Ej: 250"
          />
        </Campo>

        <Campo id="dimensiones" etiqueta="Dimensiones" error={errores.dimensiones}>
          <Input
            id="dimensiones"
            name="dimensiones"
            defaultValue={valores.dimensiones ?? ""}
            placeholder="Ej: 30x20x2 cm"
          />
        </Campo>
      </div>

      {estado?.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{estado.error}</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={enviando}>
          {enviando ? "Guardando..." : textoBoton}
        </Button>
        <Button variant="outline" render={<Link href="/productos" />}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
