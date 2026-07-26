// =============================================================================
// Página para editar una ubicación (/ubicaciones/[id]/editar).
// =============================================================================

import { notFound } from "next/navigation";
import { obtenerUbicacion } from "@/modules/inventario/ubicaciones/queries";
import { editarUbicacion } from "@/modules/inventario/ubicaciones/actions";
import { FormularioUbicacion } from "@/modules/inventario/ubicaciones/formulario-ubicacion";
import { listarClientesParaConcesion, obtenerCliente } from "@/modules/clientes/queries";

export default async function PaginaEditarUbicacion({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ubicacion = await obtenerUbicacion(id);
  if (!ubicacion) notFound();

  const clientesConcesion = await listarClientesParaConcesion();
  // Si el cliente ya vinculado no está en la lista (ej: quedó inactivo o
  // dejó de ser concesión), lo agregamos igual para no perder la selección.
  if (ubicacion.clienteId && !clientesConcesion.some((c) => c.id === ubicacion.clienteId)) {
    const clienteActual = await obtenerCliente(ubicacion.clienteId);
    if (clienteActual) clientesConcesion.unshift(clienteActual);
  }

  const accionConId = editarUbicacion.bind(null, ubicacion.id);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-heading text-2xl text-foreground">Editar ubicación</h1>
      <p className="mt-1 text-sm text-muted-foreground">{ubicacion.nombre}</p>

      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <FormularioUbicacion
          accion={accionConId}
          clientesConcesion={clientesConcesion}
          valores={ubicacion}
          textoBoton="Guardar cambios"
        />
      </div>
    </div>
  );
}
