// =============================================================================
// Formulario de ubicación (crear y editar usan este mismo componente).
// =============================================================================

"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EstadoFormulario } from "./actions";

type ValoresIniciales = {
  nombre?: string;
  tipo?: string;
  clienteId?: string | null;
  calle?: string | null;
  numero?: string | null;
  depto?: string | null;
  codigoPostal?: string | null;
  geolocalizacion?: string | null;
  descripcion?: string | null;
};

type Cliente = { id: string; nombre: string };

type Props = {
  accion: (
    previo: EstadoFormulario | undefined,
    formData: FormData,
  ) => Promise<EstadoFormulario>;
  clientesConcesion: Cliente[];
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

export function FormularioUbicacion({
  accion,
  clientesConcesion,
  valores = {},
  textoBoton,
}: Props) {
  const [estado, formAction, enviando] = useActionState(accion, {});
  const errores = estado?.errores ?? {};

  const [tipo, setTipo] = useState(valores.tipo ?? "bodega");
  const [clienteId, setClienteId] = useState(valores.clienteId ?? "");

  return (
    <form action={formAction} className="space-y-4">
      <Campo id="nombre" etiqueta="Nombre *" error={errores.nombre}>
        <Input
          id="nombre"
          name="nombre"
          defaultValue={valores.nombre ?? ""}
          placeholder="Ej: Bodega Central"
          required
        />
      </Campo>

      <Campo id="tipo" etiqueta="Tipo *" error={errores.tipo}>
        <select
          id="tipo"
          name="tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className={claseSelect}
          required
        >
          <option value="bodega">Bodega</option>
          <option value="punto_venta">Punto de venta</option>
          <option value="feria">Feria</option>
        </select>
      </Campo>

      {tipo === "punto_venta" && (
        <Campo id="clienteId" etiqueta="Cliente *" error={errores.clienteId}>
          <select
            id="clienteId"
            name="clienteId"
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            className={claseSelect}
            required
          >
            <option value="">— Elige un cliente —</option>
            {clientesConcesion.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            Solo aparecen clientes en concesión o "ambos" — son los que
            sostienen stock propio en su ubicación.
          </p>
        </Campo>
      )}

      <div className="space-y-4 rounded-lg border border-border p-4">
        <p className="text-sm font-medium text-foreground">Dirección (opcional)</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo id="calle" etiqueta="Calle" error={errores.calle}>
            <Input
              id="calle"
              name="calle"
              defaultValue={valores.calle ?? ""}
              placeholder="Ej: Av. Providencia"
            />
          </Campo>
          <Campo id="numero" etiqueta="Número" error={errores.numero}>
            <Input
              id="numero"
              name="numero"
              defaultValue={valores.numero ?? ""}
              placeholder="Ej: 1234"
            />
          </Campo>
          <Campo id="depto" etiqueta="Depto / oficina" error={errores.depto}>
            <Input
              id="depto"
              name="depto"
              defaultValue={valores.depto ?? ""}
              placeholder="Ej: Depto 501"
            />
          </Campo>
          <Campo id="codigoPostal" etiqueta="Código postal" error={errores.codigoPostal}>
            <Input
              id="codigoPostal"
              name="codigoPostal"
              defaultValue={valores.codigoPostal ?? ""}
              placeholder="Ej: 7500000"
            />
          </Campo>
        </div>
      </div>

      <Campo id="geolocalizacion" etiqueta="Geolocalización (link de Google Maps)" error={errores.geolocalizacion}>
        <Input
          id="geolocalizacion"
          name="geolocalizacion"
          type="url"
          defaultValue={valores.geolocalizacion ?? ""}
          placeholder="https://maps.google.com/..."
        />
      </Campo>

      <Campo id="descripcion" etiqueta="Descripción" error={errores.descripcion}>
        <textarea
          id="descripcion"
          name="descripcion"
          defaultValue={valores.descripcion ?? ""}
          placeholder="Información adicional sobre esta ubicación (opcional)"
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
        <Button variant="outline" render={<Link href="/ubicaciones" />}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
