// =============================================================================
// Formulario de pedido (crear y editar usan este mismo componente).
// -----------------------------------------------------------------------------
// Todo el formulario es controlado por React (mismo motivo que el formulario
// de movimientos: evita que un <select> se desincronice del estado real).
// Las líneas se envían con nombres indexados (producto_0, cantidad_0,
// precio_0, ...) más un campo oculto "numLineas", en vez de serializar JSON.
//
// Al elegir un producto en una línea, se sugiere el precio unitario según el
// canal (precio mayorista si el canal es "mayorista", precio de venta en los
// demás casos), pero siempre queda editable.
// =============================================================================

"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EstadoFormulario } from "./actions";

type Producto = {
  id: string;
  nombre: string;
  sku: string;
  precio: string | null;
  precioMayorista: string | null;
};

type Cliente = { id: string; nombre: string };

type LineaValor = {
  productoId?: string | null;
  cantidad?: number | string | null;
  precioUnitario?: string | null;
};

type ValoresIniciales = {
  clienteId?: string | null;
  canal?: string;
  notas?: string | null;
  lineas?: LineaValor[];
};

type Props = {
  accion: (
    previo: EstadoFormulario | undefined,
    formData: FormData,
  ) => Promise<EstadoFormulario>;
  productos: Producto[];
  clientes: Cliente[];
  valores?: ValoresIniciales;
  textoBoton: string;
};

const claseSelect =
  "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30";

const claseTextarea =
  "flex min-h-20 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30";

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

function formatoCLP(valor: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(valor);
}

// La base de datos siempre guarda los montos con 2 decimales (ej: "10000.00").
// Antes de poner ese valor en un campo editable "a la chilena" (donde el
// punto separa los miles), hay que convertirlo: si no tiene centavos reales
// se muestra sin decimales ("10000"), y si los tiene se usa coma ("1500,50").
// Sin esto, guardar sin tocar el precio lo multiplicaría por 100.
function formatoMontoInicial(valor: string | null | undefined): string {
  if (!valor) return "";
  const [entero, decimales] = valor.split(".");
  if (!decimales || decimales === "00") return entero;
  return `${entero},${decimales}`;
}

type Fila = { productoId: string; cantidad: string; precioUnitario: string };

function filaVacia(): Fila {
  return { productoId: "", cantidad: "1", precioUnitario: "" };
}

export function FormularioPedido({
  accion,
  productos,
  clientes,
  valores = {},
  textoBoton,
}: Props) {
  const [estado, formAction, enviando] = useActionState(accion, {});
  const errores = estado?.errores ?? {};

  const [clienteId, setClienteId] = useState(valores.clienteId ?? "");
  const [canal, setCanal] = useState(valores.canal ?? "mayorista");
  const [filas, setFilas] = useState<Fila[]>(() => {
    if (valores.lineas && valores.lineas.length > 0) {
      return valores.lineas.map((l) => ({
        productoId: l.productoId ?? "",
        cantidad: String(l.cantidad ?? ""),
        precioUnitario: formatoMontoInicial(l.precioUnitario),
      }));
    }
    return [filaVacia()];
  });

  function actualizarFila(indice: number, cambios: Partial<Fila>) {
    setFilas((prev) => prev.map((f, i) => (i === indice ? { ...f, ...cambios } : f)));
  }

  function elegirProducto(indice: number, productoId: string) {
    const producto = productos.find((p) => p.id === productoId);
    const precioSugerido =
      canal === "mayorista" ? producto?.precioMayorista : producto?.precio;
    actualizarFila(indice, {
      productoId,
      precioUnitario: formatoMontoInicial(precioSugerido),
    });
  }

  function agregarFila() {
    setFilas((prev) => [...prev, filaVacia()]);
  }

  function quitarFila(indice: number) {
    setFilas((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== indice) : prev));
  }

  const total = filas.reduce((acc, f) => {
    const cantidad = Number(f.cantidad) || 0;
    const precio = Number(f.precioUnitario.replace(/\./g, "").replace(",", ".")) || 0;
    return acc + cantidad * precio;
  }, 0);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="numLineas" value={filas.length} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo id="clienteId" etiqueta="Cliente" error={errores.clienteId}>
          <select
            id="clienteId"
            name="clienteId"
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            className={claseSelect}
          >
            <option value="">— Sin cliente (ej: venta en feria) —</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </Campo>

        <Campo id="canal" etiqueta="Canal *" error={errores.canal}>
          <select
            id="canal"
            name="canal"
            value={canal}
            onChange={(e) => setCanal(e.target.value)}
            className={claseSelect}
            required
          >
            <option value="mayorista">Mayorista</option>
            <option value="concesion">Concesión</option>
            <option value="web">Web</option>
            <option value="feria">Feria</option>
          </select>
        </Campo>
      </div>

      <Campo id="notas" etiqueta="Notas" error={errores.notas}>
        <textarea
          id="notas"
          name="notas"
          defaultValue={valores.notas ?? ""}
          placeholder="Información adicional sobre este pedido (opcional)"
          className={claseTextarea}
        />
      </Campo>

      <div className="space-y-3">
        <Label>Líneas del pedido *</Label>

        <div className="space-y-3">
          {filas.map((fila, indice) => (
            <div
              key={indice}
              className="grid grid-cols-1 gap-2 rounded-lg border border-border p-3 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end"
            >
              <div className="space-y-1.5">
                {indice === 0 && (
                  <Label htmlFor={`producto_${indice}`} className="sm:hidden">
                    Producto
                  </Label>
                )}
                <select
                  id={`producto_${indice}`}
                  name={`producto_${indice}`}
                  value={fila.productoId}
                  onChange={(e) => elegirProducto(indice, e.target.value)}
                  className={claseSelect}
                >
                  <option value="">— Elige un producto —</option>
                  {productos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.sku} — {p.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                name={`cantidad_${indice}`}
                inputMode="numeric"
                value={fila.cantidad}
                onChange={(e) => actualizarFila(indice, { cantidad: e.target.value })}
                placeholder="Cantidad"
              />

              <Input
                name={`precio_${indice}`}
                inputMode="decimal"
                value={fila.precioUnitario}
                onChange={(e) => actualizarFila(indice, { precioUnitario: e.target.value })}
                placeholder="Precio unitario"
              />

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => quitarFila(indice)}
                disabled={filas.length === 1}
              >
                Quitar
              </Button>
            </div>
          ))}
        </div>

        {errores.lineas && (
          <p className="text-sm text-red-600 dark:text-red-400">{errores.lineas}</p>
        )}

        <Button type="button" variant="outline" size="sm" onClick={agregarFila}>
          Agregar línea
        </Button>

        <p className="text-right text-sm text-muted-foreground">
          Total: <span className="font-medium text-foreground">{formatoCLP(total)}</span>
        </p>
      </div>

      {estado?.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{estado.error}</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={enviando}>
          {enviando ? "Guardando..." : textoBoton}
        </Button>
        <Button variant="outline" render={<Link href="/pedidos" />}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
