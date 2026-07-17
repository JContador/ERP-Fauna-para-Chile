// =============================================================================
// Página para registrar un movimiento nuevo (/movimientos/nuevo).
// =============================================================================

import Link from "next/link";
import { listarProductosActivos } from "@/modules/inventario/productos/queries";
import { listarUbicacionesActivas } from "@/modules/inventario/ubicaciones/queries";
import { FormularioMovimiento } from "@/modules/inventario/movimientos/formulario-movimiento";

export default async function PaginaNuevoMovimiento() {
  const [productos, ubicaciones] = await Promise.all([
    listarProductosActivos(),
    listarUbicacionesActivas(),
  ]);

  const faltaProductos = productos.length === 0;
  const faltaUbicaciones = ubicaciones.length === 0;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-heading text-2xl text-foreground">Registrar movimiento</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Los campos con * son obligatorios.
      </p>

      {(faltaProductos || faltaUbicaciones) && (
        <div className="mt-6 rounded-xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
          Antes de registrar un movimiento necesitas al menos:
          <ul className="mt-2 list-disc pl-5">
            {faltaProductos && (
              <li>
                Un producto activo (
                <Link href="/productos/nuevo" className="text-primary underline">
                  crear uno
                </Link>
                ).
              </li>
            )}
            {faltaUbicaciones && (
              <li>
                Una ubicación activa (
                <Link href="/ubicaciones/nueva" className="text-primary underline">
                  crear una
                </Link>
                ).
              </li>
            )}
          </ul>
        </div>
      )}

      {!faltaProductos && !faltaUbicaciones && (
        <div className="mt-6 rounded-xl border border-border bg-card p-6">
          <FormularioMovimiento productos={productos} ubicaciones={ubicaciones} />
        </div>
      )}
    </div>
  );
}
