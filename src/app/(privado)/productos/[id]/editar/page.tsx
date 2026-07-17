// =============================================================================
// Página para editar un producto (/productos/[id]/editar).
// -----------------------------------------------------------------------------
// En Next.js 16, "params" llega como promesa: se lee con await.
// =============================================================================

import { notFound } from "next/navigation";
import { obtenerProducto } from "@/modules/inventario/productos/queries";
import { editarProducto } from "@/modules/inventario/productos/actions";
import { FormularioProducto } from "@/modules/inventario/productos/formulario-producto";

export default async function PaginaEditarProducto({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const producto = await obtenerProducto(id);
  if (!producto) notFound();

  // Fijamos el id en la acción para que el formulario no tenga que conocerlo.
  const accionConId = editarProducto.bind(null, producto.id);

  // La base de datos guarda montos como "4500.00"; en el formulario mostramos
  // "4500" que es más natural para pesos chilenos.
  const montoSimple = (v: string | null) =>
    v === null ? null : Number(v).toString();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">
        Editar producto
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        {producto.sku} — {producto.nombre}
      </p>

      <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <FormularioProducto
          accion={accionConId}
          valores={{
            ...producto,
            costo: montoSimple(producto.costo),
            precio: montoSimple(producto.precio),
          }}
          textoBoton="Guardar cambios"
        />
      </div>
    </div>
  );
}
