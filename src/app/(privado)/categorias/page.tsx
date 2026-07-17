// =============================================================================
// Gestión de categorías de producto (/categorias).
// -----------------------------------------------------------------------------
// Listar, agregar y activar/desactivar categorías. Las categorías inactivas
// dejan de aparecer al crear/editar productos, pero no se borran.
// =============================================================================

import { listarTodasLasCategorias } from "@/modules/inventario/productos/queries";
import { cambiarEstadoCategoria } from "@/modules/inventario/categorias/actions";
import { FormularioCategoria } from "@/modules/inventario/categorias/formulario-categoria";
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

export default async function PaginaCategorias() {
  const categorias = await listarTodasLasCategorias();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-heading text-2xl text-foreground">Categorías</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Organizan el catálogo. Puedes agregar nuevas en cualquier momento.
      </p>

      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <FormularioCategoria />
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Categoría</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categorias.map((c) => (
              <TableRow key={c.id} className={c.activa ? "" : "opacity-60"}>
                <TableCell className="font-medium">{c.nombre}</TableCell>
                <TableCell>
                  {c.activa ? (
                    <Badge variant="secondary">Activa</Badge>
                  ) : (
                    <Badge variant="outline">Inactiva</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <form action={cambiarEstadoCategoria.bind(null, c.id, !c.activa)}>
                    <Button type="submit" variant="ghost" size="sm">
                      {c.activa ? "Desactivar" : "Activar"}
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
