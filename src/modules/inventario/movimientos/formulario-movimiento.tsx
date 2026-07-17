// =============================================================================
// Formulario para registrar un movimiento nuevo.
// -----------------------------------------------------------------------------
// Muestra solo los campos (origen/destino) que tienen sentido según el tipo
// elegido. La validación real y autoritativa ocurre en el servidor
// (validaciones.ts + actions.ts); esto es solo para guiar a quien lo usa.
//
// Todos los campos son "controlados" por React (value + onChange). Esto es
// a propósito: un form.reset() nativo puede desincronizarse con un <select>
// controlado (el navegador vuelve a un valor que ya no coincide con lo que
// React cree que está seleccionado). Al controlar todo, limpiar el formulario
// después de guardar es tan simple como volver a poner el estado en blanco.
// =============================================================================

"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registrarMovimiento, type EstadoFormulario } from "./actions";

type Opcion = { id: string; nombre: string };

type Props = {
  productos: (Opcion & { sku: string })[];
  ubicaciones: Opcion[];
};

const claseSelect =
  "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30";

const TIPOS: { valor: string; etiqueta: string }[] = [
  { valor: "carga_inicial", etiqueta: "Carga inicial (stock que entra por primera vez)" },
  { valor: "despacho", etiqueta: "Despacho (bodega → tienda)" },
  { valor: "venta", etiqueta: "Venta (sale del sistema)" },
  { valor: "devolucion", etiqueta: "Devolución (tienda → bodega)" },
  { valor: "traspaso", etiqueta: "Traspaso (entre dos ubicaciones)" },
  { valor: "ajuste", etiqueta: "Ajuste (corrección o merma)" },
];

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

const VALORES_INICIALES = {
  productoId: "",
  tipo: "despacho",
  sentidoAjuste: "entrada" as "entrada" | "salida",
  origenId: "",
  destinoId: "",
  cantidad: "",
};

export function FormularioMovimiento({ productos, ubicaciones }: Props) {
  const [estado, formAction, enviando] = useActionState<EstadoFormulario, FormData>(
    registrarMovimiento,
    {},
  );
  const errores = estado?.errores ?? {};

  const [productoId, setProductoId] = useState(VALORES_INICIALES.productoId);
  const [tipo, setTipo] = useState(VALORES_INICIALES.tipo);
  const [sentidoAjuste, setSentidoAjuste] = useState(VALORES_INICIALES.sentidoAjuste);
  const [origenId, setOrigenId] = useState(VALORES_INICIALES.origenId);
  const [destinoId, setDestinoId] = useState(VALORES_INICIALES.destinoId);
  const [cantidad, setCantidad] = useState(VALORES_INICIALES.cantidad);

  // Al guardar con éxito, se limpia el formulario para registrar el próximo
  // movimiento sin arrastrar los valores anteriores.
  useEffect(() => {
    if (estado?.ok) {
      setProductoId(VALORES_INICIALES.productoId);
      setTipo(VALORES_INICIALES.tipo);
      setSentidoAjuste(VALORES_INICIALES.sentidoAjuste);
      setOrigenId(VALORES_INICIALES.origenId);
      setDestinoId(VALORES_INICIALES.destinoId);
      setCantidad(VALORES_INICIALES.cantidad);
    }
  }, [estado]);

  const mostrarOrigen =
    ["despacho", "venta", "devolucion", "traspaso"].includes(tipo) ||
    (tipo === "ajuste" && sentidoAjuste === "salida");
  const mostrarDestino =
    ["carga_inicial", "despacho", "devolucion", "traspaso"].includes(tipo) ||
    (tipo === "ajuste" && sentidoAjuste === "entrada");

  return (
    <form action={formAction} className="space-y-4">
      <Campo id="productoId" etiqueta="Producto *" error={errores.productoId}>
        <select
          id="productoId"
          name="productoId"
          className={claseSelect}
          value={productoId}
          onChange={(e) => setProductoId(e.target.value)}
          required
        >
          <option value="">— Elige un producto —</option>
          {productos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.sku} — {p.nombre}
            </option>
          ))}
        </select>
      </Campo>

      <Campo id="tipo" etiqueta="Tipo de movimiento *" error={errores.tipo}>
        <select
          id="tipo"
          name="tipo"
          className={claseSelect}
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          required
        >
          {TIPOS.map((t) => (
            <option key={t.valor} value={t.valor}>
              {t.etiqueta}
            </option>
          ))}
        </select>
      </Campo>

      {tipo === "ajuste" && (
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-1.5">
            <input
              type="radio"
              name="sentidoAjuste"
              checked={sentidoAjuste === "entrada"}
              onChange={() => setSentidoAjuste("entrada")}
            />
            Entrada (el stock sube)
          </label>
          <label className="flex items-center gap-1.5">
            <input
              type="radio"
              name="sentidoAjuste"
              checked={sentidoAjuste === "salida"}
              onChange={() => setSentidoAjuste("salida")}
            />
            Salida / merma (el stock baja)
          </label>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {mostrarOrigen && (
          <Campo id="origenId" etiqueta="Origen *" error={errores.origenId}>
            <select
              id="origenId"
              name="origenId"
              className={claseSelect}
              value={origenId}
              onChange={(e) => setOrigenId(e.target.value)}
              required
            >
              <option value="">— Elige una ubicación —</option>
              {ubicaciones.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre}
                </option>
              ))}
            </select>
          </Campo>
        )}

        {mostrarDestino && (
          <Campo id="destinoId" etiqueta="Destino *" error={errores.destinoId}>
            <select
              id="destinoId"
              name="destinoId"
              className={claseSelect}
              value={destinoId}
              onChange={(e) => setDestinoId(e.target.value)}
              required
            >
              <option value="">— Elige una ubicación —</option>
              {ubicaciones.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre}
                </option>
              ))}
            </select>
          </Campo>
        )}
      </div>

      <Campo id="cantidad" etiqueta="Cantidad *" error={errores.cantidad}>
        <Input
          id="cantidad"
          name="cantidad"
          inputMode="numeric"
          placeholder="Ej: 10"
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          required
        />
      </Campo>

      {estado?.error && !errores.origenId && (
        <p className="text-sm text-red-600 dark:text-red-400">{estado.error}</p>
      )}

      {estado?.ok && (
        <p className="text-sm text-primary">Movimiento registrado correctamente.</p>
      )}

      <Button type="submit" disabled={enviando}>
        {enviando ? "Registrando..." : "Registrar movimiento"}
      </Button>
    </form>
  );
}
