// =============================================================================
// Formulario de cliente (crear y editar usan este mismo componente).
// =============================================================================

"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EstadoFormulario } from "./actions";

type ValoresIniciales = {
  nombre?: string;
  rut?: string;
  giro?: string | null;
  tipoComercial?: string;
  region?: string | null;
  condiciones?: string | null;
  notas?: string | null;
};

type Props = {
  accion: (
    previo: EstadoFormulario | undefined,
    formData: FormData,
  ) => Promise<EstadoFormulario>;
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

export function FormularioCliente({ accion, valores = {}, textoBoton }: Props) {
  const [estado, formAction, enviando] = useActionState(accion, {});
  const errores = estado?.errores ?? {};

  return (
    <form action={formAction} className="space-y-4">
      <Campo id="nombre" etiqueta="Nombre *" error={errores.nombre}>
        <Input
          id="nombre"
          name="nombre"
          defaultValue={valores.nombre ?? ""}
          placeholder="Ej: Parque Tricao"
          required
        />
      </Campo>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo id="rut" etiqueta="RUT *" error={errores.rut}>
          <Input
            id="rut"
            name="rut"
            defaultValue={valores.rut ?? ""}
            placeholder="Ej: 12345678-9"
            required
          />
        </Campo>

        <Campo id="giro" etiqueta="Giro" error={errores.giro}>
          <Input
            id="giro"
            name="giro"
            defaultValue={valores.giro ?? ""}
            placeholder="Ej: Turismo y venta al por menor"
          />
        </Campo>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo id="tipoComercial" etiqueta="Tipo comercial *" error={errores.tipoComercial}>
          <select
            id="tipoComercial"
            name="tipoComercial"
            defaultValue={valores.tipoComercial ?? "mayorista"}
            className={claseSelect}
            required
          >
            <option value="mayorista">Mayorista</option>
            <option value="concesion">Concesión</option>
            <option value="ambos">Ambos</option>
          </select>
        </Campo>

        <Campo id="region" etiqueta="Región" error={errores.region}>
          <Input
            id="region"
            name="region"
            defaultValue={valores.region ?? ""}
            placeholder="Ej: Región de O'Higgins"
          />
        </Campo>
      </div>

      <Campo id="condiciones" etiqueta="Condiciones comerciales" error={errores.condiciones}>
        <textarea
          id="condiciones"
          name="condiciones"
          defaultValue={valores.condiciones ?? ""}
          placeholder="Ej: pago a 30 días, despacho los martes"
          className={claseTextarea}
        />
      </Campo>

      <Campo id="notas" etiqueta="Notas" error={errores.notas}>
        <textarea
          id="notas"
          name="notas"
          defaultValue={valores.notas ?? ""}
          placeholder="Información adicional sobre este cliente (opcional)"
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
        <Button variant="outline" render={<Link href="/clientes" />}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
