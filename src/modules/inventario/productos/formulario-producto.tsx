// =============================================================================
// Formulario de producto (crear y editar usan este mismo componente).
// -----------------------------------------------------------------------------
// "use client": corre en el navegador para mostrar errores sin recargar la
// página. La acción (crear o editar) llega como prop desde la página.
//
// El SKU se sugiere automáticamente según la categoría (feedback del equipo),
// pero siempre es editable: si la persona escribe algo a mano, se respeta y
// no se vuelve a pisar aunque cambie de categoría después.
// =============================================================================

"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EstadoFormulario } from "./actions";
import { sugerirSku } from "./actions";

type ValoresIniciales = {
  sku?: string;
  nombre?: string;
  categoriaId?: string | null;
  costo?: string | null;
  precio?: string | null;
  precioMayorista?: string | null;
  dimensiones?: string | null;
  descripcion?: string | null;
};

type Categoria = { id: string; nombre: string };

type Props = {
  accion: (
    previo: EstadoFormulario | undefined,
    formData: FormData,
  ) => Promise<EstadoFormulario>;
  categorias: Categoria[];
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

const claseSelect =
  "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30";

const claseTextarea =
  "flex min-h-20 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30";

export function FormularioProducto({
  accion,
  categorias,
  valores = {},
  textoBoton,
}: Props) {
  const [estado, formAction, enviando] = useActionState(accion, {});
  const errores = estado?.errores ?? {};

  const esEdicion = Boolean(valores.sku);
  const [sku, setSku] = useState(valores.sku ?? "");
  const [categoriaId, setCategoriaId] = useState(valores.categoriaId ?? "");
  const skuEditadoManualmente = useRef(esEdicion); // si ya trae SKU, no lo tocamos

  // Sugiere un SKU al elegir/cambiar la categoría, solo si la persona no ha
  // escrito el suyo propio (y solo al crear, nunca al editar uno existente).
  useEffect(() => {
    if (esEdicion || skuEditadoManualmente.current) return;
    let vigente = true;
    sugerirSku(categoriaId || null).then((sugerido) => {
      if (vigente) setSku(sugerido);
    });
    return () => {
      vigente = false;
    };
  }, [categoriaId, esEdicion]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo id="sku" etiqueta="SKU *" error={errores.sku}>
          <Input
            id="sku"
            name="sku"
            value={sku}
            onChange={(e) => {
              skuEditadoManualmente.current = true;
              setSku(e.target.value);
            }}
            placeholder="Se sugiere solo según la categoría"
            required
          />
        </Campo>

        <Campo id="categoriaId" etiqueta="Categoría" error={errores.categoriaId}>
          <select
            id="categoriaId"
            name="categoriaId"
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            className={claseSelect}
          >
            <option value="">— Sin categoría —</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </Campo>
      </div>

      <Campo id="nombre" etiqueta="Nombre *" error={errores.nombre}>
        <Input
          id="nombre"
          name="nombre"
          defaultValue={valores.nombre ?? ""}
          placeholder="Ej: Gato Huiña (8 cm)"
          required
        />
      </Campo>

      <div className="grid gap-4 sm:grid-cols-3">
        <Campo id="costo" etiqueta="Costo (CLP)" error={errores.costo}>
          <Input
            id="costo"
            name="costo"
            inputMode="decimal"
            defaultValue={valores.costo ?? ""}
            placeholder="Ej: 1.500"
          />
        </Campo>

        <Campo
          id="precioMayorista"
          etiqueta="Precio mayorista (CLP)"
          error={errores.precioMayorista}
        >
          <Input
            id="precioMayorista"
            name="precioMayorista"
            inputMode="decimal"
            defaultValue={valores.precioMayorista ?? ""}
            placeholder="Ej: 2.500"
          />
        </Campo>

        <Campo id="precio" etiqueta="Precio de venta (CLP)" error={errores.precio}>
          <Input
            id="precio"
            name="precio"
            inputMode="decimal"
            defaultValue={valores.precio ?? ""}
            placeholder="Ej: 4.000"
          />
        </Campo>
      </div>

      <Campo id="dimensiones" etiqueta="Dimensiones" error={errores.dimensiones}>
        <Input
          id="dimensiones"
          name="dimensiones"
          defaultValue={valores.dimensiones ?? ""}
          placeholder="Ej: 8x4x3 cm"
        />
      </Campo>

      <Campo id="descripcion" etiqueta="Descripción" error={errores.descripcion}>
        <textarea
          id="descripcion"
          name="descripcion"
          defaultValue={valores.descripcion ?? ""}
          placeholder="Información adicional sobre el producto (opcional)"
          className={claseTextarea}
        />
      </Campo>

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
