// =============================================================================
// Listado del catálogo de productos (/productos).
// =============================================================================

import Link from "next/link";
import { listarProductos } from "@/modules/inventario/productos/queries";
import { cambiarEstadoProducto } from "@/modules/inventario/productos/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Formatea montos como pesos chilenos (ej: $12.990).
function formatoCLP(valor: string | null) {
  if (valor === null) return "—";
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(Number(valor));
}

export default async function PaginaProductos() {
  const lista = await listarProductos();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl text-foreground">Productos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {lista.length === 0
              ? "El catálogo está vacío."
              : `${lista.length} producto${lista.length === 1 ? "" : "s"} en el catálogo.`}
          </p>
        </div>
        <Button render={<Link href="/productos/nuevo" />}>
          Nuevo producto
        </Button>
      </div>

      {lista.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Costo</TableHead>
                <TableHead className="text-right">Mayorista</TableHead>
                <TableHead className="text-right">Venta</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((p) => (
                <TableRow key={p.id} className={p.activo ? "" : "opacity-60"}>
                  <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                  <TableCell className="font-medium">{p.nombre}</TableCell>
                  <TableCell>{p.categoriaNombre ?? "—"}</TableCell>
                  <TableCell className="text-right">{formatoCLP(p.costo)}</TableCell>
                  <TableCell className="text-right">
                    {formatoCLP(p.precioMayorista)}
                  </TableCell>
                  <TableCell className="text-right">{formatoCLP(p.precio)}</TableCell>
                  <TableCell>
                    {p.activo ? (
                      <Badge variant="secondary">Activo</Badge>
                    ) : (
                      <Badge variant="outline">Inactivo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        render={<Link href={`/productos/${p.id}/editar`} />}
                      >
                        Editar
                      </Button>
                      <form
                        action={cambiarEstadoProducto.bind(null, p.id, !p.activo)}
                      >
                        <Button type="submit" variant="ghost" size="sm">
                          {p.activo ? "Desactivar" : "Activar"}
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {lista.length === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Agrega tu primer producto con el botón «Nuevo producto».
          </p>
        </div>
      )}
    </div>
  );
}
