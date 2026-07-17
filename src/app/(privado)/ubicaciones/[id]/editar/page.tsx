// =============================================================================
// Página para editar una ubicación (/ubicaciones/[id]/editar).
// =============================================================================

import { notFound } from "next/navigation";
import { obtenerUbicacion } from "@/modules/inventario/ubicaciones/queries";
import { editarUbicacion } from "@/modules/inventario/ubicaciones/actions";
import { FormularioUbicacion } from "@/modules/inventario/ubicaciones/formulario-ubicacion";

export default async function PaginaEditarUbicacion({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ubicacion = await obtenerUbicacion(id);
  if (!ubicacion) notFound();

  const accionConId = editarUbicacion.bind(null, ubicacion.id);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-heading text-2xl text-foreground">Editar ubicación</h1>
      <p className="mt-1 text-sm text-muted-foreground">{ubicacion.nombre}</p>

      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <FormularioUbicacion
          accion={accionConId}
          valores={ubicacion}
          textoBoton="Guardar cambios"
        />
      </div>
    </div>
  );
}
