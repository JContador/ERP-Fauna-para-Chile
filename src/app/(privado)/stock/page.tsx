// =============================================================================
// Vista de stock (/stock) — cuánto hay de cada producto, por ubicación y en
// total. El número siempre se calcula desde los movimientos (D1); no hay
// ningún campo de stock editable en ninguna parte del sistema.
// =============================================================================

import Link from "next/link";
import { obtenerMatrizStock } from "@/modules/inventario/movimientos/queries";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function claseStock(valor: number) {
  if (valor < 0) return "text-red-600 dark:text-red-400 font-medium";
  if (valor === 0) return "text-muted-foreground";
  return "";
}

export default async function PaginaStock() {
  const { ubicaciones, filas } = await obtenerMatrizStock();

  const faltaProductos = filas.length === 0;
  const faltaUbicaciones = ubicaciones.length === 0;

  return (
    <div>
      <h1 className="font-heading text-2xl text-foreground">Stock</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Stock actual por ubicación, calculado desde el libro de movimientos.
      </p>

      {(faltaProductos || faltaUbicaciones) && (
        <div className="mt-6 rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Para ver el stock necesitas al menos un{" "}
          <Link href="/productos/nuevo" className="text-primary underline">
            producto
          </Link>{" "}
          y una{" "}
          <Link href="/ubicaciones/nueva" className="text-primary underline">
            ubicación
          </Link>{" "}
          activos, y algún{" "}
          <Link href="/movimientos/nuevo" className="text-primary underline">
            movimiento
          </Link>{" "}
          registrado.
        </div>
      )}

      {!faltaProductos && !faltaUbicaciones && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                {ubicaciones.map((u) => (
                  <TableHead key={u.id} className="text-right whitespace-nowrap">
                    {u.nombre}
                  </TableHead>
                ))}
                <TableHead className="text-right font-semibold">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filas.map(({ producto, stockPorUbicacion, total }) => (
                <TableRow key={producto.id}>
                  <TableCell>
                    <span className="font-mono text-xs text-muted-foreground">
                      {producto.sku}
                    </span>
                    <br />
                    {producto.nombre}
                  </TableCell>
                  {stockPorUbicacion.map(({ ubicacionId, stock }) => (
                    <TableCell
                      key={ubicacionId}
                      className={`text-right ${claseStock(stock)}`}
                    >
                      {stock}
                    </TableCell>
                  ))}
                  <TableCell className={`text-right font-semibold ${claseStock(total)}`}>
                    {total}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <p className="mt-4 text-xs text-muted-foreground">
        El total suma el stock en todas las ubicaciones activas. Si una ubicación
        se desactiva con stock pendiente, ese stock deja de sumarse aquí.
      </p>
    </div>
  );
}
