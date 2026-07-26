// =============================================================================
// Página para crear un cliente nuevo (/clientes/nuevo).
// =============================================================================

import { crearCliente } from "@/modules/clientes/actions";
import { FormularioCliente } from "@/modules/clientes/formulario-cliente";

export default function PaginaNuevoCliente() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-heading text-2xl text-foreground">Nuevo cliente</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Los campos con * son obligatorios. Podrás agregar contactos después de
        guardar.
      </p>

      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <FormularioCliente accion={crearCliente} textoBoton="Crear cliente" />
      </div>
    </div>
  );
}
