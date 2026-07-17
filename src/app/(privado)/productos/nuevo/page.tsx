// =============================================================================
// Página para crear un producto nuevo (/productos/nuevo).
// =============================================================================

import { crearProducto } from "@/modules/inventario/productos/actions";
import { listarCategorias } from "@/modules/inventario/productos/queries";
import { FormularioProducto } from "@/modules/inventario/productos/formulario-producto";

export default async function PaginaNuevoProducto() {
  const categorias = await listarCategorias();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-heading text-2xl text-foreground">Nuevo producto</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Los campos con * son obligatorios.
      </p>

      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <FormularioProducto
          accion={crearProducto}
          categorias={categorias}
          textoBoton="Crear producto"
        />
      </div>
    </div>
  );
}
