// =============================================================================
// Página para crear una ubicación nueva (/ubicaciones/nueva).
// =============================================================================

import { crearUbicacion } from "@/modules/inventario/ubicaciones/actions";
import { FormularioUbicacion } from "@/modules/inventario/ubicaciones/formulario-ubicacion";
import { listarClientesParaConcesion } from "@/modules/clientes/queries";

export default async function PaginaNuevaUbicacion() {
  const clientesConcesion = await listarClientesParaConcesion();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-heading text-2xl text-foreground">Nueva ubicación</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Los campos con * son obligatorios.
      </p>

      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <FormularioUbicacion
          accion={crearUbicacion}
          clientesConcesion={clientesConcesion}
          textoBoton="Crear ubicación"
        />
      </div>
    </div>
  );
}
