// =============================================================================
// Página para crear un producto nuevo (/productos/nuevo).
// =============================================================================

import { crearProducto } from "@/modules/inventario/productos/actions";
import { FormularioProducto } from "@/modules/inventario/productos/formulario-producto";

export default function PaginaNuevoProducto() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">
        Nuevo producto
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Los campos con * son obligatorios.
      </p>

      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <FormularioProducto accion={crearProducto} textoBoton="Crear producto" />
      </div>
    </div>
  );
}
